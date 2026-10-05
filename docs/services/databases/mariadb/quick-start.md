---
sidebar_position: 3
title: Démarrage rapide
---

import NavigationFooter from '@site/src/components/NavigationFooter';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Déployer MariaDB en 5 minutes

Ce guide vous accompagne dans la création de votre premier cluster **MariaDB** depuis la [console Hikube](https://console.hikube.cloud), jusqu'à la première connexion avec le client `mysql` (ou `mariadb`).

---

## Objectifs

À la fin de ce guide, vous aurez :

- Un cluster **MariaDB** déployé dans votre projet Hikube
- Un utilisateur disposant des droits sur une base applicative
- Une connexion fonctionnelle avec un client MySQL

---

## Prérequis

- Un **compte Hikube** et un **projet** disposant de quotas suffisants (CPU, mémoire, stockage)
- Le client **`mysql`** ou **`mariadb`** installé sur votre poste, si vous souhaitez tester une connexion depuis Internet
- Pour l'onglet **API** : une clé d'API `admin` du projet et les variables `HIKUBE_API`, `HIKUBE_API_KEY` et `PROJECT_ID` (voir [Préparer l'environnement](../../../api/quick-start.md#environnement)) ; les exemples utilisent `curl` et `jq`

---

## Étape 1 : Créer le cluster

<Tabs groupId="interface">
<TabItem value="console" label="Console" default>

1. Connectez-vous à la [console Hikube](https://console.hikube.cloud) et sélectionnez votre projet.
2. Dans le menu latéral, ouvrez **DB & Messaging** → **MariaDB**. La page **Clusters MariaDB** s'affiche.
3. Cliquez sur **Créer un cluster**. L'assistant **Créer un cluster MariaDB** s'ouvre.

</TabItem>
<TabItem value="api" label="API">

Avec l'API, il n'y a pas d'assistant. Vérifiez que la clé donne accès au projet en listant ses clusters MariaDB, puis consultez les presets disponibles :

```bash
curl -sS "$HIKUBE_API/mariadb/v1alpha1/projects/$PROJECT_ID/clusters" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY"

curl -sS "$HIKUBE_API/mariadb/v1alpha1/presets" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY" | jq -r '.presets[] | "\(.name)\t\(.cpu)\t\(.memory)"'
```

**Résultat attendu :** un objet `{"totalCount": ..., "clusters": [...]}`, puis la liste des presets avec leur CPU et leur mémoire.

</TabItem>
</Tabs>

---

## Étape 2 : Configurer et valider

<Tabs groupId="interface">
<TabItem value="console" label="Console" default>

L'assistant comporte cinq étapes : **Général**, **Configuration**, **Utilisateurs**, **Vérification** et **Résumé**.

### Général

Saisissez le **Nom du cluster**, par exemple `demo-mariadb` (3 à 16 caractères : minuscules, chiffres et tirets ; commence par une lettre, se termine par une lettre ou un chiffre).

### Configuration

| Champ | Valeur conseillée pour ce guide | Remarque |
|-------|----------------------------------|----------|
| **Version MariaDB** | `11.8` | Versions proposées : 10.6, 10.11, 11.4, 11.8 |
| **Préconfiguration (Preset)** | `Small (1 CPU, 512Mi)` | Non modifiable après création |
| **Taille du disque (Go)** | `10` | Capacité de stockage par nœud |
| **Nombre de réplicas** | `1 (Standalone)` | `3` ou `5` pour la haute disponibilité ; non modifiable après création |
| **Accès externe** | Activé | Nécessaire pour vous connecter depuis votre poste |

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

Relisez le récapitulatif (**Version**, **Preset**, **Volume de données**, **Réplicas**, **Exposition externe**, **Coût estimé**, **Utilisateurs à créer**), puis cliquez sur **Déployer**.

</TabItem>
<TabItem value="api" label="API">

Créez le cluster avec `POST /mariadb/v1alpha1/projects/{projectId}/clusters` :

```bash
curl -sS -X POST "$HIKUBE_API/mariadb/v1alpha1/projects/$PROJECT_ID/clusters" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "demomariadb",
    "version": "v11.8",
    "replicas": 1,
    "size": 10,
    "preset": "small",
    "external": true
  }'
```

| Champ | Équivalent console | Contraintes |
|-------|--------------------|-------------|
| `name` | **Nom du cluster** | 3 à 16 caractères, minuscules et chiffres |
| `version` | **Version MariaDB** | `v10.6`, `v10.11`, `v11.4` ou `v11.8` (préfixe `v`) |
| `replicas` | **Nombre de réplicas** | `1` (standalone) ou `2` à `8` (cluster) ; le mode ne change plus après la création |
| `size` | **Taille du disque (Go)** | 1 à 4096 |
| `preset` | **Préconfiguration (Preset)** | `nano`, `micro`, `small`, `medium`, `large`, `xlarge` ou `2xlarge` ; non modifiable après la création |
| `external` | **Accès externe** | `true` pour exposer le cluster sur Internet |

L'utilisateur est créé à l'étape 4, car son mot de passe n'est renvoyé que dans la réponse de création.

</TabItem>
</Tabs>

---

## Étape 3 : Vérifier l'état

<Tabs groupId="interface">
<TabItem value="console" label="Console" default>

L'étape **Résumé** confirme la création (« Création terminée ! »). Cliquez sur **Terminer** pour ouvrir la page du cluster.

| Statut | Signification |
|--------|---------------|
| **En création** | Le cluster est en cours de provisionnement |
| **Prêt** / **Actif** | Le cluster est opérationnel |
| **Erreur** / **Échec** | Le provisionnement a échoué |

**Résultat attendu :** après quelques minutes, le statut passe à **Prêt**. La page affiche la **Version MariaDB**, les **Réplicas**, la **Taille allouée** et la **Préconfiguration**.

</TabItem>
<TabItem value="api" label="API">

```bash
curl -sS "$HIKUBE_API/mariadb/v1alpha1/projects/$PROJECT_ID/clusters/demomariadb" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY" | jq '{name, status, version, replicas, size, preset, external, host}'
```

**Résultat attendu :** `status` passe de `provisioning` à `ready` après quelques minutes (`error` si le provisionnement échoue, `unknown` si l'état ne peut pas être déterminé). Le champ `host` contient l'adresse publique du cluster lorsque `external` vaut `true` ; il reste vide tant que l'adresse n'est pas attribuée.

</TabItem>
</Tabs>

---

## Étape 4 : Récupérer les identifiants et donner accès à une base

<Tabs groupId="interface">
<TabItem value="console" label="Console" default>

### Identifiants

L'étape **Résumé** de l'assistant affiche, dans **Identifiants des utilisateurs**, le **Mot de passe** de chaque utilisateur et la **Chaîne de connexion interne** (`<hôte>:3306`) lorsque l'accès externe est activé.

:::warning
Copiez ces mots de passe immédiatement : ils ne seront plus affichés. En cas de perte, générez-en un nouveau depuis la section **Utilisateurs** (**Actions** → **Changer le mot de passe**).
:::

L'adresse reste consultable dans la carte **Connexion et réseau** de la page du cluster, champ **Hôte (Host)**.

### Accès à une base applicative

Le rôle choisi dans l'assistant s'applique à la base système `mysql`. Pour créer une base applicative et y donner accès :

1. Dans la section **Utilisateurs**, ouvrez le menu **Actions** de `app-user` et choisissez **Gérer les accès**.
2. Sous **Accès spécifiques (Bases de données)**, cliquez sur **Ajouter**.
3. Saisissez le **Nom de la base**, par exemple `myapp` (minuscules, chiffres et tirets), et choisissez les **Droits** **Administrateur (Admin)**.
4. Cliquez sur **Enregistrer**. La base `myapp` est créée si elle n'existe pas.

</TabItem>
<TabItem value="api" label="API">

Créez l'utilisateur et donnez-lui le rôle `admin` sur la base `myapp` ; la base est créée si elle n'existe pas :

```bash
curl -sS -X POST "$HIKUBE_API/mariadb/v1alpha1/projects/$PROJECT_ID/clusters/demomariadb/users" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "appuser",
    "config": {
      "databases": {
        "myapp": {"role": "admin"}
      }
    }
  }' | jq '{username, password}'
```

- `username` : 1 à 63 caractères, minuscules, chiffres et tirets, commençant par une lettre ;
- `config.databases` : un objet dont chaque clé est un nom de base (minuscules, chiffres et tirets) et chaque valeur `{"role": "admin"}` ou `{"role": "readonly"}` ;
- `config.maxUserConnections` (facultatif) : nombre maximal de connexions simultanées de l'utilisateur, `0` pour illimité.

La réponse contient le champ `password`.

:::warning
Le mot de passe n'est renvoyé qu'une seule fois, dans cette réponse. Enregistrez-le directement dans votre gestionnaire de secrets. En cas de perte, effectuez une rotation : `POST .../users/appuser/rotate-password` renvoie un nouveau mot de passe.
:::

L'adresse du cluster est le champ `host` de `GET $HIKUBE_API/mariadb/v1alpha1/projects/$PROJECT_ID/clusters/demomariadb` (étape 3) ; le port est `3306`. Les exemples de l'étape 5 utilisent `app-user` : remplacez-le par `appuser`.

</TabItem>
</Tabs>

---

## Étape 5 : Connexion et tests

```bash
mysql -h <hôte> -P 3306 -u app-user -p myapp
```

Saisissez le mot de passe, puis vérifiez la connexion :

```sql
SELECT VERSION();
CREATE TABLE test (id INT AUTO_INCREMENT PRIMARY KEY, message VARCHAR(100));
INSERT INTO test (message) VALUES ('Bonjour Hikube');
SELECT * FROM test;
```

**Résultat attendu :**

```console
+----+----------------+
| id | message        |
+----+----------------+
|  1 | Bonjour Hikube |
+----+----------------+
```

:::tip
Le client `mariadb` accepte les mêmes options : `mariadb -h <hôte> -P 3306 -u app-user -p myapp`.
:::

---

## Étape 6 : Dépannage rapide

### Le champ Hôte (Host) affiche « Non défini »

L'**Accès externe** est désactivé, ou l'adresse IP publique n'est pas encore attribuée. Activez-le via **Modifier** si besoin, puis patientez quelques instants.

### `Access denied for user`

Mot de passe erroné, ou utilisateur sans accès sur la base indiquée. Vérifiez la colonne **Bases de données** de la liste des utilisateurs et ajoutez l'accès via **Gérer les accès**.

### Le bouton Suivant reste inactif

- À l'étape **Configuration** : le cluster dépasse les quotas du projet.
- À l'étape **Utilisateurs** : ajoutez au moins un utilisateur.

### Le cluster reste en Erreur

[Contactez le support](mailto:support@hidora.io) en indiquant le nom du projet et du cluster.

---

## Étape 7 : Nettoyage

<Tabs groupId="interface">
<TabItem value="console" label="Console" default>

1. Ouvrez la page du cluster (**DB & Messaging** → **MariaDB** → nom du cluster).
2. Cliquez sur **Supprimer le cluster**.
3. Saisissez le nom exact du cluster dans le champ **Nom de la ressource à confirmer**, puis cliquez sur **Supprimer définitivement**.

</TabItem>
<TabItem value="api" label="API">

```bash
curl -sS -X DELETE "$HIKUBE_API/mariadb/v1alpha1/projects/$PROJECT_ID/clusters/demomariadb" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY"
```

Une réponse `200` avec un objet vide `{}` confirme la demande de suppression ; le cluster disparaît ensuite de `GET $HIKUBE_API/mariadb/v1alpha1/projects/$PROJECT_ID/clusters`.

</TabItem>
</Tabs>

:::warning
Cette action supprime le cluster MariaDB et toutes les données associées. Elle est **irréversible**.
:::

---

## Résumé

Vous avez créé depuis la console :

- Un cluster **MariaDB** dans votre projet
- Un utilisateur et une base applicative
- Un accès externe et une connexion avec le client `mysql`

<NavigationFooter
  nextSteps={[
    {label: "Gérer les utilisateurs et bases", href: "../how-to/manage-users-databases"},
    {label: "FAQ", href: "../faq"},
  ]}
  seeAlso={[
    {label: "Toutes les bases de données", href: "../../"},
  ]}
/>
