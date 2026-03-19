---
sidebar_position: 6
title: FAQ
---

# FAQ — ClickHouse

### What is the difference between shards and replicas?

**Shards** and **replicas** play different roles in the ClickHouse architecture:

- **Shards**: **horizontal** data distribution. Each shard contains a portion of the total dataset. Adding shards increases storage and processing capacity.
- **Replicas**: **identical** copies of data within the same shard. Each replica contains the same data to ensure high availability.

```yaml title="clickhouse.yaml"
spec:
  shards: 2       # Data is distributed across 2 shards
  replicas: 3     # Each shard has 3 copies (total: 6 pods)
```

:::tip
In production, use at least 2 replicas per shard for high availability. Increase the number of shards to handle larger data volumes.
:::

### What is ClickHouse Keeper for?

**ClickHouse Keeper** is the cluster coordination component, based on the **Raft** protocol. It replaces Apache ZooKeeper and provides:

- **Leader election** for replicated tables
- **Coordination** of replication operations between replicas
- **Metadata** management for the cluster

The number of Keeper replicas must be **odd** (3 or 5) to guarantee quorum (majority required for leader election). The recommended minimum is **3 replicas**.

```yaml title="clickhouse.yaml"
spec:
  clickhouseKeeper:
    enabled: true
    replicas: 3        # Always odd: 3 or 5
    resourcesPreset: micro
    size: 2Gi
```

### Is ClickHouse suitable for transactional queries (OLTP)?

**No.** ClickHouse is an **OLAP** (Online Analytical Processing) database engine optimized for data analysis:

- **Column-oriented** architecture: very performant for aggregations and scans on large data volumes
- Optimized for **massive reads** and analytical queries
- **Not suitable** for frequent transactional operations (individual `UPDATE`, `DELETE`)

If you need a transactional engine (OLTP), use **PostgreSQL** or **MySQL** on Hikube instead.

### What is the difference between `resourcesPreset` and `resources`?

The `resourcesPreset` field lets you choose a predetermined resource profile for each ClickHouse replica. If the `resources` field (explicit CPU/memory) is defined, `resourcesPreset` is **completely ignored**.

| **Preset** | **CPU** | **Memory** |
|------------|---------|------------|
| `nano`     | 250m    | 128Mi      |
| `micro`    | 500m    | 256Mi      |
| `small`    | 1       | 512Mi      |
| `medium`   | 1       | 1Gi        |
| `large`    | 2       | 2Gi        |
| `xlarge`   | 4       | 4Gi        |
| `2xlarge`  | 8       | 8Gi        |

```yaml title="clickhouse.yaml"
spec:
  # Using a preset
  resourcesPreset: large

  # OR explicit configuration (the preset is then ignored)
  resources:
    cpu: 4000m
    memory: 8Gi
```

### How is data distributed between shards?

Data is distributed between shards via the ClickHouse **Distributed** engine:

- Each shard stores a **partition** of the total dataset
- The `Distributed` engine routes queries to all shards and **merges the results**
- Data is **replicated** within each shard according to the configured number of replicas

To benefit from distribution, create tables with the `ReplicatedMergeTree` engine on each shard and a `Distributed` table for global queries.

### How to configure ClickHouse backups?

ClickHouse backups use **Restic** for sending to S3-compatible storage. Configure the `backup` section:

```yaml title="clickhouse.yaml"
spec:
  backup:
    enabled: true
    s3Region: eu-central-1
    s3Bucket: s3.example.com/clickhouse-backups
    schedule: "0 3 * * *"
    cleanupStrategy: "--keep-last=7 --keep-daily=7 --keep-weekly=4"
    s3AccessKey: your-access-key
    s3SecretKey: your-secret-key
    resticPassword: your-restic-password
```

:::warning
Keep the `resticPassword` in a safe place. Without this password, backups cannot be decrypted.
:::
