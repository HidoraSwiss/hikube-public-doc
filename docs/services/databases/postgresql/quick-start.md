---
sidebar_position: 3
title: "Déployer PostgreSQL en 5 minutes"
sidebar_label: Démarrage rapide
description: "Créez un cluster PostgreSQL depuis la console Hikube avec une base et un utilisateur, récupérez le mot de passe généré et connectez-vous avec psql."
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
| **Preset d'instance** | `s1.small — 1 CPU / 2Gi` | Aucun preset n'est présélectionné ; capacité allouée à chaque nœud |
| **Taille du disque (Go)** | `10` | Capacité de stockage par nœud |
| **Nombre de réplicas** | `1 (Standalone)` | `2` ou `3` pour la haute disponibilité |
| **Accès externe** | Activé | Nécessaire pour vous connecter depuis votre poste |

![Assistant PostgreSQL, étape Configuration](/img/console/postgresql/wizard-configuration.fr.png)


Le bandeau en haut de l'assistant affiche le **Coût estimé** et l'impact sur les quotas du projet.

:::warning
Le **Nombre de réplicas** ne peut plus être modifié après la création. Pour la production, choisissez directement **2 (Haute disponibilité)** ou **3 (Haute disponibilité max)**.
:::

:::note
N'activez l'**Accès externe** que si vous en avez besoin : il expose la base de données sur l'Internet public.
:::

### Bases

Saisissez un **Nom de la base de données**, par exemple `myapp` (1 à 54 caractères : minuscules, chiffres, tirets bas et tirets ; commence par une lettre ou un tiret bas, mais pas par `pg_`), puis cliquez sur **Ajouter**.

Ajoutez au moins une base applicative : la base **`postgres`**, toujours créée, est une base système réservée à la plateforme, et vos utilisateurs ne peuvent pas y recevoir de droit.

### Utilisateurs

Ajoutez au moins un utilisateur :

1. **Nom de l'utilisateur** : par exemple `app_user` (minuscules, chiffres et tirets bas uniquement, pas de tiret).
2. **Nom de la base** : sélectionnez `myapp`. La liste ne propose que les bases ajoutées à l'étape **Bases**. Sans base applicative, elle affiche « Aucune base applicative » et l'utilisateur est créé sans droit.
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
| **Prêt** | Le cluster est opérationnel |
| **Erreur** | La plateforme n'a pas pu appliquer la création ou la dernière modification du cluster |

**Résultat attendu :** après quelques minutes, le statut passe à **Prêt**. La page du cluster affiche la **Version PostgreSQL**, les **Réplicas**, la **Taille allouée** et l'**Accès externe** (**Activé**).

---

## Étape 4 : Récupérer les identifiants

Les mots de passe sont affichés **une seule fois**, à l'étape **Résumé** de l'assistant, dans la section **Identifiants des utilisateurs** :

- **Mot de passe** de chaque utilisateur créé ;
- **Chaîne de connexion interne** : l'adresse du cluster, lorsque l'accès externe est activé.

Si la plateforme refuse un utilisateur, l'étape affiche « Utilisateur non créé » et la raison, à la place de son mot de passe.

![Assistant PostgreSQL, étape Résumé : identifiants des utilisateurs (mot de passe masqué)](/img/console/postgresql/wizard-credentials.fr.png)


:::warning
Copiez ces mots de passe dans un gestionnaire de mots de passe avant de quitter l'écran : ils ne seront plus affichés. En cas de perte, générez-en un nouveau depuis l'onglet **Utilisateurs** (**Actions** → **Changer le mot de passe**).
:::

La carte **Connexion et Bases de données** de la page du cluster affiche ses adresses en deux zones, chacune avec un bouton de copie :

- **Interne**, *Depuis les ressources du projet uniquement* : l'hôte interne, toujours renseigné, et le port (`5432`). Il se joint depuis les VM et les clusters Kubernetes du même projet, sans accès externe ;
- **Externe**, *Depuis Internet* : l'adresse publique, lorsque l'**Accès externe** est activé.

---

## Étape 5 : Connexion et tests

Depuis votre poste, connectez-vous avec `psql` sur l'adresse de la zone **Externe** :

```bash
psql "host=<hôte> port=5432 dbname=myapp user=app_user sslmode=require"
```

Depuis une VM ou un cluster Kubernetes du projet, utilisez l'hôte de la zone **Interne** : `psql "host=<hôte-interne> port=5432 dbname=myapp user=app_user"`.

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

### La zone Externe affiche « Désactivé » ou « En attente d'attribution… »

« Désactivé » : l'**Accès externe** est coupé. Activez-le via **Modifier** si vous devez vous connecter depuis Internet ; depuis le projet, utilisez l'hôte de la zone **Interne**. « En attente d'attribution… » : l'adresse publique n'est pas encore attribuée, patientez quelques instants.

### L'hôte interne ne se résout pas depuis une VM

Copiez le nom complet de la zone **Interne**, sans le raccourcir. Sur Debian 13, le nom ne se résout pas sans configuration : voir [Joindre un service managé du projet](../../compute/how-to/configure-network.md#joindre-un-service-managé-du-projet).

### Le bouton Suivant reste inactif

- À l'étape **Configuration** : le cluster dépasse les quotas du projet. Réduisez le preset, la taille du disque ou le nombre de réplicas.
- À l'étape **Utilisateurs** : ajoutez au moins un utilisateur.

### Authentification refusée

Vérifiez le nom d'utilisateur, la base cible et le mot de passe. Si le mot de passe a été perdu, effectuez une rotation depuis l'onglet **Utilisateurs**. Voir [Gérer les utilisateurs et bases de données](./how-to/manage-users-databases.md).

### Le cluster passe en Erreur

La plateforme n'a pas pu appliquer la création ou la dernière modification du cluster. [Contactez le support](mailto:support@hidora.io) en indiquant le nom du projet et du cluster.

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
