---
title: "Comment gérer les utilisateurs et bases de données"
sidebar_position: 1
---

# Comment gérer les utilisateurs et bases de données

Ce guide explique comment créer des bases de données, activer des extensions, créer des utilisateurs, gérer leurs droits et renouveler leurs mots de passe sur un cluster PostgreSQL, depuis la [console Hikube](https://console.hikube.cloud).

## Prérequis

- Un cluster **PostgreSQL** au statut **Prêt** dans votre projet (voir le [démarrage rapide](../quick-start.md))
- Le client **`psql`** pour tester les connexions

Toutes les opérations se font depuis la page du cluster : **DB & Messaging** → **PostgreSQL** → nom du cluster. La page comporte deux onglets, **Bases de données** et **Utilisateurs**.

## Étapes

### 1. Créer une base de données

1. Dans l'onglet **Bases de données**, cliquez sur **Créer**.
2. Saisissez le **Nom de la base de données** (minuscules, chiffres et tirets bas, 63 caractères au maximum), par exemple `analytics`.
3. Dans **Extensions PostgreSQL**, cochez les extensions à activer à la création.
4. Cliquez sur **Créer**.

La base apparaît dans la liste, avec ses extensions. Elle figure aussi dans la carte **Connexion et Bases de données**, sous **Bases de données initiales**.

:::tip
Vous pouvez aussi déclarer des bases dès la création du cluster, à l'étape **Bases** de l'assistant. La base **`postgres`** est toujours créée automatiquement.
:::

### 2. Gérer les extensions d'une base

1. Dans l'onglet **Bases de données**, ouvrez le menu **Actions** de la base.
2. Choisissez **Gérer les extensions**.
3. Cochez ou décochez les extensions, puis cliquez sur **Enregistrer**.

La liste proposée correspond aux extensions disponibles sur la plateforme, notamment `pg_stat_statements`, `pgcrypto`, `uuid-ossp`, `pg_trgm`, `hstore`, `citext`, `postgres_fdw`, `pgaudit` et `vector` (pgvector).

### 3. Créer un utilisateur

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

Cliquez ensuite sur **Terminer et retourner au cluster**.

### 4. Modifier les droits d'un utilisateur

1. Dans l'onglet **Utilisateurs**, ouvrez le menu **Actions** de l'utilisateur.
2. Choisissez **Gérer les accès**.
3. Ajoutez des accès avec **Ajouter**, modifiez les **Droits** ou retirez une ligne.
4. Cliquez sur **Enregistrer**.

Le nom d'utilisateur ne peut pas être modifié.

### 5. Renouveler le mot de passe d'un utilisateur

1. Ouvrez le menu **Actions** de l'utilisateur et choisissez **Changer le mot de passe**.
2. Dans la fenêtre **Rotation du mot de passe**, cliquez sur **Effectuer la rotation**.
3. Copiez le nouveau mot de passe affiché, puis cliquez sur **Terminer**.

:::warning
La rotation révoque immédiatement l'ancien mot de passe. Mettez à jour vos applications sans attendre pour éviter une coupure.
:::

### 6. Supprimer une base ou un utilisateur

- Base : menu **Actions** → **Supprimer la base de données**.
- Utilisateur : menu **Actions** → **Supprimer l'utilisateur**.

Confirmez en saisissant le nom exact de l'élément, puis cliquez sur **Supprimer définitivement**. La suppression d'une base efface ses données.

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

- L'onglet **Bases de données** liste vos bases et leurs extensions.
- L'onglet **Utilisateurs** liste vos utilisateurs avec, pour chacun, les bases accessibles et le droit associé (par exemple `analytics (Lecture seule)`).

## Pour aller plus loin

- [Concepts PostgreSQL](../concepts.md) : droits, règles de nommage
- [Modifier les ressources](./scale-resources.md) : preset, disque, accès externe
