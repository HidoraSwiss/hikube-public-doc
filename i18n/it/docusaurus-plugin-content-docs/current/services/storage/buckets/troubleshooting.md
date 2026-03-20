---
sidebar_position: 7
title: Risoluzione dei problemi
---

# Risoluzione dei problemi — Bucket S3

### AccessDenied durante l'accesso al bucket

**Causa**: le credenziali utilizzate sono errate, oppure il nome del bucket utilizzato non corrisponde al nome reale nel backend S3.

**Soluzione**:

1. Recuperate le credenziali dal Secret Kubernetes:
   ```bash
   kubectl get tenantsecret bucket-<name> -o jsonpath='{.data.BucketInfo}' | base64 -d | jq
   ```

2. Utilizzate il campo `spec.bucketName` come nome del bucket (e non `metadata.name`):
   ```bash
   aws --endpoint-url https://prod.s3.hikube.cloud s3 ls s3://<spec.bucketName>/
   ```

3. Verificate che `accessKeyID` e `accessSecretKey` siano correttamente configurati nel vostro strumento S3.

---

### ListBucket fallisce sulla root

**Causa**: ogni bucket possiede le proprie credenziali isolate. Non è possibile elencare tutti i bucket con un unico set di credenziali.

**Soluzione**:

1. Utilizzate le credenziali specifiche del bucket che desiderate elencare:
   ```bash
   aws --endpoint-url https://prod.s3.hikube.cloud s3 ls s3://<spec.bucketName>/
   ```

2. Per elencare tutti i vostri bucket, utilizzate `kubectl`:
   ```bash
   kubectl get buckets
   ```

3. Per ogni bucket, recuperate le credenziali individuali dal Secret corrispondente.

---

### Credenziali introvabili

**Causa**: il nome del Secret segue il pattern `bucket-<name>` dove `<name>` è il `metadata.name` della risorsa Bucket.

**Soluzione**:

1. Elencate i Secret disponibili:
   ```bash
   kubectl get tenantsecrets | grep bucket-
   ```

2. Estraete le informazioni di accesso:
   ```bash
   kubectl get tenantsecret bucket-<name> -o jsonpath='{.data.BucketInfo}' | base64 -d | jq
   ```

3. Per estrarre solo le chiavi:
   ```bash
   kubectl get tenantsecret bucket-<name> -o jsonpath='{.data.BucketInfo}' \
     | base64 -d \
     | jq -r '.spec.secretS3 | "\(.accessKeyID) \(.accessSecretKey)"'
   ```

---

### Upload lento o timeout

**Causa**: problema di rete, dimensione del file importante senza multipart upload, o endpoint distante.

**Soluzione**:

1. Verificate la vostra connettività verso l'endpoint:
   ```bash
   curl -s -o /dev/null -w "%{time_total}" https://prod.s3.hikube.cloud
   ```

2. Utilizzate l'endpoint regionale `https://prod.s3.hikube.cloud` (senza CDN intermedio).

3. Per file voluminosi, attivate il multipart upload:
   ```bash
   aws --endpoint-url https://prod.s3.hikube.cloud s3 cp large-file.tar.gz s3://<bucket-name>/ \
     --expected-size $(stat -c%s large-file.tar.gz)
   ```

4. Con `mc`, il multipart è automatico per i file superiori a 64 MB.

---

### Bucket non trovato dopo la creazione

**Causa**: il nome reale del bucket nel backend S3 (`spec.bucketName`) differisce dal `metadata.name` della risorsa Kubernetes.

**Soluzione**:

1. Verificate lo stato della risorsa Bucket:
   ```bash
   kubectl get bucket <name>
   kubectl describe bucket <name>
   ```

2. Recuperate il nome reale del bucket dal Secret:
   ```bash
   kubectl get tenantsecret bucket-<name> -o jsonpath='{.data.BucketInfo}' \
     | base64 -d \
     | jq -r '.spec.bucketName'
   ```

3. Utilizzate questo nome reale per accedere al bucket:
   ```bash
   aws --endpoint-url https://prod.s3.hikube.cloud s3 ls s3://<real-bucket-name>/
   ```

:::warning
Non confondete `metadata.name` (nome Kubernetes) e `spec.bucketName` (nome reale in S3). Solo il secondo funziona per l'accesso S3.
:::
