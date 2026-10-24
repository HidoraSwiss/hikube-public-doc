---
title: "Comment modifier les ressources d'un cluster — PostgreSQL"
sidebar_label: "Comment modifier les ressources d'un cluster"
sidebar_position: 2
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Comment modifier les ressources d'un cluster

Ce guide explique comment ajuster un cluster PostgreSQL existant depuis la [console Hikube](https://console.hikube.cloud) : preset d'instance (CPU et mémoire), taille du disque, version et accès externe.

## Prérequis

- Un cluster **PostgreSQL** existant dans votre projet
- Des quotas de projet suffisants pour la nouvelle configuration
- Pour l'onglet **API** : une clé d'API `admin` du projet et les variables `HIKUBE_API`, `HIKUBE_API_KEY` et `PROJECT_ID` (voir [Préparer l'environnement](../../../../api/quick-start.md#environnement)) ; les exemples utilisent `curl` et `jq`

## Ce qui est modifiable

| Paramètre | Modifiable après création |
|-----------|---------------------------|
| **Version PostgreSQL** | Oui, vers une version supérieure uniquement |
| **Préconfiguration (Preset)** | Oui |
| **Taille du disque (Go)** | Oui, à la hausse uniquement |
| **Accès externe** | Oui |
| **Nombre de réplicas** | Non, « Le mode ne peut pas être modifié après création ». Le formulaire affiche la valeur actuelle (1, 2 ou 3) |

Pour changer le nombre de réplicas d'un cluster existant, [contactez le support](mailto:support@hidora.io).

## Presets disponibles

| Preset | CPU | Mémoire |
|--------|-----|---------|
| `u1.medium` | 1 | 4Gi |
| `u1.large` | 2 | 8Gi |
| `u1.xlarge` | 4 | 16Gi |
| `u1.2xlarge` | 8 | 32Gi |
| `u1.4xlarge` | 16 | 64Gi |
| `u1.8xlarge` | 32 | 128Gi |
| `s1.small` | 1 | 2Gi |
| `s1.medium` | 2 | 4Gi |
| `s1.large` | 4 | 8Gi |
| `s1.xlarge` | 8 | 16Gi |
| `s1.2xlarge` | 16 | 32Gi |
| `s1.4xlarge` | 32 | 64Gi |
| `m1.large` | 2 | 16Gi |
| `m1.xlarge` | 4 | 32Gi |
| `m1.2xlarge` | 8 | 64Gi |
| `m1.4xlarge` | 16 | 128Gi |
| `m1.8xlarge` | 32 | 256Gi |

Les presets reprennent les tailles des [machines virtuelles](../../../compute/overview.md), séries `u1`, `s1` et `m1`. La liste affichée dans le formulaire fait foi. Les ressources s'appliquent à chaque nœud du cluster.

Un cluster créé avec un ancien preset (`small`, `medium`…) le conserve : le formulaire l'affiche tel quel et l'enregistre sans changement tant que vous n'en choisissez pas un autre. Si les ressources du cluster ont été fixées hors de son preset, le formulaire l'indique par la mention « (forcé) ».

## Étapes

### 1. Ouvrir le formulaire de modification

<Tabs groupId="interface">
<TabItem value="console" label="Console" default>

1. Ouvrez **DB & Messaging** → **PostgreSQL**.
2. Dans la liste **Clusters PostgreSQL**, ouvrez le menu **Actions** du cluster et choisissez **Modifier**, ou ouvrez la page du cluster et cliquez sur **Modifier**.

La page **Modifier PostgreSQL** affiche la carte **Paramètres du cluster** et l'impact de la configuration sur les quotas du projet.

</TabItem>
<TabItem value="api" label="API">

Récupérez la configuration actuelle du cluster :

```bash
curl -sS "$HIKUBE_API/postgres/v1alpha1/projects/$PROJECT_ID/clusters/demopg" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY" | jq '{version, replicas, size, preset, external, config, quorum}'
```

</TabItem>
</Tabs>

### 2. Ajuster les paramètres

<Tabs groupId="interface">
<TabItem value="console" label="Console" default>

- **Préconfiguration (Preset)** : sélectionnez un preset supérieur pour augmenter le CPU et la mémoire de chaque nœud.
- **Taille du disque (Go)** : saisissez la nouvelle capacité, au moins égale à la taille actuelle. Une valeur inférieure affiche « La taille du disque ne peut pas être réduite : N Go minimum. » et n'est pas enregistrée.
- **Version PostgreSQL** : sélectionnez la version cible. Le formulaire ne propose que la version actuelle et les versions supérieures. Une montée de version majeure (par exemple 17 → 18) se fait en place : l'instance est arrêtée pendant la migration des données.
- **Accès externe** : activez ou désactivez l'exposition sur l'Internet public.

Quand vous changez le preset ou la version, l'avertissement « Les instances du cluster vont redémarrer » s'affiche ; pour un changement de version, il rappelle qu'une version mise à niveau ne peut plus être abaissée.

</TabItem>
<TabItem value="api" label="API">

La modification passe par `PATCH /postgres/v1alpha1/projects/{projectId}/clusters/{name}`, une [mise à jour partielle](../../../../api/overview.md#mises-a-jour-partielles) : seuls les champs envoyés changent.

| Champ | Règle |
|-------|-------|
| `version` | `v15` à `v18` ; seule une montée de version est possible, comme dans la console : une version inférieure à la version actuelle est refusée (code `80203`) |
| `size` | 1 à 4096 Go, au moins la taille actuelle : une taille inférieure est refusée (code `80204`) |
| `preset` | Un preset de la liste ci-dessus |
| `replicas` | Un passage entre standalone (`1`) et cluster (`2` à `8`) est refusé (`400`, code `80201`) |
| `external` | `true` ou `false` |
| `quorum.minSyncReplicas`, `quorum.maxSyncReplicas` | Une borne peut être envoyée seule ; une fois appliquées, la borne basse ne doit pas dépasser la haute |
| `config.maxConnections` | `0` revient à la valeur par défaut de PostgreSQL |

Par exemple, pour changer le preset et la taille du disque :

```bash
curl -sS -X PATCH "$HIKUBE_API/postgres/v1alpha1/projects/$PROJECT_ID/clusters/demopg" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"preset": "u1.large", "size": 20}'
```

</TabItem>
</Tabs>

### 3. Enregistrer

<Tabs groupId="interface">
<TabItem value="console" label="Console" default>

Cliquez sur **Sauvegarder**. Le message « Cluster mis à jour » confirme la prise en compte. Si la nouvelle configuration dépasse les quotas du projet, le bouton reste inactif.

</TabItem>
<TabItem value="api" label="API">

La réponse `200` décrit le cluster avec ses nouvelles valeurs. Si `external` passe à `true` alors qu'aucune adresse IP publique n'est disponible, la requête est refusée (`400`). Vérifiez au préalable que la nouvelle configuration tient dans les quotas du projet.

</TabItem>
</Tabs>

:::warning
Un changement de preset ou de version entraîne le redémarrage des instances dès l'enregistrement. Sur un cluster à 1 réplica, la base est indisponible pendant le redémarrage, et pendant toute la migration lors d'une montée de version majeure ; planifiez l'opération en dehors des heures de forte charge.
:::

:::tip
Augmentez la taille du disque avant qu'il ne soit plein. Surveillez l'espace utilisé avec `SELECT pg_size_pretty(pg_database_size(current_database()));`.
:::

## Vérification

<Tabs groupId="interface">
<TabItem value="console" label="Console" default>

La page du cluster affiche les nouvelles valeurs dans les cartes **Version PostgreSQL**, **Taille allouée** et **Accès externe**, et le statut revient à **Prêt** une fois la mise à jour appliquée.

</TabItem>
<TabItem value="api" label="API">

```bash
curl -sS "$HIKUBE_API/postgres/v1alpha1/projects/$PROJECT_ID/clusters/demopg" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY" | jq '{status, version, preset, size, external}'
```

Les valeurs reflètent la nouvelle configuration, et `status` revient à `ready` une fois la mise à jour appliquée.

</TabItem>
</Tabs>

## Pour aller plus loin

- [Concepts PostgreSQL](../concepts.md) : réplication, presets, accès réseau
- [Gérer les utilisateurs et bases de données](./manage-users-databases.md)
