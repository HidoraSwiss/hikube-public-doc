---
title: "Come gestire la conservazione degli oggetti di un bucket bloccato"
description: "Verificate e modificate la conservazione predefinita di un bucket WORM, fissate o prolungate la conservazione di un oggetto e applicate un blocco legale con i comandi standard di S3 Object Lock."
---

# Come gestire la conservazione degli oggetti di un bucket bloccato

Un bucket creato con **Enable Object Lock (WORM)** blocca per impostazione predefinita ogni oggetto per 365 giorni dopo la sua scrittura, in modalità `COMPLIANCE`. Questa guida mostra come verificare questo blocco e adattarlo con i comandi standard di S3 Object Lock: conservazione predefinita del bucket, conservazione propria di un oggetto, proroga, blocco legale (*legal hold*).

Queste operazioni si eseguono con un client S3. La console e l'API Hikube mostrano la conservazione predefinita con cui il bucket è stato creato (365 giorni): non riflettono una modifica fatta con un client S3.

## Prerequisiti

- Un **bucket bloccato (WORM)** in stato **Ready**: il blocco si sceglie alla creazione (vedere l'[avvio rapido](../quick-start.md)) e non può essere attivato in seguito
- Un **utente S3** in **Read / Write** su questo bucket (vedere [Gestire gli utenti e le chiavi di accesso](./configure-access.md))
- [AWS CLI](https://aws.amazon.com/cli/) installato e le variabili `S3_ENDPOINT`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` e `BUCKET_NAME` esportate come al [passo 4 dell'avvio rapido](../quick-start.md#passo-4-recuperare-le-credenziali)

:::warning Un blocco non si rimuove
Una conservazione in modalità `COMPLIANCE` non può essere né ridotta né rimossa. L'oggetto non potrà essere eliminato, né il bucket svuotato, prima della scadenza. Verificate la data prima di eseguire un comando.
:::

## Comprendere i due meccanismi

| Meccanismo | Durata | Chi lo applica | Rimozione |
|------------|--------|----------------|-----------|
| **Conservazione** (*retention*) | Fino a una data (`RetainUntilDate`) | Il bucket, alla scrittura di ogni oggetto (conservazione predefinita, 365 giorni salvo modifica), oppure voi, oggetto per oggetto | Automatica alla scadenza; può solo essere prorogata |
| **Blocco legale** (*legal hold*) | Senza scadenza | Voi, oggetto per oggetto | Quando lo rimuovete (`Status=OFF`) |

I due si sommano: un oggetto può essere eliminato solo quando la sua conservazione è scaduta **e** il suo blocco legale è stato rimosso.

## Passaggi

### 1. Verificare il blocco del bucket

```bash
aws --endpoint-url "$S3_ENDPOINT" s3api get-object-lock-configuration \
  --bucket "$BUCKET_NAME"
```

**Risultato atteso:**

```json
{
    "ObjectLockConfiguration": {
        "ObjectLockEnabled": "Enabled",
        "Rule": {
            "DefaultRetention": {
                "Mode": "COMPLIANCE",
                "Days": 365
            }
        }
    }
}
```

`DefaultRetention` è la conservazione applicata a ogni oggetto scritto senza una conservazione propria.

### 2. Modificare la conservazione predefinita del bucket

Qualsiasi utente in **Read / Write** può sostituire la conservazione predefinita, in giorni (`Days`) o in anni (`Years`). Esempio per 55 giorni:

```bash
aws --endpoint-url "$S3_ENDPOINT" s3api put-object-lock-configuration \
  --bucket "$BUCKET_NAME" \
  --object-lock-configuration '{"ObjectLockEnabled":"Enabled","Rule":{"DefaultRetention":{"Mode":"COMPLIANCE","Days":55}}}'
```

Il nuovo valore si applica solo agli oggetti scritti in seguito: un oggetto già bloccato mantiene la sua scadenza. Senza `Rule`, il bucket non ha più una conservazione predefinita e un oggetto scritto senza una conservazione propria non viene bloccato. Rieseguite il passo 1 per verificare il valore in vigore.

:::info Visualizzazione nella console
La console e l'API Hikube mostrano sempre la conservazione predefinita scelta alla creazione del bucket (365 giorni): una modifica fatta con un client S3 non vi compare. Solo il passaggio 1 indica il valore in vigore. La modifica della conservazione predefinita dalla console sarà presto disponibile.
:::

:::warning Chi può modificare la conservazione
Una chiave in **Read / Write** basta per ridurre o rimuovere la conservazione predefinita dei prossimi oggetti. Riservate queste chiavi alle applicazioni che scrivono nel bucket e assegnate **Read-only** agli altri.
:::

### 3. Caricare un oggetto con una conservazione propria

Una data di scadenza assegnata al caricamento sostituisce la conservazione predefinita per quell'oggetto, che sia più lunga (un archivio normativo di dieci anni, per esempio) o più breve (un backup conservato 55 giorni in un bucket a 365 giorni).

```bash
# Data di scadenza: ISO 8601, in UTC
RETAIN_UNTIL="2036-12-31T00:00:00Z"

aws --endpoint-url "$S3_ENDPOINT" s3api put-object \
  --bucket "$BUCKET_NAME" --key archives/report-2026.pdf --body ./report-2026.pdf \
  --object-lock-mode COMPLIANCE \
  --object-lock-retain-until-date "$RETAIN_UNTIL"
```

### 4. Leggere la conservazione di un oggetto

```bash
aws --endpoint-url "$S3_ENDPOINT" s3api get-object-retention \
  --bucket "$BUCKET_NAME" --key archives/report-2026.pdf
```

**Risultato atteso:**

```json
{
    "Retention": {
        "Mode": "COMPLIANCE",
        "RetainUntilDate": "2036-12-31T00:00:00+00:00"
    }
}
```

### 5. Prorogare la conservazione di un oggetto

Una conservazione può solo essere **prorogata**: la nuova data deve essere successiva alla scadenza attuale, altrimenti la richiesta viene rifiutata.

```bash
aws --endpoint-url "$S3_ENDPOINT" s3api put-object-retention \
  --bucket "$BUCKET_NAME" --key archives/report-2026.pdf \
  --retention '{"Mode":"COMPLIANCE","RetainUntilDate":"2040-12-31T00:00:00Z"}'
```

### 6. Applicare o rimuovere un blocco legale

Il blocco legale impedisce l'eliminazione di un oggetto senza data di scadenza, per esempio durante un contenzioso o un audit:

```bash
# Applicare il blocco
aws --endpoint-url "$S3_ENDPOINT" s3api put-object-legal-hold \
  --bucket "$BUCKET_NAME" --key archives/report-2026.pdf \
  --legal-hold Status=ON

# Verificare il blocco
aws --endpoint-url "$S3_ENDPOINT" s3api get-object-legal-hold \
  --bucket "$BUCKET_NAME" --key archives/report-2026.pdf

# Rimuovere il blocco
aws --endpoint-url "$S3_ENDPOINT" s3api put-object-legal-hold \
  --bucket "$BUCKET_NAME" --key archives/report-2026.pdf \
  --legal-hold Status=OFF
```

Rimuovere il blocco legale non rimuove la conservazione: l'oggetto resta protetto fino alla sua scadenza.

## Modalità `GOVERNANCE`

La modalità `GOVERNANCE` è accettata, ma gli utenti di un bucket non hanno il permesso di aggirare una conservazione: `--bypass-governance-retention` restituisce `AccessDenied`. Un oggetto in `GOVERNANCE` è quindi, in pratica, immutabile quanto in `COMPLIANCE` fino alla scadenza. Usate `COMPLIANCE`, che dichiara ciò che verrà applicato.

## Risoluzione dei problemi

| Sintomo | Causa probabile | Azione |
|---------|-----------------|--------|
| `get-object-lock-configuration` fallisce | Bucket creato senza blocco | Il blocco si attiva solo alla creazione: create un bucket bloccato e copiatevi gli oggetti |
| `AccessDenied` su `put-object-lock-configuration`, `put-object-retention` o `put-object-legal-hold` | Utente in **Read-only** | Usate un utente in **Read / Write** |
| Proroga rifiutata | Nuova data precedente alla scadenza attuale | Scegliete una data successiva alla scadenza attuale (passo 4) |
| Data rifiutata al caricamento | Data passata o formato errato | Data futura, in formato ISO 8601 UTC (`2036-12-31T00:00:00Z`) |
| Oggetto scritto con una conservazione inattesa | Conservazione predefinita modificata da un utente del bucket | Leggete la conservazione predefinita (passo 1) e ripristinatela se necessario (passo 2) |
| `AccessDenied` all'eliminazione di un oggetto | Conservazione in corso o blocco legale applicato | Leggete la conservazione (passo 4) e il blocco legale (passo 6) dell'oggetto |

## Per approfondire

- [Concetti dei bucket S3](../concepts.md): blocco ed eliminazione di un bucket bloccato
- [FAQ dei bucket S3](../faq.md#a-cosa-serve-il-blocco-worm)
