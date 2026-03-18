---
title: "How to configure ClickHouse sharding"
---

# How to configure ClickHouse sharding

This guide explains how to configure sharding (horizontal partitioning) on ClickHouse to distribute data across multiple shards and ensure high availability with replicas. Cluster coordination is handled by **ClickHouse Keeper**.

## Prerequisites

- A ClickHouse instance deployed on Hikube (see the [quick start](../quick-start.md))
- `kubectl` configured to interact with the Hikube API
- Knowledge of sharding and replication concepts (see [concepts](../concepts.md) if available)

## Steps

### 1. Understanding shards vs replicas

Before configuring sharding, it is important to distinguish these two concepts:

- **Shards**: distribute data horizontally. Each shard contains a portion of the data. More shards = more storage capacity and parallel processing.
- **Replicas**: duplicate data within each shard for redundancy. More replicas = more availability in case of failure.

For example, with `shards: 2` and `replicas: 2`, you get 4 ClickHouse pods in total (2 shards x 2 replicas per shard).

:::note
Sharding is useful when the data volume exceeds the capacity of a single node, or when you want to parallelize queries across multiple servers.
:::

### 2. Configure sharding

Create a manifest with multiple shards and replicas:

```yaml title="clickhouse-sharded.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: ClickHouse
metadata:
  name: my-clickhouse-sharded
spec:
  shards: 2
  replicas: 2
  resourcesPreset: large
  size: 50Gi
  storageClass: replicated
  clickhouseKeeper:
    enabled: true
    replicas: 3
    resourcesPreset: micro
    size: 2Gi
```

This configuration creates:
- **2 shards** to distribute data
- **2 replicas per shard** for redundancy (4 ClickHouse pods total)
- **3 Keeper replicas** for cluster coordination

### 3. Configure ClickHouse Keeper

ClickHouse Keeper handles cluster coordination: leader election, data replication, and shard state tracking. It must be enabled for sharded configurations.

```yaml title="clickhouse-keeper-config.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: ClickHouse
metadata:
  name: my-clickhouse-sharded
spec:
  shards: 2
  replicas: 2
  resourcesPreset: large
  size: 50Gi
  storageClass: replicated
  clickhouseKeeper:
    enabled: true
    replicas: 3
    resourcesPreset: small
    size: 5Gi
```

:::tip
Always deploy Keeper with an odd number of replicas (3 or 5) to guarantee quorum. With 3 replicas, the cluster tolerates the loss of one Keeper node. With 5, it tolerates two.
:::

:::warning
Changing the number of shards on an existing cluster can lead to complex data redistribution. Plan the number of shards from the initial deployment as much as possible.
:::

### 4. Apply and verify

Apply the configuration:

```bash
kubectl apply -f clickhouse-sharded.yaml
```

Wait for all pods to be ready:

```bash
# Observer le deploiement en temps reel
kubectl get pods -l app.kubernetes.io/instance=my-clickhouse-sharded -w
```

**Expected output:**

```console
NAME                          READY   STATUS    RESTARTS   AGE
my-clickhouse-sharded-0-0     1/1     Running   0          4m
my-clickhouse-sharded-0-1     1/1     Running   0          4m
my-clickhouse-sharded-1-0     1/1     Running   0          3m
my-clickhouse-sharded-1-1     1/1     Running   0          3m
```

Also verify the Keeper pods:

```bash
kubectl get pods -l app.kubernetes.io/instance=my-clickhouse-sharded,app.kubernetes.io/component=keeper
```

**Expected output:**

```console
NAME                                  READY   STATUS    RESTARTS   AGE
my-clickhouse-sharded-keeper-0        1/1     Running   0          4m
my-clickhouse-sharded-keeper-1        1/1     Running   0          4m
my-clickhouse-sharded-keeper-2        1/1     Running   0          4m
```

## Verification

Connect to ClickHouse and verify the cluster topology:

```bash
# Se connecter au premier pod ClickHouse
kubectl exec -it my-clickhouse-sharded-0-0 -- clickhouse-client
```

Then execute the following query to list shards and replicas:

```sql
SELECT cluster, shard_num, replica_num, host_name
FROM system.clusters
WHERE cluster = 'default'
ORDER BY shard_num, replica_num;
```

## Going further

- [API Reference](../api-reference.md) -- `shards`, `replicas` and `clickhouseKeeper` parameters
- [How to vertically scale ClickHouse](./scale-resources.md) -- Adjust CPU and memory resources
- [How to manage users and profiles](./manage-users.md) -- User access management
