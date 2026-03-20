---
sidebar_position: 7
title: Fehlerbehebung
---

# Fehlerbehebung — S3 Buckets

### AccessDenied beim Zugriff auf den Bucket

**Ursache**: Die verwendeten Zugangsdaten sind falsch, oder der verwendete Bucket-Name entspricht nicht dem tatsächlichen Namen im S3-Backend.

**Lösung**:

1. Rufen Sie die Zugangsdaten aus dem Kubernetes Secret ab:
   ```bash
   kubectl get tenantsecret bucket-<name> -o jsonpath='{.data.BucketInfo}' | base64 -d | jq
   ```

2. Verwenden Sie das Feld `spec.bucketName` als Bucket-Namen (nicht `metadata.name`):
   ```bash
   aws --endpoint-url https://prod.s3.hikube.cloud s3 ls s3://<spec.bucketName>/
   ```

3. Überprüfen Sie, ob `accessKeyID` und `accessSecretKey` in Ihrem S3-Tool korrekt konfiguriert sind.

---

### ListBucket schlägt am Root fehl

**Ursache**: Jeder Bucket verfügt über eigene isolierte Zugangsdaten. Es ist nicht möglich, alle Buckets mit einem einzigen Satz von Zugangsdaten aufzulisten.

**Lösung**:

1. Verwenden Sie die spezifischen Zugangsdaten des Buckets, den Sie auflisten möchten:
   ```bash
   aws --endpoint-url https://prod.s3.hikube.cloud s3 ls s3://<spec.bucketName>/
   ```

2. Um alle Ihre Buckets aufzulisten, verwenden Sie `kubectl`:
   ```bash
   kubectl get buckets
   ```

3. Für jeden Bucket rufen Sie die individuellen Zugangsdaten aus dem entsprechenden Secret ab.

---

### Zugangsdaten nicht auffindbar

**Ursache**: Der Name des Secrets folgt dem Muster `bucket-<name>`, wobei `<name>` der `metadata.name` der Bucket-Ressource ist.

**Lösung**:

1. Listen Sie die verfügbaren Secrets auf:
   ```bash
   kubectl get tenantsecrets | grep bucket-
   ```

2. Extrahieren Sie die Zugangsinformationen:
   ```bash
   kubectl get tenantsecret bucket-<name> -o jsonpath='{.data.BucketInfo}' | base64 -d | jq
   ```

3. Um nur die Schlüssel zu extrahieren:
   ```bash
   kubectl get tenantsecret bucket-<name> -o jsonpath='{.data.BucketInfo}' \
     | base64 -d \
     | jq -r '.spec.secretS3 | "\(.accessKeyID) \(.accessSecretKey)"'
   ```

---

### Langsamer Upload oder Timeout

**Ursache**: Netzwerkproblem, große Dateigröße ohne Multipart-Upload oder entfernter Endpunkt.

**Lösung**:

1. Überprüfen Sie Ihre Konnektivität zum Endpunkt:
   ```bash
   curl -s -o /dev/null -w "%{time_total}" https://prod.s3.hikube.cloud
   ```

2. Verwenden Sie den regionalen Endpunkt `https://prod.s3.hikube.cloud` (kein zwischengeschaltetes CDN).

3. Für große Dateien aktivieren Sie den Multipart-Upload:
   ```bash
   aws --endpoint-url https://prod.s3.hikube.cloud s3 cp large-file.tar.gz s3://<bucket-name>/ \
     --expected-size $(stat -c%s large-file.tar.gz)
   ```

4. Mit `mc` erfolgt Multipart automatisch bei Dateien über 64 MB.

---

### Bucket nach Erstellung nicht gefunden

**Ursache**: Der tatsächliche Bucket-Name im S3-Backend (`spec.bucketName`) unterscheidet sich vom `metadata.name` der Kubernetes-Ressource.

**Lösung**:

1. Überprüfen Sie den Status der Bucket-Ressource:
   ```bash
   kubectl get bucket <name>
   kubectl describe bucket <name>
   ```

2. Rufen Sie den tatsächlichen Bucket-Namen aus dem Secret ab:
   ```bash
   kubectl get tenantsecret bucket-<name> -o jsonpath='{.data.BucketInfo}' \
     | base64 -d \
     | jq -r '.spec.bucketName'
   ```

3. Verwenden Sie diesen tatsächlichen Namen für den Zugriff auf den Bucket:
   ```bash
   aws --endpoint-url https://prod.s3.hikube.cloud s3 ls s3://<real-bucket-name>/
   ```

:::warning
Verwechseln Sie nicht `metadata.name` (Kubernetes-Name) und `spec.bucketName` (tatsächlicher Name in S3). Nur der zweite funktioniert für den S3-Zugriff.
:::
