---
sidebar_position: 3
title: Avvio rapido
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# Creare il primo bucket S3

Questa guida la accompagna nella creazione del suo **primo bucket S3** dalla [console Hikube](https://console.hikube.cloud), fino al primo caricamento di un file.

---

## Obiettivi

Al termine di questa guida disporrà di:

- Un **bucket S3** operativo nel suo progetto
- Un **utente S3** con la relativa coppia di chiavi di accesso
- Un primo file caricato con `aws` o `mc`

---

## Prerequisiti

- Un **account Hikube** e un **progetto** (vedere l'[avvio rapido Hikube](../../../getting-started/quick-start.md))
- Un client S3 installato sulla sua postazione: [AWS CLI](https://aws.amazon.com/cli/) o [MinIO Client (`mc`)](https://min.io/docs/minio/linux/reference/minio-mc.html)

---

## Passo 1: Aprire la procedura guidata di creazione

1. Acceda alla [console Hikube](https://console.hikube.cloud) e selezioni il suo progetto.
2. Nel menu laterale, apra **Infrastructure** → **S3 Buckets**. Viene visualizzata la pagina **Object Storage Buckets**.
3. Faccia clic su **Create a bucket**.

---

## Passo 2: Configurare e creare il bucket

La procedura guidata comprende tre passaggi.

### General

1. Inserisca il nome nel campo **Bucket name** (viene proposto un nome predefinito). Regole: lettere minuscole, cifre e trattini; inizia con una lettera e termina con una lettera o una cifra; massimo 16 caratteri. Esempio: `demo-assets`.
2. Per questa guida lasci deselezionate le opzioni:
   - **Enable Object Lock (WORM)**: impedisce l'eliminazione o la modifica degli oggetti per 365 giorni (conservazione fissata dalla piattaforma);
   - **Enable encryption at rest (LUKS)**: cifra i dati memorizzati; non può essere modificata dopo la creazione.
3. Faccia clic su **Next**.

### Users

1. Inserisca il nome nel campo **Username** (ad esempio `app-user`).
2. Lasci **Read only** su **No** per ottenere un accesso in lettura e scrittura.
3. Faccia clic su **Add**, quindi su **Next**.

Per continuare è necessario almeno un utente.

### Summary

Il **Summary** mostra il nome, il progetto, il numero di utenti da creare, lo stato del blocco e della cifratura, nonché l'**Estimated Cost** per GB. Faccia clic su **Create bucket**.

Durante la creazione, il pulsante mostra **Creating...** e poi **Provisioning bucket…**: la console attende che il bucket sia pronto prima di creare gli utenti.

---

## Passo 3: Verificare lo stato del bucket

La schermata finale mostra **Bucket successfully created**. Dopo aver recuperato le credenziali (passo 4), faccia clic su **Finish**: la console apre la pagina del bucket.

In questa pagina:

- il badge di stato indica **Ready** quando il bucket è operativo (**Creating** durante il provisioning);
- i badge **WORM** e **LUKS** ricordano lo stato del blocco e della cifratura;
- la scheda **Access & Configuration** mostra il **Bucket name** S3 e l'**Endpoint**;
- la scheda **Users & Access** elenca gli utenti e il loro diritto (**Read-only** o **Read / Write**).

![Pagina di un bucket: nome S3, endpoint e utenti](/img/console/buckets/bucket-detail.en.png)


:::note
Se il bucket non è pronto in tempo, la console mostra «Bucket provisioning» e non crea gli utenti. Attenda che il bucket passi a **Ready**, quindi li crei dalla sua pagina con **Add User** (vedere [Gestire gli utenti e le chiavi di accesso](./how-to/configure-access.md)).
:::

---

## Passo 4: Recuperare le credenziali

La schermata finale della procedura guidata mostra, per ciascun utente creato:

| Campo | Utilizzo |
|-------|-------|
| **S3 Bucket Name** | Nome effettivo del bucket da utilizzare nei suoi comandi e SDK |
| **Access Key** | Access Key ID |
| **Secret Key** | Secret Access Key |
| **API Endpoint (S3)** | Endpoint S3, ad esempio `prod.s3.hikube.cloud` |

![Schermata finale della procedura guidata del bucket: credenziali dell'utente (chiave segreta oscurata)](/img/console/buckets/wizard-credentials.en.png)


:::warning Chiave segreta mostrata una sola volta
Copi questi valori prima di cliccare su **Finish** e conservi la chiave segreta in un gestore di password. Non verrà più mostrata. In caso di smarrimento, crei un nuovo utente.
:::

:::note S3 Bucket Name
Il **S3 Bucket Name** è generato dalla piattaforma e differisce dal nome inserito nella procedura guidata. Utilizzi sempre il nome S3 nei suoi client. Resta consultabile nella pagina del bucket.
:::

Esporti i valori nel suo terminale:

```bash
export S3_ENDPOINT="https://<endpoint>"
export AWS_ACCESS_KEY_ID="<chiave-di-accesso>"
export AWS_SECRET_ACCESS_KEY="<chiave-segreta>"
export BUCKET_NAME="<nome-del-bucket-s3>"
```

Se l'endpoint viene visualizzato senza prefisso (ad esempio `prod.s3.hikube.cloud`), aggiunga `https://` davanti: i client `aws` e `mc` si aspettano un URL completo.

---

## Passo 5: Connessione e test

:::warning Indichi il suo bucket
Le chiavi di un utente non danno il permesso di elencare tutti i bucket dell'endpoint. I comandi devono **sempre indicare il suo bucket**: `s3://$BUCKET_NAME/` o `hikube/$BUCKET_NAME/`.
:::

### Opzione A: AWS CLI

```bash
# Caricare un file di test
echo "hello hikube" > /tmp/hello.txt
aws --endpoint-url "$S3_ENDPOINT" s3 cp /tmp/hello.txt "s3://$BUCKET_NAME/hello.txt"

# Elencare il contenuto del bucket
aws --endpoint-url "$S3_ENDPOINT" s3 ls "s3://$BUCKET_NAME/"
```

### Opzione B: MinIO Client (`mc`)

```bash
# Definire un alias per l'endpoint
mc alias set hikube "$S3_ENDPOINT" "$AWS_ACCESS_KEY_ID" "$AWS_SECRET_ACCESS_KEY"

# Caricare un file di test e poi elencare il bucket
mc cp /tmp/hello.txt "hikube/$BUCKET_NAME/hello.txt"
mc ls "hikube/$BUCKET_NAME/"
```

**Risultato atteso:** il file `hello.txt` compare nell'elenco.

:::tip
La scheda **Access & Configuration** della pagina del bucket propone questi comandi, già completati con l'endpoint e il nome del bucket, nella sezione **Connection example**.
:::

---

## Passo 6: Risoluzione rapida dei problemi

| Sintomo | Causa probabile | Azione |
|----------|----------------|--------|
| `AccessDenied` su `aws s3 ls` senza bucket | Elenco dell'intero endpoint | Indichi `s3://$BUCKET_NAME/` |
| `NoSuchBucket` | Utilizzato il nome inserito nella procedura guidata invece del nome S3 | Utilizzi il **Bucket name** visualizzato in **Access & Configuration** |
| `AccessDenied` in scrittura | Utente in **Read-only** | Modifichi il suo diritto con **Edit access** |
| `SignatureDoesNotMatch` / `InvalidAccessKeyId` | Chiavi errate o incomplete | Ricopi le chiavi; se la chiave segreta è andata persa, crei un nuovo utente |
| Errore di connessione | Endpoint senza `https://` | Anteponga `https://` all'endpoint |

Vedere anche la [risoluzione dei problemi completa](./troubleshooting.md).

---

## Passo 7: Pulizia

1. Elimini il file di test:
   ```bash
   aws --endpoint-url "$S3_ENDPOINT" s3 rm "s3://$BUCKET_NAME/hello.txt"
   ```
2. Nella pagina del bucket, faccia clic su **Delete** (oppure, dall'elenco, apra il menu delle azioni del bucket e scelga **Delete**).
3. Inserisca il nome esatto del bucket in **Resource name to confirm**, quindi faccia clic su **Permanently delete**.

:::warning Eliminazione irreversibile
L'eliminazione di un bucket è definitiva. Se la console risponde «The bucket is not empty or is still in use.», svuoti il bucket e riprovi.
:::

<NavigationFooter
  nextSteps={[
    {label: "Gestire gli utenti e le chiavi di accesso", href: "../how-to/configure-access"},
    {label: "Collegare un'applicazione", href: "../how-to/connect-from-app"},
  ]}
/>
