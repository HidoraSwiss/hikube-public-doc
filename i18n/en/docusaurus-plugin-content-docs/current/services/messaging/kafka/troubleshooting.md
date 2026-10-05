---
sidebar_position: 7
title: Troubleshooting
---

# Troubleshooting — Kafka

:::info Availability
Kafka is not yet available as self-service in the [Hikube console](https://console.hikube.cloud).
To provision an instance or change its configuration, [contact support](mailto:support@hidora.io).
:::

The diagnostics below are run from your Kafka client tools. When an action is needed on the platform side (resources, storage, restart, server logs), [contact support](mailto:support@hidora.io) with the project and the instance name.

### Unable to connect to the cluster

**Cause**: wrong bootstrap server address or port, external access not enabled while the client is outside the platform, or missing client security settings.

**Solution**:

1. Check that you are using the address provided by support.
2. Query the cluster metadata:
   ```bash
   kcat -b <bootstrap-servers> -L
   ```
3. If the command fails from outside the platform, check with support that external access is enabled on the instance.

### ZooKeeper loses quorum

**Cause**: the number of ZooKeeper instances is insufficient or even, or a ZooKeeper volume is full. A quorum requires a strict majority (e.g. 2 nodes out of 3).

**Solution**: this diagnosis and its fix (odd number of instances, larger ZooKeeper storage) are handled on the platform side. Contact support.

### Topic inaccessible or broker unavailable

**Cause**: one or more brokers are not working properly, or the topic does not have enough in-sync replicas relative to `min.insync.replicas`.

**Solution**:

1. Describe the topic from your client to check the leaders and the ISR (In-Sync Replicas):
   ```bash
   kafka-topics.sh --describe --topic <topic-name> --bootstrap-server <bootstrap-servers>
   ```
2. Check that the topic's number of replicas is consistent with the number of brokers.
3. If partitions have no leader or brokers are missing, contact support (broker state, disk space).

### High consumer lag

**Cause**: consumers do not process messages fast enough compared to the production rate. This can be due to too few partitions, too few consumers in the group, or undersized consumers.

**Solution**:

1. Measure the consumer group lag:
   ```bash
   kafka-consumer-groups.sh --describe --group <group-id> --bootstrap-server <bootstrap-servers>
   ```
2. If the lag is spread over many partitions, **increase the number of consumers** in the group (without exceeding the number of partitions).
3. If all partitions have lag, consider **increasing the number of partitions** of the topic. This option is not available in the console; contact support.
4. Check that your consumers have enough resources (CPU, memory) to process the messages.

### Broker restarted due to lack of memory

**Cause**: the broker consumes more memory than its allocated limit. This frequently happens with the `nano` or `micro` presets under load.

**Solution**: request a larger preset or explicit resources for the brokers. This option is not available in the console; contact support.

### Duplicate messages

**Cause**: by default, Kafka works in **at-least-once delivery** mode. When the producer retries or consumers rebalance, messages can be delivered several times.

**Solution**:

1. **Producer side**: enable idempotence to avoid duplicates on retries:
   ```properties title="producer.properties"
   enable.idempotence=true
   acks=all
   ```
2. **Consumer side**: implement a **deduplication** mechanism based on a unique message identifier (key, UUID, etc.).
3. For critical cases, combine `acks=all`, `enable.idempotence=true` on the producer and idempotent processing on the consumer side.

:::tip
Producer idempotence guarantees that a message sent several times (because of network retries) is written only once to the partition. Idempotent processing on the consumer side is still needed to cover rebalancing scenarios.
:::
