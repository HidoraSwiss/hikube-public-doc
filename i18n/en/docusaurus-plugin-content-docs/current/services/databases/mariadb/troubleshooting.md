---
sidebar_position: 7
title: "Troubleshooting — MariaDB"
sidebar_label: Troubleshooting
description: "Fix common MariaDB issues on Hikube: cluster in error, connection refused, Access denied, errors in Manage Access, full disk, replication out of sync."
---

# Troubleshooting — MariaDB

### The cluster stays in "Creating" status

**Cause**: the nodes and their volumes are being provisioned. This can take several minutes, longer with 3 or 5 replicas.

**Solution**:

1. Wait a few minutes and refresh the cluster page.
2. If the status does not change after about fifteen minutes, [contact support](mailto:support@hidora.io), providing the project and the cluster name.

### The cluster changes to "Error" status

**Cause**: the platform could not apply the cluster's creation or its last change. After a change, the cluster may keep running with its previous configuration.

**Solution**: [contact support](mailto:support@hidora.io), providing the project, the cluster name and the change requested.

### Connection refused or timed out

**Cause**: external access is disabled, the IP address has not been assigned yet, or the client is using the wrong address or port.

**Solution**:

1. In the **Connection and network** card, check that the **External** zone contains an address, and not **Disabled** or "Waiting for allocation…". From a VM of the project, use the host in the **Internal** zone instead.
2. Use port `3306` and test connectivity:
   ```bash
   mysqladmin -h <host> -P 3306 -u <user> -p ping
   ```
3. Check that no outbound firewall on your network blocks port `3306`.

### `Access denied for user`

**Cause**: wrong password or password revoked by a rotation, or user without rights on the specified database.

**Solution**:

1. In the user list, check the **Databases** column: the user must have access to the database in use.
2. Add the access via **Actions** → **Manage Access** if necessary.
3. If in doubt about the password, generate a new one via **Actions** → **Change Password** and update your applications.

### Error when adding an access or a user

**Cause**: the database name or username does not follow the naming rules, or the access targets a system database (`mysql`, `information_schema`, `performance_schema`, `sys`).

**Solution**: use only lowercase letters, digits and hyphens, starting with a letter and ending with a letter or a digit. Underscores (`_`) and uppercase letters are not accepted. Grant access to an application database, never to a system database. See [MariaDB concepts](./concepts.md#naming-rules).

### A `mysql` line is shown in error in "Manage Access"

**Cause**: the user was created with the cluster creation wizard before console v1.3.0, which gave it a role on the `mysql` system database. A system database can no longer receive access, and updating the user is refused as long as this line is present.

**Solution**: remove the `mysql` line, add the user's application database if needed, then click **Save**. The "Access updated" message confirms the change.

### Disk space full

**Cause**: the data volume (including binary logs) has reached the **Allocated Size**.

**Solution**:

1. Measure the space used per database:
   ```sql
   SELECT table_schema, ROUND(SUM(data_length + index_length) / 1024 / 1024, 1) AS size_mb
   FROM information_schema.tables
   GROUP BY table_schema;
   ```
2. Increase the **Disk size (GB)** via **Edit**, within the project's storage quota. The size cannot be reduced afterwards. See [Scale resources](./how-to/scale-resources.md).
3. Delete obsolete data, then optimize the tables concerned (`OPTIMIZE TABLE`).

### Replication out of sync

**Cause**: a replica can no longer keep up with the primary (high write load, insufficient resources, infrastructure incident).

**Solution**: resynchronizing a replica is not offered in the console. [Contact support](mailto:support@hidora.io), providing the project and the cluster name.
