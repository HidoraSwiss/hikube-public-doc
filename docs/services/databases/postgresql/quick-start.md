---
sidebar_position: 3
title: Démarrage rapide
---

import NavigationFooter from '@site/src/components/NavigationFooter';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

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
- Pour l'onglet **API** : une clé d'API `admin` du projet et les variables `HIKUBE_API`, `HIKUBE_API_KEY` et `PROJECT_ID` (voir [Préparer l'environnement](../../../api/quick-start.md#environnement)) ; les exemples utilisent `curl` et `jq`

---

## Étape 1 : Créer le cluster

<Tabs groupId="interface">
<TabItem value="console" label="Console" default>

1. Connectez-vous à la [console Hikube](https://console.hikube.cloud) et sélectionnez votre projet.
2. Dans le menu latéral, ouvrez **DB & Messaging** → **PostgreSQL**. La page **Clusters PostgreSQL** s'affiche.
3. Cliquez sur **Créer un cluster**. L'assistant **Créer un cluster PostgreSQL** s'ouvre.

</TabItem>
<TabItem value="api" label="API">

Avec l'API, il n'y a pas d'assistant. Vérifiez que la clé donne accès au projet en listant ses clusters PostgreSQL, puis consultez les presets disponibles :

```bash
curl -sS "$HIKUBE_API/postgres/v1alpha1/projects/$PROJECT_ID/clusters" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY"

curl -sS "$HIKUBE_API/postgres/v1alpha1/presets" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY" | jq -r '.presets[] | "\(.name)\t\(.cpu)\t\(.memory)"'
```

**Résultat attendu :** un objet `{"totalCount": ..., "clusters": [...]}`, puis la liste des presets (`nano`, `micro`, `small`, `medium`, `large`, `xlarge`, `2xlarge`) avec leur CPU et leur mémoire.

</TabItem>
</Tabs>

---

## Étape 2 : Configurer et valider

<Tabs groupId="interface">
<TabItem value="console" label="Console" default>

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

![Assistant PostgreSQL, étape Configuration](/img/console/postgresql/wizard-configuration.fr.png)


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

</TabItem>
<TabItem value="api" label="API">

Créez le cluster avec `POST /postgres/v1alpha1/projects/{projectId}/clusters` :

```bash
curl -sS -X POST "$HIKUBE_API/postgres/v1alpha1/projects/$PROJECT_ID/clusters" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "demopg",
    "version": "v18",
    "replicas": 1,
    "size": 10,
    "preset": "small",
    "external": true
  }'
```

| Champ | Équivalent console | Contraintes |
|-------|--------------------|-------------|
| `name` | **Nom du cluster** | 3 à 16 caractères, minuscules et chiffres |
| `version` | **Version PostgreSQL** | `v15`, `v16`, `v17` ou `v18` (préfixe `v`) |
| `replicas` | **Nombre de réplicas** | `1` (standalone) ou `2` à `8` (cluster) ; le mode ne change plus après la création |
| `size` | **Taille du disque (Go)** | 1 à 4096 |
| `preset` | **Preset d'instance** | un nom renvoyé par `GET /postgres/v1alpha1/presets` |
| `external` | **Accès externe** | `true` pour exposer le cluster sur Internet |

Les champs facultatifs `config.maxConnections` (1 à 10000) et `quorum` (`minSyncReplicas`, `maxSyncReplicas`, pour un cluster à plusieurs réplicas) règlent le nombre maximal de connexions et la réplication synchrone.

Créez ensuite la base applicative :

```bash
curl -sS -X POST "$HIKUBE_API/postgres/v1alpha1/projects/$PROJECT_ID/clusters/demopg/databases" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"databaseName": "myapp"}'
```

Le nom de base accepte les minuscules, les chiffres et les tirets (63 caractères au maximum). Le champ facultatif `extensions` active des extensions dès la création ; `GET /postgres/v1alpha1/extensions` en donne la liste.

L'utilisateur est créé à l'étape 4, car son mot de passe n'est renvoyé que dans la réponse de création.

</TabItem>
</Tabs>

---

## Étape 3 : Vérifier l'état

<Tabs groupId="interface">
<TabItem value="console" label="Console" default>

L'étape **Résumé** confirme la création (« Création terminée ! »). Cliquez sur **Terminer** pour ouvrir la page du cluster.

Le statut du cluster est affiché à côté de son nom, dans la page du cluster comme dans la liste **Clusters PostgreSQL** :

| Statut | Signification |
|--------|---------------|
| **En création** | Le cluster est en cours de provisionnement |
| **Prêt** / **Actif** | Le cluster est opérationnel |
| **Erreur** / **Échec** | Le provisionnement a échoué |

**Résultat attendu :** après quelques minutes, le statut passe à **Prêt**. La page du cluster affiche la **Version PostgreSQL**, les **Réplicas**, la **Taille allouée** et l'**Accès externe** (**Activé**).

</TabItem>
<TabItem value="api" label="API">

```bash
curl -sS "$HIKUBE_API/postgres/v1alpha1/projects/$PROJECT_ID/clusters/demopg" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY" | jq '{name, status, version, replicas, size, preset, external, host}'
```

**Résultat attendu :** `status` passe de `provisioning` à `ready` après quelques minutes (`error` si le provisionnement échoue, `unknown` si l'état ne peut pas être déterminé). Le champ `host` contient l'adresse publique du cluster lorsque `external` vaut `true` ; il reste vide tant que l'adresse n'est pas attribuée.

</TabItem>
</Tabs>

---

## Étape 4 : Récupérer les identifiants

<Tabs groupId="interface">
<TabItem value="console" label="Console" default>

Les mots de passe sont affichés **une seule fois**, à l'étape **Résumé** de l'assistant, dans la section **Identifiants des utilisateurs** :

- **Mot de passe** de chaque utilisateur créé ;
- **Chaîne de connexion interne** : l'adresse du cluster, lorsque l'accès externe est activé.

![Assistant PostgreSQL, étape Résumé : identifiants des utilisateurs (mot de passe masqué)](/img/console/postgresql/wizard-credentials.fr.png)


:::warning
Copiez ces mots de passe dans un gestionnaire de mots de passe avant de quitter l'écran : ils ne seront plus affichés. En cas de perte, générez-en un nouveau depuis l'onglet **Utilisateurs** (**Actions** → **Changer le mot de passe**).
:::

L'adresse du cluster reste consultable dans la page du cluster, carte **Connexion et Bases de données**, champ **Hôte (Host)**.

</TabItem>
<TabItem value="api" label="API">

Créez l'utilisateur et donnez-lui le rôle `admin` sur la base `myapp` :

```bash
curl -sS -X POST "$HIKUBE_API/postgres/v1alpha1/projects/$PROJECT_ID/clusters/demopg/users" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "app_user",
    "config": {
      "databases": {
        "myapp": {"role": "admin"}
      }
    }
  }' | jq '{username, password}'
```

- `username` : minuscules, chiffres et tirets bas, commençant par une lettre ou un tiret bas ; `postgres` est réservé ;
- `config.databases` : un objet dont chaque clé est un nom de base et chaque valeur un rôle, `admin` (lecture et écriture) ou `readonly` (lecture seule). Une base absente du cluster est créée ;
- `config.privileges.replication` (facultatif) : `true` accorde le droit de réplication.

La réponse contient le champ `password`.

:::warning
Le mot de passe n'est renvoyé qu'une seule fois, dans cette réponse. Enregistrez-le directement dans votre gestionnaire de secrets. En cas de perte, effectuez une rotation : `POST .../users/app_user/rotate-password` renvoie un nouveau mot de passe.
:::

L'adresse du cluster est le champ `host` de `GET $HIKUBE_API/postgres/v1alpha1/projects/$PROJECT_ID/clusters/demopg` (étape 3) ; le port est `5432`.

</TabItem>
</Tabs>

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

<Tabs groupId="interface">
<TabItem value="console" label="Console" default>

1. Ouvrez la page du cluster (**DB & Messaging** → **PostgreSQL** → nom du cluster).
2. Cliquez sur **Supprimer le cluster**.
3. Saisissez le nom exact du cluster dans le champ **Nom de la ressource à confirmer**, puis cliquez sur **Supprimer définitivement**.

</TabItem>
<TabItem value="api" label="API">

```bash
curl -sS -X DELETE "$HIKUBE_API/postgres/v1alpha1/projects/$PROJECT_ID/clusters/demopg" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY"
```

Une réponse `200` avec un objet vide `{}` confirme la demande de suppression ; le cluster disparaît ensuite de `GET $HIKUBE_API/postgres/v1alpha1/projects/$PROJECT_ID/clusters`.

</TabItem>
</Tabs>

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
