---
title: "Comment scaler verticalement ClickHouse"
description: "Mesurez la consommation mémoire et disque d'une instance ClickHouse sur Hikube, puis demandez au support un autre preset ou plus de stockage pour ses réplicas."
sidebar_position: 2
---

# Comment scaler verticalement ClickHouse

:::info Disponibilité
ClickHouse n'est pas encore disponible en libre-service dans la [console Hikube](https://console.hikube.cloud).
Pour en provisionner une instance ou modifier sa configuration, [contactez le support](mailto:support@hidora.io).
:::

Ce guide aide à décider quand et comment augmenter les ressources d'une instance ClickHouse.

## Presets disponibles

Les ressources de chaque réplica ClickHouse sont définies par un preset :

| Preset | CPU | Mémoire |
|--------|-----|---------|
| `t1.nano` | 250m | 128Mi |
| `t1.micro` | 500m | 256Mi |
| `t1.small` | 1 | 512Mi |
| `c1.small` | 1 | 1Gi |
| `c1.medium` | 2 | 2Gi |
| `c1.large` | 4 | 4Gi |
| `c1.xlarge` | 8 | 8Gi |

## Étapes

### 1. Mesurer la consommation actuelle

Identifiez les requêtes les plus gourmandes en mémoire :

```sql
SELECT query, memory_usage, elapsed
FROM system.query_log
WHERE type = 'QueryFinish'
ORDER BY memory_usage DESC
LIMIT 10;
```

Et l'espace disque utilisé par table :

```sql
SELECT database, table, formatReadableSize(sum(bytes_on_disk)) AS size
FROM system.parts
WHERE active
GROUP BY database, table
ORDER BY sum(bytes_on_disk) DESC;
```

### 2. Demander la modification

[Contactez le support](mailto:support@hidora.io) en indiquant le projet, le nom de l'instance et la cible : preset, taille du stockage, ou nombre de shards si un seul nœud ne suffit plus (voir [Configurer le sharding](./configure-sharding.md)).

:::warning
Un changement de preset redémarre les réplicas. Avec plusieurs réplicas par shard, le service reste disponible pendant l'opération.
:::

## Vérification

Après l'intervention, contrôlez les ressources vues par ClickHouse :

```sql
SELECT name, value FROM system.settings WHERE name = 'max_memory_usage';
SELECT * FROM system.disks;
```

## Pour aller plus loin

- [Concepts ClickHouse](../concepts.md)
- [Configurer le sharding](./configure-sharding.md)
