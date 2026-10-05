---
title: "Comment modifier les ressources d'un cluster"
sidebar_position: 2
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Comment modifier les ressources d'un cluster

Ce guide explique comment ajuster un cluster MongoDB existant depuis la [console Hikube](https://console.hikube.cloud) : taille du disque, version et accès externe.

## Prérequis

- Un cluster **MongoDB** existant dans votre projet
- Des quotas de projet suffisants pour la nouvelle configuration
- Pour l'onglet **API** : une clé d'API `admin` du projet et les variables `HIKUBE_API`, `HIKUBE_API_KEY` et `PROJECT_ID` (voir [Préparer l'environnement](../../../../api/quick-start.md#environnement)) ; les exemples utilisent `curl` et `jq`

## Ce qui est modifiable

| Paramètre | Modifiable après création |
|-----------|---------------------------|
| **Version MongoDB** | Oui |
| **Taille du disque (Go)** | Oui |
| **Accès externe** | Oui |
| **Préconfiguration (Preset)** | Non, « La préconfiguration ne peut pas être modifiée après création » |
| **Nombre de réplicas** | Non, « Le mode ne peut pas être modifié après création » |
| **Sharding** | Non, l'option ne figure pas dans le formulaire de modification |

Pour changer la préconfiguration, le nombre de réplicas ou la topologie d'un cluster existant, [contactez le support](mailto:support@hidora.io).

## Étapes

### 1. Ouvrir le formulaire de modification

<Tabs groupId="interface">
<TabItem value="console" label="Console" default>

1. Ouvrez **DB & Messaging** → **MongoDB**.
2. Ouvrez le cluster, puis cliquez sur **Modifier** (ou utilisez **Actions** → **Modifier** dans la liste).

La page **Modifier MongoDB** affiche la carte **Paramètres du cluster** et l'impact sur les quotas du projet.

</TabItem>
<TabItem value="api" label="API">

Récupérez la configuration actuelle du cluster :

```bash
curl -sS "$HIKUBE_API/mongodb/v1alpha1/projects/$PROJECT_ID/clusters/demomongo" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY" | jq '{version, replicas, size, external, preset, sharding}'
```

</TabItem>
</Tabs>

### 2. Ajuster les paramètres

<Tabs groupId="interface">
<TabItem value="console" label="Console" default>

- **Taille du disque (Go)** : saisissez la nouvelle capacité.
- **Version MongoDB** : sélectionnez la version cible (6.0, 7.0 ou 8.0).
- **Accès externe** : activez ou désactivez l'exposition sur l'Internet public.

:::tip
MongoDB ne prend en charge les montées de version majeure que d'une version à la suivante (6.0 → 7.0 → 8.0). Le formulaire propose toutes les versions, y compris un saut de version ou une version inférieure : ne sautez pas de version et ne revenez pas en arrière.
:::

</TabItem>
<TabItem value="api" label="API">

La modification passe par `PATCH /mongodb/v1alpha1/projects/{projectId}/clusters/{name}`, dont le corps accepte cinq champs :

| Champ | Comportement s'il est omis |
|-------|----------------------------|
| `version` | Obligatoire (`v6`, `v7` ou `v8`) ; montez d'une version majeure à la fois |
| `size` | Obligatoire (1 à 4096 Go) |
| `replicas` | Conservé ; un passage entre standalone (`1`) et replica set (`2` à `8`) est refusé (`400`) |
| `external` | **Désactivé** : un champ absent vaut `false` |
| `sharding` | **Désactivé** : renvoyez toujours l'objet `sharding` tel que le renvoie `GET` |

La préconfiguration (`preset`) n'est pas modifiable par l'API non plus. Partez de la configuration actuelle et ne changez que les valeurs voulues, par exemple la taille du disque :

```bash
curl -sS "$HIKUBE_API/mongodb/v1alpha1/projects/$PROJECT_ID/clusters/demomongo" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY" \
| jq '{version, replicas, size, external, sharding} | .size = 20' > mongo-update.json

curl -sS -X PATCH "$HIKUBE_API/mongodb/v1alpha1/projects/$PROJECT_ID/clusters/demomongo" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY" \
  -H "Content-Type: application/json" \
  -d @mongo-update.json
```

:::warning
Ne modifiez pas l'objet `sharding` : la topologie d'un cluster existant ne se change pas, comme dans la console. Pour la modifier, [contactez le support](mailto:support@hidora.io).
:::

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

## Vérification

<Tabs groupId="interface">
<TabItem value="console" label="Console" default>

La page du cluster affiche les nouvelles valeurs dans les cartes **Version MongoDB** et **Taille allouée**. Depuis `mongosh`, contrôlez l'espace utilisé :

```javascript
db.stats({ scale: 1024 * 1024 })
```

</TabItem>
<TabItem value="api" label="API">

```bash
curl -sS "$HIKUBE_API/mongodb/v1alpha1/projects/$PROJECT_ID/clusters/demomongo" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY" | jq '{status, version, size, external, sharding: .sharding.enabled}'
```

Les valeurs reflètent la nouvelle configuration, et `status` revient à `ready` une fois la mise à jour appliquée. Contrôlez l'espace utilisé depuis `mongosh`, comme dans l'onglet **Console**.

</TabItem>
</Tabs>

## Pour aller plus loin

- [Concepts MongoDB](../concepts.md) : réplication, préconfigurations, accès réseau
- [Configurer le sharding](./configure-sharding.md)
