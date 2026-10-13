---
sidebar_position: 6
title: FAQ
---

# FAQ — MariaDB

### Are my MySQL applications compatible?

Yes. **MariaDB** is an open source fork of MySQL, compatible with the MySQL protocol and syntax. The `mysql` and `mysqldump` clients and MySQL connectors (JDBC, PDO, `mysql2`, etc.) work without modification. This service was previously presented in this documentation under the name "MySQL".

### Which version should I choose?

The wizard offers versions **10.6**, **10.11**, **11.4** and **11.8**. Choose the most recent one for a new project, or the version closest to your current environment for a migration. The version can be upgraded after creation from **Edit**; it cannot be downgraded.

### Which presets are available?

The **Preset** sets the CPU and memory of each node. Presets are the [virtual machine](../../compute/overview.md) sizes of the `u1`, `s1` and `m1` series: a preset has the same resources as the VM of the same name. The list displayed by the wizard is authoritative:

| **Preset** | **CPU** | **Memory** |
|------------|---------|-------------|
| `u1.medium` | 1 | 4Gi |
| `u1.large` | 2 | 8Gi |
| `u1.xlarge` | 4 | 16Gi |
| `u1.2xlarge` | 8 | 32Gi |
| `u1.4xlarge` | 16 | 64Gi |
| `u1.8xlarge` | 32 | 128Gi |
| `s1.small` | 1 | 2Gi |
| `s1.medium` | 2 | 4Gi |
| `s1.large` | 4 | 8Gi |
| `s1.xlarge` | 8 | 16Gi |
| `s1.2xlarge` | 16 | 32Gi |
| `s1.4xlarge` | 32 | 64Gi |
| `m1.large` | 2 | 16Gi |
| `m1.xlarge` | 4 | 32Gi |
| `m1.2xlarge` | 8 | 64Gi |
| `m1.4xlarge` | 16 | 128Gi |
| `m1.8xlarge` | 32 | 256Gi |

:::warning
The preset cannot be changed after creation. Size it accordingly, or contact support to change it.
:::

### How does replication work?

The primary writes its changes to the binary log, which the replicas replay. If the primary fails, the platform automatically promotes a replica. Choose **3 (Max High Availability)** or **5 (Ultra High Availability)** replicas at creation to benefit from this: this number cannot be changed afterwards.

### Where can I find the connection address?

In the **Connection and network** card of the cluster page, **Host** field, when **External Access** is enabled. The port is `3306`. Without external access, the field shows **Not defined**: the cluster remains reachable from the project's VMs and Kubernetes clusters through an internal address, which the console does not display; [contact support](mailto:support@hidora.io) to obtain it.

### How do I create a database?

Grant a user access to the database name (**Manage Access** → **Specific Access (Databases)** → **Add**), or enter it as a user's **Database** in the **Users** step of the cluster creation wizard. The database is created if it does not exist. System database names (`mysql`, `information_schema`, `performance_schema`, `sys`) are refused. See [Manage users and databases](./how-to/manage-users-databases.md).

### Why does the user created in the wizard not have access to my database?

The **Role** chosen in the wizard applies to the **Database** entered for that user, and to it alone. Grant access to your other databases via **Manage Access**.

Users created before console v1.3.0 received their role on the `mysql` system database. In **Manage Access**, remove the `mysql` line, shown in error, and add their application database.

### I lost a user's password. How do I recover it?

It cannot be read again. Generate a new one: **Actions** → **Change Password** → **Perform rotation**. The old password is revoked immediately.

### Can I limit the number of connections per user or change server parameters?

These settings are not offered in the console; contact support.

### Are backups available?

Backup configuration and restore are not offered in the console; contact support. See [Configure backups](./how-to/configure-backups.md).
