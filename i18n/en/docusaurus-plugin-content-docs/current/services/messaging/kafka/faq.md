---
sidebar_position: 6
title: FAQ
---

# FAQ — Kafka

:::info Availability
Kafka is not yet available as self-service in the [Hikube console](https://console.hikube.cloud).
To provision an instance or change its configuration, [contact support](mailto:support@hidora.io).
:::

### How do I get a Kafka cluster?

Send your request to [support](mailto:support@hidora.io) with the instance parameters (number of brokers, presets, storage, topics, external access). The [quick start](./quick-start.md) lists the information to prepare.

### What is the difference between partitions and the replication factor?

These two parameters serve different purposes:

- **Partitions**: determine the **parallelism and throughput** of a topic. The more partitions, the more consumers can read in parallel. Each partition is an ordered sequence of messages.
- **Replicas** (replication factor): determine the number of **copies** of each partition spread across different brokers, ensuring **high availability**. If a broker goes down, a replica takes over.

:::warning
The number of replicas of a topic **cannot exceed** the number of available brokers. For example, with 3 brokers, a topic can have at most 3 replicas.
:::

### Why does Kafka use ZooKeeper?

ZooKeeper handles **Kafka cluster coordination**:

- **Controller election**: designates the leader broker responsible for managing partitions
- **Topic metadata**: stores the list of topics, partitions and their assignment to brokers
- **Failure detection**: monitors broker state and triggers reassignment in case of failure

:::tip
ZooKeeper requires an **odd number of instances** (3, 5, 7…) to maintain quorum. In production, plan for at least 3 instances.
:::

### What is `cleanup.policy` used for on a topic?

The cleanup policy defines how Kafka handles old messages:

- **`delete`** (default): deletes log segments that exceed the retention period set by `retention.ms`. Suited to event streams.
- **`compact`**: keeps only the **latest value for each key**. Suited to reference tables or state (changelog).

The policy of each topic is part of the instance configuration. This option is not available in the console; contact support.

### How do consumer groups work?

A **consumer group** is a set of consumers that share the reading of a topic's partitions:

- Each partition is read by **a single consumer** of the group at any given time
- If a consumer goes down, its partitions are redistributed to the other members of the group (**rebalancing**)
- Several consumer groups can read the same topic independently (each keeps its own offset)

This enables **parallel consumption** while guaranteeing message order within each partition.

### Which resource presets are available?

Presets apply separately to the brokers and to ZooKeeper:

| **Preset** | **CPU** | **Memory** |
| ---------- | ------- | ---------- |
| `nano`     | 250m    | 128Mi      |
| `micro`    | 500m    | 256Mi      |
| `small`    | 1       | 512Mi      |
| `medium`   | 1       | 1Gi        |
| `large`    | 2       | 2Gi        |
| `xlarge`   | 4       | 4Gi        |
| `2xlarge`  | 8       | 8Gi        |

Explicit CPU/memory values can also be requested; they then replace the preset. This option is not available in the console; contact support.

### How do I expose Kafka outside the platform?

External access is an instance option: when enabled, the brokers become reachable from outside the platform. This option is not available in the console; contact support.

:::warning
External exposure makes your brokers reachable on the Internet, on port `9094`. This listener is TLS-encrypted by default, but no client authentication is configured: anyone who knows the address can produce and consume messages. Discuss setting up authentication (SCRAM or mTLS) with support before enabling this option.
:::

### How do I configure `min.insync.replicas`?

The `min.insync.replicas` parameter guarantees that a minimum number of replicas acknowledges each write before it is considered successful. It is a **topic**-level setting, defined in the instance configuration.

:::tip
For a production topic with 3 replicas, `min.insync.replicas: 2` tolerates the loss of one broker while guaranteeing data durability. On the producer side, combine it with `acks=all`.
:::
