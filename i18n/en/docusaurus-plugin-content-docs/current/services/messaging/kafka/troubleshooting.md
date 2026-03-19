---
sidebar_position: 7
title: Troubleshooting
---

# Troubleshooting — Kafka

### ZooKeeper loses quorum

**Cause**: the number of ZooKeeper replicas is insufficient or even, preventing the formation of a majority quorum. A quorum requires a strict majority (e.g., 2/3 nodes).

**Solution**:

1. Check the configured ZooKeeper replicas count:
   ```bash
   kubectl get kafka -o yaml | grep -A 5 zookeeper
   ```
2. Ensure `zookeeper.replicas` is an **odd number** (3, 5, or 7)
3. Check ZooKeeper pod status:
   ```bash
   kubectl get pods -l app.kubernetes.io/component=zookeeper
   ```
4. Check available disk space on ZooKeeper volumes — a full disk causes quorum loss:
   ```bash
   kubectl exec <zookeeper-pod> -- df -h /data
   ```
5. If needed, increase `zookeeper.size` in your manifest and reapply it

### Topic inaccessible or broker unavailable

**Cause**: one or more Kafka brokers are not functioning properly, or the topic does not have enough synchronized replicas relative to `min.insync.replicas`.

**Solution**:

1. Check Kafka pod status:
   ```bash
   kubectl get pods -l app.kubernetes.io/component=kafka
   ```
2. Inspect events on a failing pod:
   ```bash
   kubectl describe pod <kafka-pod>
   ```
3. Verify that the topic's replica count is consistent with the number of available brokers:
   ```bash
   kubectl exec <kafka-pod> -- kafka-topics.sh --describe --topic <topic-name> --bootstrap-server localhost:9092
   ```
4. Check storage space — a full volume prevents the broker from operating:
   ```bash
   kubectl exec <kafka-pod> -- df -h /bitnami/kafka
   ```

### Significant consumer lag

**Cause**: consumers are not processing messages fast enough compared to the production rate. This can be due to insufficient partitions, too few consumers in the group, or under-provisioned consumers.

**Solution**:

1. Identify consumer group lag:
   ```bash
   kubectl exec <kafka-pod> -- kafka-consumer-groups.sh --describe --group <group-id> --bootstrap-server localhost:9092
   ```
2. If lag is spread across many partitions, **increase the number of consumers** in the group (without exceeding the number of partitions)
3. If all partitions have lag, consider **increasing the number of partitions** for the topic:
   ```yaml title="kafka.yaml"
   topics:
     - name: events
       partitions: 12
       replicas: 3
   ```
4. Verify that consumers have sufficient resources (CPU, memory) to process messages

### Broker OOMKilled

**Cause**: the Kafka broker consumes more memory than the allocated limit. This frequently occurs with the `nano` or `micro` preset under load.

**Solution**:

1. Check pod events to confirm the OOMKill:
   ```bash
   kubectl describe pod <kafka-pod> | grep -A 5 "Last State"
   ```
2. Increase broker memory resources using a higher preset or explicit resources:
   ```yaml title="kafka.yaml"
   kafka:
     replicas: 3
     resources:
       cpu: 2000m
       memory: 4Gi
     size: 20Gi
   ```
3. Reapply the manifest:
   ```bash
   kubectl apply -f kafka.yaml
   ```

### Duplicate messages

**Cause**: by default, Kafka operates in **at-least-once delivery** mode. In case of producer retries or consumer rebalancing, messages may be delivered multiple times.

**Solution**:

1. **Producer side**: enable idempotence to avoid duplicates during retries:
   ```
   enable.idempotence=true
   acks=all
   ```
2. **Consumer side**: implement a **deduplication** mechanism based on a unique message identifier (key, UUID, etc.)
3. For critical use cases, combine `acks=all` and `enable.idempotence=true` on the producer with idempotent processing on the consumer side

:::tip
Producer idempotence ensures that a message sent multiple times (due to network retries) is written only once to the partition. Idempotent processing on the consumer side remains necessary to cover rebalancing scenarios.
:::
