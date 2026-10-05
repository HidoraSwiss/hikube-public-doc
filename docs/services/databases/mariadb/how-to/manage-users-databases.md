---
title: "Comment gérer les utilisateurs et bases de données"
sidebar_position: 1
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Comment gérer les utilisateurs et bases de données

Ce guide explique comment créer des utilisateurs, leur donner accès à des bases de données et renouveler leurs mots de passe sur un cluster MariaDB, depuis la [console Hikube](https://console.hikube.cloud).

## Prérequis

- Un cluster **MariaDB** au statut **Prêt** dans votre projet (voir le [démarrage rapide](../quick-start.md))
- Un client **`mysql`** ou **`mariadb`** pour tester les connexions
- Pour l'onglet **API** : une clé d'API `admin` du projet et les variables `HIKUBE_API`, `HIKUBE_API_KEY` et `PROJECT_ID` (voir [Préparer l'environnement](../../../../api/quick-start.md#environnement)) ; les exemples utilisent `curl` et `jq`

Toutes les opérations se font depuis la page du cluster : **DB & Messaging** → **MariaDB** → nom du cluster, section **Utilisateurs**.

:::note
La console MariaDB n'a pas d'onglet dédié aux bases de données : une base se crée en accordant un accès sur son nom à un utilisateur.
:::

## Étapes

### 1. Créer un utilisateur

<Tabs groupId="interface">
<TabItem value="console" label="Console" default>

1. Dans la section **Utilisateurs**, cliquez sur **Créer un utilisateur**.
2. Saisissez le **Nom d'utilisateur** : minuscules, chiffres et tirets, commençant par une lettre (par exemple `report-reader`).
3. Laissez **Rôle Global (Optionnel)** sur **Aucun rôle global**.
4. Sous **Accès spécifiques (Bases de données)**, cliquez sur **Ajouter** pour chaque base :
   - **Nom de la base** : par exemple `analytics` (minuscules, chiffres et tirets ; pas de tiret bas) ;
   - **Droits** : **Administrateur (Admin)** ou **Lecture seule (Read-only)**.
5. Cliquez sur **Créer l'utilisateur**.

L'écran « Mot de passe généré » affiche le mot de passe généré.

:::warning
Copiez ce mot de passe immédiatement et conservez-le en lieu sûr : il ne sera plus affiché après avoir quitté cet écran.
:::

</TabItem>
<TabItem value="api" label="API">

```bash
curl -sS -X POST "$HIKUBE_API/mariadb/v1alpha1/projects/$PROJECT_ID/clusters/demomariadb/users" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "reportreader",
    "config": {
      "maxUserConnections": 0,
      "databases": {
        "analytics": {"role": "readonly"}
      }
    }
  }' | jq '{username, password}'
```

- `username` : 1 à 63 caractères, minuscules, chiffres et tirets, commençant par une lettre ;
- `config.databases` : un objet dont chaque clé est un nom de base et chaque valeur `{"role": "admin"}` ou `{"role": "readonly"}`. Une base qui n'existe pas encore est créée ;
- `config.maxUserConnections` : nombre maximal de connexions simultanées (`0` pour illimité, 10000 au maximum).

:::warning
Le champ `password` de la réponse n'est renvoyé qu'une seule fois. Enregistrez-le directement dans votre gestionnaire de secrets.
:::

</TabItem>
</Tabs>

Cliquez ensuite sur **Terminer**.

### 2. Créer une base de données

<Tabs groupId="interface">
<TabItem value="console" label="Console" default>

Accordez à un utilisateur un accès sur le nom de la nouvelle base (étape 1 pour un nouvel utilisateur, étape 3 pour un utilisateur existant). La base est créée si elle n'existe pas encore.

</TabItem>
<TabItem value="api" label="API">

L'API expose aussi les bases elles-mêmes. Pour créer une base sans encore y donner accès :

```bash
curl -sS -X POST "$HIKUBE_API/mariadb/v1alpha1/projects/$PROJECT_ID/clusters/demomariadb/databases" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"databaseName": "analytics"}'
```

`GET $HIKUBE_API/mariadb/v1alpha1/projects/$PROJECT_ID/clusters/demomariadb/databases` liste les bases avec, pour chacune, les utilisateurs `admin` et `readonly`. Une base se supprime avec `DELETE $HIKUBE_API/mariadb/v1alpha1/projects/$PROJECT_ID/clusters/demomariadb/databases/<base>`, ce qui efface ses données.

</TabItem>
</Tabs>

### 3. Modifier les droits d'un utilisateur

<Tabs groupId="interface">
<TabItem value="console" label="Console" default>

1. Ouvrez le menu **Actions** de l'utilisateur et choisissez **Gérer les accès**.
2. Ajoutez des accès avec **Ajouter**, modifiez les **Droits** ou retirez une ligne.
3. Cliquez sur **Enregistrer**.

</TabItem>
<TabItem value="api" label="API">

```bash
curl -sS -X PATCH "$HIKUBE_API/mariadb/v1alpha1/projects/$PROJECT_ID/clusters/demomariadb/users/reportreader" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "config": {
      "maxUserConnections": 0,
      "databases": {
        "analytics": {"role": "readonly"},
        "myapp": {"role": "admin"}
      }
    }
  }'
```

L'objet `config.databases` remplace l'ensemble des droits de l'utilisateur : une base absente de la requête lui est retirée. `config.maxUserConnections` est lui aussi réécrit (`0`, illimité, s'il est omis). Consultez la configuration actuelle avec `GET $HIKUBE_API/mariadb/v1alpha1/projects/$PROJECT_ID/clusters/demomariadb/users/reportreader`.

</TabItem>
</Tabs>

Le nom d'utilisateur ne peut pas être modifié.

### 4. Renouveler le mot de passe d'un utilisateur

<Tabs groupId="interface">
<TabItem value="console" label="Console" default>

1. Ouvrez le menu **Actions** de l'utilisateur et choisissez **Changer le mot de passe**.
2. Dans la fenêtre **Rotation du mot de passe**, cliquez sur **Effectuer la rotation**.
3. Copiez le nouveau mot de passe, puis cliquez sur **Terminer**.

</TabItem>
<TabItem value="api" label="API">

```bash
curl -sS -X POST "$HIKUBE_API/mariadb/v1alpha1/projects/$PROJECT_ID/clusters/demomariadb/users/reportreader/rotate-password" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY" | jq -r '.password'
```

La requête n'a pas de corps. Le nouveau mot de passe n'est renvoyé que dans cette réponse.

</TabItem>
</Tabs>

:::warning
La rotation révoque immédiatement l'ancien mot de passe. Mettez à jour vos applications sans attendre pour éviter une coupure.
:::

### 5. Supprimer un utilisateur

<Tabs groupId="interface">
<TabItem value="console" label="Console" default>

Ouvrez le menu **Actions** de l'utilisateur, choisissez **Supprimer l'utilisateur**, saisissez son nom exact puis cliquez sur **Supprimer définitivement**.

</TabItem>
<TabItem value="api" label="API">

```bash
curl -sS -X DELETE "$HIKUBE_API/mariadb/v1alpha1/projects/$PROJECT_ID/clusters/demomariadb/users/reportreader" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY"
```

Les droits de l'utilisateur sur toutes les bases sont retirés avec lui.

</TabItem>
</Tabs>

### 6. Tester la connexion

```bash
mysql -h <hôte> -P 3306 -u report-reader -p analytics
```

```sql
-- Doit réussir
SELECT CURRENT_USER(), DATABASE();
SHOW GRANTS;

-- Doit échouer pour un utilisateur en lecture seule
CREATE TABLE test (id INT);
```

## Vérification

<Tabs groupId="interface">
<TabItem value="console" label="Console" default>

La liste des utilisateurs affiche, pour chacun, son **Rôle** et les **Bases de données** accessibles avec le droit associé (par exemple `analytics (readonly)` ou `analytics (admin)`).

</TabItem>
<TabItem value="api" label="API">

```bash
curl -sS "$HIKUBE_API/mariadb/v1alpha1/projects/$PROJECT_ID/clusters/demomariadb/users" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY" | jq '.users[] | {username, databases: .config.databases}'
```

Cette lecture suffit avec une clé `read`.

</TabItem>
</Tabs>

## Pour aller plus loin

- [Concepts MariaDB](../concepts.md) : rôles et règles de nommage
- [Modifier les ressources](./scale-resources.md)
