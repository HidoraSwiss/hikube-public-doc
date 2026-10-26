---
title: "Come gestire la conservazione degli oggetti di un bucket bloccato"
description: "Verificate il blocco di un bucket WORM, prolungate la conservazione di un oggetto e applicate un blocco legale con i comandi standard di S3 Object Lock."
---

# Come gestire la conservazione degli oggetti di un bucket bloccato

Un bucket creato con **Enable Object Lock (WORM)** blocca ogni oggetto per 365 giorni dopo la sua scrittura, in modalità `COMPLIANCE`. Questa guida mostra come verificare questo blocco e, con i comandi standard di S3 Object Lock, conservare un oggetto più a lungo: conservazione propria dell'oggetto, proroga, blocco legale (*legal hold*).

Queste operazioni si eseguono con un client S3. La console e l'API Hikube mostrano solo la conservazione predefinita del bucket.

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
| **Conservazione** (*retention*) | Fino a una data (`RetainUntilDate`) | Il bucket, alla scrittura di ogni oggetto (365 giorni), oppure voi, oggetto per oggetto | Automatica alla scadenza; può solo essere prorogata |
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

### 2. Caricare un oggetto con una conservazione propria

Per conservare un oggetto oltre 365 giorni (un archivio normativo di dieci anni, per esempio), assegnategli una data di scadenza al caricamento. Scegliete una data **successiva** alla scadenza predefinita (365 giorni dopo il caricamento): la conservazione propria di un oggetto serve a conservarlo più a lungo.

```bash
# Data di scadenza: ISO 8601, in UTC
RETAIN_UNTIL="2036-12-31T00:00:00Z"

aws --endpoint-url "$S3_ENDPOINT" s3api put-object \
  --bucket "$BUCKET_NAME" --key archives/report-2026.pdf --body ./report-2026.pdf \
  --object-lock-mode COMPLIANCE \
  --object-lock-retain-until-date "$RETAIN_UNTIL"
```

### 3. Leggere la conservazione di un oggetto

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

### 4. Prorogare la conservazione di un oggetto

Una conservazione può solo essere **prorogata**: la nuova data deve essere successiva alla scadenza attuale, altrimenti la richiesta viene rifiutata.

```bash
aws --endpoint-url "$S3_ENDPOINT" s3api put-object-retention \
  --bucket "$BUCKET_NAME" --key archives/report-2026.pdf \
  --retention '{"Mode":"COMPLIANCE","RetainUntilDate":"2040-12-31T00:00:00Z"}'
```

### 5. Applicare o rimuovere un blocco legale

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
| `AccessDenied` su `put-object-retention` o `put-object-legal-hold` | Utente in **Read-only** | Usate un utente in **Read / Write** |
| Proroga rifiutata | Nuova data precedente alla scadenza attuale | Scegliete una data successiva alla scadenza attuale (passo 3) |
| Data rifiutata al caricamento | Data passata o formato errato | Data futura, in formato ISO 8601 UTC (`2036-12-31T00:00:00Z`) |
| `AccessDenied` all'eliminazione di un oggetto | Conservazione in corso o blocco legale applicato | Leggete la conservazione (passo 3) e il blocco legale (passo 5) dell'oggetto |

## Per approfondire

- [Concetti dei bucket S3](../concepts.md): blocco ed eliminazione di un bucket bloccato
- [FAQ dei bucket S3](../faq.md#a-cosa-serve-il-blocco-worm)
