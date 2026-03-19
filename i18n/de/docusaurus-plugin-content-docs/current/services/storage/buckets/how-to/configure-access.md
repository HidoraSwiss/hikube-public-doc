---
title: "Konfiguration von l'acces S3"
---

# Konfiguration von l'acces S3

Chaque bucket cree sur Hikube genere automatiquement un couple de cles d'acces S3 unique. Dieser Leitfaden erklärt comment recuperer ces identifiants, configurer differents clients S3 (AWS CLI, MinIO Client, rclone) et injecter les cles dans vos pods Kubernetes de maniere securisee.

## Voraussetzungen

- **kubectl** configure avec votre kubeconfig Hikube
- Un **bucket** cree sur Hikube
- **jq** installe localement
- Un ou plusieurs clients S3 installes : **AWS CLI**, **mc** (MinIO Client) ou **rclone**

## Schritte

### 1. Comprendre le modele d'acces

Sur Hikube, chaque bucket dispose de son propre couple de cles d'acces :

- **1 bucket = 1 couple de cles** (accessKeyID + accessSecretKey)
- Les cles sont generees automatiquement a la creation du bucket
- Les identifiants sont stockes dans un Secret Kubernetes nomme `bucket-<nom-du-bucket>`
- L'endpoint S3 est commun a tous les buckets : `https://prod.s3.hikube.cloud`

:::tip
Chaque bucket beneficie d'un stockage **triple-replique** Hochverfügbarkeit. Vos donnees sont automatiquement reparties um die ... zu gewährleisten durabilite.
:::

### 2. Recuperer les identifiants

Extrayez les informations de connexion depuis le Secret Kubernetes :

```bash
kubectl get secret bucket-<nom-du-bucket> -o jsonpath='{.data.BucketInfo}' | base64 -d | jq
```

Pour extraire les valeurs individuellement :

```bash
# Endpoint S3
kubectl get secret bucket-<nom-du-bucket> -o jsonpath='{.data.BucketInfo}' | base64 -d | jq -r '.spec.secretS3.endpoint'

# Access Key
kubectl get secret bucket-<nom-du-bucket> -o jsonpath='{.data.BucketInfo}' | base64 -d | jq -r '.spec.secretS3.accessKeyID'

# Secret Key
kubectl get secret bucket-<nom-du-bucket> -o jsonpath='{.data.BucketInfo}' | base64 -d | jq -r '.spec.secretS3.accessSecretKey'

# Nom reel du bucket
kubectl get secret bucket-<nom-du-bucket> -o jsonpath='{.data.BucketInfo}' | base64 -d | jq -r '.spec.bucketName'
```

:::note
Le `bucketName` retourne par le Secret est un identifiant interne (ex: `bucket-1df67984-321d-492d-bb06-2f4527bb0f5b`). Il differe du nom `metadata.name` de votre manifeste. Utilisez toujours cette valeur pour les operations S3.
:::

### 3. Configurer les clients S3

#### AWS CLI

Configurez un profil dedie pour Hikube :

```bash
aws configure --profile hikube
```

Renseignez les valeurs suivantes :

```
AWS Access Key ID: <accessKeyID>
AWS Secret Access Key: <accessSecretKey>
Default region name: (laisser vide)
Default output format: json
```

Utilisez le profil avec l'endpoint Hikube :

```bash
aws s3 ls s3://$BUCKET_NAME --endpoint-url https://prod.s3.hikube.cloud --profile hikube
```

#### MinIO Client (mc)

Creez un alias pour l'endpoint Hikube :

```bash
mc alias set hikube https://prod.s3.hikube.cloud ACCESS_KEY SECRET_KEY
```

Testez la connexion :

```bash
# Lister les objets
mc ls hikube/$BUCKET_NAME

# Uploader un fichier
mc cp fichier.txt hikube/$BUCKET_NAME/

# Telecharger un fichier
mc cp hikube/$BUCKET_NAME/fichier.txt ./
```

