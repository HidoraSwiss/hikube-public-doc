---
sidebar_position: 2
title: Concepts
---

# Concepts — Kafka

## Architecture

Kafka on Hikube is a managed distributed streaming service. Each instance deployed via the `Kafka` resource creates a cluster of **brokers** coordinated by **ZooKeeper**, capable of handling millions of messages per second with guaranteed persistence.

```mermaid
graph TB
    subgraph "Hikube Platform"
        subgraph "Tenant namespace"
            CR[Kafka CRD]
            SEC[Secret credentials]
        end

        subgraph "Kafka Cluster"
            B1[Broker 1]
            B2[Broker 2]
            B3[Broker 3]
        end

        subgraph "ZooKeeper"
            Z1[ZK 1]
            Z2[ZK 2]
            Z3[ZK 3]
        end

        subgraph "Topics"
            T1["Topic A (3 partitions)"]
            T2["Topic B (2 partitions)"]
        end

        subgraph "Storage"
            PV1[PV Broker 1]
            PV2[PV Broker 2]
            PV3[PV Broker 3]
        end
    end

    CR --> B1
    CR --> B2
    CR --> B3
    B1 --> PV1
    B2 --> PV2
    B3 --> PV3
    Z1 <--> Z2
    Z2 <--> Z3
    B1 -.-> Z1
    B2 -.-> Z1
    B3 -.-> Z1
    T1 --> B1
    T1 --> B2
    T1 --> B3
    T2 --> B1
    T2 --> B2
```

---

## Terminology

| Term | Description |
|------|-------------|
| **Kafka** | Kubernetes resource (`apps.cozystack.io/v1alpha1`) representing a managed Kafka cluster. |
| **Broker** | Kafka instance that stores messages and serves producers/consumers. |
| **ZooKeeper** | Distributed coordination service that manages cluster metadata, leader election, and topic configuration. |
| **Topic** | Named message channel. Producers write to a topic, consumers read from a topic. |
| **Partition** | Subdivision of a topic. Each partition is an ordered log of messages, distributed on a broker. |
| **Replication Factor** | Number of copies of each partition across different brokers. |
| **Consumer Group** | Group of consumers that share the partitions of a topic for parallel processing. |
| **Retention** | Maximum duration or size for message retention in a topic. |
| **resourcesPreset** | Predefined resource profile (nano to 2xlarge). |

---

## Topics and partitions

### How it works

A **topic** is divided into **partitions**, each distributed on a different broker:

```mermaid
graph LR
    subgraph "Topic: orders"
        P0[Partition 0<br/>Broker 1]
        P1[Partition 1<br/>Broker 2]
        P2[Partition 2<br/>Broker 3]
    end

    Prod[Producer] --> P0
    Prod --> P1
    Prod --> P2

    P0 --> C1[Consumer 1]
    P1 --> C2[Consumer 2]
    P2 --> C3[Consumer 3]
```

- More partitions = more parallelism
- Each partition has a **leader** (a broker) and **followers** (replicas)
- The `replicationFactor` determines the number of copies of each partition

### Topic configuration

Topics are declared directly in the Kafka manifest:

| Parameter | Description |
|-----------|-------------|
| `topics[name].partitions` | Number of partitions for the topic |
| `topics[name].config.replicationFactor` | Number of replicas per partition |
| `topics[name].config.retentionMs` | Retention duration in ms (e.g., `604800000` = 7 days) |
| `topics[name].config.cleanupPolicy` | `delete` (deletion by TTL) or `compact` (keep the last message per key) |

---

## ZooKeeper

ZooKeeper handles Kafka cluster coordination:

- **Leader election** for each partition
- **Metadata storage** (topics, partitions, offsets)
- **Failure detection** of brokers

:::tip
Always configure an odd number of ZooKeeper instances (`zookeeper.replicas: 3`) to guarantee quorum.
:::

ZooKeeper resources are configured independently from brokers via `zookeeper.resources` or `zookeeper.resourcesPreset`.

---

## Resource presets

Presets apply separately to **Kafka brokers** and **ZooKeeper**:

| Preset | CPU | Memory |
|--------|-----|--------|
| `nano` | 250m | 128Mi |
| `micro` | 500m | 256Mi |
| `small` | 1 | 512Mi |
| `medium` | 1 | 1Gi |
| `large` | 2 | 2Gi |
| `xlarge` | 4 | 4Gi |
| `2xlarge` | 8 | 8Gi |

---

## Limits and quotas

| Parameter | Value |
|-----------|-------|
| Max Kafka brokers | Depending on tenant quota |
| ZooKeeper instances | 3 recommended (odd number) |
| Topics per cluster | Unlimited (depending on resources) |
| Partitions per topic | Configurable |
| Storage size | Variable (`kafka.size`, `zookeeper.size`) |

---

## Further reading

- [Overview](./overview.md): service presentation
- [API Reference](./api-reference.md): all parameters of the Kafka resource
