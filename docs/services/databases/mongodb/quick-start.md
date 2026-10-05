---
sidebar_position: 3
title: Démarrage rapide
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# Déployer MongoDB en 5 minutes

Ce guide vous accompagne dans la création de votre premier cluster **MongoDB** depuis la [console Hikube](https://console.hikube.cloud), jusqu'à la première connexion avec `mongosh`.

---

## Objectifs

À la fin de ce guide, vous aurez :

- Un cluster **MongoDB** (replica set) déployé dans votre projet Hikube
- Un utilisateur disposant des droits sur une base applicative
- Une connexion fonctionnelle avec `mongosh`

---

## Prérequis

- Un **compte Hikube** et un **projet** disposant de quotas suffisants (CPU, mémoire, stockage)
- Le shell **`mongosh`** installé sur votre poste, si vous souhaitez tester une connexion depuis Internet

---

## Étape 1 : Créer le cluster

1. Connectez-vous à la [console Hikube](https://console.hikube.cloud) et sélectionnez votre projet.
2. Dans le menu latéral, ouvrez **DB & Messaging** → **MongoDB**. La page **Clusters MongoDB** s'affiche.
3. Cliquez sur **Créer un cluster**. L'assistant **Créer un cluster MongoDB** s'ouvre.

---

## Étape 2 : Configurer et valider

L'assistant comporte cinq étapes : **Général**, **Configuration**, **Utilisateurs**, **Vérification** et **Résumé**.

### Général

Saisissez le **Nom du cluster**, par exemple `demo-mongo` (3 à 16 caractères : minuscules, chiffres et tirets ; commence par une lettre, se termine par une lettre ou un chiffre).

### Configuration

| Champ | Valeur conseillée pour ce guide | Remarque |
|-------|----------------------------------|----------|
| **Version MongoDB** | `8.0` | Versions proposées : 6.0, 7.0, 8.0 |
| **Préconfiguration (Preset)** | `Small (1 CPU, 512Mi)` | Non modifiable après création |
| **Taille du disque (Go)** | `10` | Capacité de stockage par nœud |
| **Nombre de réplicas** | `3 (Haute disponibilité max)` | `1` pour un simple test ; non modifiable après création |
| **Accès externe** | Activé | Nécessaire pour vous connecter depuis votre poste |
| **Sharding (Topologie distribuée)** | Désactivé | Voir [Configurer le sharding](./how-to/configure-sharding.md) |

Le bandeau en haut de l'assistant affiche le **Coût estimé** et l'impact sur les quotas du projet.

:::note
N'activez l'**Accès externe** que si vous en avez besoin : il expose la base de données sur l'Internet public.
:::

### Utilisateurs

Ajoutez au moins un utilisateur :

1. **Nom de l'utilisateur** : par exemple `app-user` (minuscules, chiffres et tirets).
2. **Rôle** : **Administrateur** ou **Lecture seule**.
3. Cliquez sur **Ajouter**.

### Vérification

Relisez le récapitulatif (**Version**, **Preset**, **Volume de données**, **Réplicas**, **Exposition externe**, **Sharding**, **Utilisateurs à créer**, **Coût estimé**), puis cliquez sur **Déployer**.

---

## Étape 3 : Vérifier l'état

L'étape **Résumé** confirme la création (« Création terminée ! »). Cliquez sur **Terminer** pour ouvrir la page du cluster.

| Statut | Signification |
|--------|---------------|
| **En création** | Le cluster est en cours de provisionnement |
| **Prêt** / **Actif** | Le cluster est opérationnel |
| **Erreur** / **Échec** | Le provisionnement a échoué |

**Résultat attendu :** après quelques minutes, le statut passe à **Prêt**. La page affiche la **Version MongoDB**, les **Réplicas**, la **Taille allouée** et la **Préconfiguration**, ainsi que la carte **Connexion et réseau** (**Hôte (Host)**, **Accès externe**, **Sharding**).

---

## Étape 4 : Récupérer les identifiants et donner accès à une base

### Identifiants

L'étape **Résumé** de l'assistant affiche, dans **Identifiants des utilisateurs**, le **Mot de passe** de chaque utilisateur et, lorsque l'accès externe est activé, une **Chaîne de connexion interne** de la forme `mongodb://app-user:<password>@<hôte>`.

:::warning
Copiez ces mots de passe immédiatement : ils ne seront plus affichés. En cas de perte, générez-en un nouveau depuis la section **Utilisateurs** (**Actions** → **Changer le mot de passe**).
:::

### Accès à une base applicative

Le rôle choisi dans l'assistant s'applique à la base `admin`. Pour donner accès à une base applicative :

1. Dans la section **Utilisateurs**, ouvrez le menu **Actions** de `app-user` et choisissez **Gérer les accès**.
2. Sous **Accès spécifiques (Bases de données)**, cliquez sur **Ajouter**.
3. Saisissez le **Nom de la base**, par exemple `myapp` (minuscules, chiffres et tirets), et choisissez les **Droits** **Administrateur (Admin)**.
4. Cliquez sur **Enregistrer**.

---

## Étape 5 : Connexion et tests

```bash
mongosh "mongodb://<hôte>:27017/myapp" --username app-user --authenticationDatabase admin
```

La connexion n'est pas chiffrée (pas de TLS) : n'ajoutez pas `--tls`.

Saisissez le mot de passe, puis vérifiez la connexion :

```javascript
db.runCommand({ ping: 1 })
db.test.insertOne({ message: "Bonjour Hikube" })
db.test.find()
```

**Résultat attendu :**

```console
{ ok: 1 }
[ { _id: ObjectId('...'), message: 'Bonjour Hikube' } ]
```

---

## Étape 6 : Dépannage rapide

### Le champ Hôte (Host) affiche « Non défini »

L'**Accès externe** est désactivé, ou l'adresse publique n'est pas encore attribuée. Activez-le via **Modifier** si besoin, puis patientez quelques instants.

Sur un cluster sans sharding, le champ reste aujourd'hui sur **Non défini** même avec l'accès externe activé : chaque membre reçoit sa propre adresse publique, que la console n'affiche pas. [Contactez le support](mailto:support@hidora.io) pour l'obtenir. Connectez-vous alors à cette adresse sans paramètre `replicaSet` : les membres s'annoncent sous des noms internes, qui ne se résolvent pas depuis l'extérieur.

### `Authentication failed`

Vérifiez le nom d'utilisateur, le mot de passe et la base d'authentification (`--authenticationDatabase admin`). Si le mot de passe a été perdu, effectuez une rotation depuis la section **Utilisateurs**.

### `not authorized on myapp`

L'utilisateur n'a pas d'accès sur la base `myapp`. Ajoutez-le via **Gérer les accès**.

### Le cluster reste en Erreur

[Contactez le support](mailto:support@hidora.io) en indiquant le nom du projet et du cluster.

---

## Étape 7 : Nettoyage

1. Ouvrez la page du cluster (**DB & Messaging** → **MongoDB** → nom du cluster).
2. Cliquez sur **Supprimer le cluster**.
3. Saisissez le nom exact du cluster dans le champ **Nom de la ressource à confirmer**, puis cliquez sur **Supprimer définitivement**.

:::warning
Cette action supprime le cluster MongoDB et toutes les données associées. Elle est **irréversible**.
:::

---

## Résumé

Vous avez créé depuis la console :

- Un cluster **MongoDB** répliqué dans votre projet
- Un utilisateur et ses droits sur une base applicative
- Un accès externe et une connexion `mongosh`

<NavigationFooter
  nextSteps={[
    {label: "Gérer les utilisateurs et bases", href: "../how-to/manage-users-databases"},
    {label: "FAQ", href: "../faq"},
  ]}
  seeAlso={[
    {label: "Toutes les bases de données", href: "../../"},
  ]}
/>
