---
sidebar_position: 3
title: Démarrage rapide
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# Déployer PostgreSQL en 5 minutes

Ce guide vous accompagne dans la création de votre premier cluster **PostgreSQL** depuis la [console Hikube](https://console.hikube.cloud), jusqu'à la première connexion avec `psql`.

---

## Objectifs

À la fin de ce guide, vous aurez :

- Un cluster **PostgreSQL** déployé dans votre projet Hikube
- Une base de données applicative et un utilisateur pour vous y connecter
- Un mot de passe généré par la plateforme
- Une connexion fonctionnelle avec `psql`

---

## Prérequis

- Un **compte Hikube** et un **projet** disposant de quotas suffisants (CPU, mémoire, stockage)
- Le client **`psql`** installé sur votre poste, si vous souhaitez tester une connexion depuis Internet

---

## Étape 1 : Créer le cluster

1. Connectez-vous à la [console Hikube](https://console.hikube.cloud) et sélectionnez votre projet.
2. Dans le menu latéral, ouvrez **DB & Messaging** → **PostgreSQL**. La page **Clusters PostgreSQL** s'affiche.
3. Cliquez sur **Créer un cluster**. L'assistant **Créer un cluster PostgreSQL** s'ouvre.

---

## Étape 2 : Configurer et valider

L'assistant comporte six étapes : **Général**, **Configuration**, **Bases**, **Utilisateurs**, **Vérification** et **Résumé**. Passez de l'une à l'autre avec **Suivant** et **Précédent**.

### Général

Saisissez le **Nom du cluster** (un nom aléatoire est proposé par défaut), par exemple `demo-pg`. Il doit compter 3 à 16 caractères (minuscules, chiffres et tirets), commencer par une lettre et se terminer par une lettre ou un chiffre.

### Configuration

| Champ | Valeur conseillée pour ce guide | Remarque |
|-------|----------------------------------|----------|
| **Version PostgreSQL** | `18` | Versions proposées : 15, 16, 17, 18 |
| **Preset d'instance** | `Small (1 CPU, 512Mi)` | Capacité allouée à chaque nœud |
| **Taille du disque (Go)** | `10` | Capacité de stockage par nœud |
| **Nombre de réplicas** | `1 (Standalone)` | `2` ou `3` pour la haute disponibilité |
| **Accès externe** | Activé | Nécessaire pour vous connecter depuis votre poste |

Le bandeau en haut de l'assistant affiche le **Coût estimé** et l'impact sur les quotas du projet.

:::warning
Le **Nombre de réplicas** ne peut plus être modifié après la création. Pour la production, choisissez directement **2 (Haute disponibilité)** ou **3 (Haute disponibilité max)**.
:::

:::note
N'activez l'**Accès externe** que si vous en avez besoin : il expose la base de données sur l'Internet public.
:::

### Bases

Saisissez un **Nom de la base de données**, par exemple `myapp`, puis cliquez sur **Ajouter**. Si vous n'ajoutez aucune base, seule la base par défaut **`postgres`** est créée.

### Utilisateurs

Ajoutez au moins un utilisateur :

1. **Nom de l'utilisateur** : par exemple `app_user` (minuscules, chiffres et tirets bas uniquement, pas de tiret).
2. **Nom de la base** : sélectionnez `myapp`.
3. **Droits** : **Administrateur (Admin)** ou **Lecture seule (Read-only)**.
4. Cliquez sur **Ajouter**.

### Vérification

Relisez le récapitulatif (**Version**, **Preset d'instance**, **Volume de données**, **Réplicas**, **Exposition externe**, **Bases à créer**, **Utilisateurs à créer**, **Coût estimé**), puis cliquez sur **Déployer**.

---

## Étape 3 : Vérifier l'état

L'étape **Résumé** confirme la création (« Création terminée ! »). Cliquez sur **Terminer** pour ouvrir la page du cluster.

Le statut du cluster est affiché à côté de son nom, dans la page du cluster comme dans la liste **Clusters PostgreSQL** :

| Statut | Signification |
|--------|---------------|
| **En création** | Le cluster est en cours de provisionnement |
| **Prêt** / **Actif** | Le cluster est opérationnel |
| **Erreur** / **Échec** | Le provisionnement a échoué |

**Résultat attendu :** après quelques minutes, le statut passe à **Prêt**. La page du cluster affiche la **Version PostgreSQL**, les **Réplicas**, la **Taille allouée** et l'**Accès externe** (**Activé**).

---

## Étape 4 : Récupérer les identifiants

Les mots de passe sont affichés **une seule fois**, à l'étape **Résumé** de l'assistant, dans la section **Identifiants des utilisateurs** :

- **Mot de passe** de chaque utilisateur créé ;
- **Chaîne de connexion interne** : l'adresse du cluster, lorsque l'accès externe est activé.

:::warning
Copiez ces mots de passe dans un gestionnaire de mots de passe avant de quitter l'écran : ils ne seront plus affichés. En cas de perte, générez-en un nouveau depuis l'onglet **Utilisateurs** (**Actions** → **Changer le mot de passe**).
:::

L'adresse du cluster reste consultable dans la page du cluster, carte **Connexion et Bases de données**, champ **Hôte (Host)**.

---

## Étape 5 : Connexion et tests

Connectez-vous avec `psql` en utilisant l'adresse du champ **Hôte (Host)** :

```bash
psql "host=<hôte> port=5432 dbname=myapp user=app_user sslmode=require"
```

Saisissez le mot de passe lorsqu'il est demandé, puis vérifiez la connexion :

```sql
SELECT version();
CREATE TABLE test (id serial PRIMARY KEY, message text);
INSERT INTO test (message) VALUES ('Bonjour Hikube');
SELECT * FROM test;
```

**Résultat attendu :**

```console
 id |    message
----+----------------
  1 | Bonjour Hikube
(1 row)
```

---

## Étape 6 : Dépannage rapide

### Le champ Hôte (Host) affiche « Non défini »

L'**Accès externe** est désactivé, ou l'adresse IP publique n'est pas encore attribuée. Vérifiez la carte **Accès externe** de la page du cluster ; activez-le si besoin via **Modifier**, puis patientez quelques instants.

### Le bouton Suivant reste inactif

- À l'étape **Configuration** : le cluster dépasse les quotas du projet. Réduisez le preset, la taille du disque ou le nombre de réplicas.
- À l'étape **Utilisateurs** : ajoutez au moins un utilisateur.

### Authentification refusée

Vérifiez le nom d'utilisateur, la base cible et le mot de passe. Si le mot de passe a été perdu, effectuez une rotation depuis l'onglet **Utilisateurs**. Voir [Gérer les utilisateurs et bases de données](./how-to/manage-users-databases.md).

### Le cluster reste en Erreur

[Contactez le support](mailto:support@hidora.io) en indiquant le nom du projet et du cluster.

---

## Étape 7 : Nettoyage

1. Ouvrez la page du cluster (**DB & Messaging** → **PostgreSQL** → nom du cluster).
2. Cliquez sur **Supprimer le cluster**.
3. Saisissez le nom exact du cluster dans le champ **Nom de la ressource à confirmer**, puis cliquez sur **Supprimer définitivement**.

:::warning
Cette action supprime le cluster PostgreSQL et toutes les données associées. Elle est **irréversible**.
:::

---

## Résumé

Vous avez créé depuis la console :

- Un cluster **PostgreSQL** dans votre projet
- Une base de données et un utilisateur avec ses droits
- Un accès externe et une connexion `psql`

<NavigationFooter
  nextSteps={[
    {label: "Gérer les utilisateurs et bases", href: "../how-to/manage-users-databases"},
    {label: "FAQ", href: "../faq"},
  ]}
  seeAlso={[
    {label: "Toutes les bases de données", href: "../../"},
  ]}
/>
