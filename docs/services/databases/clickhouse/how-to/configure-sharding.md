---
title: "Comment configurer le sharding ClickHouse"
sidebar_position: 3
---

# Comment configurer le sharding ClickHouse

:::info Disponibilité
ClickHouse n'est pas encore disponible en libre-service dans la [console Hikube](https://console.hikube.cloud).
Pour en provisionner une instance ou modifier sa configuration, [contactez le support](mailto:support@hidora.io).
:::

Ce guide explique comment choisir le nombre de shards et de réplicas d'une instance ClickHouse, puis comment créer des tables qui exploitent cette topologie.

## Étapes

### 1. Comprendre shards et réplicas

- **Shards** : distribuent les données horizontalement. Chaque shard contient une partie des données. Plus de shards = plus de capacité de stockage et de traitement en parallèle.
- **Réplicas** : dupliquent les données au sein de chaque shard pour la redondance. Plus de réplicas = plus de disponibilité en cas de panne.

Par exemple, avec 2 shards et 2 réplicas par shard, l'instance compte 4 nœuds ClickHouse au total.

:::note
Le sharding est utile lorsque le volume de données dépasse la capacité d'un seul nœud, ou lorsque vous souhaitez paralléliser les requêtes sur plusieurs serveurs.
:::

### 2. Demander la topologie

[Contactez le support](mailto:support@hidora.io) en indiquant le nombre de shards, le nombre de réplicas par shard, le preset et la taille du stockage. Une configuration répliquée ou shardée s'appuie sur **ClickHouse Keeper** (3 instances recommandées, toujours en nombre impair).

### 3. Créer des tables distribuées

Sur une instance shardée, créez une table locale répliquée sur chaque shard, puis une table `Distributed` qui répartit les requêtes :

```sql
-- Table locale, créée sur tous les nœuds du cluster
CREATE TABLE default.events_local ON CLUSTER '{cluster}'
(
    ts DateTime,
    user_id UInt64,
    action String
)
ENGINE = ReplicatedMergeTree
ORDER BY (ts, user_id);

-- Table distribuée, point d'entrée des requêtes
CREATE TABLE default.events ON CLUSTER '{cluster}'
AS default.events_local
ENGINE = Distributed('{cluster}', default, events_local, cityHash64(user_id));
```

:::tip
Choisissez une clé de distribution (ici `cityHash64(user_id)`) qui répartit uniformément les données et regroupe celles interrogées ensemble.
:::

## Vérification

```sql
-- Topologie vue par ClickHouse
SELECT cluster, shard_num, replica_num, host_name
FROM system.clusters;

-- Répartition des lignes par shard
SELECT _shard_num, count() FROM default.events GROUP BY _shard_num;
```

## Pour aller plus loin

- [Concepts ClickHouse](../concepts.md) : sharding, réplication, Keeper
- [Scaler verticalement](./scale-resources.md)
