---
sidebar_position: 7
title: Troubleshooting
---

# Troubleshooting — ClickHouse

:::info Availability
ClickHouse is not yet available as self-service in the [Hikube console](https://console.hikube.cloud).
To provision an instance or change its configuration, [contact support](mailto:support@hidora.io).
:::

### Slow queries on large volumes

**Cause**: tables do not use the right engines or a suitable `ORDER BY`, the topology is not optimal, or the allocated resources are insufficient.

**Solution**:

1. On a sharded instance, query **Distributed** tables to spread queries across all shards.
2. Make sure local tables use `ReplicatedMergeTree` with an `ORDER BY` suited to your most frequent filters.
3. Analyze slow queries through the system log:
   ```sql
   SELECT query, elapsed, read_rows, memory_usage
   FROM system.query_log
   WHERE type = 'QueryFinish'
   ORDER BY elapsed DESC
   LIMIT 10;
   ```
4. If resources are saturated, ask [support](mailto:support@hidora.io) for a larger preset or additional shards. See [Scale vertically](./how-to/scale-resources.md).

### Insufficient disk space

**Cause**: the data volume exceeds the storage size, or the system logs (`query_log`, `query_thread_log`) accumulate too much data.

**Solution**:

1. Identify the largest tables:
   ```sql
   SELECT database, table, formatReadableSize(sum(bytes_on_disk)) AS size
   FROM system.parts
   WHERE active
   GROUP BY database, table
   ORDER BY sum(bytes_on_disk) DESC;
   ```
2. Drop obsolete partitions of your application data (`ALTER TABLE ... DROP PARTITION`) or set a `TTL` on your tables.
3. To increase storage or the log volume size, or to reduce log retention, contact support.

### Replication errors or Keeper unavailable

**Cause**: ClickHouse Keeper has lost its quorum, or a replica can no longer synchronize.

**Solution**:

1. Check the state of replicated tables:
   ```sql
   SELECT database, table, is_readonly, absolute_delay, queue_size
   FROM system.replicas
   WHERE is_readonly OR absolute_delay > 60;
   ```
2. A read-only replica (`is_readonly = 1`) usually indicates lost contact with Keeper. [Contact support](mailto:support@hidora.io) with the project, the instance name and the query result.

### Authentication refused

**Cause**: wrong user or password, or a read-only user attempting a write (`Not enough privileges`).

**Solution**: check the credentials you received and the user's access level (`SHOW GRANTS`). To create a user or change its rights, contact support. See [Manage users](./how-to/manage-users.md).