#### rclone

Ajoutez une configuration rclone pour Hikube. Creez ou editez le fichier `~/.config/rclone/rclone.conf` :

```ini title="rclone.conf"
[hikube]
type = s3
provider = Minio
endpoint = https://prod.s3.hikube.cloud
access_key_id = ACCESS_KEY
secret_access_key = SECRET_KEY
acl = private
```

Testez la connexion :

```bash
# Lister les objets
rclone ls hikube:$BUCKET_NAME

# Synchroniser un repertoire local
rclone sync ./mon-dossier hikube:$BUCKET_NAME/mon-dossier

# Copier un fichier
rclone copy fichier.txt hikube:$BUCKET_NAME/
```

### 4. Utiliser le bucket dans un pod Kubernetes

Pour injecter les identifiants S3 dans un pod, utilisez un `initContainer` qui lit le Secret et expose les valeurs comme variables d'environnement, ou montez directement le Secret :

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
      initContainers:
      - name: extract-s3-creds
        image: bitnami/kubectl:latest
        command:
        - sh
        - -c
        - |
          SECRET=$(cat /secrets/BucketInfo)
          echo "export AWS_ACCESS_KEY_ID=$(echo $SECRET | jq -r '.spec.secretS3.accessKeyID')" > /env/s3.env
          echo "export AWS_SECRET_ACCESS_KEY=$(echo $SECRET | jq -r '.spec.secretS3.accessSecretKey')" >> /env/s3.env
          echo "export S3_ENDPOINT=$(echo $SECRET | jq -r '.spec.secretS3.endpoint')" >> /env/s3.env
          echo "export BUCKET_NAME=$(echo $SECRET | jq -r '.spec.bucketName')" >> /env/s3.env
        volumeMounts:
        - name: bucket-secret
          mountPath: /secrets
        - name: env-vars
          mountPath: /env
      containers:
      - name: app
        image: my-app:latest
        command:
        - sh
        - -c
        - |
          source /env/s3.env
          exec my-app-binary
        volumeMounts:
        - name: env-vars
          mountPath: /env
      volumes:
      - name: bucket-secret
        secret:
          secretName: bucket-app-data
      - name: env-vars
        emptyDir: {}
```

:::tip
Pour une approche plus simple, vous pouvez aussi monter le Secret complet et lire le JSON directement dans votre application au demarrage.
:::

### 5. Best Practices de securite

:::warning
Ne stockez jamais vos cles S3 en clair dans vos manifestes ou depots Git. Utilisez toujours les Secrets Kubernetes pour gerer les identifiants.
:::

Recommandations :

- **Utilisez les Secrets Kubernetes** : les identifiants sont deja stockes dans un Secret genere automatiquement. Referez-le plutot que de copier les cles en clair.
- **Ne commitez jamais les cles** : ajoutez les fichiers contenant des identifiants a votre `.gitignore`.
- **Limitez l'acces aux Secrets** : configurez des RBAC Kubernetes pour restreindre les namespaces et les utilisateurs qui peuvent lire les Secrets de buckets.
- **Rotation des cles** : si vous suspectez une compromission, supprimez et recreez le bucket pour obtenir de nouvelles cles.

## Überprüfung

Confirmez que votre configuration est fonctionnelle avec chaque client :

1. **AWS CLI** :

```bash
aws s3 ls s3://$BUCKET_NAME --endpoint-url https://prod.s3.hikube.cloud
```

2. **MinIO Client** :

```bash
mc ls hikube/$BUCKET_NAME
```

3. **rclone** :

```bash
rclone ls hikube:$BUCKET_NAME
```

Si la commande retourne une liste vide (bucket vide) ou la liste des objets existants sans erreur, la configuration est correcte.

## Weiterführende Informationen

- [API-Referenz Buckets](../api-reference.md)
- [Verbindung mit un bucket depuis une application](./connect-from-app.md)
