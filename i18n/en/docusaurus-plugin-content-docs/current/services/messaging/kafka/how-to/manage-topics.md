---
title: "How to create and manage topics"
---

# How to create and manage topics

:::info Availability
Kafka is not yet available as self-service in the [Hikube console](https://console.hikube.cloud).
To provision an instance or change its configuration, [contact support](mailto:support@hidora.io).
:::

This guide presents the parameters of a Kafka topic on Hikube (partitions, replicas, retention, cleanup policy) and how to check the configuration from a Kafka client.

Managed topics are part of the instance configuration: you request their creation and modification from support. This option is not available in the console; contact support.

## Prerequisites

- A **Kafka** cluster provisioned on Hikube and the address of its bootstrap servers (`<bootstrap-servers>`)
- The Kafka client scripts (`kafka-topics.sh`) installed on your workstation

## Steps

### 1. Define the topics

For each topic, prepare:

| Parameter | Description |
|-----------|-------------|
| Name | Topic name |
| Partitions | Number of partitions (consumption parallelism) |
| Replicas | Number of copies of each partition (data durability) |
| Options | Advanced topic configuration (see below) |

:::warning
The number of replicas of a topic cannot exceed the number of available brokers. For example, with 3 brokers, the maximum is 3 replicas.
:::

### 2. Choose the retention and cleanup policy

The two main cleanup policies are:

- **`delete`**: messages are deleted once the retention period (`retention.ms`) expires
- **`compact`**: only the latest value of each key is kept (ideal for reference tables, state)

**Common configuration options:**

| Parameter | Description | Example |
|-----------|-------------|---------|
| `cleanup.policy` | Cleanup policy: `delete` or `compact` | `"delete"` |
| `retention.ms` | Message retention duration in milliseconds | `"604800000"` (7 days) |
| `min.insync.replicas` | Minimum number of in-sync replicas required to acknowledge a write | `"2"` |
| `segment.ms` | Time before a log segment is rolled (in ms) | `"3600000"` (1 hour) |
| `max.compaction.lag.ms` | Maximum delay before a message is compacted (in ms) | `"5400000"` (1h30) |

:::tip
For production topics, plan for `min.insync.replicas: "2"` with 3 replicas. At least 2 brokers then acknowledge each write, which protects against data loss if a broker fails.
:::

### 3. Send the request

Send the list of topics and their options to [support](mailto:support@hidora.io), specifying the project and the name of the Kafka instance.

### 4. Check the topics

Once the configuration is applied, list the topics from your client:

```bash
kafka-topics.sh --bootstrap-server <bootstrap-servers> --list
```

**Expected result:**

```console
events
orders
```

To see the details of a topic:

```bash
kafka-topics.sh --bootstrap-server <bootstrap-servers> --describe --topic events
```

**Expected result:**

```console
Topic: events   TopicId: AbC123...   PartitionCount: 6   ReplicationFactor: 3
  Topic: events   Partition: 0   Leader: 1   Replicas: 1,2,0   Isr: 1,2,0
  Topic: events   Partition: 1   Leader: 2   Replicas: 2,0,1   Isr: 2,0,1
  ...
```

## Verification

The configuration is correct if:

- The topics appear in the list (`--list`)
- The number of partitions and the replication factor match your request
- The ISR (In-Sync Replicas) contain the expected number of brokers

## Further reading

- **[Concepts](../concepts.md)**: topics, partitions and replication
- **[How to scale the Kafka cluster](./scale-resources.md)**: adjust broker and ZooKeeper resources
