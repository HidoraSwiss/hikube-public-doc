---
title: "How to scale the cluster"
---

# How to scale the Kafka cluster

:::info Availability
Kafka is not yet available as self-service in the [Hikube console](https://console.hikube.cloud).
To provision an instance or change its configuration, [contact support](mailto:support@hidora.io).
:::

This guide presents the sizing parameters of a Kafka cluster on Hikube (number of brokers, CPU/memory resources, storage, ZooKeeper) and what to check before and after a change.

Sizing is part of the instance configuration. This option is not available in the console; contact support.

## Prerequisites

- A **Kafka** cluster provisioned on Hikube and the address of its bootstrap servers (`<bootstrap-servers>`)
- The Kafka client scripts installed on your workstation (for verification)

## Available presets

Presets apply separately to the Kafka brokers and to the ZooKeeper nodes:

| Preset | CPU | Memory |
|--------|-----|--------|
| `nano` | 250m | 128Mi |
| `micro` | 500m | 256Mi |
| `small` | 1 | 512Mi |
| `medium` | 1 | 1Gi |
| `large` | 2 | 2Gi |
| `xlarge` | 4 | 4Gi |
| `2xlarge` | 8 | 8Gi |

:::note
Explicit CPU/memory values can be requested instead of a preset; they then replace the preset.
:::

## Steps

### 1. Identify the need

| Symptom | Lever |
|---------|-------|
| Insufficient throughput, consumer lag on all partitions | More brokers and/or more partitions |
| Brokers restarted due to lack of memory | Larger preset for the brokers |
| Insufficient disk space on the brokers | Larger broker storage |
| Unstable coordination | ZooKeeper resources or storage |

### 2. Prepare the request

Tell support, for the project and instance concerned:

- **Brokers**: number of brokers, preset (or explicit CPU/memory), storage size per broker;
- **ZooKeeper**: number of instances (odd: 1, 3, 5), preset, storage size.

:::warning
Reducing the number of brokers on an existing cluster can cause data loss if partitions are not redistributed beforehand. Prefer increasing the number of brokers.
:::

:::tip
In production, 3 ZooKeeper instances are enough in most cases. 5 instances are only justified for very large clusters (10 brokers or more).
:::

### 3. Adapt the topics if needed

The number of replicas of a topic cannot exceed the number of brokers. After increasing the number of brokers, you can request a higher replication factor or more partitions for your topics (see [How to create and manage topics](./manage-topics.md)).

### 4. Send the request

Send the request to [support](mailto:support@hidora.io). Applying the changes may restart the brokers one after another; make sure your clients can reconnect.

## Verification

Once the change is applied, check that the cluster responds and that all topics have their replicas in sync:

```bash
kafka-topics.sh --bootstrap-server <bootstrap-servers> --list
kafka-topics.sh --bootstrap-server <bootstrap-servers> --describe --under-replicated-partitions
```

The second command must return nothing when all partitions are replicated.

## Further reading

- **[Concepts](../concepts.md)**: architecture, ZooKeeper and presets
- **[How to create and manage topics](./manage-topics.md)**: configure topics after scaling
