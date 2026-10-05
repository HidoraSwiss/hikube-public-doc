---
title: "Comment gérer les utilisateurs et les clés d'accès"
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Comment gérer les utilisateurs et les clés d'accès

Chaque bucket Hikube peut avoir plusieurs **utilisateurs S3**, chacun avec sa propre paire de clés et son droit (**Lecture seule** ou **Lecture / Écriture**). Ce guide explique comment gérer ces utilisateurs depuis la [console Hikube](https://console.hikube.cloud) et configurer les clients S3 courants (AWS CLI, MinIO Client, rclone).

## Prérequis

- Un **bucket** créé dans votre projet (voir le [démarrage rapide](../quick-start.md)), au statut **Prêt**
- Un ou plusieurs clients S3 installés : **AWS CLI**, **mc** (MinIO Client) ou **rclone**
- Pour l'onglet **API** : une clé d'API `admin` du projet et les variables `HIKUBE_API`, `HIKUBE_API_KEY` et `PROJECT_ID` (voir [Préparer l'environnement](../../../../api/quick-start.md#environnement)) ; les exemples utilisent `curl` et `jq`

## Comprendre le modèle d'accès

- Un bucket peut avoir **plusieurs utilisateurs** ; chacun a sa propre **Access Key ID** et sa **Secret Access Key**.
- Les clés d'un utilisateur ne donnent accès **qu'à ce bucket**.
- Le **nom S3 réel** du bucket et l'**endpoint** sont communs à tous ses utilisateurs ; ils sont affichés dans la carte **Accès & Configuration** de la page du bucket.
- La **clé secrète n'est affichée qu'une fois**, à la création de l'utilisateur.

## Créer un utilisateur

<Tabs groupId="interface">
<TabItem value="console" label="Console" default>

1. Ouvrez **Infrastructure** → **Buckets S3**, puis cliquez sur le bucket.
2. Dans la carte **Utilisateurs et Accès**, cliquez sur **Ajouter un utilisateur**.
3. Dans la fenêtre **Nouvel Utilisateur** :
   - saisissez le **Nom d'utilisateur** (3 à 16 caractères : minuscules, chiffres et tirets ; doit commencer par une lettre) ;
   - cochez **Accès en lecture seule** si l'utilisateur ne doit que lire les objets.
4. Cliquez sur **Créer l'utilisateur**.

La fenêtre **Identifiants générés** affiche le **Bucket S3**, l'**Endpoint S3**, l'**Access Key ID** et la **Secret Access Key**.

:::warning
Copiez ces valeurs avant de cliquer sur **J'ai sauvegardé ces clés** : la clé secrète ne pourra pas être récupérée par la suite.
:::

</TabItem>
<TabItem value="api" label="API">

```bash
curl -sS -X POST "$HIKUBE_API/bucket/v1alpha1/projects/$PROJECT_ID/buckets/demoassets/users" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "reader",
    "config": {"readonly": true}
  }' | jq '{bucketName, endpoint, secrets}'
```

- `username` : 63 caractères maximum ; minuscules, chiffres et tirets ;
- `config.readonly` : `true` pour un accès en lecture seule, `false` pour la lecture et l'écriture.

La réponse contient le nom S3 du bucket (`bucketName`), l'endpoint (`endpoint`) et la paire de clés (`secrets.accessKeyId`, `secrets.accessSecretKey`).

:::warning
`secrets` n'est renvoyé que dans cette réponse : enregistrez la clé secrète aussitôt dans votre gestionnaire de secrets.
:::

Pour lister les utilisateurs du bucket et leur droit :

```bash
curl -sS "$HIKUBE_API/bucket/v1alpha1/projects/$PROJECT_ID/buckets/demoassets/users" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY" | jq '.users[] | {username, readonly: .config.readonly}'
```

</TabItem>
</Tabs>

## Modifier le droit d'un utilisateur

<Tabs groupId="interface">
<TabItem value="console" label="Console" default>

1. Dans la carte **Utilisateurs et Accès**, ouvrez le menu d'actions de l'utilisateur.
2. Choisissez **Modifier l'accès**.
3. Cochez ou décochez **Accès en lecture seule**, puis cliquez sur **Enregistrer**.

La colonne **Accès** du tableau affiche alors **Lecture seule** ou **Lecture / Écriture**. Les clés de l'utilisateur ne changent pas.

</TabItem>
<TabItem value="api" label="API">

```bash
curl -sS -X PATCH "$HIKUBE_API/bucket/v1alpha1/projects/$PROJECT_ID/buckets/demoassets/users/reader" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"config": {"readonly": false}}'
```

Les clés de l'utilisateur ne changent pas.

</TabItem>
</Tabs>

## Renouveler des clés

<Tabs groupId="interface">
<TabItem value="console" label="Console" default>

La console ne propose pas de rotation des clés d'un utilisateur existant. Pour renouveler des clés (perte de la clé secrète, suspicion de fuite) :

1. Créez un **nouvel utilisateur** avec le même droit et récupérez ses clés.
2. Mettez à jour vos applications avec les nouvelles clés.
3. Supprimez l'ancien utilisateur : menu d'actions → **Supprimer**, puis confirmez.

</TabItem>
<TabItem value="api" label="API">

L'API renouvelle la paire de clés d'un utilisateur existant, sans changer son droit :

```bash
curl -sS -X POST "$HIKUBE_API/bucket/v1alpha1/projects/$PROJECT_ID/buckets/demoassets/users/reader/rotate-credentials" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY" | jq '.secrets'
```

La requête n'a pas de corps. La réponse contient la nouvelle paire (`secrets.accessKeyId`, `secrets.accessSecretKey`), renvoyée une seule fois ; l'ancienne paire est révoquée. Mettez aussitôt à jour vos applications avec ces clés.

Pour supprimer un utilisateur :

```bash
curl -sS -X DELETE "$HIKUBE_API/bucket/v1alpha1/projects/$PROJECT_ID/buckets/demoassets/users/reader" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY"
```

</TabItem>
</Tabs>

## Configurer les clients S3

Dans les exemples suivants, remplacez :

- `<endpoint>` par le **Point de terminaison (Endpoint)**, préfixé par `https://` (par exemple `https://prod.s3.hikube.cloud`) ;
- `<bucket>` par le **Nom du bucket** S3 affiché dans **Accès & Configuration** ;
- `<access-key>` et `<secret-key>` par les clés de l'utilisateur.

### AWS CLI

Configurez un profil dédié :

```bash
aws configure --profile hikube
```

```text
AWS Access Key ID: <access-key>
AWS Secret Access Key: <secret-key>
Default region name: (laisser vide)
Default output format: json
```

Utilisez le profil avec l'endpoint Hikube :

```bash
aws s3 ls s3://<bucket>/ --endpoint-url <endpoint> --profile hikube
```

### MinIO Client (mc)

```bash
mc alias set hikube <endpoint> <access-key> <secret-key>

# Lister, envoyer et télécharger
mc ls hikube/<bucket>/
mc cp fichier.txt hikube/<bucket>/
mc cp hikube/<bucket>/fichier.txt ./
```

### rclone

Ajoutez un remote dans `~/.config/rclone/rclone.conf` :

```ini title="rclone.conf"
[hikube]
type = s3
provider = Minio
endpoint = <endpoint>
access_key_id = <access-key>
secret_access_key = <secret-key>
acl = private
```

```bash
# Lister les objets
rclone ls hikube:<bucket>

# Synchroniser un répertoire local
rclone sync ./mon-dossier hikube:<bucket>/mon-dossier
```

## Bonnes pratiques de sécurité

:::warning
Ne stockez jamais vos clés S3 en clair dans vos dépôts Git ou vos images de conteneur. Utilisez un gestionnaire de secrets, des variables d'environnement ou, dans un cluster Kubernetes, un Secret (voir [Connecter une application](./connect-from-app.md)).
:::

- **Un utilisateur par application** : vous pouvez révoquer l'accès d'une application sans impacter les autres.
- **Lecture seule par défaut** pour les applications qui ne font que lire.
- **Supprimez les utilisateurs inutilisés.**

## Vérification

Avec chaque client configuré, listez le bucket :

```bash
aws s3 ls s3://<bucket>/ --endpoint-url <endpoint> --profile hikube
mc ls hikube/<bucket>/
rclone ls hikube:<bucket>
```

Si la commande retourne une liste vide (bucket vide) ou la liste des objets sans erreur, la configuration est correcte. Avec un utilisateur en **Lecture seule**, un envoi de fichier doit échouer avec `AccessDenied`.

## Pour aller plus loin

- [Connecter un bucket depuis une application](./connect-from-app.md)
- [Concepts](../concepts.md)
