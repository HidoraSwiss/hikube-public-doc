---
sidebar_position: 2
title: Autenticazione
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# Autenticazione con chiave API

Un client dell'API pubblica (script, pipeline CI/CD, strumento di automazione) si autentica con una **chiave API**. Una chiave appartiene a un **progetto** e conferisce, su quel solo progetto, i diritti dei suoi **scope**.

Gli amministratori del progetto creano e revocano le sue chiavi dalla console, scheda **API keys** delle impostazioni del progetto: vedere [Ottenere una chiave](#obtenir).

---

## Presentare la chiave

La chiave si trasmette nell'intestazione `X-Hikube-Api-Key`, a ogni richiesta:

```bash
curl -sS "$HIKUBE_API/instance/v1alpha1/projects/$PROJECT_ID/instances" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY"
```

Non utilizzi l'intestazione `Authorization`: è riservata alle sessioni della console. Se una richiesta le contiene entrambe, si applica la chiave API.

Una richiesta senza chiave viene rifiutata con `403` e il codice `10002`, come una chiave non valida (vedere [Accesso negato](./errors.md#acces-refuse)). Il rifiuto segue il formato di errore dell'API, con il relativo `requestId`.

Una chiave ha la forma `sk_hk_<keyId>_<secret>`:

- `sk_hk_` è un prefisso fisso, che permette agli strumenti di rilevamento dei segreti di riconoscere una chiave Hikube dimenticata in un repository o in un log;
- `<keyId>` identifica la chiave (32 caratteri esadecimali); figura nell'elenco delle chiavi del progetto e serve a revocarla;
- `<secret>` è la parte segreta. Hikube ne conserva solo un'impronta: il segreto viene mostrato **una sola volta**, alla creazione della chiave, e non può essere recuperato in seguito.

---

## Scope {#scopes}

Una chiave porta uno o più scope. Ogni scope corrisponde a un livello di diritti sul progetto, dal più basso al più alto; uno scope include i diritti degli scope inferiori.

| Scope | Corrisponde al ruolo | Utilizzo |
|-------|--------------------|-------|
| `read` | Read | Tutte le operazioni `GET`: risorse, stato, cataloghi |
| `write` | Use | I diritti di `read`, più avviare, arrestare e riavviare una VM. Né creazione, né modifica, né eliminazione, né lettura di credenziali |
| `admin` | Admin | Creare, modificare ed eliminare risorse; riavviare un database gestito; creare utenti e ruotarne le password; leggere le credenziali (kubeconfig, password, chiavi S3) |
| `superadmin` | Super admin | Tutti i diritti sul progetto |

Per una pipeline che distribuisce risorse serve quindi una chiave `admin`. Per uno strumento che accende e spegne VM secondo un orario basta una chiave `write`; per uno strumento di monitoraggio o di inventario, una chiave `read`.

:::warning Una chiave `read` resta un segreto
Ogni chiave API è un segreto, qualunque siano i suoi scope: non la condivida e la conservi in un gestore di segreti.
:::

Una chiave non ha mai più diritti dei suoi scope, qualunque siano i diritti della persona che l'ha creata. Al contrario, una chiave mantiene i propri scope se quella persona perde i suoi: per rimuovere un accesso, revochi la chiave.

:::tip Privilegio minimo
Dia a ogni chiave lo scope più basso sufficiente al suo utilizzo, e una chiave per utilizzo (una pipeline, uno strumento): potrà revocarne una senza interrompere le altre.
:::

---

## Validità

Ogni chiave scade. La sua durata di validità viene scelta alla creazione tra:

| Valore | Durata |
|--------|-------|
| `1d` | 1 giorno |
| `7d` | 7 giorni |
| `30d` | 30 giorni |
| `90d` | 90 giorni (predefinito) |
| `180d` | 180 giorni |
| `365d` | 1 anno (massimo) |

Non esistono chiavi senza data di scadenza. Una chiave scaduta viene rifiutata come una chiave non valida. Un'integrazione di lunga durata deve quindi prevedere la sostituzione della propria chiave prima della scadenza: crei la nuova chiave, la distribuisca, poi revochi la vecchia.

L'elenco delle chiavi di un progetto indica, per ciascuna chiave, la data di scadenza (`expiresAt`) e l'ultimo utilizzo (`lastUsedAt`, al minuto): è il modo per individuare una chiave che non serve più prima di revocarla.

---

## Limiti

- **Una chiave, un progetto.** Una chiave agisce solo sul proprio progetto. Una richiesta destinata a un altro progetto, o all'organizzazione, viene rifiutata.
- **Operazioni accessibili.** Una chiave può chiamare solo le operazioni del [riferimento dell'API](/api/reference/hikube-api/). La gestione dell'account, dell'organizzazione, dei progetti, dei membri e delle chiavi stesse resta riservata agli utenti connessi: **una chiave non può creare né revocare chiavi**.
- **Numero di chiavi per progetto.** Il numero di chiavi attive di un progetto è limitato in base all'offerta dell'organizzazione: **1** per l'offerta di prova Starter, **16** per l'offerta Enterprise. Le chiavi scadute non vengono conteggiate. Oltre questo limite, la creazione viene rifiutata (codice `60009`); revochi una chiave per liberare un posto, oppure contatti il supporto per adeguare il limite.
- **Frequenza.** Le richieste sono limitate per chiave e per indirizzo IP. Oltre il limite, l'API risponde `429` con il codice `10008` e un'intestazione `Retry-After`: vedere [Limiti di frequenza](./errors.md#limites-de-debit).
- **Chi gestisce le chiavi.** Solo gli amministratori del progetto, o della sua organizzazione, creano, elencano e revocano le chiavi di un progetto. Nessuno può creare una chiave i cui scope superino i propri diritti (codice `60003`).

:::note Offerta Starter
Con una sola chiave autorizzata, la sostituzione di una chiave comporta una breve interruzione: revochi la vecchia prima di creare la nuova.
:::

---

## Ottenere una chiave {#obtenir}

Gli amministratori del progetto, o della sua organizzazione, creano le chiavi dalla [console Hikube](https://console.hikube.cloud):

1. Apra le impostazioni del progetto. La scheda **API keys** ne elenca le chiavi.
2. Faccia clic su **Create a key**, quindi indichi:
   - un nome (ad esempio `ci-deploiement`);
   - l'**Access level**: **Read** (`read`), **Use** (`write`), **Admin** (`admin`) o **Super admin** (`superadmin`), mai superiore al suo;
   - la **Validity**, da 1 giorno a 1 anno.
3. Copi la chiave: viene mostrata una sola volta, con un esempio di chiamata. La conservi subito nel suo gestore di segreti.

L'elenco indica, per ciascuna chiave, il livello, la creazione, la scadenza (**Expires soon** negli ultimi 7 giorni, poi **Expired**) e l'ultimo utilizzo. **Renew** crea una nuova chiave con lo stesso nome e lo stesso livello, poi propone di revocare la vecchia.

Un amministratore connesso può anche gestire le chiavi con `POST`, `GET` e `DELETE` su `/iam/v1alpha1/projects/{projectId}/api-keys`, con la propria sessione utente e non con una chiave API. Il corpo di creazione contiene `name`, `scopes` (ad esempio `["read"]`) e `validity` (da `1d` a `365d`, `90d` per impostazione predefinita); la risposta restituisce la chiave completa in `secret`, una sola volta.

L'identificativo del progetto (`projectId`), utilizzato nei percorsi dell'API, figura nell'esempio di chiamata mostrato con la chiave: è l'UUID che segue `/projects/`.

---

## Revocare una chiave {#révoquer-une-clé}

Una chiave revocata viene rifiutata dalla richiesta successiva. Revochi una chiave:

- non appena può essere trapelata (commit, log, screenshot, postazione smarrita);
- quando lo strumento che la utilizzava viene dismesso;
- quando cambia la persona o il team che ne era responsabile.

Nella scheda **API keys** delle impostazioni del progetto, revochi la chiave e confermi digitandone il nome. Con una sessione utente, `DELETE /iam/v1alpha1/projects/{projectId}/api-keys/{keyId}` fa lo stesso: il `keyId` è la parte della chiave tra `sk_hk_` e l'ultimo `_`. Non trasmetta mai il segreto, nemmeno al supporto.

Le chiavi di un progetto eliminato vengono rifiutate dal momento dell'eliminazione, poi cancellate.

---

## Buone pratiche

- **Conservi la chiave in un gestore di segreti** (Vault, gestore di password del team, segreti della sua piattaforma CI/CD), mai in un repository Git, in un'immagine di container, in un file di configurazione versionato o in un ticket.
- **In CI/CD**, dichiari la chiave come variabile segreta mascherata e protetta, limitata ai branch o agli ambienti che ne hanno bisogno. Esempio GitLab CI:

  ```yaml title=".gitlab-ci.yml"
  deploy:
    stage: deploy
    image: alpine:3.20
    # HIKUBE_API_KEY: variabile CI/CD mascherata e protetta, definita nelle
    # impostazioni del progetto GitLab. PROJECT_ID non è un segreto.
    variables:
      HIKUBE_API: "<URL di base dell'API>"   # vedere «Panoramica»
      PROJECT_ID: "<project_id>"
    script:
      - apk add --no-cache curl jq
      - >
        curl -sS --fail-with-body
        "$HIKUBE_API/disk/v1alpha1/projects/$PROJECT_ID/disks"
        -H "X-Hikube-Api-Key: $HIKUBE_API_KEY" | jq '.totalCount'
  ```

- **Non registri la chiave nei log**: eviti `curl -v` e `set -x` negli script che la manipolano, perché mostrano le intestazioni.
- **Una chiave per utilizzo**, con lo scope minimo e la durata più breve compatibile con l'utilizzo.
- **Sorvegli la scadenza** e pianifichi la sostituzione delle chiavi di lunga durata.
- **Reagisca a una fuga** revocando prima la chiave, poi cercando dove è stata utilizzata.

<NavigationFooter
  nextSteps={[
    {label: "Avvio rapido", href: "../quick-start"},
    {label: "Errori", href: "../errors"},
  ]}
  seeAlso={[
    {label: "Panoramica dell'API", href: "../overview"},
  ]}
/>
