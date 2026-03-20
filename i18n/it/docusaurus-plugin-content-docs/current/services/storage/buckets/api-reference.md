---
sidebar_position: 3
title: Riferimento API
---

# Riferimento API - Bucket S3

Questo riferimento descrive in dettaglio l'API `Bucket` di Hikube, utilizzata per provisionare bucket S3 compatibili [MinIO](https://min.io/) nel vostro tenant Kubernetes.
I bucket S3 consentono di archiviare e servire dati (file, oggetti, backup, log, ecc.) in modo durevole, altamente disponibile e compatibile con gli strumenti S3 standard.

---

## Bucket

### **Panoramica**

L'API `Bucket` consente di creare bucket S3 direttamente da Kubernetes.

```yaml
apiVersion: apps.cozystack.io/v1alpha1
kind: Bucket
metadata:
  name: example-bucket
```

> 📌 La creazione di un oggetto `Bucket` nel vostro tenant comporta automaticamente la creazione del bucket corrispondente nel backend S3.

---

### **Specifica Completa**

L'oggetto `Bucket` non possiede **alcun campo `spec` configurabile**.
L'unica parte necessaria è il **metadato `metadata.name`**, che definisce il nome del bucket creato nell'interfaccia utente.

| **Parametro**        | **Tipo** | **Descrizione**                                      | **Richiesto** |
| -------------------- | -------- | ---------------------------------------------------- | ------------- |
| `metadata.name`      | string   | Nome unico del bucket (utilizzato come nome S3)     | ✅             |

---

### **Esempio Minimo**

```yaml title="zitadel-bucket.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Bucket
metadata:
  name: backup-prod
```

---

## 🔐 Secret di Accesso S3

Quando un bucket viene creato, Hikube genera automaticamente un secret Kubernetes associato.
Questo secret è nominato secondo il pattern seguente:

```txt
bucket-<nome-del-bucket>
```

Ad esempio:

```bash
kubectl get secret
```

```bash
NAME                  TYPE     DATA   AGE
bucket-backup-prod    Opaque   1      10s
```

Il contenuto di questo secret è archiviato in una **chiave unica `BucketInfo`** in formato JSON:

```json
{
  "metadata": {
    "name": "bc-254505e2-1f26-4f47-bf75-42faae918531",
    "creationTimestamp": null
  },
  "spec": {
    "bucketName": "bucket-1df67984-321d-492d-bb06-2f4527bb0f5b",
    "authenticationType": "KEY",
    "secretS3": {
      "endpoint": "https://prod.s3.hikube.cloud",
      "region": "",
      "accessKeyID": "UYL5FFZ0GWTQ4LCN4AI0",
      "accessSecretKey": "L1ZJy67a2PKdOmKqjeuTWQd/4HjJVMJdxnEX4ewq"
    },
    "secretAzure": null,
    "protocols": ["s3"]
  }
}
```

---

### **Campi Importanti**

| **Campo**                       | **Descrizione**                               |
| ------------------------------- | --------------------------------------------- |
| `spec.bucketName`               | Nome interno reale del bucket nel backend S3  |
| `spec.secretS3.endpoint`        | Endpoint HTTPS del servizio S3 Hikube         |
| `spec.secretS3.accessKeyID`     | Chiave di accesso S3 generata per questo bucket |
| `spec.secretS3.accessSecretKey` | Chiave segreta S3 associata                   |
| `spec.protocols`                | Protocolli supportati (attualmente `["s3"]`)  |

---

### **Estrazione delle credenziali**

Potete recuperare le informazioni con `kubectl` e `jq`:

```bash
kubectl get secret bucket-bckprd -o jsonpath='{.data.BucketInfo}' | base64 -d | jq
```

Oppure per estrarre solo la chiave e il segreto:

```bash
kubectl get secret bucket-bckprd -o jsonpath='{.data.BucketInfo}' \
  | base64 -d \
  | jq -r '.spec.secretS3.accessKeyID, .spec.secretS3.accessSecretKey'
```

---

## 🌐 Endpoint S3

L'endpoint pubblico per accedere ai vostri bucket è:

```url
https://prod.s3.hikube.cloud
```

Potete utilizzarlo con:

* `aws-cli` (configurando un profilo con `--endpoint-url`)
* `mc` (MinIO Client)
* `rclone`, `s3cmd`, Velero, o qualsiasi libreria compatibile AWS S3.

---

## ⚠️ Buone Pratiche

### **Sicurezza**

* Non archiviate mai le vostre chiavi S3 in chiaro nei manifesti o nei repository Git.
* Utilizzate sempre i Secret Kubernetes e montaggi sicuri.
* Limitate i permessi allo stretto necessario (1 bucket = 1 coppia di chiavi idealmente).

### **Denominazione**

* Utilizzate nomi espliciti per identificare facilmente i bucket.
* Tenete presente che il nome reale in S3 (`bucketName`) viene generato automaticamente e può differire dal nome Kubernetes.

### **Utilizzo**

* Configurate i vostri strumenti S3 per puntare a `https://prod.s3.hikube.cloud`.
* Utilizzate la chiave `accessKeyID` e `accessSecretKey` fornite nel secret associato.

---

:::tip Buono a sapersi
Ogni bucket creato tramite l'API Hikube è archiviato su un'infrastruttura **triple-replicata** e beneficia dell'alta disponibilità nativa del cluster S3.
:::
