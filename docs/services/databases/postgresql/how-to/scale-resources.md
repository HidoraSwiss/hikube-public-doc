---
title: "Comment modifier les ressources d'un cluster"
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
| **Version PostgreSQL** | Oui |
| **Préconfiguration (Preset)** | Oui |
| **Taille du disque (Go)** | Oui |
| **Accès externe** | Oui |
| **Nombre de réplicas** | Non, « Le mode ne peut pas être modifié après création » |

Pour changer le nombre de réplicas d'un cluster existant, [contactez le support](mailto:support@hidora.io).

## Presets disponibles

| Preset | CPU | Mémoire |
|--------|-----|---------|
| `nano` | 250m | 128Mi |
| `micro` | 500m | 256Mi |
| `small` | 1 | 512Mi |
| `medium` | 1 | 1Gi |
| `large` | 2 | 2Gi |
| `xlarge` | 4 | 4Gi |
| `2xlarge` | 8 | 8Gi |

La liste affichée dans le formulaire fait foi. Les ressources s'appliquent à chaque nœud du cluster.

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
- **Taille du disque (Go)** : saisissez la nouvelle capacité.
- **Version PostgreSQL** : sélectionnez la version cible. Le formulaire propose toutes les versions, mais seule une montée de version est possible : une version inférieure est refusée par la plateforme, le cluster reste sur sa version actuelle et la configuration demeure en échec jusqu'à ce que vous sélectionniez de nouveau une version supérieure ou égale. Une montée de version majeure (par exemple 17 → 18) se fait en place : l'instance est arrêtée pendant la migration des données.
- **Accès externe** : activez ou désactivez l'exposition sur l'Internet public.

</TabItem>
<TabItem value="api" label="API">

La modification passe par `PATCH /postgres/v1alpha1/projects/{projectId}/clusters/{name}`. Le corps reprend les champs de la configuration :

| Champ | Comportement s'il est omis |
|-------|----------------------------|
| `version` | Obligatoire (`v15` à `v18`) ; seule une montée de version est possible, comme dans la console |
| `size` | Obligatoire (1 à 4096 Go) |
| `preset` | Conservé |
| `replicas` | Conservé ; un passage entre standalone (`1`) et cluster (`2` à `8`) est refusé (`400`) |
| `external` | **Désactivé** : un champ absent vaut `false` |
| `quorum` | Remis à zéro (`minSyncReplicas` et `maxSyncReplicas` à `0`) |
| `config.maxConnections` | Conservé |

Partez donc de la configuration actuelle et ne changez que les valeurs voulues, par exemple le preset et la taille du disque :

```bash
curl -sS "$HIKUBE_API/postgres/v1alpha1/projects/$PROJECT_ID/clusters/demopg" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY" \
| jq '{version, replicas, size, preset, external, config, quorum}
      | .preset = "medium" | .size = 20' > pg-update.json

curl -sS -X PATCH "$HIKUBE_API/postgres/v1alpha1/projects/$PROJECT_ID/clusters/demopg" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY" \
  -H "Content-Type: application/json" \
  -d @pg-update.json
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
Un changement de preset ou de version entraîne le redémarrage des instances. Sur un cluster à 1 réplica, la base est indisponible pendant le redémarrage, et pendant toute la migration lors d'une montée de version majeure ; planifiez l'opération en dehors des heures de forte charge.
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
