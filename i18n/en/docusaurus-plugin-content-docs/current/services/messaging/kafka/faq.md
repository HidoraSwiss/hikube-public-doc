---
sidebar_position: 6
title: FAQ
---

# FAQ — Kafka

### What is the difference between `partitions` and `replicationFactor`?

These two parameters serve distinct purposes:

- **`partitions`**: determines the **parallelism and throughput** of a topic. More partitions allow more consumers to read in parallel. Each partition is an ordered sequence of messages.
- **`replicas`** (replication factor): determines the number of **copies** of each partition spread across different brokers, ensuring **high availability**. If a broker goes down, a replica takes over.

:::warning
The number of topic replicas **cannot exceed** the number of available brokers. For example, with 3 brokers (`kafka.replicas: 3`), you can configure at most `replicas: 3` on a topic.
:::

### Why does Kafka use ZooKeeper?

ZooKeeper handles **Kafka cluster coordination**:

- **Controller election**: designates the leader broker responsible for partition management
- **Topic metadata**: stores the list of topics, partitions, and their assignment to brokers
- **Failure detection**: monitors broker health and triggers reassignment in case of failure

:::tip
ZooKeeper requires an **odd number of replicas** (3, 5, 7...) to maintain quorum. In production, use at least `zookeeper.replicas: 3`.
:::

### What does `cleanup.policy` do on a topic?

The cleanup policy defines how Kafka manages old messages:

- **`delete`** (default): removes log segments that exceed the retention period defined by `retention.ms`. Suitable for event streams.
- **`compact`**: keeps only the **latest value for each key**. Suitable for reference tables or state (changelog).

Configuration example:

```yaml title="kafka.yaml"
topics:
  - name: user-profiles
    partitions: 3
    replicas: 3
    config:
      cleanup.policy: compact
```

### How do consumer groups work?

A **consumer group** is a set of consumers that share the reading of a topic's partitions:

- Each partition is read by **only one consumer** in the group at any given time
- If a consumer goes down, its partitions are redistributed to other group members (**rebalancing**)
- Multiple consumer groups can read the same topic independently (each maintains its own offset)

This enables **parallel consumption** while guaranteeing message ordering within each partition.

### What is the difference between `resourcesPreset` and `resources`?

The `resourcesPreset` field applies a predefined CPU/memory configuration, while `resources` allows you to specify explicit values. If `resources` is defined, `resourcesPreset` is **ignored**.

| **Preset** | **CPU** | **Memory** |
| ---------- | ------- | ---------- |
| `nano`     | 250m    | 128Mi      |
| `micro`    | 500m    | 256Mi      |
| `small`    | 1       | 512Mi      |
| `medium`   | 1       | 1Gi        |
| `large`    | 2       | 2Gi        |
| `xlarge`   | 4       | 4Gi        |
| `2xlarge`  | 8       | 8Gi        |

Example with explicit resources:

```yaml title="kafka.yaml"
kafka:
  replicas: 3
  resources:
    cpu: 2000m
    memory: 4Gi
  size: 50Gi
```

### How to expose Kafka outside the cluster?

Enable the `external: true` parameter in your manifest:

```yaml title="kafka.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Kafka
metadata:
  name: kafka
spec:
  external: true
  kafka:
    replicas: 3
    resourcesPreset: small
    size: 10Gi
  zookeeper:
    replicas: 3
    resourcesPreset: small
    size: 5Gi
```

This creates a **LoadBalancer** service for each broker, allowing access from outside the Kubernetes cluster.

:::warning
External exposure makes your brokers accessible on the Internet. Ensure authentication and encryption are properly configured before enabling this option.
:::

### How to configure `min.insync.replicas`?

The `min.insync.replicas` parameter ensures that a minimum number of replicas acknowledge each write before it is considered successful. This is a **topic-level** configuration:

```yaml title="kafka.yaml"
topics:
  - name: orders
    partitions: 6
    replicas: 3
    config:
      min.insync.replicas: "2"
```

:::tip
For a production cluster with 3 replicas, set `min.insync.replicas: 2`. This tolerates the loss of one broker while ensuring data durability.
:::
