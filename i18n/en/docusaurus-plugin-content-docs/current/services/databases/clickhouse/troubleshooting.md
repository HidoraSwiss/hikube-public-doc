---
sidebar_position: 7
title: Troubleshooting
---

# Troubleshooting — ClickHouse

### ClickHouse Keeper unstable (even number of replicas)

**Cause**: the number of ClickHouse Keeper replicas is even (2, 4, etc.), which prevents quorum maintenance. The Raft protocol requires a strict majority to elect a leader, and an even number of nodes does not guarantee this majority in case of a network partition.

**Solution**:

1. Check the current number of Keeper replicas:
   ```bash
   kubectl get pods -l app=clickhouse-keeper-<name>
   ```
2. Change the number of replicas to use an **odd** number (3 or 5):
   ```yaml title="clickhouse.yaml"
   spec:
     clickhouseKeeper:
       enabled: true
       replicas: 3    # Always odd
   ```
3. Apply the change:
   ```bash
   kubectl apply -f clickhouse.yaml
   ```
4. Check the Keeper logs to confirm the quorum is restored:
   ```bash
   kubectl logs -l app=clickhouse-keeper-<name>
   ```

### Slow queries on large volumes

**Cause**: the sharding configuration is not optimal, tables are not using the right engines, or allocated resources are insufficient.

**Solution**:

1. Verify that you are using **Distributed** tables to spread queries across all shards.
2. Make sure local tables use the `ReplicatedMergeTree` engine with an `ORDER BY` adapted to your most frequent queries.
3. Increase the number of shards to distribute the load:
   ```yaml title="clickhouse.yaml"
   spec:
     shards: 4    # Increase the number of shards
   ```
4. Check allocated resources and increase if needed:
   ```bash
   kubectl top pod -l app=clickhouse-<name>
   ```
5. Analyze slow queries via the system `query_log`:
   ```sql
   SELECT query, elapsed, read_rows, memory_usage
   FROM system.query_log
   WHERE type = 'QueryFinish'
   ORDER BY elapsed DESC
   LIMIT 10;
   ```

### Insufficient disk space

**Cause**: the data volume exceeds the PVC size, or system logs (`query_log`, `query_thread_log`) are accumulating too much data.

**Solution**:

1. Increase the data volume size:
   ```yaml title="clickhouse.yaml"
   spec:
     size: 50Gi    # Increase from the current value
   ```
2. Also check the log volume size and adjust if needed:
   ```yaml title="clickhouse.yaml"
   spec:
     logStorageSize: 5Gi    # Increase if logs are saturating
   ```
3. Reduce system log retention via `logTTL`:
   ```yaml title="clickhouse.yaml"
   spec:
     logTTL: 7    # Reduce from 15 to 7 days for example
   ```
4. Review your application data retention policies and drop obsolete partitions.

### ClickHouse pod stuck in Pending state

**Cause**: the PersistentVolumeClaim (PVC) cannot bind to a volume, usually because of a non-existent `storageClass` or exceeded resource quota.

**Solution**:

1. Check the pod status and associated events:
   ```bash
   kubectl describe pod clickhouse-<name>-0-0
   ```
2. Check the PVC status:
   ```bash
   kubectl get pvc -l app=clickhouse-<name>
   ```
3. Make sure the `storageClass` exists:
   ```bash
   kubectl get storageclass
   ```
4. Check that resource quotas (CPU, memory, storage) have not been reached.
5. Fix the configuration in your manifest and reapply:
   ```bash
   kubectl apply -f clickhouse.yaml
   ```

### Cross-shard replication failed

**Cause**: ClickHouse Keeper is not functional, the network between pods is unstable, or the replicas configuration per shard is incorrect.

**Solution**:

1. Check that ClickHouse Keeper is operational:
   ```bash
   kubectl get pods -l app=clickhouse-keeper-<name>
   ```
2. Check the Keeper logs to identify errors:
   ```bash
   kubectl logs -l app=clickhouse-keeper-<name>
   ```
3. Verify network connectivity between ClickHouse pods:
   ```bash
   kubectl exec clickhouse-<name>-0-0 -- clickhouse-client --query "SELECT * FROM system.clusters"
   ```
4. Make sure the replicas configuration is consistent:
   ```yaml title="clickhouse.yaml"
   spec:
     shards: 2
     replicas: 3    # Each shard must have the same number of replicas
     clickhouseKeeper:
       enabled: true
       replicas: 3
   ```
5. If Keeper is unstable, restart the Keeper pods and wait for quorum stabilization.
