---
title: "How to configure ClickHouse sharding"
sidebar_position: 3
---

# How to configure ClickHouse sharding

:::info Availability
ClickHouse is not yet available as self-service in the [Hikube console](https://console.hikube.cloud).
To provision an instance or change its configuration, [contact support](mailto:support@hidora.io).
:::

This guide explains how to choose the number of shards and replicas for a ClickHouse instance, then how to create tables that take advantage of this topology.

## Steps

### 1. Understand shards and replicas

- **Shards**: distribute data horizontally. Each shard contains part of the data. More shards = more storage capacity and more parallel processing.
- **Replicas**: duplicate data within each shard for redundancy. More replicas = higher availability in case of failure.

For example, with 2 shards and 2 replicas per shard, the instance has 4 ClickHouse nodes in total.

:::note
Sharding is useful when the data volume exceeds the capacity of a single node, or when you want to parallelize queries across several servers.
:::

### 2. Request the topology

[Contact support](mailto:support@hidora.io) with the number of shards, the number of replicas per shard, the preset and the storage size. A replicated or sharded configuration relies on **ClickHouse Keeper** (3 instances recommended, always an odd number).

### 3. Create distributed tables

On a sharded instance, create a replicated local table on each shard, then a `Distributed` table that spreads the queries:

```sql
-- Local table, created on all nodes of the cluster
CREATE TABLE default.events_local ON CLUSTER '{cluster}'
(
    ts DateTime,
    user_id UInt64,
    action String
)
ENGINE = ReplicatedMergeTree
ORDER BY (ts, user_id);

-- Distributed table, entry point for queries
CREATE TABLE default.events ON CLUSTER '{cluster}'
AS default.events_local
ENGINE = Distributed('{cluster}', default, events_local, cityHash64(user_id));
```

:::tip
Choose a distribution key (here `cityHash64(user_id)`) that spreads data evenly and groups together the data that is queried together.
:::

## Verification

```sql
-- Topology as seen by ClickHouse
SELECT cluster, shard_num, replica_num, host_name
FROM system.clusters;

-- Distribution of rows per shard
SELECT _shard_num, count() FROM default.events GROUP BY _shard_num;
```

## Further reading

- [ClickHouse concepts](../concepts.md): sharding, replication, Keeper
- [Scale vertically](./scale-resources.md)
