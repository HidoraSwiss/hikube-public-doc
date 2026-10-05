---
title: "Comment connecter un bucket depuis une application"
---

# Comment connecter un bucket depuis une application

Ce guide explique comment utiliser les identifiants d'un utilisateur S3 Hikube depuis une application : variables d'environnement, SDK Python (boto3), et injection dans un pod de votre cluster Kubernetes.

## Prérequis

- Un **bucket** et un **utilisateur S3** créés depuis la [console Hikube](https://console.hikube.cloud), avec ses clés (voir [Gérer les utilisateurs et les clés d'accès](./configure-access.md))
- Selon le cas : **AWS CLI**, **Python avec boto3** (`pip install boto3`), ou un **cluster Kubernetes** et son kubeconfig

## Étapes

### 1. Rassembler les informations de connexion

| Information | Où la trouver |
|-------------|---------------|
| Endpoint | Page du bucket, carte **Accès & Configuration**, champ **Point de terminaison (Endpoint)** |
| Nom du bucket S3 | Même carte, champ **Nom du bucket** |
| Access Key ID / Secret Access Key | Affichées à la création de l'utilisateur |

:::note
Le nom du bucket S3 est généré par la plateforme et diffère du nom choisi dans la console. Utilisez toujours le nom S3 dans votre application.
:::

### 2. Exposer les identifiants en variables d'environnement

La plupart des SDK et outils S3 lisent les variables standard :

```bash
export AWS_ACCESS_KEY_ID="<access-key>"
export AWS_SECRET_ACCESS_KEY="<secret-key>"
export S3_ENDPOINT="https://<endpoint>"
export BUCKET_NAME="<bucket>"
```

Testez avec AWS CLI :

```bash
# Envoyer, lister et télécharger un fichier
aws s3 cp fichier.txt "s3://$BUCKET_NAME/" --endpoint-url "$S3_ENDPOINT"
aws s3 ls "s3://$BUCKET_NAME/" --endpoint-url "$S3_ENDPOINT"
aws s3 cp "s3://$BUCKET_NAME/fichier.txt" ./fichier-download.txt --endpoint-url "$S3_ENDPOINT"
```

### 3. Utiliser le bucket avec Python (boto3)

```python title="s3_example.py"
import os

import boto3

s3 = boto3.client(
    "s3",
    endpoint_url=os.environ["S3_ENDPOINT"],
    aws_access_key_id=os.environ["AWS_ACCESS_KEY_ID"],
    aws_secret_access_key=os.environ["AWS_SECRET_ACCESS_KEY"],
)
bucket_name = os.environ["BUCKET_NAME"]

# Upload d'un fichier
s3.upload_file("local-file.txt", bucket_name, "remote-file.txt")
print("Upload terminé")

# Download d'un fichier
s3.download_file(bucket_name, "remote-file.txt", "downloaded.txt")
print("Download terminé")

# Lister les objets
response = s3.list_objects_v2(Bucket=bucket_name)
for obj in response.get("Contents", []):
    print(f"  {obj['Key']} ({obj['Size']} octets)")
```

```bash
python s3_example.py
```

### 4. Utiliser le bucket depuis un cluster Kubernetes

Si votre application tourne dans un [cluster Kubernetes Hikube](../../../kubernetes/overview.md), stockez les identifiants dans un Secret **de votre cluster** (avec le kubeconfig téléchargé depuis la page du cluster) :

```bash
kubectl create secret generic s3-credentials \
  --from-literal=AWS_ACCESS_KEY_ID="<access-key>" \
  --from-literal=AWS_SECRET_ACCESS_KEY="<secret-key>" \
  --from-literal=S3_ENDPOINT="https://<endpoint>" \
  --from-literal=BUCKET_NAME="<bucket>"
```

Injectez-les dans votre application :

```yaml title="app-with-bucket.yaml"
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app
spec:
  replicas: 1
  selector:
    matchLabels:
      app: my-app
  template:
    metadata:
      labels:
        app: my-app
    spec:
      containers:
        - name: app
          image: my-app:latest
          envFrom:
            - secretRef:
                name: s3-credentials
```

```bash
kubectl apply -f app-with-bucket.yaml
```

:::tip
Ne versionnez pas les clés dans vos manifestes. Créez le Secret à part (ou via votre outil de gestion de secrets) et référencez-le uniquement par son nom.
:::

## Vérification

1. Envoyez un fichier de test et vérifiez sa présence :

```bash
echo "test" > /tmp/test-hikube.txt
aws s3 cp /tmp/test-hikube.txt "s3://$BUCKET_NAME/test.txt" --endpoint-url "$S3_ENDPOINT"
aws s3 ls "s3://$BUCKET_NAME/" --endpoint-url "$S3_ENDPOINT"
```

**Résultat attendu :**

```console
2026-01-15 10:30:00          5 test.txt
```

2. Supprimez le fichier de test :

```bash
aws s3 rm "s3://$BUCKET_NAME/test.txt" --endpoint-url "$S3_ENDPOINT"
```

## Pour aller plus loin

- [Gérer les utilisateurs et les clés d'accès](./configure-access.md)
- [Dépannage](../troubleshooting.md)
