---
sidebar_position: 7
title: Troubleshooting
---

# Troubleshooting — PostgreSQL

### PostgreSQL pod stuck in Pending state

**Cause**: the PersistentVolumeClaim (PVC) cannot bind to a volume. This can be due to a non-existent `storageClass`, exceeded storage quota, or insufficient resources on the nodes.

**Solution**:

1. Check the pod status and associated events:
   ```bash
   kubectl describe pod pg-<name>-1
   ```
2. Check the PVC status:
   ```bash
   kubectl get pvc
   kubectl describe pvc pg-<name>-1
   ```
3. Make sure the `storageClass` used is one of the available classes: `local`, `replicated`, or `replicated-async`.
4. Check that your storage quota has not been reached.
5. If needed, fix the `storageClass` in your manifest and reapply:
   ```bash
   kubectl apply -f postgresql.yaml
   ```

### Replication desynchronized between primary and standby

**Cause**: replication lag can occur due to high network load, insufficient resources on standby nodes, or a high volume of transactions on the primary.

**Solution**:

1. Connect to the primary and check the replication status:
   ```sql
   SELECT client_addr, state, sent_lsn, write_lsn, flush_lsn, replay_lsn
   FROM pg_stat_replication;
   ```
2. Compare LSN positions between `sent_lsn` and `replay_lsn`. A large gap indicates lag.
3. Check the resources allocated to standby nodes (CPU, memory). If needed, increase the `resourcesPreset` or explicit `resources`.
4. Check network connectivity between pods:
   ```bash
   kubectl logs pg-<name>-2
   ```
5. If lag persists, consider reducing the write load on the primary or increasing resources.

### Connection refused to PostgreSQL

**Cause**: pods are not running, the Secret name is incorrect, or the service is not accessible.

**Solution**:

1. Check that PostgreSQL pods are in `Running` state:
   ```bash
   kubectl get pods -l app=pg-<name>
   ```
2. Check that the service exists and points to the correct endpoints:
   ```bash
   kubectl get svc pg-<name>-rw
   kubectl get endpoints pg-<name>-rw
   ```
3. Make sure you are using the correct Secret name for credentials. The pattern is `pg-<name>-app`:
   ```bash
   kubectl get tenantsecret pg-<name>-app
   ```
4. Test the connection from a pod in the same namespace:
   ```bash
   kubectl run test-pg --rm -it --image=postgres:16 -- psql -h pg-<name>-rw -p 5432 -U <user>
   ```

### PITR restore failed

**Cause**: bootstrap parameters are misconfigured. The `bootstrap.oldName` field must match exactly the name of the original instance, and the new instance name must be different.

**Solution**:

1. Verify that `bootstrap.oldName` matches exactly the name of the original PostgreSQL instance:
   ```yaml title="postgresql-restore.yaml"
   apiVersion: apps.cozystack.io/v1alpha1
   kind: Postgres
   metadata:
     name: restored-db       # Must be a new name
   spec:
     bootstrap:
       enabled: true
       oldName: "original-db"  # Exact name of the old instance
       recoveryTime: "2025-06-15T14:30:00Z"  # RFC 3339 format
   ```
2. The `recoveryTime` must be in **RFC 3339** format (e.g., `2025-06-15T14:30:00Z`). If left empty, the restore will use the latest available state.
3. The name in `metadata.name` must be **different** from `bootstrap.oldName`.
4. Make sure the backups from the original instance are still accessible in the S3 storage.

### Slow performance

**Cause**: PostgreSQL parameters are not tuned for the workload, or allocated resources are insufficient.

**Solution**:

1. Adjust PostgreSQL parameters in your manifest:
   ```yaml title="postgresql.yaml"
   spec:
     postgresql:
       parameters:
         shared_buffers: 512MB       # ~25% of allocated RAM
         work_mem: 64MB              # Memory per sort operation
         max_connections: 200        # Adjust based on load
         effective_cache_size: 1536MB  # ~75% of RAM
   ```
2. Check that the `resourcesPreset` is suitable for your workload:
   - Development: `nano` or `micro`
   - Production: `medium`, `large` or higher
3. Monitor resource usage:
   ```bash
   kubectl top pod pg-<name>-1
   ```
4. If queries are slow, identify them with `pg_stat_statements` and optimize indexes.
5. Increase resources if needed by switching to a higher preset or defining explicit `resources`.
