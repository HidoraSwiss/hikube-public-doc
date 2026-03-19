---
sidebar_position: 6
title: FAQ
---

# FAQ — Buckets S3

### Quel est l'endpoint S3 Hikube ?

L'endpoint S3 public d'Hikube est :

```
https://prod.s3.hikube.cloud
```

Cet endpoint est compatible avec l'API AWS S3 standard. Vous pouvez l'utiliser avec n'importe quel outil ou SDK compatible S3.

---

### Quels outils sont compatibles ?

Tous les outils compatibles avec l'API S3 fonctionnent avec les buckets Hikube :

| Outil | Configuration |
|-------|--------------|
| **aws-cli** | `aws --endpoint-url https://prod.s3.hikube.cloud s3 ls` |
| **mc** (MinIO Client) | `mc alias set hikube https://prod.s3.hikube.cloud ACCESS_KEY SECRET_KEY` |
| **rclone** | Configurer un remote de type `s3` avec l'endpoint Hikube |
| **s3cmd** | Configurer `host_base` et `host_bucket` vers l'endpoint Hikube |
| **Velero** | Backup Kubernetes vers S3 Hikube |
| **Restic** | Backup de fichiers vers S3 Hikube |

Toute bibliothèque compatible AWS S3 (boto3, aws-sdk-js, etc.) fonctionne également.

---

### Comment fonctionnent les credentials ?

Lorsqu'un bucket est créé, Hikube génère automatiquement un Secret Kubernetes nommé `bucket-<name>`. Ce secret contient une clé `BucketInfo` au format JSON avec toutes les informations d'accès :

```bash
kubectl get secret bucket-<name> -o jsonpath='{.data.BucketInfo}' | base64 -d | jq
```

Le JSON contient :

| Champ | Description |
|-------|-------------|
| `spec.bucketName` | Nom réel du bucket dans le backend S3 |
| `spec.secretS3.endpoint` | Endpoint S3 (`https://prod.s3.hikube.cloud`) |
| `spec.secretS3.accessKeyID` | Clé d'accès S3 |
| `spec.secretS3.accessSecretKey` | Clé secrète S3 |

:::warning
Utilisez `spec.bucketName` (et non `metadata.name`) comme nom de bucket lors de l'accès S3. Le nom réel est généré automatiquement et diffère du nom Kubernetes.
:::

---

### Peut-on avoir plusieurs buckets ?

Oui, vous pouvez créer autant de buckets que nécessaire. Chaque ressource `Bucket` provisionne un bucket indépendant avec ses propres credentials :

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

Chaque bucket génère son propre Secret (`bucket-app-logs`, `bucket-db-backups`) avec des credentials distinctes.

---

### Quelle est la durabilité des données ?

Les données stockées dans les buckets Hikube bénéficient d'une **triple réplication** sur trois datacenters :

- Genève
- Gland
- Lucerne

Cette architecture garantit la haute disponibilité et la durabilité des données, même en cas de panne complète d'un datacenter.

---

### La configuration est-elle vraiment juste metadata.name ?

Oui, l'objet `Bucket` est volontairement minimal. Aucun champ `spec` n'est requis :

```yaml title="bucket.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Bucket
metadata:
  name: mon-bucket
```

C'est tout ce qu'il faut pour provisionner un bucket S3 fonctionnel. L'endpoint, les credentials et le nom réel du bucket sont automatiquement générés et mis à disposition dans le Secret associé.
