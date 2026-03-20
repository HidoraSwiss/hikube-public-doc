---
sidebar_position: 3
title: Référence API
---

# Référence API - Buckets S3

Cette référence détaille l’API `Bucket` d’Hikube, utilisée pour provisionner des buckets S3 compatibles dans votre tenant Kubernetes.  
Les buckets S3 permettent de stocker et servir des données (fichiers, objets, backups, logs, etc.) de façon durable, hautement disponible et compatible avec les outils S3 standard.

---

## Bucket

### **Vue d’ensemble**

L’API `Bucket` permet de créer des buckets S3 directement depuis Kubernetes.

```yaml
apiVersion: apps.cozystack.io/v1alpha1
kind: Bucket
metadata:
  name: example-bucket
```

> 📌 La création d’un objet `Bucket` dans votre tenant entraîne automatiquement la création du bucket correspondant dans le backend S3.

---

### **Spécification Complète**

L’objet `Bucket` ne possède **aucun champ `spec` configurable**.
La seule partie nécessaire est la **métadonnée `metadata.name`**, qui définit le nom du bucket créé dans l'interface utilisateur.

| **Paramètre**        | **Type** | **Description**                                      | **Requis** |
| -------------------- | -------- | ---------------------------------------------------- | ---------- |
| `metadata.name`      | string   | Nom unique du bucket (utilisé comme nom S3)          | ✅          |

---

### **Exemple Minimal**

```yaml title="zitadel-bucket.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Bucket
metadata:
  name: backup-prod
```

---

## 🔐 Secret d’Accès S3

Lorsqu’un bucket est créé, Hikube génère automatiquement un secret Kubernetes associé.
Ce secret est nommé selon le pattern suivant :

```txt
bucket-<nom-du-bucket>
```

Par exemple :

```bash
kubectl get secret
```

```bash
NAME                  TYPE     DATA   AGE
bucket-backup-prod    Opaque   1      10s
```

Le contenu de ce secret est stocké dans une **clé unique `BucketInfo`** au format JSON :

```json
{
  "metadata": {
    "name": "bc-254505e2-1f26-4f47-bf75-42faae918531",
    "creationTimestamp": null
  },
  "spec": {
    "bucketName": "bucket-1df67984-321d-492d-bb06-2f4527bb0f5b",
    "authenticationType": "KEY",
    "secretS3": {
      "endpoint": "https://prod.s3.hikube.cloud",
      "region": "",
      "accessKeyID": "UYL5FFZ0GWTQ4LCN4AI0",
      "accessSecretKey": "L1ZJy67a2PKdOmKqjeuTWQd/4HjJVMJdxnEX4ewq"
    },
    "secretAzure": null,
    "protocols": ["s3"]
  }
}
```

---

### **Champs Importants**

| **Champ**                       | **Description**                               |
| ------------------------------- | --------------------------------------------- |
| `spec.bucketName`               | Nom interne réel du bucket dans le backend S3 |
| `spec.secretS3.endpoint`        | Endpoint HTTPS du service S3 Hikube           |
| `spec.secretS3.accessKeyID`     | Clé d’accès S3 générée pour ce bucket         |
| `spec.secretS3.accessSecretKey` | Clé secrète S3 associée                       |
| `spec.protocols`                | Protocoles supportés (actuellement `["s3"]`)  |

---

### **Extraction des identifiants**

Vous pouvez récupérer les informations avec `kubectl` et `jq` :

```bash
kubectl get secret bucket-bckprd -o jsonpath='{.data.BucketInfo}' | base64 -d | jq
```

Ou pour extraire uniquement la clé et le secret :

```bash
kubectl get secret bucket-bckprd -o jsonpath='{.data.BucketInfo}' \
  | base64 -d \
  | jq -r '.spec.secretS3.accessKeyID, .spec.secretS3.accessSecretKey'
```

---

## 🌐 Endpoint S3

L’endpoint public pour accéder à vos buckets est :

```url
https://prod.s3.hikube.cloud
```

Vous pouvez l’utiliser avec :

* `aws-cli` (en configurant un profil avec `--endpoint-url`)
* `mc` (MinIO Client)
* `rclone`, `s3cmd`, Velero, ou toute bibliothèque compatible AWS S3.

---

## ⚠️ Bonnes Pratiques

### **Sécurité**

* Ne stockez jamais vos clés S3 en clair dans vos manifests ou dépôts Git.
* Utilisez toujours les Secrets Kubernetes et des montages sécurisés.
* Limitez les permissions au strict nécessaire (1 bucket = 1 couple de clés idéalement).

### **Nommage**

* Utilisez des noms explicites pour identifier facilement les buckets.
* Gardez à l’esprit que le nom réel dans S3 (`bucketName`) est généré automatiquement et peut différer du nom Kubernetes.

### **Utilisation**

* Configurez vos outils S3 pour pointer vers `https://prod.s3.hikube.cloud`.
* Utilisez la clé `accessKeyID` et `accessSecretKey` fournies dans le secret associé.

---

:::tip Bon à savoir
Chaque bucket créé via l’API Hikube est stocké sur une infrastructure **triple-répliquée** et bénéficie de la haute disponibilité native du cluster S3.
:::
