---
title: "Verbindung mit un bucket depuis une application"
---

# Verbindung mit un bucket depuis une application

Lorsque vous creez un bucket sur Hikube, un Secret Kubernetes contenant les identifiants S3 est automatiquement genere. Dieser Leitfaden erklärt comment recuperer ces identifiants et les utiliser depuis AWS CLI, Python (boto3) ou toute application compatible S3.

## Voraussetzungen

- **kubectl** configure avec votre kubeconfig Hikube
- Un **bucket** cree sur Hikube (ou un manifeste pret a deployer)
- **jq** installe localement (pour l'extraction des identifiants)
- **AWS CLI** ou **Python avec boto3** installe (selon votre cas d'usage)

## Schritte

### 1. Creer un bucket

Si vous n'avez pas encore de bucket, creez-en un :

```yaml title="my-bucket.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Bucket
metadata:
  name: app-data
```

Appliquez le manifeste :

```bash
kubectl apply -f my-bucket.yaml
```

Überprüfen Sie, ob le bucket et son Secret sont crees :

```bash
kubectl get bucket app-data
kubectl get secret bucket-app-data
```

**Erwartetes Ergebnis :**

```
NAME       AGE
app-data   10s

NAME                 TYPE     DATA   AGE
bucket-app-data      Opaque   1      10s
```

### 2. Recuperer les identifiants S3

Le Secret `bucket-app-data` contient une cle `BucketInfo` au format JSON avec toutes les informations de connexion. Extrayez-les :

```bash
kubectl get secret bucket-app-data -o jsonpath='{.data.BucketInfo}' | base64 -d | jq
```

**Erwartetes Ergebnis :**

```json
{
  "spec": {
    "bucketName": "bucket-1df67984-321d-492d-bb06-2f4527bb0f5b",
    "secretS3": {
      "endpoint": "https://prod.s3.hikube.cloud",
      "accessKeyID": "UYL5FFZ0GWTQ4LCN4AI0",
      "accessSecretKey": "L1ZJy67a2PKdOmKqjeuTWQd/4HjJVMJdxnEX4ewq"
    }
  }
}
```

:::note
Le `bucketName` est un identifiant interne genere automatiquement. Il differe du nom que vous avez donne dans `metadata.name`. Utilisez toujours `bucketName` pour les operations S3.
:::

### 3. Utiliser le bucket avec AWS CLI

Exportez les identifiants comme variables d'environnement :

```bash
export AWS_ACCESS_KEY_ID=$(kubectl get secret bucket-app-data -o jsonpath='{.data.BucketInfo}' | base64 -d | jq -r '.spec.secretS3.accessKeyID')
export AWS_SECRET_ACCESS_KEY=$(kubectl get secret bucket-app-data -o jsonpath='{.data.BucketInfo}' | base64 -d | jq -r '.spec.secretS3.accessSecretKey')
export BUCKET_NAME=$(kubectl get secret bucket-app-data -o jsonpath='{.data.BucketInfo}' | base64 -d | jq -r '.spec.bucketName')
```

Testez la connexion :

```bash
# Lister les objets du bucket
aws s3 ls s3://$BUCKET_NAME --endpoint-url https://prod.s3.hikube.cloud

# Uploader un fichier
aws s3 cp fichier.txt s3://$BUCKET_NAME/ --endpoint-url https://prod.s3.hikube.cloud

# Telecharger un fichier
aws s3 cp s3://$BUCKET_NAME/fichier.txt ./fichier-download.txt --endpoint-url https://prod.s3.hikube.cloud
```

### 4. Utiliser le bucket avec Python (boto3)

Voici un exemple complet d'utilisation avec la bibliotheque `boto3` :

```python title="s3_example.py"
import boto3
import json
import subprocess

# Option 1 : Lire les identifiants depuis le Secret Kubernetes
result = subprocess.run(
    ["kubectl", "get", "secret", "bucket-app-data",
     "-o", "jsonpath={.data.BucketInfo}"],
    capture_output=True, text=True
)
import base64
bucket_info = json.loads(base64.b64decode(result.stdout))

endpoint = bucket_info["spec"]["secretS3"]["endpoint"]
access_key = bucket_info["spec"]["secretS3"]["accessKeyID"]
secret_key = bucket_info["spec"]["secretS3"]["accessSecretKey"]
bucket_name = bucket_info["spec"]["bucketName"]

# Option 2 : Utiliser des variables d'environnement (recommande en production)
# import os
# endpoint = "https://prod.s3.hikube.cloud"
# access_key = os.environ["AWS_ACCESS_KEY_ID"]
# secret_key = os.environ["AWS_SECRET_ACCESS_KEY"]
# bucket_name = os.environ["BUCKET_NAME"]

# Creer le client S3
s3 = boto3.client(
    "s3",
    endpoint_url=endpoint,
    aws_access_key_id=access_key,
    aws_secret_access_key=secret_key,
)

# Upload d'un fichier
s3.upload_file("local-file.txt", bucket_name, "remote-file.txt")
print("Upload termine")

# Download d'un fichier
s3.download_file(bucket_name, "remote-file.txt", "downloaded.txt")
print("Download termine")

# Lister les objets
response = s3.list_objects_v2(Bucket=bucket_name)
for obj in response.get("Contents", []):
    print(f"  {obj['Key']} ({obj['Size']} octets)")
```

:::tip
En production, privilegiez les variables d'environnement ou les Secrets Kubernetes montes en volumes plutot que d'appeler `kubectl` depuis votre code applicatif.
:::

## Überprüfung

Confirmez que la connexion fonctionne correctement :

1. **Verifiez le bucket** :

```bash
kubectl get bucket app-data
```

2. **Testez un upload/download** :

```bash
echo "test" > /tmp/test-hikube.txt
aws s3 cp /tmp/test-hikube.txt s3://$BUCKET_NAME/test.txt --endpoint-url https://prod.s3.hikube.cloud
aws s3 ls s3://$BUCKET_NAME --endpoint-url https://prod.s3.hikube.cloud
```

**Erwartetes Ergebnis :**

```
2024-01-15 10:30:00          5 test.txt
```

3. **Nettoyez le fichier de test** :

```bash
aws s3 rm s3://$BUCKET_NAME/test.txt --endpoint-url https://prod.s3.hikube.cloud
```

## Weiterführende Informationen

- [API-Referenz Buckets](../api-reference.md)
- [Konfiguration von l'acces S3](./configure-access.md)
