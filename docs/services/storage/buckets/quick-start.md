---
sidebar_position: 3
title: Démarrage rapide
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# Créer votre premier bucket S3

Ce guide vous accompagne dans la création de votre **premier bucket S3** depuis la [console Hikube](https://console.hikube.cloud), jusqu'au premier envoi de fichier.

---

## Objectifs

À la fin de ce guide, vous aurez :

- Un **bucket S3** opérationnel dans votre projet
- Un **utilisateur S3** avec sa paire de clés d'accès
- Un premier fichier envoyé avec `aws` ou `mc`

---

## Prérequis

- Un **compte Hikube** et un **projet** (voir le [démarrage rapide Hikube](../../../getting-started/quick-start.md))
- Un client S3 installé sur votre poste : [AWS CLI](https://aws.amazon.com/cli/) ou [MinIO Client (`mc`)](https://min.io/docs/minio/linux/reference/minio-mc.html)

---

## Étape 1 : Ouvrir l'assistant de création

1. Connectez-vous à la [console Hikube](https://console.hikube.cloud) et sélectionnez votre projet.
2. Dans le menu latéral, ouvrez **Infrastructure** → **Buckets S3**. La page **Buckets Object Storage** s'affiche.
3. Cliquez sur **Créer un bucket**.

---

## Étape 2 : Configurer et créer le bucket

L'assistant comporte trois étapes.

### Général

1. Saisissez le **Nom du bucket** (un nom est proposé par défaut). Règles : minuscules, chiffres et tirets ; commence par une lettre et se termine par une lettre ou un chiffre ; 16 caractères maximum. Exemple : `demo-assets`.
2. Laissez décochées pour ce guide les options :
   - **Activer le verrouillage (Object Lock / WORM)** : empêche la suppression ou la modification des objets pendant 365 jours (rétention fixée par la plateforme) ;
   - **Activer le chiffrement au repos (LUKS)** : chiffre les données stockées ; ne peut pas être modifié après la création.
3. Cliquez sur **Suivant**.

### Utilisateurs

1. Saisissez le **Nom de l'utilisateur** (par exemple `app-user`).
2. Laissez **Lecture seule** sur **Non** pour obtenir un accès en lecture et écriture.
3. Cliquez sur **Ajouter**, puis sur **Suivant**.

Au moins un utilisateur est nécessaire pour continuer.

### Vérification

Le **Récapitulatif** affiche le nom, le projet, le nombre d'utilisateurs à créer, l'état du verrouillage et du chiffrement, ainsi que le **Coût estimé** par Go. Cliquez sur **Créer le bucket**.

Pendant la création, le bouton affiche **Création...** puis **Provisionnement du bucket…** : la console attend que le bucket soit prêt avant de créer les utilisateurs.

---

## Étape 3 : Vérifier l'état du bucket

L'écran de fin affiche **Bucket créé avec succès**. Après avoir récupéré les identifiants (étape 4), cliquez sur **Terminer** : la console ouvre la page du bucket.

Sur cette page :

- le badge de statut indique **Prêt** lorsque le bucket est opérationnel (**En création** pendant le provisionnement) ;
- les badges **WORM** et **LUKS** rappellent l'état du verrouillage et du chiffrement ;
- la carte **Accès & Configuration** affiche le **Nom du bucket** S3 et le **Point de terminaison (Endpoint)** ;
- la carte **Utilisateurs et Accès** liste les utilisateurs et leur droit (**Lecture seule** ou **Lecture / Écriture**).

:::note
Si le bucket n'est pas prêt à temps, la console affiche « Bucket en cours de provisionnement » et ne crée pas les utilisateurs. Attendez que le bucket passe à **Prêt**, puis créez-les depuis sa page avec **Ajouter un utilisateur** (voir [Gérer les utilisateurs et les clés d'accès](./how-to/configure-access.md)).
:::

---

## Étape 4 : Récupérer les identifiants

L'écran de fin de l'assistant affiche, pour chaque utilisateur créé :

| Champ | Usage |
|-------|-------|
| **Nom du bucket S3** | Nom réel du bucket à utiliser dans vos commandes et SDK |
| **Clé d'accès** | Access Key ID |
| **Clé secrète** | Secret Access Key |
| **Point de terminaison API (S3)** | Endpoint S3, par exemple `prod.s3.hikube.cloud` |

:::warning Clé secrète affichée une seule fois
Copiez ces valeurs avant de cliquer sur **Terminer** et conservez la clé secrète dans un gestionnaire de mots de passe. Elle ne sera plus affichée. En cas de perte, créez un nouvel utilisateur.
:::

:::note Nom du bucket S3
Le **Nom du bucket S3** est généré par la plateforme et diffère du nom saisi dans l'assistant. Utilisez toujours le nom S3 dans vos clients. Il reste consultable sur la page du bucket.
:::

Exportez les valeurs dans votre terminal :

```bash
export S3_ENDPOINT="https://<point-de-terminaison>"
export AWS_ACCESS_KEY_ID="<clé-d-accès>"
export AWS_SECRET_ACCESS_KEY="<clé-secrète>"
export BUCKET_NAME="<nom-du-bucket-s3>"
```

Si l'endpoint s'affiche sans préfixe (par exemple `prod.s3.hikube.cloud`), ajoutez `https://` devant : les clients `aws` et `mc` attendent une URL complète.

---

## Étape 5 : Connexion et tests

:::warning Ciblez votre bucket
Les clés d'un utilisateur ne donnent pas la permission de lister tous les buckets de l'endpoint. Les commandes doivent **toujours cibler votre bucket** : `s3://$BUCKET_NAME/` ou `hikube/$BUCKET_NAME/`.
:::

### Option A : AWS CLI

```bash
# Envoyer un fichier de test
echo "hello hikube" > /tmp/hello.txt
aws --endpoint-url "$S3_ENDPOINT" s3 cp /tmp/hello.txt "s3://$BUCKET_NAME/hello.txt"

# Lister le contenu du bucket
aws --endpoint-url "$S3_ENDPOINT" s3 ls "s3://$BUCKET_NAME/"
```

### Option B : MinIO Client (`mc`)

```bash
# Définir un alias pour l'endpoint
mc alias set hikube "$S3_ENDPOINT" "$AWS_ACCESS_KEY_ID" "$AWS_SECRET_ACCESS_KEY"

# Envoyer un fichier de test puis lister le bucket
mc cp /tmp/hello.txt "hikube/$BUCKET_NAME/hello.txt"
mc ls "hikube/$BUCKET_NAME/"
```

**Résultat attendu :** le fichier `hello.txt` apparaît dans la liste.

:::tip
La carte **Accès & Configuration** de la page du bucket propose ces commandes, déjà complétées avec l'endpoint et le nom du bucket, dans la rubrique **Exemple de connexion**.
:::

---

## Étape 6 : Dépannage rapide

| Symptôme | Cause probable | Action |
|----------|----------------|--------|
| `AccessDenied` sur `aws s3 ls` sans bucket | Listage de l'endpoint entier | Ciblez `s3://$BUCKET_NAME/` |
| `NoSuchBucket` | Nom saisi dans l'assistant utilisé au lieu du nom S3 | Utilisez le **Nom du bucket** affiché dans **Accès & Configuration** |
| `AccessDenied` à l'écriture | Utilisateur en **Lecture seule** | Changez son droit avec **Modifier l'accès** |
| `SignatureDoesNotMatch` / `InvalidAccessKeyId` | Clés incorrectes ou incomplètes | Recopiez les clés ; si la clé secrète est perdue, créez un nouvel utilisateur |
| Erreur de connexion | Endpoint sans `https://` | Préfixez l'endpoint par `https://` |

Voir aussi le [dépannage complet](./troubleshooting.md).

---

## Étape 7 : Nettoyage

1. Supprimez le fichier de test :
   ```bash
   aws --endpoint-url "$S3_ENDPOINT" s3 rm "s3://$BUCKET_NAME/hello.txt"
   ```
2. Sur la page du bucket, cliquez sur **Supprimer** (ou, depuis la liste, ouvrez le menu d'actions du bucket et choisissez **Supprimer**).
3. Saisissez le nom exact du bucket dans **Nom de la ressource à confirmer**, puis cliquez sur **Supprimer définitivement**.

:::warning Suppression irréversible
La suppression d'un bucket est définitive. Si la console répond « Le bucket n'est pas vide ou est encore utilisé. », videz le bucket puis réessayez.
:::

<NavigationFooter
  nextSteps={[
    {label: "Gérer les utilisateurs et les clés d'accès", href: "../how-to/configure-access"},
    {label: "Connecter une application", href: "../how-to/connect-from-app"},
  ]}
/>
