---
sidebar_position: 3
title: Démarrage rapide
---

import NavigationFooter from '@site/src/components/NavigationFooter';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Déployer Redis en 5 minutes

Ce guide vous accompagne dans la création de votre premier cluster **Redis** depuis la [console Hikube](https://console.hikube.cloud), jusqu'aux premiers tests avec `redis-cli`.

---

## Objectifs

À la fin de ce guide, vous aurez :

- Un cluster **Redis** déployé dans votre projet Hikube
- Un mot de passe d'accès généré par la plateforme
- Une connexion fonctionnelle avec `redis-cli`

---

## Prérequis

- Un **compte Hikube** et un **projet** disposant de quotas suffisants (CPU, mémoire, stockage)
- Le client **`redis-cli`** installé sur votre poste, si vous souhaitez tester une connexion depuis Internet
- Pour l'onglet **API** : une clé d'API `admin` du projet et les variables `HIKUBE_API`, `HIKUBE_API_KEY` et `PROJECT_ID` (voir [Préparer l'environnement](../../../api/quick-start.md#environnement)) ; les exemples utilisent `curl` et `jq`

---

## Étape 1 : Créer le cluster

<Tabs groupId="interface">
<TabItem value="console" label="Console" default>

1. Connectez-vous à la [console Hikube](https://console.hikube.cloud) et sélectionnez votre projet.
2. Dans le menu latéral, ouvrez **DB & Messaging** → **Redis**. La page **Clusters Redis** s'affiche.
3. Cliquez sur **Créer un cluster**. L'assistant **Créer un cluster Redis** s'ouvre.

</TabItem>
<TabItem value="api" label="API">

Avec l'API, il n'y a pas d'assistant. Vérifiez que la clé donne accès au projet en listant ses clusters Redis, puis consultez les préconfigurations disponibles :

```bash
curl -sS "$HIKUBE_API/redis/v1alpha1/projects/$PROJECT_ID/clusters" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY"

curl -sS "$HIKUBE_API/redis/v1alpha1/presets" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY" | jq '.presets[] | {name, cpu, memory}'
```

**Résultat attendu :** un objet `{"totalCount": ..., "clusters": [...]}`, puis la liste des préconfigurations (`nano` à `2xlarge`) avec leur CPU et leur mémoire.

</TabItem>
</Tabs>

---

## Étape 2 : Configurer et valider

<Tabs groupId="interface">
<TabItem value="console" label="Console" default>

L'assistant comporte quatre étapes : **Général**, **Configuration**, **Vérification** et **Résumé**.

### Général

Saisissez le **Nom du cluster**, par exemple `demo-cache` (3 à 16 caractères : minuscules, chiffres et tirets ; commence par une lettre, se termine par une lettre ou un chiffre). Cliquez sur **Suivant**.

### Configuration

| Champ | Valeur conseillée pour ce guide | Remarque |
|-------|----------------------------------|----------|
| **Version** | `8 (Latest)` | Versions proposées : 8 et 7 |
| **Préconfiguration** | `Small (1 CPU, 512Mi)` | Capacité allouée à chaque nœud |
| **Taille du volume (Go)** | `10` | Stockage alloué à chaque nœud |
| **Nombre de réplicas** | `3` | 1 à 8 ; 2 minimum pour le failover automatique |
| **Réseau public** | Activé | Nécessaire pour vous connecter depuis votre poste |
| **Activer l'authentification** | Activé | Active par défaut ; à conserver |

Le bandeau en haut de l'assistant affiche le **Coût estimé** et l'impact sur les quotas du projet. Cliquez sur **Suivant**.

:::warning
Le **Nombre de réplicas** ne peut plus être modifié après la création.
:::

### Vérification

Relisez le récapitulatif (**Nom**, **Version**, **Préconfiguration**, **Réplicas**, **Taille de stockage**, **Réseau** : **Public** ou **Privé**), puis cliquez sur **Déployer**.

</TabItem>
<TabItem value="api" label="API">

Créez le cluster avec `POST /redis/v1alpha1/projects/{projectId}/clusters`, avec les mêmes valeurs que dans la console :

```bash
curl -sS -X POST "$HIKUBE_API/redis/v1alpha1/projects/$PROJECT_ID/clusters" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "democache",
    "version": "v8",
    "preset": "small",
    "size": 10,
    "replicas": 3,
    "external": true,
    "authEnabled": true
  }' | jq '{name, status, password}'
```

| Champ | Valeur | Remarque |
|-------|--------|----------|
| `name` | `democache` | 16 caractères maximum, en minuscules ; identifie le cluster dans les chemins de l'API |
| `version` | `v8` | `v7` ou `v8` |
| `preset` | `small` | `nano`, `micro`, `small`, `medium`, `large`, `xlarge` ou `2xlarge` |
| `size` | `10` | Taille du volume de chaque nœud, en Go (1 à 4096) |
| `replicas` | `3` | 1 à 8 ; `1` = nœud unique, 2 et plus = mode cluster. Le mode ne peut plus changer après la création |
| `external` | `true` | Accès depuis Internet (**Réseau public**) |
| `authEnabled` | `true` | Authentification par mot de passe |

:::warning Mot de passe renvoyé une seule fois
Avec `"authEnabled": true`, la réponse de création contient le champ `password`. Il n'est renvoyé qu'ici : enregistrez-le aussitôt dans votre gestionnaire de secrets.
:::

</TabItem>
</Tabs>

---

## Étape 3 : Vérifier l'état

<Tabs groupId="interface">
<TabItem value="console" label="Console" default>

L'étape **Résumé** affiche « Cluster créé avec succès ». Cliquez sur **Terminer** pour revenir à la liste **Clusters Redis**, puis ouvrez le cluster.

| Statut | Signification |
|--------|---------------|
| **En création** | Le cluster est en cours de provisionnement |
| **Prêt** / **Actif** | Le cluster est opérationnel |
| **Erreur** / **Échec** | Le provisionnement a échoué |

**Résultat attendu :** après quelques minutes, la section **Connexion** de la page du cluster affiche le **Statut** **Prêt** et l'**Hôte** du cluster.

</TabItem>
<TabItem value="api" label="API">

```bash
curl -sS "$HIKUBE_API/redis/v1alpha1/projects/$PROJECT_ID/clusters/democache" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY" | jq '{name, status, host, replicas, preset}'
```

| `status` | Signification |
|----------|---------------|
| `provisioning` | Le cluster est en cours de provisionnement |
| `ready` | Le cluster est opérationnel |
| `error` | Le provisionnement a échoué |

**Résultat attendu :** après quelques minutes, `status` vaut `ready` et `host` contient l'adresse du cluster.

</TabItem>
</Tabs>

---

## Étape 4 : Récupérer les identifiants

<Tabs groupId="interface">
<TabItem value="console" label="Console" default>

Lorsque l'authentification est activée, l'étape **Résumé** de l'assistant affiche, dans **Identifiants des utilisateurs** :

- l'utilisateur **`default`** ;
- son **Mot de passe** ;
- la **Chaîne de connexion interne** : l'adresse du cluster, lorsque le réseau public est activé.

:::warning
Copiez le mot de passe immédiatement : il ne sera plus affiché. En cas de perte, générez-en un nouveau depuis la section **Sécurité** de la page du cluster (**Effectuer une rotation**). Voir [Renouveler le mot de passe](./how-to/rotate-password.md).
:::

L'adresse reste consultable dans la page du cluster, section **Connexion**, champ **Hôte** (bouton de copie à droite).

</TabItem>
<TabItem value="api" label="API">

- **Utilisateur** : `default` ;
- **Mot de passe** : le champ `password` de la réponse de création (étape 2). `GET` ne le renvoie jamais ;
- **Hôte** : le champ `host` de `GET .../clusters/democache` (étape 3).

En cas de perte du mot de passe, générez-en un nouveau. La rotation révoque immédiatement l'ancien :

```bash
curl -sS -X POST "$HIKUBE_API/redis/v1alpha1/projects/$PROJECT_ID/clusters/democache/rotate-password" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY" | jq -r '.password'
```

Voir [Renouveler le mot de passe](./how-to/rotate-password.md).

</TabItem>
</Tabs>

---

## Étape 5 : Connexion et tests

```bash
export REDIS_HOST=<hôte>
export REDISCLI_AUTH='<mot de passe>'

# Test PING
redis-cli -h "$REDIS_HOST" -p 6379 ping
# PONG

# Créer une clé
redis-cli -h "$REDIS_HOST" -p 6379 SET hello "hikube"
# OK

# Lire la clé
redis-cli -h "$REDIS_HOST" -p 6379 GET hello
# "hikube"
```

:::tip
La variable `REDISCLI_AUTH` évite de faire apparaître le mot de passe dans l'historique du shell, contrairement à l'option `-a`.
:::

---

## Étape 6 : Dépannage rapide

### L'hôte affiche « En attente d'attribution... »

Le réseau public est désactivé, ou l'adresse IP publique n'est pas encore attribuée. Activez **Accès externe** via **Modifier** si nécessaire, puis patientez quelques instants.

### `NOAUTH Authentication required` ou `WRONGPASS`

Le mot de passe est absent ou erroné. Vérifiez la variable `REDISCLI_AUTH`, ou générez un nouveau mot de passe depuis la section **Sécurité**.

### Le bouton Suivant reste inactif

La configuration dépasse les quotas du projet. Réduisez la préconfiguration, la taille du volume ou le nombre de réplicas.

### Le cluster reste en Erreur

[Contactez le support](mailto:support@hidora.io) en indiquant le nom du projet et du cluster.

---

## Étape 7 : Nettoyage

<Tabs groupId="interface">
<TabItem value="console" label="Console" default>

1. Ouvrez la page du cluster (**DB & Messaging** → **Redis** → nom du cluster).
2. Cliquez sur **Supprimer**.
3. Saisissez le nom exact du cluster dans le champ **Nom de la ressource à confirmer**, puis cliquez sur **Supprimer définitivement**.

</TabItem>
<TabItem value="api" label="API">

```bash
curl -sS -X DELETE "$HIKUBE_API/redis/v1alpha1/projects/$PROJECT_ID/clusters/democache" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY"
```

Une réponse `200` avec un objet vide `{}` confirme la suppression. L'API ne demande pas de confirmation.

</TabItem>
</Tabs>

:::warning
Cette action supprime le cluster Redis et toutes les données associées. Elle est **irréversible**.
:::

---

## Résumé

Vous avez créé depuis la console :

- Un cluster **Redis** répliqué, supervisé par Sentinel
- Un mot de passe d'accès
- Une connexion `redis-cli` via le réseau public

<NavigationFooter
  nextSteps={[
    {label: "Haute disponibilité", href: "../how-to/configure-ha"},
    {label: "FAQ", href: "../faq"},
  ]}
  seeAlso={[
    {label: "Toutes les bases de données", href: "../../"},
  ]}
/>
