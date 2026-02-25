---
sidebar_position: 2
title: Démarrage rapide
---

# Créer votre premier Bucket S3

Ce guide vous accompagne pas à pas dans la création de votre **premier bucket S3 Hikube** en **5 minutes** chrono.  
À la fin de ce tutoriel, vous disposerez d’un bucket prêt à l’emploi, avec des credentials S3 valides et une connectivité opérationnelle.

---

## 🎯 Objectif

À la fin de ce guide, vous aurez :

- Un **bucket S3 fonctionnel** dans votre tenant  
- Un **secret d’accès S3** généré automatiquement  
- La possibilité de vous connecter avec des outils standards (`aws-cli`, `mc`, etc.)

---

## 🧰 Prérequis

Avant de commencer, assurez-vous d’avoir :

- **kubectl** configuré avec votre kubeconfig Hikube  
- Les **droits nécessaires** sur votre tenant pour créer des ressources  
- Un outil S3 de votre choix installé (par ex. `aws-cli` ou `mc`)

---

## 🚀 Étape 1 : Créer le Bucket (1 minute)

### **Préparez le fichier manifest**

Créez un fichier `bucket.yaml` :

```yaml title="bucket.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Bucket
metadata:
  name: example-bucket
```

> 📌 Le nom indiqué dans `metadata.name` identifie la ressource Kubernetes.
> Le nom réel du bucket S3 est généré automatiquement.

---

### **Déployez le bucket**

```bash
# Créer le bucket
kubectl apply -f bucket.yaml

# Vérifier la création
kubectl get bucket example-bucket -w
```

**Résultat attendu :**

```bash
NAME             READY   AGE
example-bucket   True    15s
```

---

## 🔐 Étape 2 : Récupérer les credentials (2 minutes)

La création du bucket génère un `Secret` contenant une clé `BucketInfo` (JSON).

```bash
# Récupérer et stocker le JSON dans une variable
INFO="$(kubectl get secret bucket-example-bucket -o jsonpath='{.data.BucketInfo}' | base64 -d)"

# Exporter les variables utiles
export S3_ENDPOINT="$(echo "$INFO" | jq -r '.spec.secretS3.endpoint')"
export S3_ACCESS_KEY="$(echo "$INFO" | jq -r '.spec.secretS3.accessKeyID')"
export S3_SECRET_KEY="$(echo "$INFO" | jq -r '.spec.secretS3.accessSecretKey')"
export BUCKET_NAME="$(echo "$INFO" | jq -r '.spec.bucketName')"
```

> `BUCKET_NAME` est le **nom réel** de votre bucket côté S3. Utilisez-le dans les commandes ci-dessous.

---

## 🌐 Étape 3 : Tester la connexion S3 (2 minutes)

:::warning Accès racine S3
Avec ces identifiants, vous **n’avez pas** la permission de lister tous les buckets de l’endpoint.
Les commandes de type `ls` **doivent cibler votre bucket** :
`… ls s3://$BUCKET_NAME/ …` ou `… ls <alias>/$BUCKET_NAME/ …`
:::

### Option A — `aws-cli`

```bash
# Configurer un profil temporaire
aws configure --profile hikube
# Access Key ID:    $S3_ACCESS_KEY
# Secret Access Key: $S3_SECRET_KEY
# Default region name: (laisser vide)
# Default output format: json

# Lister le contenu **de votre bucket** (vide juste après création)
aws s3 ls "s3://$BUCKET_NAME/" --endpoint-url "$S3_ENDPOINT" --profile hikube

# Envoyer un fichier de test
echo "hello hikube" > /tmp/hello.txt
aws s3 cp /tmp/hello.txt "s3://$BUCKET_NAME/hello.txt" --endpoint-url "$S3_ENDPOINT" --profile hikube

# Vérifier
aws s3 ls "s3://$BUCKET_NAME/" --endpoint-url "$S3_ENDPOINT" --profile hikube
```

### Option B — `mc` (client S3)

```bash
# Définir un alias pour l’endpoint
mc alias set hikube "$S3_ENDPOINT" "$S3_ACCESS_KEY" "$S3_SECRET_KEY"

# ⚠️ Ne PAS faire: `mc ls hikube`  -> AccessDenied
# ✅ Cibler directement votre bucket :
mc ls "hikube/$BUCKET_NAME/"

# Envoyer un fichier de test
mc cp /tmp/hello.txt "hikube/$BUCKET_NAME/hello.txt"

# Vérifier
mc ls "hikube/$BUCKET_NAME/"
```

---

## 🧹 Nettoyage (optionnel)

```bash
# Supprimer le bucket (efface aussi son contenu)
kubectl delete buckets example-bucket
```

:::warning Suppression irréversible
La suppression du bucket efface **définitivement** toutes les données qu’il contient.
Vérifiez vos sauvegardes avant de procéder.
:::

---

## 🚀 Prochaines étapes

**📚 Référence API** → [Spécification complète](./api-reference.md)
**📖 Architecture** → [Vue d’ensemble](./overview.md)

---

## 💡 À retenir

- Les identifiants fournis donnent accès **uniquement** à votre bucket
- Ciblez toujours `s3://$BUCKET_NAME/` (ou `alias/$BUCKET_NAME/`) dans vos commandes
- L’endpoint S3 est compatible avec les outils et SDK standards
- Isolation stricte par tenant et credentials dédiés
