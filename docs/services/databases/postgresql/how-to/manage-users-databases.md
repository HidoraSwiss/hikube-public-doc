---
title: "Comment gérer les utilisateurs et bases de données"
sidebar_position: 1
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Comment gérer les utilisateurs et bases de données

Ce guide explique comment créer des bases de données, activer des extensions, créer des utilisateurs, gérer leurs droits et renouveler leurs mots de passe sur un cluster PostgreSQL, depuis la [console Hikube](https://console.hikube.cloud).

## Prérequis

- Un cluster **PostgreSQL** au statut **Prêt** dans votre projet (voir le [démarrage rapide](../quick-start.md))
- Le client **`psql`** pour tester les connexions
- Pour l'onglet **API** : une clé d'API `admin` du projet et les variables `HIKUBE_API`, `HIKUBE_API_KEY` et `PROJECT_ID` (voir [Préparer l'environnement](../../../../api/quick-start.md#environnement)) ; les exemples utilisent `curl` et `jq`

Toutes les opérations se font depuis la page du cluster : **DB & Messaging** → **PostgreSQL** → nom du cluster. La page comporte deux onglets, **Bases de données** et **Utilisateurs**.

## Étapes

### 1. Créer une base de données

<Tabs groupId="interface">
<TabItem value="console" label="Console" default>

1. Dans l'onglet **Bases de données**, cliquez sur **Créer**.
2. Saisissez le **Nom de la base de données** (minuscules, chiffres et tirets bas, 63 caractères au maximum), par exemple `analytics`.
3. Dans **Extensions PostgreSQL**, cochez les extensions à activer à la création.
4. Cliquez sur **Créer**.

La base apparaît dans la liste, avec ses extensions. Elle figure aussi dans la carte **Connexion et Bases de données**, sous **Bases de données initiales**.

</TabItem>
<TabItem value="api" label="API">

```bash
curl -sS -X POST "$HIKUBE_API/postgres/v1alpha1/projects/$PROJECT_ID/clusters/demopg/databases" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "databaseName": "analytics",
    "extensions": ["pg_stat_statements", "pgcrypto"]
  }'
```

Avec l'API, le nom de base accepte les minuscules, les chiffres et les tirets (63 caractères au maximum, commençant par une lettre) ; le tiret bas est refusé. `GET /postgres/v1alpha1/extensions` renvoie les extensions disponibles, et `GET $HIKUBE_API/postgres/v1alpha1/projects/$PROJECT_ID/clusters/demopg/databases` liste les bases du cluster avec leurs extensions et leurs rôles.

</TabItem>
</Tabs>

:::tip
Vous pouvez aussi déclarer des bases dès la création du cluster, à l'étape **Bases** de l'assistant. La base **`postgres`** est toujours créée automatiquement.
:::

### 2. Gérer les extensions d'une base

<Tabs groupId="interface">
<TabItem value="console" label="Console" default>

1. Dans l'onglet **Bases de données**, ouvrez le menu **Actions** de la base.
2. Choisissez **Gérer les extensions**.
3. Cochez ou décochez les extensions, puis cliquez sur **Enregistrer**.

La liste proposée correspond aux extensions disponibles sur la plateforme, notamment `pg_stat_statements`, `pgcrypto`, `uuid-ossp`, `pg_trgm`, `hstore`, `citext`, `postgres_fdw`, `pgaudit` et `vector` (pgvector).

</TabItem>
<TabItem value="api" label="API">

```bash
curl -sS -X PATCH "$HIKUBE_API/postgres/v1alpha1/projects/$PROJECT_ID/clusters/demopg/databases/analytics" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"extensions": ["pg_stat_statements", "pgcrypto", "vector"]}'
```

La liste `extensions` remplace la liste actuelle : indiquez toutes les extensions à conserver. Les droits des utilisateurs sur la base ne changent pas.

</TabItem>
</Tabs>

### 3. Créer un utilisateur

<Tabs groupId="interface">
<TabItem value="console" label="Console" default>

1. Dans l'onglet **Utilisateurs**, cliquez sur **Créer un utilisateur**.
2. Saisissez le **Nom d'utilisateur** : 3 à 16 caractères, minuscules, chiffres et tirets bas, commençant par une lettre ou un tiret bas (par exemple `report_reader`).
3. Dans **Bases de données**, cliquez sur **Ajouter un accès** pour chaque base à laquelle l'utilisateur doit accéder :
   - **Nom de la base** : sélectionnez la base ;
   - **Droits** : **Administrateur (Admin)** (lecture et écriture) ou **Lecture seule (Read-only)**.
4. Cliquez sur **Créer l'utilisateur**.

L'écran « Utilisateur créé avec succès ! » affiche le mot de passe généré.

:::warning
Copiez ce mot de passe immédiatement et conservez-le en lieu sûr : il ne sera plus affiché après avoir quitté cet écran.
:::

</TabItem>
<TabItem value="api" label="API">

```bash
curl -sS -X POST "$HIKUBE_API/postgres/v1alpha1/projects/$PROJECT_ID/clusters/demopg/users" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "report_reader",
    "config": {
      "databases": {
        "analytics": {"role": "readonly"}
      }
    }
  }' | jq '{username, password}'
```

- `username` : 1 à 63 caractères, minuscules, chiffres et tirets bas, commençant par une lettre ou un tiret bas ; `postgres` est réservé ;
- `config.databases` : un objet dont chaque clé est un nom de base et chaque valeur `{"role": "admin"}` ou `{"role": "readonly"}`. Une base qui n'existe pas encore est créée ;
- `config.privileges.replication` (facultatif) : `true` accorde le droit de réplication.

:::warning
Le champ `password` de la réponse n'est renvoyé qu'une seule fois. Enregistrez-le directement dans votre gestionnaire de secrets.
:::

</TabItem>
</Tabs>

Cliquez ensuite sur **Terminer et retourner au cluster**.

### 4. Modifier les droits d'un utilisateur

<Tabs groupId="interface">
<TabItem value="console" label="Console" default>

1. Dans l'onglet **Utilisateurs**, ouvrez le menu **Actions** de l'utilisateur.
2. Choisissez **Gérer les accès**.
3. Ajoutez des accès avec **Ajouter**, modifiez les **Droits** ou retirez une ligne.
4. Cliquez sur **Enregistrer**.

</TabItem>
<TabItem value="api" label="API">

```bash
curl -sS -X PATCH "$HIKUBE_API/postgres/v1alpha1/projects/$PROJECT_ID/clusters/demopg/users/report_reader" \
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

L'objet `config.databases` remplace l'ensemble des droits de l'utilisateur : une base absente de la requête lui est retirée. De même, `config.privileges.replication` vaut `false` s'il est omis. Consultez les droits actuels avec `GET $HIKUBE_API/postgres/v1alpha1/projects/$PROJECT_ID/clusters/demopg/users/report_reader`.

</TabItem>
</Tabs>

Le nom d'utilisateur ne peut pas être modifié.

### 5. Renouveler le mot de passe d'un utilisateur

<Tabs groupId="interface">
<TabItem value="console" label="Console" default>

1. Ouvrez le menu **Actions** de l'utilisateur et choisissez **Changer le mot de passe**.
2. Dans la fenêtre **Rotation du mot de passe**, cliquez sur **Effectuer la rotation**.
3. Copiez le nouveau mot de passe affiché, puis cliquez sur **Terminer**.

</TabItem>
<TabItem value="api" label="API">

```bash
curl -sS -X POST "$HIKUBE_API/postgres/v1alpha1/projects/$PROJECT_ID/clusters/demopg/users/report_reader/rotate-password" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY" | jq -r '.password'
```

La requête n'a pas de corps. Le nouveau mot de passe n'est renvoyé que dans cette réponse.

</TabItem>
</Tabs>

:::warning
La rotation révoque immédiatement l'ancien mot de passe. Mettez à jour vos applications sans attendre pour éviter une coupure.
:::

### 6. Supprimer une base ou un utilisateur

<Tabs groupId="interface">
<TabItem value="console" label="Console" default>

- Base : menu **Actions** → **Supprimer la base de données**.
- Utilisateur : menu **Actions** → **Supprimer l'utilisateur**.

Confirmez en saisissant le nom exact de l'élément, puis cliquez sur **Supprimer définitivement**. La suppression d'une base efface ses données.

</TabItem>
<TabItem value="api" label="API">

```bash
# Supprimer une base (ses données sont effacées)
curl -sS -X DELETE "$HIKUBE_API/postgres/v1alpha1/projects/$PROJECT_ID/clusters/demopg/databases/analytics" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY"

# Supprimer un utilisateur (ses droits sur toutes les bases sont retirés)
curl -sS -X DELETE "$HIKUBE_API/postgres/v1alpha1/projects/$PROJECT_ID/clusters/demopg/users/report_reader" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY"
```

</TabItem>
</Tabs>

### 7. Tester la connexion

```bash
# Utilisateur en lecture seule
psql "host=<hôte> port=5432 dbname=analytics user=report_reader sslmode=require"
```

```sql
-- Doit réussir
SELECT current_user, current_database();

-- Doit échouer pour un utilisateur en lecture seule
CREATE TABLE test (id int);
```

## Vérification

<Tabs groupId="interface">
<TabItem value="console" label="Console" default>

- L'onglet **Bases de données** liste vos bases et leurs extensions.
- L'onglet **Utilisateurs** liste vos utilisateurs avec, pour chacun, les bases accessibles et le droit associé (par exemple `analytics (readonly)` ou `analytics (admin)`).

</TabItem>
<TabItem value="api" label="API">

```bash
# Bases, extensions et utilisateurs par rôle
curl -sS "$HIKUBE_API/postgres/v1alpha1/projects/$PROJECT_ID/clusters/demopg/databases" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY" | jq '.databases[] | {databaseName, extensions, roles}'

# Utilisateurs et droits par base
curl -sS "$HIKUBE_API/postgres/v1alpha1/projects/$PROJECT_ID/clusters/demopg/users" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY" | jq '.users[] | {username, databases: .config.databases}'
```

Ces lectures suffisent avec une clé `read`.

</TabItem>
</Tabs>

## Pour aller plus loin

- [Concepts PostgreSQL](../concepts.md) : droits, règles de nommage
- [Modifier les ressources](./scale-resources.md) : preset, disque, accès externe
