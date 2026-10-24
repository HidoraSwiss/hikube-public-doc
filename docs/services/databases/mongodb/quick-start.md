---
sidebar_position: 3
title: "Déployer MongoDB en 5 minutes"
sidebar_label: Démarrage rapide
description: "Créez un replica set MongoDB depuis la console Hikube, donnez à un utilisateur l'accès à une base applicative et connectez-vous avec mongosh."
---

import NavigationFooter from '@site/src/components/NavigationFooter';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

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
- Pour l'onglet **API** : une clé d'API `admin` du projet et les variables `HIKUBE_API`, `HIKUBE_API_KEY` et `PROJECT_ID` (voir [Préparer l'environnement](../../../api/quick-start.md#environnement)) ; les exemples utilisent `curl` et `jq`

---

## Étape 1 : Créer le cluster

<Tabs groupId="interface">
<TabItem value="console" label="Console" default>

1. Connectez-vous à la [console Hikube](https://console.hikube.cloud) et sélectionnez votre projet.
2. Dans le menu latéral, ouvrez **DB & Messaging** → **MongoDB**. La page **Clusters MongoDB** s'affiche.
3. Cliquez sur **Créer un cluster**. L'assistant **Créer un cluster MongoDB** s'ouvre.

</TabItem>
<TabItem value="api" label="API">

Avec l'API, il n'y a pas d'assistant. Vérifiez que la clé donne accès au projet en listant ses clusters MongoDB, puis consultez les presets disponibles :

```bash
curl -sS "$HIKUBE_API/mongodb/v1alpha1/projects/$PROJECT_ID/clusters" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY"

curl -sS "$HIKUBE_API/mongodb/v1alpha1/presets" \
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

Saisissez le **Nom du cluster**, par exemple `demo-mongo` (3 à 16 caractères : minuscules, chiffres et tirets ; commence par une lettre, se termine par une lettre ou un chiffre).

### Configuration

| Champ | Valeur conseillée pour ce guide | Remarque |
|-------|----------------------------------|----------|
| **Version MongoDB** | `8.0` | Versions proposées : 6.0, 7.0, 8.0 |
| **Préconfiguration (Preset)** | `s1.small — 1 CPU / 2Gi` | Aucun preset n'est présélectionné ; non modifiable après création |
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
2. **Base de données** : la base applicative sur laquelle porte le rôle de l'utilisateur, par exemple `myapp` (minuscules, chiffres et tirets). Elle est créée si elle n'existe pas. Les bases système `admin`, `local` et `config` sont refusées.
3. **Rôle** : **Administrateur** pour ce guide, ou **Lecture seule**.
4. Cliquez sur **Ajouter**.

### Vérification

Relisez le récapitulatif (**Version**, **Preset**, **Volume de données**, **Réplicas**, **Exposition externe**, **Sharding**, **Utilisateurs à créer**, **Coût estimé**), puis cliquez sur **Déployer**.

</TabItem>
<TabItem value="api" label="API">

Créez le cluster avec `POST /mongodb/v1alpha1/projects/{projectId}/clusters` :

```bash
curl -sS -X POST "$HIKUBE_API/mongodb/v1alpha1/projects/$PROJECT_ID/clusters" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "demomongo",
    "version": "v8",
    "replicas": 3,
    "size": 10,
    "preset": "s1.small",
    "external": true
  }'
```

| Champ | Équivalent console | Contraintes |
|-------|--------------------|-------------|
| `name` | **Nom du cluster** | 3 à 16 caractères, minuscules et chiffres |
| `version` | **Version MongoDB** | `v6`, `v7` ou `v8` |
| `replicas` | **Nombre de réplicas** | `1` (standalone) ou `2` à `8` (replica set) ; le mode ne change plus après la création |
| `size` | **Taille du disque (Go)** | 1 à 4096 |
| `preset` | **Préconfiguration (Preset)** | Une préconfiguration de `GET /mongodb/v1alpha1/presets` (séries `u1`, `s1` et `m1`) ; non modifiable après la création |
| `external` | **Accès externe** | `true` pour exposer le cluster sur Internet |
| `sharding` | **Sharding (Topologie distribuée)** | facultatif ; absent, le sharding est désactivé. Voir [Configurer le sharding](./how-to/configure-sharding.md) |

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
| **Prêt** | Le cluster est opérationnel |
| **Erreur** | La plateforme n'a pas pu appliquer la création ou la dernière modification du cluster |

**Résultat attendu :** après quelques minutes, le statut passe à **Prêt**. La page affiche la **Version MongoDB**, les **Réplicas**, la **Taille allouée** et la **Préconfiguration**, ainsi que la carte **Connexion et réseau** : les zones d'adresses **Interne** et **Externe**, et le **Sharding**. Pour un replica set avec accès externe, la zone **Externe** liste une adresse par membre (**membre 1**, **membre 2**…), chacune avec un bouton de copie.

</TabItem>
<TabItem value="api" label="API">

```bash
curl -sS "$HIKUBE_API/mongodb/v1alpha1/projects/$PROJECT_ID/clusters/demomongo" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY" | jq '{name, status, version, replicas, size, preset, external, host, internalHost, sharding: .sharding.enabled}'
```

**Résultat attendu :** `status` passe de `provisioning` à `ready` après quelques minutes (`error` si le provisionnement échoue, `unknown` si l'état ne peut pas être déterminé). Le champ `host` contient l'adresse publique du cluster lorsque `external` vaut `true` ; il reste vide tant que l'adresse n'est pas attribuée. Le champ `internalHost`, toujours renseigné, est l'hôte interne (zone **Interne** de la console), joignable depuis les VM et les clusters Kubernetes du projet.

</TabItem>
</Tabs>

---

## Étape 4 : Récupérer les identifiants et donner accès à une base

<Tabs groupId="interface">
<TabItem value="console" label="Console" default>

### Identifiants

L'étape **Résumé** de l'assistant affiche, dans **Identifiants des utilisateurs**, le **Mot de passe** de chaque utilisateur et, lorsque l'accès externe est activé, une **Chaîne de connexion interne** : `mongodb://app-user:<password>@<hôte>` pour un cluster shardé, `mongodb://app-user:<password>@<membre>:27017/?directConnection=true&authSource=admin` pour un replica set.

:::warning
Copiez ces mots de passe immédiatement : ils ne seront plus affichés. En cas de perte, générez-en un nouveau depuis la section **Utilisateurs** (**Actions** → **Changer le mot de passe**).
:::

### Accès à la base applicative

L'utilisateur dispose du rôle choisi sur la base indiquée à l'étape **Utilisateurs** : dans la section **Utilisateurs** de la page du cluster, la colonne **Bases de données** affiche `myapp (Administrateur)`. Pour lui donner accès à d'autres bases, ouvrez le menu **Actions** de l'utilisateur et choisissez **Gérer les accès** (voir [Gérer les utilisateurs et bases de données](./how-to/manage-users-databases.md)).

</TabItem>
<TabItem value="api" label="API">

Créez l'utilisateur avec le rôle `admin` sur la base `myapp` :

```bash
curl -sS -X POST "$HIKUBE_API/mongodb/v1alpha1/projects/$PROJECT_ID/clusters/demomongo/users" \
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
- `config.databases` : obligatoire, au moins une entrée ; chaque clé est un nom de base (minuscules, chiffres et tirets) et chaque valeur `{"role": "admin"}` ou `{"role": "readonly"}`. L'équivalent du **Rôle** de l'assistant est une entrée sur la base `admin`.

La réponse contient le champ `password`.

:::warning
Le mot de passe n'est renvoyé qu'une seule fois, dans cette réponse. Enregistrez-le directement dans votre gestionnaire de secrets. En cas de perte, effectuez une rotation : `POST .../users/appuser/rotate-password` renvoie un nouveau mot de passe.
:::

Les adresses du cluster sont les champs de `GET $HIKUBE_API/mongodb/v1alpha1/projects/$PROJECT_ID/clusters/demomongo` (étape 3) : `host` depuis Internet, `internalHost` depuis les ressources du projet ; le port est `27017`. Les exemples de l'étape 5 utilisent `app-user` : remplacez-le par `appuser`.

</TabItem>
</Tabs>

---

## Étape 5 : Connexion et tests

Depuis votre poste, sur un replica set, connectez-vous directement à un membre : copiez l'une des adresses de la zone **Externe**, ou la **Chaîne de connexion externe** de la carte **Connexion et réseau**.

```bash
mongosh "mongodb://<membre>:27017/myapp?directConnection=true&authSource=admin" --username app-user
```

Sur un cluster shardé, utilisez l'adresse de la zone **Externe** : `mongosh "mongodb://<hôte>:27017/myapp?authSource=admin" --username app-user`.

Depuis une VM ou un cluster Kubernetes du projet, utilisez l'hôte de la zone **Interne**, sans accès externe. Sur un replica set, ajoutez `replicaSet=rs0`, comme le rappelle la console : le pilote trouve alors lui-même le primaire.

```bash
mongosh "mongodb://<hôte-interne>:27017/myapp?replicaSet=rs0&authSource=admin" --username app-user
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

:::note
Le membre joint peut être un secondaire, qui n'accepte pas les écritures : `insertOne` répond alors `not primary`. Vérifiez avec `db.hello().isWritablePrimary`, puis reconnectez-vous à un autre membre de la liste pour écrire. Un secondaire sert les lectures avec `readPreference=secondaryPreferred`.
:::

---

## Étape 6 : Dépannage rapide

### La zone Externe affiche « Désactivé » ou « En attente d'attribution… »

« Désactivé » : l'**Accès externe** est coupé. Activez-le via **Modifier** si vous devez vous connecter depuis Internet ; depuis le projet, utilisez l'hôte de la zone **Interne**. « En attente d'attribution… » : l'adresse publique n'est pas encore attribuée, patientez quelques instants.

Sur un replica set avec accès externe, chaque membre reçoit sa propre adresse publique : la zone **Externe** les liste dès qu'elles sont attribuées. Connectez-vous à l'une d'elles avec `directConnection=true`, sans paramètre `replicaSet` : les membres s'annoncent sous des noms internes au cluster, qui ne se résolvent pas depuis l'extérieur.

### L'hôte interne ne se résout pas depuis une VM

Copiez le nom complet de la zone **Interne**, sans le raccourcir. Sur Debian 13, le nom ne se résout pas sans configuration : voir [Joindre un service managé du projet](../../compute/how-to/configure-network.md#joindre-un-service-managé-du-projet).

### `Authentication failed`

Vérifiez le nom d'utilisateur, le mot de passe et la base d'authentification (`authSource=admin` ou `--authenticationDatabase admin`). Si le mot de passe a été perdu, effectuez une rotation depuis la section **Utilisateurs**.

### `not authorized on myapp`

L'utilisateur n'a pas d'accès sur la base `myapp`. Ajoutez-le via **Gérer les accès**.

### Le cluster passe en Erreur

La plateforme n'a pas pu appliquer la création ou la dernière modification du cluster. [Contactez le support](mailto:support@hidora.io) en indiquant le nom du projet et du cluster.

---

## Étape 7 : Nettoyage

<Tabs groupId="interface">
<TabItem value="console" label="Console" default>

1. Ouvrez la page du cluster (**DB & Messaging** → **MongoDB** → nom du cluster).
2. Cliquez sur **Supprimer le cluster**.
3. Saisissez le nom exact du cluster dans le champ **Nom de la ressource à confirmer**, puis cliquez sur **Supprimer définitivement**.

</TabItem>
<TabItem value="api" label="API">

```bash
curl -sS -X DELETE "$HIKUBE_API/mongodb/v1alpha1/projects/$PROJECT_ID/clusters/demomongo" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY"
```

Une réponse `200` avec un objet vide `{}` confirme la demande de suppression ; le cluster disparaît ensuite de `GET $HIKUBE_API/mongodb/v1alpha1/projects/$PROJECT_ID/clusters`.

</TabItem>
</Tabs>

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
