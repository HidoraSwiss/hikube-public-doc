---
title: "Comment modifier les ressources d'un cluster — MongoDB"
sidebar_label: "Comment modifier les ressources d'un cluster"
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
| **Version MongoDB** | Oui, vers une version supérieure uniquement |
| **Taille du disque (Go)** | Oui, à la hausse uniquement |
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

- **Taille du disque (Go)** : saisissez la nouvelle capacité, au moins égale à la taille actuelle. Une valeur inférieure affiche « La taille du disque ne peut pas être réduite : N Go minimum. » et n'est pas enregistrée.
- **Version MongoDB** : sélectionnez la version cible. Le formulaire ne propose que la version actuelle et les versions supérieures.
- **Accès externe** : activez ou désactivez l'exposition sur l'Internet public.

:::tip
MongoDB ne prend en charge les montées de version majeure que d'une version à la suivante (6.0 → 7.0 → 8.0). Le formulaire propose toutes les versions supérieures, y compris un saut de version : ne sautez pas de version.
:::

Quand vous changez la version, l'avertissement « Les instances du cluster vont redémarrer » s'affiche : le changement redémarre les instances du cluster dès l'enregistrement, et une version mise à niveau ne peut plus être abaissée. Planifiez-le en dehors des périodes de forte activité.

</TabItem>
<TabItem value="api" label="API">

La modification passe par `PATCH /mongodb/v1alpha1/projects/{projectId}/clusters/{name}`, une [mise à jour partielle](../../../../api/overview.md#mises-a-jour-partielles) : seuls les champs envoyés changent. Le corps accepte cinq champs :

| Champ | Règle |
|-------|-------|
| `version` | `v6`, `v7` ou `v8` ; montez d'une version majeure à la fois. Une version inférieure à la version actuelle est refusée (code `150203`) |
| `size` | 1 à 4096 Go, au moins la taille actuelle : une taille inférieure est refusée (code `150204`) |
| `replicas` | Un passage entre standalone (`1`) et replica set (`2` à `8`) est refusé (`400`, code `150201`) |
| `external` | `true` ou `false` |
| `sharding` | Laissez-le de côté (voir l'avertissement ci-dessous) |

La préconfiguration (`preset`) n'est pas modifiable par l'API. Par exemple, pour passer le disque à 20 Go :

```bash
curl -sS -X PATCH "$HIKUBE_API/mongodb/v1alpha1/projects/$PROJECT_ID/clusters/demomongo" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"size": 20}'
```

:::warning
N'envoyez pas `sharding` : la topologie d'un cluster existant ne se change pas, comme dans la console, et un cluster partitionné le reste tant que le champ est absent. Pour la modifier, [contactez le support](mailto:support@hidora.io).
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
