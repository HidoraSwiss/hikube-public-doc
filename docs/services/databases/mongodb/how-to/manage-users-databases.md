---
title: "Comment gérer les utilisateurs et bases de données — MongoDB"
sidebar_label: "Comment gérer les utilisateurs et bases de données"
sidebar_position: 1
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Comment gérer les utilisateurs et bases de données

Ce guide explique comment créer des utilisateurs MongoDB, leur donner accès à des bases de données et renouveler leurs mots de passe, depuis la [console Hikube](https://console.hikube.cloud).

## Prérequis

- Un cluster **MongoDB** au statut **Prêt** dans votre projet (voir le [démarrage rapide](../quick-start.md))
- Le shell **`mongosh`** pour tester les connexions
- Pour l'onglet **API** : une clé d'API `admin` du projet et les variables `HIKUBE_API`, `HIKUBE_API_KEY` et `PROJECT_ID` (voir [Préparer l'environnement](../../../../api/quick-start.md#environnement)) ; les exemples utilisent `curl` et `jq`

Toutes les opérations se font depuis la page du cluster : **DB & Messaging** → **MongoDB** → nom du cluster, section **Utilisateurs**.

:::note
La console MongoDB n'a pas d'onglet dédié aux bases de données : les droits se définissent par utilisateur, base par base. Comme toujours avec MongoDB, une base apparaît physiquement dès que vous y écrivez un premier document.
:::

## Étapes

### 1. Créer un utilisateur

<Tabs groupId="interface">
<TabItem value="console" label="Console" default>

1. Dans la section **Utilisateurs**, cliquez sur **Créer un utilisateur**.
2. Saisissez le **Nom d'utilisateur** : 3 à 16 caractères, minuscules, chiffres et tirets, commençant par une lettre et se terminant par une lettre ou un chiffre (par exemple `report-reader`).
3. Sous **Accès spécifiques (Bases de données)**, cliquez sur **Ajouter** pour chaque base :
   - **Nom de la base** : par exemple `analytics` (minuscules, chiffres et tirets ; les bases système `admin`, `local` et `config` sont refusées) ;
   - **Droits** : **Administrateur (Admin)** ou **Lecture seule (Read-only)**.
4. Cliquez sur **Créer l'utilisateur**.

Un utilisateur MongoDB doit avoir au moins un accès : sans accès, la console affiche « Veuillez attribuer au moins un accès à une base de données. » et le bouton reste inactif. Il n'existe pas de rôle global : l'utilisateur n'a accès qu'aux bases listées.

L'écran « Utilisateur créé avec succès ! » affiche le mot de passe généré.

:::warning
Copiez ce mot de passe immédiatement et conservez-le en lieu sûr : il ne sera plus affiché après avoir quitté cet écran.
:::

Cliquez ensuite sur **Terminer et retourner au cluster**.

:::tip
Les utilisateurs déclarés dans l'assistant de création du cluster reçoivent leur rôle sur la **Base de données** indiquée à l'étape **Utilisateurs**.
:::

</TabItem>
<TabItem value="api" label="API">

```bash
curl -sS -X POST "$HIKUBE_API/mongodb/v1alpha1/projects/$PROJECT_ID/clusters/demomongo/users" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "reportreader",
    "config": {
      "databases": {
        "analytics": {"role": "readonly"}
      }
    }
  }' | jq '{username, password}'
```

- `username` : 1 à 63 caractères, minuscules, chiffres et tirets, commençant par une lettre ;
- `config.databases` : obligatoire, au moins une entrée ; chaque clé est un nom de base et chaque valeur `{"role": "admin"}` ou `{"role": "readonly"}`. Un rôle global correspond à une entrée sur la base `admin`. Sans entrée, la requête est refusée (`400`).

:::warning
Le champ `password` de la réponse n'est renvoyé qu'une seule fois. Enregistrez-le directement dans votre gestionnaire de secrets.
:::

</TabItem>
</Tabs>

### 2. Modifier les droits d'un utilisateur

<Tabs groupId="interface">
<TabItem value="console" label="Console" default>

1. Ouvrez le menu **Actions** de l'utilisateur et choisissez **Gérer les accès**.
2. Ajoutez des accès avec **Ajouter**, modifiez les **Droits** ou retirez une ligne. Au moins un accès doit subsister.
3. Cliquez sur **Enregistrer**. Le message « Accès mis à jour » confirme l'enregistrement.

</TabItem>
<TabItem value="api" label="API">

```bash
curl -sS -X PATCH "$HIKUBE_API/mongodb/v1alpha1/projects/$PROJECT_ID/clusters/demomongo/users/reportreader" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "config": {
      "databases": {
        "analytics": {"role": "readonly"},
        "myapp": {"role": "admin"}
      }
    }
  }'
```

L'objet `config.databases`, s'il est envoyé, remplace l'ensemble des droits de l'utilisateur : une base absente de la requête lui est retirée, et au moins une entrée doit subsister. Un corps sans `config.databases` ne change rien ; voir [Mises à jour partielles](../../../../api/overview.md#mises-a-jour-partielles). Consultez les droits actuels avec `GET $HIKUBE_API/mongodb/v1alpha1/projects/$PROJECT_ID/clusters/demomongo/users/reportreader`.

</TabItem>
</Tabs>

Le nom d'utilisateur ne peut pas être modifié.

:::warning Utilisateurs créés avant la console v1.3.0
Les utilisateurs déclarés dans l'assistant de création de cluster avant la console v1.3.0 ont reçu un rôle sur la base système `admin`. Dans **Gérer les accès**, cette ligne apparaît en erreur et empêche l'enregistrement : retirez-la, ajoutez si besoin la base applicative de l'utilisateur, puis cliquez sur **Enregistrer**.
:::

### 3. Renouveler le mot de passe d'un utilisateur

<Tabs groupId="interface">
<TabItem value="console" label="Console" default>

1. Ouvrez le menu **Actions** de l'utilisateur et choisissez **Changer le mot de passe**.
2. Dans la fenêtre **Rotation du mot de passe**, cliquez sur **Effectuer la rotation**.
3. Copiez le nouveau mot de passe, puis cliquez sur **Terminer**.

</TabItem>
<TabItem value="api" label="API">

```bash
curl -sS -X POST "$HIKUBE_API/mongodb/v1alpha1/projects/$PROJECT_ID/clusters/demomongo/users/reportreader/rotate-password" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY" | jq -r '.password'
```

La requête n'a pas de corps. Le nouveau mot de passe n'est renvoyé que dans cette réponse.

</TabItem>
</Tabs>

:::warning
La rotation révoque immédiatement l'ancien mot de passe. Mettez à jour vos applications sans attendre pour éviter une coupure.
:::

### 4. Supprimer un utilisateur

<Tabs groupId="interface">
<TabItem value="console" label="Console" default>

Ouvrez le menu **Actions** de l'utilisateur, choisissez **Supprimer l'utilisateur**, saisissez son nom exact puis cliquez sur **Supprimer définitivement**.

</TabItem>
<TabItem value="api" label="API">

```bash
curl -sS -X DELETE "$HIKUBE_API/mongodb/v1alpha1/projects/$PROJECT_ID/clusters/demomongo/users/reportreader" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY"
```

Les droits de l'utilisateur sur toutes les bases sont retirés avec lui.

</TabItem>
</Tabs>

### 5. Tester la connexion

```bash
mongosh "mongodb://<hôte>:27017/analytics?directConnection=true&authSource=admin" --username report-reader
```

Sur un replica set, `<hôte>` est l'adresse d'un des **Membres du replica set rs0** listés dans la carte **Connexion et réseau**.

```javascript
// Doit réussir
db.runCommand({ connectionStatus: 1 })
db.events.find().limit(1)

// Doit échouer pour un utilisateur en lecture seule
db.events.insertOne({ test: true })
```

## Vérification

<Tabs groupId="interface">
<TabItem value="console" label="Console" default>

La colonne **Bases de données** de la liste des utilisateurs affiche, pour chacun, les bases accessibles avec le rôle associé (par exemple `analytics (Lecture seule)` ou `analytics (Administrateur)`).

</TabItem>
<TabItem value="api" label="API">

```bash
curl -sS "$HIKUBE_API/mongodb/v1alpha1/projects/$PROJECT_ID/clusters/demomongo/users" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY" | jq '.users[] | {username, databases: .config.databases}'
```

Cette lecture suffit avec une clé `read`. L'API expose aussi les bases déclarées sur le cluster : `GET $HIKUBE_API/mongodb/v1alpha1/projects/$PROJECT_ID/clusters/demomongo/databases`.

</TabItem>
</Tabs>

## Pour aller plus loin

- [Concepts MongoDB](../concepts.md) : rôles et règles de nommage
- [Modifier les ressources](./scale-resources.md)
