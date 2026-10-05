---
title: "How to scale ClickHouse vertically"
sidebar_position: 2
---

# How to scale ClickHouse vertically

:::info Availability
ClickHouse is not yet available as self-service in the [Hikube console](https://console.hikube.cloud).
To provision an instance or change its configuration, [contact support](mailto:support@hidora.io).
:::

This guide helps you decide when and how to increase the resources of a ClickHouse instance.

## Available presets

The resources of each ClickHouse replica are defined by a preset:

| Preset | CPU | Memory |
|--------|-----|--------|
| `nano` | 250m | 128Mi |
| `micro` | 500m | 256Mi |
| `small` | 1 | 512Mi |
| `medium` | 1 | 1Gi |
| `large` | 2 | 2Gi |
| `xlarge` | 4 | 4Gi |
| `2xlarge` | 8 | 8Gi |

## Steps

### 1. Measure current consumption

Identify the most memory-intensive queries:

```sql
SELECT query, memory_usage, elapsed
FROM system.query_log
WHERE type = 'QueryFinish'
ORDER BY memory_usage DESC
LIMIT 10;
```

And the disk space used per table:

```sql
SELECT database, table, formatReadableSize(sum(bytes_on_disk)) AS size
FROM system.parts
WHERE active
GROUP BY database, table
ORDER BY sum(bytes_on_disk) DESC;
```

### 2. Request the change

[Contact support](mailto:support@hidora.io) with the project, the instance name and the target: preset, storage size, or number of shards if a single node is no longer enough (see [Configure sharding](./configure-sharding.md)).

:::warning
Changing the preset restarts the replicas. With several replicas per shard, the service remains available during the operation.
:::

## Verification

After the change, check the resources as seen by ClickHouse:

```sql
SELECT name, value FROM system.settings WHERE name = 'max_memory_usage';
SELECT * FROM system.disks;
```

## Further reading

- [ClickHouse concepts](../concepts.md)
- [Configure sharding](./configure-sharding.md)
