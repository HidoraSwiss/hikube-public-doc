---
sidebar_position: 6
title: FAQ
---

# FAQ — Bucket S3

### Qual è l'endpoint S3 Hikube?

L'endpoint S3 pubblico di Hikube è:

```
https://prod.s3.hikube.cloud
```

Questo endpoint è compatibile con l'API AWS S3 standard. Potete utilizzarlo con qualsiasi strumento o SDK compatibile S3.

---

### Quali strumenti sono compatibili?

Tutti gli strumenti compatibili con l'API S3 funzionano con i bucket Hikube:

| Strumento | Configurazione |
|-----------|---------------|
| **aws-cli** | `aws --endpoint-url https://prod.s3.hikube.cloud s3 ls` |
| **mc** (MinIO Client) | `mc alias set hikube https://prod.s3.hikube.cloud ACCESS_KEY SECRET_KEY` |
| **rclone** | Configurare un remote di tipo `s3` con l'endpoint Hikube |
| **s3cmd** | Configurare `host_base` e `host_bucket` verso l'endpoint Hikube |
| **Velero** | Backup Kubernetes verso S3 Hikube |
| **Restic** | Backup di file verso S3 Hikube |

Qualsiasi libreria compatibile AWS S3 (boto3, aws-sdk-js, ecc.) funziona altrettanto.

---

### Come funzionano le credenziali?

Quando un bucket viene creato, Hikube genera automaticamente un Secret Kubernetes denominato `bucket-<name>`. Questo secret contiene una chiave `BucketInfo` in formato JSON con tutte le informazioni di accesso:

```bash
kubectl get tenantsecret bucket-<name> -o jsonpath='{.data.BucketInfo}' | base64 -d | jq
```

Il JSON contiene:

| Campo | Descrizione |
|-------|-------------|
| `spec.bucketName` | Nome reale del bucket nel backend S3 |
| `spec.secretS3.endpoint` | Endpoint S3 (`https://prod.s3.hikube.cloud`) |
| `spec.secretS3.accessKeyID` | Chiave di accesso S3 |
| `spec.secretS3.accessSecretKey` | Chiave segreta S3 |

:::warning
Utilizzate `spec.bucketName` (e non `metadata.name`) come nome del bucket durante l'accesso S3. Il nome reale viene generato automaticamente e differisce dal nome Kubernetes.
:::

---

### Si possono avere più bucket?

Sì, potete creare quanti bucket necessari. Ogni risorsa `Bucket` provisiona un bucket indipendente con le proprie credenziali:

```yaml title="bucket-logs.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Bucket
metadata:
  name: app-logs
```

```yaml title="bucket-backups.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Bucket
metadata:
  name: db-backups
```

Ogni bucket genera il proprio Secret (`bucket-app-logs`, `bucket-db-backups`) con credenziali distinte.

---

### Qual è la durabilità dei dati?

I dati archiviati nei bucket Hikube beneficiano di una **tripla replica** su tre datacenter:

- Ginevra
- Gland
- Lucerna

Questa architettura garantisce l'alta disponibilità e la durabilità dei dati, anche in caso di guasto completo di un datacenter.

---

### La configurazione è davvero solo metadata.name?

Sì, l'oggetto `Bucket` è volutamente minimale. Nessun campo `spec` è richiesto:

```yaml title="bucket.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Bucket
metadata:
  name: mio-bucket
```

Questo è tutto ciò che serve per provisionare un bucket S3 funzionante. L'endpoint, le credenziali e il nome reale del bucket sono automaticamente generati e messi a disposizione nel Secret associato.
