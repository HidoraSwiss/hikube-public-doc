---
title: "Comment gérer les utilisateurs et bases de données"
sidebar_position: 1
---

# Comment gérer les utilisateurs et bases de données

Ce guide explique comment créer des utilisateurs, leur donner accès à des bases de données et renouveler leurs mots de passe sur un cluster MariaDB, depuis la [console Hikube](https://console.hikube.cloud).

## Prérequis

- Un cluster **MariaDB** au statut **Prêt** dans votre projet (voir le [démarrage rapide](../quick-start.md))
- Un client **`mysql`** ou **`mariadb`** pour tester les connexions

Toutes les opérations se font depuis la page du cluster : **DB & Messaging** → **MariaDB** → nom du cluster, section **Utilisateurs**.

:::note
La console MariaDB n'a pas d'onglet dédié aux bases de données : une base se crée en accordant un accès sur son nom à un utilisateur.
:::

## Étapes

### 1. Créer un utilisateur

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

Cliquez ensuite sur **Terminer**.

### 2. Créer une base de données

Accordez à un utilisateur un accès sur le nom de la nouvelle base (étape 1 pour un nouvel utilisateur, étape 3 pour un utilisateur existant). La base est créée si elle n'existe pas encore.

### 3. Modifier les droits d'un utilisateur

1. Ouvrez le menu **Actions** de l'utilisateur et choisissez **Gérer les accès**.
2. Ajoutez des accès avec **Ajouter**, modifiez les **Droits** ou retirez une ligne.
3. Cliquez sur **Enregistrer**.

Le nom d'utilisateur ne peut pas être modifié.

### 4. Renouveler le mot de passe d'un utilisateur

1. Ouvrez le menu **Actions** de l'utilisateur et choisissez **Changer le mot de passe**.
2. Dans la fenêtre **Rotation du mot de passe**, cliquez sur **Effectuer la rotation**.
3. Copiez le nouveau mot de passe, puis cliquez sur **Terminer**.

:::warning
La rotation révoque immédiatement l'ancien mot de passe. Mettez à jour vos applications sans attendre pour éviter une coupure.
:::

### 5. Supprimer un utilisateur

Ouvrez le menu **Actions** de l'utilisateur, choisissez **Supprimer l'utilisateur**, saisissez son nom exact puis cliquez sur **Supprimer définitivement**.

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

La liste des utilisateurs affiche, pour chacun, son **Rôle** et les **Bases de données** accessibles avec le droit associé (par exemple `analytics (Lecture seule)`).

## Pour aller plus loin

- [Concepts MariaDB](../concepts.md) : rôles et règles de nommage
- [Modifier les ressources](./scale-resources.md)
