---
sidebar_position: 3
title: Avvio rapido
---

import NavigationFooter from '@site/src/components/NavigationFooter';
import {ApiEnv} from '@site/src/components/HikubeApi';

# Prime chiamate all'API pubblica

Questa guida la accompagna dall'ottenimento di una chiave API fino alla creazione di una prima risorsa, un bucket S3, con `curl`.

:::warning Anteprima
L'API pubblica è in anteprima (`v1alpha1`): percorsi e campi possono ancora evolvere.
:::

---

## Obiettivi

Al termine di questa guida disporrà di:

- Una **chiave API** e l'**identificativo del suo progetto**
- Un **ambiente shell** pronto per tutti gli esempi della documentazione
- Una **prima chiamata** di lettura riuscita
- Un **bucket S3** creato tramite l'API, con un utente e le relative chiavi di accesso

---

## Prerequisiti

- Un **account Hikube** e un **progetto** (vedere l'[avvio rapido Hikube](../../getting-started/quick-start))
- Essere **amministratore** del progetto o della sua organizzazione, oppure rivolgersi a un amministratore, per ottenere la chiave
- `curl` e [`jq`](https://jqlang.org/) sulla sua postazione

---

## Passo 1: Ottenere una chiave e l'identificativo del progetto {#project-id}

Un amministratore del progetto o dell'organizzazione crea la chiave nella console: impostazioni del progetto, scheda **API keys**, **Create a key** (vedere [Ottenere una chiave](./authentication.md#obtenir)).

Per questa guida, crei una chiave di livello **Admin** (`admin`): deve poter creare ed eliminare un bucket. Una validità di 7 giorni è sufficiente per una prova.

La console mostra:

- la **chiave**, nella forma `sk_hk_<keyId>_<secret>`. Viene mostrata una sola volta: la registri subito nel suo gestore di segreti;
- un esempio di chiamata, che contiene l'**identificativo del progetto** (`projectId`) dopo `/projects/`: un UUID come `01928f6e-7b2c-7d4e-9a10-3f5b6c7d8e9f`.

:::note Identificativo del progetto
Rilevi l'identificativo del progetto nell'esempio di chiamata. Non lo confonda con il nome del progetto, né con l'**Organization ID** visualizzato in **My Account**.
:::

---

## Passo 2: Preparare l'ambiente {#environnement}

Tutti gli esempi `curl` della documentazione leggono l'URL di base, la chiave e l'identificativo del progetto da tre variabili. Le definisca nella sua shell:

<ApiEnv />

Sostituisca `sk_hk_<keyId>_<secret>` e `<project_id>` con i suoi valori. Per non lasciare la chiave nella cronologia della shell, la legga dal suo gestore di segreti anziché digitarla in chiaro.

---

## Passo 3: Effettuare una prima chiamata di lettura

Inizi da un catalogo, che non dipende da alcun progetto: l'elenco dei tipi di istanza.

```bash
curl -sS "$HIKUBE_API/instance/v1alpha1/instance-types" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY" | jq .
```

Poi elenchi i bucket del suo progetto, il che verifica la chiave **e** l'identificativo del progetto:

```bash
curl -sS "$HIKUBE_API/bucket/v1alpha1/projects/$PROJECT_ID/buckets" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY" | jq .
```

**Risultato atteso:**

```json
{
  "totalCount": "0",
  "buckets": []
}
```

I campi interi a 64 bit, come `totalCount`, vengono restituiti sotto forma di stringa. Una risposta `403` con il codice `10002` significa che la chiave non è valida, è scaduta, è stata revocata, oppure non appartiene a questo progetto.

---

## Passo 4: Creare un bucket

```bash
curl -sS -X POST "$HIKUBE_API/bucket/v1alpha1/projects/$PROJECT_ID/buckets" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"name": "demoapi", "locking": false, "encrypted": false}'
```

- `name`: massimo 16 caratteri, lettere minuscole e cifre;
- `locking`: blocco degli oggetti (WORM), non modificabile dopo la creazione;
- `encrypted`: cifratura a riposo, non modificabile dopo la creazione.

La risposta descrive il bucket, con il suo `id` e uno `status` a `provisioning`. La creazione è asincrona: passi al passo successivo.

---

## Passo 5: Verificare lo stato e recuperare le credenziali

Interroghi il bucket finché il suo stato non è `ready`:

```bash
curl -sS "$HIKUBE_API/bucket/v1alpha1/projects/$PROJECT_ID/buckets/demoapi" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY" | jq '{name, status, bucketName, endpoint}'
```

**Risultato atteso:** `status` vale `ready`; `bucketName` è il nome S3 del bucket ed `endpoint` l'URL del punto di accesso S3.

Crei poi un utente del bucket, in lettura e scrittura:

```bash
curl -sS -X POST "$HIKUBE_API/bucket/v1alpha1/projects/$PROJECT_ID/buckets/demoapi/users" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"username": "app", "config": {"readonly": false}}'
```

La risposta contiene `bucketName`, `endpoint` e `secrets.accessKeyId` / `secrets.accessSecretKey`.

:::warning Chiavi S3 mostrate una sola volta
Le chiavi S3 vengono restituite solo alla creazione dell'utente. Le registri subito nel suo gestore di segreti. In caso di smarrimento, ne generi di nuove con `POST .../users/app/rotate-credentials`.
:::

Verifichi l'accesso con un client S3, ad esempio l'AWS CLI (vedere [Bucket — avvio rapido](../../services/storage/buckets/quick-start)).

---

## Passo 6: Risoluzione rapida dei problemi

| Sintomo | Causa probabile | Azione |
|----------|----------------|--------|
| `403`, codice `10002` | Chiave non valida, scaduta o revocata, `PROJECT_ID` errato, o scope insufficiente (`read` per una creazione) | Verifichi le variabili; la creazione richiede una chiave `admin` |
| `400`, codice di validazione | Campo non valido (nome troppo lungo, carattere non consentito…) | Legga `message`, che indica il campo in questione |
| `409` | Una risorsa con questo nome esiste già nel progetto | Scelga un altro nome |
| `503`, codice `10004` | Verifica della chiave momentaneamente impossibile | Riprovi dopo qualche secondo: la chiave non è in causa |
| `curl: (6) Could not resolve host` | `HIKUBE_API` vuota o errata | Ripeta il passo 2 |

Vedere anche [Errori](./errors.md).

---

## Passo 7: Pulizia

Elimini l'utente, poi il bucket:

```bash
curl -sS -X DELETE "$HIKUBE_API/bucket/v1alpha1/projects/$PROJECT_ID/buckets/demoapi/users/app" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY"

curl -sS -X DELETE "$HIKUBE_API/bucket/v1alpha1/projects/$PROJECT_ID/buckets/demoapi" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY"
```

Ogni eliminazione riuscita restituisce `200` e un oggetto vuoto `{}`.

:::warning Eliminazione irreversibile
L'eliminazione di un bucket è definitiva. Un bucket che contiene ancora oggetti non può essere eliminato: lo svuoti prima con il suo client S3.
:::

Se la chiave serviva solo per questa prova, ne richieda la revoca (vedere [Revocare una chiave](./authentication.md#révoquer-une-clé)).

<NavigationFooter
  nextSteps={[
    {label: "Autenticazione e buone pratiche", href: "../authentication"},
    {label: "Riferimento dell'API", href: "../reference/hikube-api"},
  ]}
  seeAlso={[
    {label: "Errori", href: "../errors"},
    {label: "FAQ dell'API", href: "../faq"},
  ]}
/>
