---
sidebar_position: 7
title: Fehlerbehebung
---

# Fehlerbehebung — Buckets S3

### AccessDenied lors de l'accès au bucket

**Ursache**: les credentials utilisées sont incorrectes, ou le nom de bucket utilisé ne correspond pas au nom réel dans le backend S3.

**Lösung**:

1. Récupérez les credentials depuis le Secret Kubernetes :
   ```bash
   kubectl get tenantsecret bucket-<name> -o jsonpath='{.data.BucketInfo}' | base64 -d | jq
   ```

2. Utilisez le champ `spec.bucketName` comme nom de bucket (et non `metadata.name`) :
   ```bash
   aws --endpoint-url https://prod.s3.hikube.cloud s3 ls s3://<spec.bucketName>/
   ```

3. Überprüfen Sie, ob `accessKeyID` et `accessSecretKey` sont correctement configurés dans votre outil S3.

---

### ListBucket échoue sur la racine

**Ursache**: chaque bucket possède ses propres credentials isolées. Il n'est pas possible de lister tous les buckets avec un seul jeu de credentials.

**Lösung**:

1. Utilisez les credentials spécifiques au bucket que vous souhaitez lister :
   ```bash
   aws --endpoint-url https://prod.s3.hikube.cloud s3 ls s3://<spec.bucketName>/
   ```

2. Pour lister tous vos buckets, utilisez `kubectl` :
   ```bash
   kubectl get buckets
   ```

3. Pour chaque bucket, récupérez les credentials individuelles depuis le Secret correspondant.

---

### Credentials introuvables

**Ursache**: le nom du Secret suit le pattern `bucket-<name>` où `<name>` est le `metadata.name` de la ressource Bucket.

**Lösung**:

1. Listez les Secrets disponibles :
   ```bash
   kubectl get tenantsecrets | grep bucket-
   ```

2. Extrayez les informations d'accès :
   ```bash
   kubectl get tenantsecret bucket-<name> -o jsonpath='{.data.BucketInfo}' | base64 -d | jq
   ```

3. Pour extraire uniquement les clés :
   ```bash
   kubectl get tenantsecret bucket-<name> -o jsonpath='{.data.BucketInfo}' \
     | base64 -d \
     | jq -r '.spec.secretS3 | "\(.accessKeyID) \(.accessSecretKey)"'
   ```

---

### Upload lent ou timeout

**Ursache**: problème réseau, taille de fichier importante sans multipart upload, ou endpoint distant.

**Lösung**:

1. Vérifiez votre connectivité vers l'endpoint :
   ```bash
   curl -s -o /dev/null -w "%{time_total}" https://prod.s3.hikube.cloud
   ```

2. Utilisez l'endpoint régional `https://prod.s3.hikube.cloud` (pas de CDN intermédiaire).

3. Pour les fichiers volumineux, aktiviertz le multipart upload :
   ```bash
   aws --endpoint-url https://prod.s3.hikube.cloud s3 cp large-file.tar.gz s3://<bucket-name>/ \
     --expected-size $(stat -c%s large-file.tar.gz)
   ```

4. Avec `mc`, le multipart est automatique pour les fichiers de plus de 64 Mo.

---

### Bucket non trouvé après création

**Ursache**: le nom réel du bucket dans le backend S3 (`spec.bucketName`) diffère du `metadata.name` de la ressource Kubernetes.

**Lösung**:

1. Vérifiez le statut de la ressource Bucket :
   ```bash
   kubectl get bucket <name>
   kubectl describe bucket <name>
   ```

2. Récupérez le nom réel du bucket depuis le Secret :
   ```bash
   kubectl get tenantsecret bucket-<name> -o jsonpath='{.data.BucketInfo}' \
     | base64 -d \
     | jq -r '.spec.bucketName'
   ```

3. Utilisez ce nom réel pour accéder au bucket :
   ```bash
   aws --endpoint-url https://prod.s3.hikube.cloud s3 ls s3://<real-bucket-name>/
   ```

:::warning
Ne confondez pas `metadata.name` (nom Kubernetes) et `spec.bucketName` (nom réel dans S3). Seul le second fonctionne pour l'accès S3.
:::
