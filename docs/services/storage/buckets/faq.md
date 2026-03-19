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

Toute bibliotheque compatible AWS S3 (boto3, aws-sdk-js, etc.) fonctionne egalement.

---

### Comment fonctionnent les credentials ?

Lorsqu'un bucket est cree, Hikube genere automatiquement un Secret Kubernetes nomme `bucket-<name>`. Ce secret contient une cle `BucketInfo` au format JSON avec toutes les informations d'acces :

```bash
kubectl get secret bucket-<name> -o jsonpath='{.data.BucketInfo}' | base64 -d | jq
```

Le JSON contient :

| Champ | Description |
|-------|-------------|
| `spec.bucketName` | Nom reel du bucket dans le backend S3 |
| `spec.secretS3.endpoint` | Endpoint S3 (`https://prod.s3.hikube.cloud`) |
| `spec.secretS3.accessKeyID` | Cle d'acces S3 |
| `spec.secretS3.accessSecretKey` | Cle secrete S3 |

:::warning
Utilisez `spec.bucketName` (et non `metadata.name`) comme nom de bucket lors de l'acces S3. Le nom reel est genere automatiquement et differe du nom Kubernetes.
:::

---

### Peut-on avoir plusieurs buckets ?

Oui, vous pouvez creer autant de buckets que necessaire. Chaque ressource `Bucket` provisionne un bucket independant avec ses propres credentials :

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

Chaque bucket genere son propre Secret (`bucket-app-logs`, `bucket-db-backups`) avec des credentials distinctes.

---

### Quelle est la durabilite des donnees ?

Les donnees stockees dans les buckets Hikube beneficient d'une **triple replication** sur trois datacenters :

- Geneve
- Gland
- Lucerne

Cette architecture garantit la haute disponibilite et la durabilite des donnees, meme en cas de panne complete d'un datacenter.

---

### La configuration est-elle vraiment juste metadata.name ?

Oui, l'objet `Bucket` est volontairement minimal. Aucun champ `spec` n'est requis :

```yaml title="bucket.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Bucket
metadata:
  name: mon-bucket
```

C'est tout ce qu'il faut pour provisionner un bucket S3 fonctionnel. L'endpoint, les credentials et le nom reel du bucket sont automatiquement generes et mis a disposition dans le Secret associe.
