---
sidebar_position: 6
title: FAQ
---

# FAQ — ClickHouse

:::info Availability
ClickHouse is not yet available as self-service in the [Hikube console](https://console.hikube.cloud).
To provision an instance or change its configuration, [contact support](mailto:support@hidora.io).
:::

### What is the difference between shards and replicas?

**Shards** and **replicas** play different roles in the ClickHouse architecture:

- **Shards**: **horizontal** distribution of data. Each shard contains part of the total dataset. Adding shards increases storage and processing capacity.
- **Replicas**: **identical** copies of the data within the same shard, for high availability.

For example, 2 shards with 3 replicas each represent 6 ClickHouse nodes.

:::tip
In production, plan for at least 2 replicas per shard for high availability. Increase the number of shards to handle larger data volumes.
:::

### What is ClickHouse Keeper for?

**ClickHouse Keeper** is the cluster coordination component, based on the **Raft** protocol. It replaces Apache ZooKeeper and provides:

- **Leader election** for replicated tables
- **Coordination** of replication operations between replicas
- Management of cluster **metadata**

The number of Keeper instances must be **odd** (3 or 5) to guarantee quorum. The recommended minimum is **3**.

### Is ClickHouse suitable for transactional queries (OLTP)?

**No.** ClickHouse is an **OLAP** (Online Analytical Processing) engine optimized for data analysis:

- **Column-oriented** architecture: very efficient for aggregations and scans over large volumes
- Optimized for **massive reads** and analytical queries
- **Not suited** to frequent transactional operations (single-row `UPDATE`, `DELETE`)

For a transactional engine, use [PostgreSQL](../postgresql/overview.md) or [MariaDB](../mariadb/overview.md) instead, both available in the console.

### Which presets are available?

| **Preset** | **CPU** | **Memory** |
|------------|---------|------------|
| `nano`     | 250m    | 128Mi      |
| `micro`    | 500m    | 256Mi      |
| `small`    | 1       | 512Mi      |
| `medium`   | 1       | 1Gi        |
| `large`    | 2       | 2Gi        |
| `xlarge`   | 4       | 4Gi        |
| `2xlarge`  | 8       | 8Gi        |

The preset applies to each replica. Specify it in your request to support.

### How is data distributed between shards?

Data is distributed between shards through the ClickHouse **Distributed** engine:

- Each shard stores a **partition** of the total dataset
- The `Distributed` engine routes queries to all shards and **merges the results**
- Data is **replicated** within each shard according to the number of replicas

Create `ReplicatedMergeTree` tables on each shard and a `Distributed` table for global queries. See [Configure sharding](./how-to/configure-sharding.md).

### How do I configure ClickHouse backups?

ClickHouse backups send encrypted snapshots to S3-compatible storage. They are set up on request: [contact support](mailto:support@hidora.io) and specify the desired frequency and retention.
