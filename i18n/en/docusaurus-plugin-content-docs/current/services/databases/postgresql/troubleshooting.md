---
sidebar_position: 7
title: Troubleshooting
---

# Troubleshooting — PostgreSQL

### The cluster stays in "Creating" status

**Cause**: the instances and their volumes are being provisioned. This can take several minutes, longer with several replicas.

**Solution**:

1. Wait a few minutes and refresh the cluster page.
2. If the status does not change after about fifteen minutes, or changes to **Error** or **Failed**, [contact support](mailto:support@hidora.io), providing the project and the cluster name.

### Unable to get past the wizard's Configuration step

**Cause**: the requested configuration exceeds the project quotas (CPU, memory or storage). The message "Storage quota exceeded for this project" may appear under the **Disk size (GB)** field.

**Solution**:

1. Check the quota banner at the top of the wizard.
2. Reduce the **Instance preset**, the **Disk size (GB)** or the **Number of replicas**: consumption is multiplied by the number of replicas.
3. If the project needs additional quotas, contact support.

### Connection refused or timed out

**Cause**: external access is disabled, the IP address has not been assigned yet, or the client is using the wrong address or port.

**Solution**:

1. On the cluster page, check that the **External Access** card shows **Enabled**. Otherwise, enable it via **Edit**.
2. Check that the **Host** field contains an address and not **Not defined**.
3. Use port `5432` and test connectivity:
   ```bash
   pg_isready -h <host> -p 5432
   ```
4. Check that no outbound firewall on your network blocks port `5432`.

### Authentication rejected (`password authentication failed`)

**Cause**: wrong password or password revoked by a rotation, or user without rights on the target database.

**Solution**:

1. In the **Users** tab, check that the user exists and has access to the database in use (**Databases** column).
2. If necessary, add the access via **Actions** → **Manage Access**.
3. If the password has been lost or has changed, generate a new one via **Actions** → **Change Password**, then update your applications.

### Permission denied on a table (`permission denied`)

**Cause**: the user has the **Read-only** right on the database, or has no access to this database.

**Solution**: via **Actions** → **Manage Access**, grant the **Administrator (Admin)** right on the database concerned, then reconnect.

### Slow performance

**Cause**: the allocated resources are insufficient for the load, or some queries are not optimized.

**Solution**:

1. Enable the `pg_stat_statements` extension on the database (**Actions** → **Manage extensions**) and identify the most expensive queries:
   ```sql
   SELECT query, calls, mean_exec_time
   FROM pg_stat_statements
   ORDER BY mean_exec_time DESC
   LIMIT 10;
   ```
2. Add the missing indexes.
3. If resources are saturated, switch to a higher preset via **Edit**. See [Scale resources](./how-to/scale-resources.md).
4. To tune PostgreSQL parameters (`shared_buffers`, `work_mem`, `max_connections`), contact support: these parameters are not offered in the console.

### Disk full

**Cause**: the data volume has reached the **Allocated Size**.

**Solution**: increase the **Disk size (GB)** via **Edit**, within the project's storage quota. If needed, delete obsolete data and run `VACUUM` to reclaim space.
