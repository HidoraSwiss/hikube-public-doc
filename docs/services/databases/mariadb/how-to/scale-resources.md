---
title: "Comment modifier les ressources d'un cluster"
sidebar_position: 2
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Comment modifier les ressources d'un cluster

Ce guide explique comment ajuster un cluster MariaDB existant depuis la [console Hikube](https://console.hikube.cloud) : taille du disque, version et accès externe.

## Prérequis

- Un cluster **MariaDB** existant dans votre projet
- Des quotas de projet suffisants pour la nouvelle configuration
- Pour l'onglet **API** : une clé d'API `admin` du projet et les variables `HIKUBE_API`, `HIKUBE_API_KEY` et `PROJECT_ID` (voir [Préparer l'environnement](../../../../api/quick-start.md#environnement)) ; les exemples utilisent `curl` et `jq`

## Ce qui est modifiable

| Paramètre | Modifiable après création |
|-----------|---------------------------|
| **Version MariaDB** | Oui |
| **Taille du disque (Go)** | Oui |
| **Accès externe** | Oui |
| **Préconfiguration (Preset)** | Non, « La préconfiguration ne peut pas être modifiée après création » |
| **Nombre de réplicas** | Non, « Le mode ne peut pas être modifié après création » |

Pour changer la préconfiguration (CPU et mémoire) ou le nombre de réplicas d'un cluster existant, [contactez le support](mailto:support@hidora.io).

## Étapes

### 1. Ouvrir le formulaire de modification

<Tabs groupId="interface">
<TabItem value="console" label="Console" default>

1. Ouvrez **DB & Messaging** → **MariaDB**.
2. Ouvrez le cluster, puis cliquez sur **Modifier** (ou utilisez **Actions** → **Modifier** dans la liste).

La page **Modifier MariaDB** affiche la carte **Paramètres du cluster** et l'impact sur les quotas du projet.

</TabItem>
<TabItem value="api" label="API">

Récupérez la configuration actuelle du cluster :

```bash
curl -sS "$HIKUBE_API/mariadb/v1alpha1/projects/$PROJECT_ID/clusters/demomariadb" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY" | jq '{version, replicas, size, external, preset}'
```

</TabItem>
</Tabs>

### 2. Ajuster les paramètres

<Tabs groupId="interface">
<TabItem value="console" label="Console" default>

- **Taille du disque (Go)** : saisissez la nouvelle capacité.
- **Version MariaDB** : sélectionnez la version cible (10.6, 10.11, 11.4 ou 11.8). Le formulaire propose aussi les versions inférieures à la version actuelle : ne revenez pas à une version antérieure, MariaDB ne prend pas en charge la rétrogradation.
- **Accès externe** : activez ou désactivez l'exposition sur l'Internet public.

</TabItem>
<TabItem value="api" label="API">

La modification passe par `PATCH /mariadb/v1alpha1/projects/{projectId}/clusters/{name}`, dont le corps accepte quatre champs :

| Champ | Comportement s'il est omis |
|-------|----------------------------|
| `version` | Obligatoire (`v10.6`, `v10.11`, `v11.4` ou `v11.8`) ; ne revenez pas à une version antérieure |
| `size` | Obligatoire (1 à 4096 Go) |
| `replicas` | Conservé ; un passage entre standalone (`1`) et cluster (`2` à `8`) est refusé (`400`) |
| `external` | **Désactivé** : un champ absent vaut `false` |

La préconfiguration (`preset`) n'est pas modifiable par l'API non plus. Partez de la configuration actuelle et ne changez que les valeurs voulues, par exemple la taille du disque :

```bash
curl -sS "$HIKUBE_API/mariadb/v1alpha1/projects/$PROJECT_ID/clusters/demomariadb" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY" \
| jq '{version, replicas, size, external} | .size = 20' > mariadb-update.json

curl -sS -X PATCH "$HIKUBE_API/mariadb/v1alpha1/projects/$PROJECT_ID/clusters/demomariadb" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY" \
  -H "Content-Type: application/json" \
  -d @mariadb-update.json
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

:::tip
Augmentez la taille du disque avant qu'il ne soit plein. Pour mesurer l'espace utilisé par base :

```sql
SELECT table_schema, ROUND(SUM(data_length + index_length) / 1024 / 1024, 1) AS size_mb
FROM information_schema.tables
GROUP BY table_schema;
```
:::

## Vérification

<Tabs groupId="interface">
<TabItem value="console" label="Console" default>

La page du cluster affiche les nouvelles valeurs dans les cartes **Version MariaDB** et **Taille allouée**, et l'état de l'**Accès externe** dans la carte **Connexion et réseau**.

</TabItem>
<TabItem value="api" label="API">

```bash
curl -sS "$HIKUBE_API/mariadb/v1alpha1/projects/$PROJECT_ID/clusters/demomariadb" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY" | jq '{status, version, size, external, host}'
```

Les valeurs reflètent la nouvelle configuration, et `status` revient à `ready` une fois la mise à jour appliquée.

</TabItem>
</Tabs>

## Pour aller plus loin

- [Concepts MariaDB](../concepts.md) : réplication, préconfigurations, accès réseau
- [Gérer les utilisateurs et bases de données](./manage-users-databases.md)
