---
title: "Comment gérer les utilisateurs et bases de données — MariaDB"
sidebar_label: "Comment gérer les utilisateurs et bases de données"
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
2. Saisissez le **Nom d'utilisateur** : 3 à 16 caractères, minuscules, chiffres et tirets, commençant par une lettre et se terminant par une lettre ou un chiffre (par exemple `report-reader`).
3. Sous **Accès spécifiques (Bases de données)**, cliquez sur **Ajouter** pour chaque base :
   - **Nom de la base** : par exemple `analytics` (minuscules, chiffres et tirets ; pas de tiret bas ; les bases système `mysql`, `information_schema`, `performance_schema` et `sys` sont refusées) ;
   - **Droits** : **Administrateur (Admin)** ou **Lecture seule (Read-only)**.
4. Cliquez sur **Créer l'utilisateur**.

Il n'existe pas de rôle global : l'utilisateur n'a accès qu'aux bases listées. Sans aucun accès, la console indique « Aucun accès configuré : l'utilisateur n'a de droits sur aucune base. » ; l'utilisateur peut être créé ainsi et recevoir ses accès plus tard.

L'écran « Utilisateur créé avec succès ! » affiche le mot de passe généré.

:::warning
Copiez ce mot de passe immédiatement et conservez-le en lieu sûr : il ne sera plus affiché après avoir quitté cet écran.
:::

Cliquez ensuite sur **Terminer et retourner au cluster**.

:::tip
Les utilisateurs déclarés dans l'assistant de création du cluster reçoivent leur rôle sur la **Base de données** indiquée à l'étape **Utilisateurs**.
:::

### 2. Créer une base de données

Accordez à un utilisateur un accès sur le nom de la nouvelle base (étape 1 pour un nouvel utilisateur, étape 3 pour un utilisateur existant). La base est créée si elle n'existe pas encore.

### 3. Modifier les droits d'un utilisateur

1. Ouvrez le menu **Actions** de l'utilisateur et choisissez **Gérer les accès**.
2. Ajoutez des accès avec **Ajouter**, modifiez les **Droits** ou retirez une ligne.
3. Cliquez sur **Enregistrer**. Le message « Accès mis à jour » confirme l'enregistrement.

Le nom d'utilisateur ne peut pas être modifié.

:::warning Utilisateurs créés avant la console v1.3.0
Les utilisateurs déclarés dans l'assistant de création de cluster avant la console v1.3.0 ont reçu un rôle sur la base système `mysql`. Dans **Gérer les accès**, cette ligne apparaît en erreur et empêche l'enregistrement : retirez-la, ajoutez si besoin la base applicative de l'utilisateur, puis cliquez sur **Enregistrer**.
:::

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

La colonne **Bases de données** de la liste des utilisateurs affiche, pour chacun, les bases accessibles avec le rôle associé (par exemple `analytics (Lecture seule)` ou `analytics (Administrateur)`), ou **Aucun**.

## Pour aller plus loin

- [Concepts MariaDB](../concepts.md) : rôles et règles de nommage
- [Modifier les ressources](./scale-resources.md)
