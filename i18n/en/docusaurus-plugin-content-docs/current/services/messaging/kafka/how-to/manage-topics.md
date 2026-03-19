---
title: "How to create and manage topics"
---

# How to create and manage topics

This guide explains how to create, configure, and manage Kafka topics on Hikube declaratively via Kubernetes manifests. You will learn how to define partitions, replicas, and retention and cleanup policies.

## Prerequisites

- **kubectl** configured with your Hikube kubeconfig
- A **Kafka** cluster deployed on Hikube (or a manifest ready to deploy)

## Steps

### 1. Add a topic to the manifest

Topics are declared in the `topics` section of the Kafka manifest. Each topic has a name, a number of partitions, and a number of replicas.

```yaml title="kafka-topics.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Kafka
metadata:
  name: my-kafka
spec:
  kafka:
    replicas: 3
    resourcesPreset: small
    size: 10Gi
  zookeeper:
    replicas: 3
    resourcesPreset: small
    size: 5Gi
  topics:
    - name: events
      partitions: 6
      replicas: 3
    - name: orders
      partitions: 3
      replicas: 3
```

**Topic parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `topics[i].name` | `string` | Topic name |
| `topics[i].partitions` | `int` | Number of partitions (consumption parallelism) |
| `topics[i].replicas` | `int` | Number of replicas (data durability) |
| `topics[i].config` | `object` | Advanced topic configuration |

:::warning
The number of replicas for a topic cannot exceed the number of available brokers. For example, with 3 brokers, the maximum is `replicas: 3`.
:::

### 2. Configure retention and cleanup policy

Each topic can be customized via the `config` field. The two main cleanup policies are:

- **`delete`**: messages are deleted after the retention period expires (`retention.ms`)
- **`compact`**: only the latest value for each key is kept (ideal for reference tables, state)

```yaml title="kafka-topics-config.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Kafka
metadata:
  name: my-kafka
spec:
  kafka:
    replicas: 3
    resourcesPreset: small
    size: 20Gi
  zookeeper:
    replicas: 3
    resourcesPreset: small
    size: 5Gi
  topics:
    - name: events
      partitions: 6
      replicas: 3
      config:
        cleanup.policy: "delete"
        retention.ms: "604800000"
        min.insync.replicas: "2"
    - name: orders
      partitions: 3
      replicas: 3
      config:
        cleanup.policy: "compact"
        segment.ms: "3600000"
        max.compaction.lag.ms: "5400000"
        min.insync.replicas: "2"
```

**Common configuration options:**

| Parameter | Description | Example |
|-----------|-------------|---------|
| `cleanup.policy` | Cleanup policy: `delete` or `compact` | `"delete"` |
| `retention.ms` | Message retention duration in milliseconds | `"604800000"` (7 days) |
| `min.insync.replicas` | Minimum number of in-sync replicas to acknowledge a write | `"2"` |
| `segment.ms` | Duration before log segment rotation (in ms) | `"3600000"` (1 hour) |
| `max.compaction.lag.ms` | Maximum delay before compacting a message (in ms) | `"5400000"` (1h30) |

:::tip
For production topics, always configure `min.insync.replicas: "2"` with 3 replicas. This ensures that at least 2 brokers acknowledge each write, protecting against data loss in case of a broker failure.
:::

### 3. Apply the changes

```bash
kubectl apply -f kafka-topics-config.yaml
```

The Kafka operator automatically creates or updates the topics declared in the manifest.

### 4. Verify the topics

Verify that the Kafka resource has been updated:

```bash
kubectl get kafka my-kafka -o yaml | grep -A 10 "topics:"
```

For a more thorough verification, you can launch a debug pod with the Kafka CLI:

```bash
kubectl run kafka-debug --rm -it --image=bitnami/kafka:latest --restart=Never -- \
  kafka-topics.sh --bootstrap-server my-kafka-kafka-bootstrap:9092 --list
```

**Expected output:**

```console
events
orders
```

To see the details of a topic:

```bash
kubectl run kafka-debug --rm -it --image=bitnami/kafka:latest --restart=Never -- \
  kafka-topics.sh --bootstrap-server my-kafka-kafka-bootstrap:9092 --describe --topic events
```

**Expected output:**

```console
Topic: events   TopicId: AbC123...   PartitionCount: 6   ReplicationFactor: 3
  Topic: events   Partition: 0   Leader: 1   Replicas: 1,2,0   Isr: 1,2,0
  Topic: events   Partition: 1   Leader: 2   Replicas: 2,0,1   Isr: 2,0,1
  ...
```

## Verification

The configuration is successful if:

- The topics appear in the list (`--list`)
- The number of partitions and the replication factor match the manifest
- The ISR (In-Sync Replicas) contain the expected number of brokers

## Next steps

- **[Kafka API reference](../api-reference.md)**: full documentation of `topics` parameters and advanced configuration
- **[How to scale the Kafka cluster](./scale-resources.md)**: adjust broker and ZooKeeper resources
