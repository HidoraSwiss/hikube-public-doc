---
title: Créer un Bucket en 5 minutes
---

# Créer votre premier Bucket

Ce guide vous accompagne pour créer votre premier bucket de stockage d'objets sur Hikube en moins de 5 minutes.

## Prérequis

- Accès à un tenant Hikube
- kubectl configuré avec votre kubeconfig
- [AWS CLI](https://aws.amazon.com/cli/) (optionnel, pour tester)

## Étape 1 : Créer le bucket

### Via kubectl

```text
# bucket.yaml
apiVersion: apps.cozystack.io/v1alpha1
kind: Bucket
metadata:
  name: mon-premier-bucket
spec:
  size: 10Gi
  replicas: 2
  storageClass: "replicated"
```

```bash
kubectl apply -f bucket.yaml
```

### Via interface web

1. Allez dans l'onglet **"Catalog"**
2. Sélectionnez l'application **"Bucket"**
3. Configurez les paramètres :
   - **Name** : `mon-premier-bucket`
   - **Size** : `10Gi`
   - **Replicas** : `2`
4. Cliquez sur **"Deploy"**

## Étape 2 : Vérifier le déploiement

```bash
# Vérifier l'état du bucket
kubectl get buckets

# Voir les détails
kubectl describe bucket mon-premier-bucket

# Vérifier les pods
kubectl get pods -l app=bucket
```

## Étape 3 : Récupérer les credentials

```bash
# Obtenir les informations de connexion
kubectl get secret bucket-mon-premier-bucket -o yaml

# Décoder les credentials
echo "VOTRE_SECRET_BASE64" | base64 -d
```

## Étape 4 : Tester avec AWS CLI

### Configurer AWS CLI

```bash
# Créer le fichier de configuration
mkdir -p ~/.aws
```

```text
# ~/.aws/config
[default]
region = us-east-1
s3 =
    addressing_style = virtual
```

```text
# ~/.aws/credentials
[default]
aws_access_key_id = VOTRE_ACCESS_KEY
aws_secret_access_key = VOTRE_SECRET_KEY
```

### Tester les opérations S3

```bash
# Lister les buckets
aws s3 ls --endpoint-url http://bucket-mon-premier-bucket.example.org

# Créer un fichier de test
echo "Hello Hikube!" > test.txt

# Uploader un fichier
aws s3 cp test.txt s3://mon-premier-bucket/ --endpoint-url http://bucket-mon-premier-bucket.example.org

# Lister les objets
aws s3 ls s3://mon-premier-bucket/ --endpoint-url http://bucket-mon-premier-bucket.example.org

# Télécharger le fichier
aws s3 cp s3://mon-premier-bucket/test.txt downloaded.txt --endpoint-url http://bucket-mon-premier-bucket.example.org
```

## Étape 5 : Utiliser avec une application

### Exemple avec Python

```text
import boto3

# Configuration
s3 = boto3.client(
    's3',
    endpoint_url='http://bucket-mon-premier-bucket.example.org',
    aws_access_key_id='VOTRE_ACCESS_KEY',
    aws_secret_access_key='VOTRE_SECRET_KEY'
)

# Uploader un fichier
s3.upload_file('mon-fichier.txt', 'mon-premier-bucket', 'mon-fichier.txt')

# Lister les objets
response = s3.list_objects_v2(Bucket='mon-premier-bucket')
for obj in response['Contents']:
    print(obj['Key'])
```

### Exemple avec Node.js

```text
const AWS = require('aws-sdk');

// Configuration
const s3 = new AWS.S3({
    endpoint: 'http://bucket-mon-premier-bucket.example.org',
    accessKeyId: 'VOTRE_ACCESS_KEY',
    secretAccessKey: 'VOTRE_SECRET_KEY',
    s3ForcePathStyle: true
});

// Uploader un fichier
const params = {
    Bucket: 'mon-premier-bucket',
    Key: 'mon-fichier.txt',
    Body: 'Contenu du fichier'
};

s3.upload(params, (err, data) => {
    if (err) console.log(err);
    else console.log('Fichier uploadé:', data.Location);
});
```