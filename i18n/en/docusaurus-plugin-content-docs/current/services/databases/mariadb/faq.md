---
sidebar_position: 6
title: FAQ
---

# FAQ — MariaDB

### Are my MySQL applications compatible?

Yes. **MariaDB** is an open source fork of MySQL, compatible with the MySQL protocol and syntax. The `mysql` and `mysqldump` clients and MySQL connectors (JDBC, PDO, `mysql2`, etc.) work without modification. This service was previously presented in this documentation under the name "MySQL".

### Which version should I choose?

The wizard offers versions **10.6**, **10.11**, **11.4** and **11.8**. Choose the most recent one for a new project, or the version closest to your current environment for a migration. The version can be changed after creation from **Edit**.

### Which presets are available?

The **Preset** sets the CPU and memory of each node. The list displayed by the wizard is authoritative; for reference:

| **Preset** | **CPU** | **Memory** |
|------------|---------|-------------|
| `nano`     | 250m    | 128Mi       |
| `micro`    | 500m    | 256Mi       |
| `small`    | 1       | 512Mi       |
| `medium`   | 1       | 1Gi         |
| `large`    | 2       | 2Gi         |
| `xlarge`   | 4       | 4Gi         |
| `2xlarge`  | 8       | 8Gi         |

:::warning
The preset cannot be changed after creation. Size it accordingly, or contact support to change it.
:::

### How does replication work?

The primary writes its changes to the binary log, which the replicas replay. If the primary fails, the platform automatically promotes a replica. Choose **3 (Max High Availability)** or **5 (Ultra High Availability)** replicas at creation to benefit from this: this number cannot be changed afterwards.

### Where can I find the connection address?

In the **Connection and network** card of the cluster page, **Host** field, when **External Access** is enabled. The port is `3306`. Without external access, the field shows **Not defined**: the cluster remains reachable from the project's VMs through an internal address, which the console does not display; [contact support](mailto:support@hidora.io) to obtain it.

### How do I create a database?

Grant a user access to the database name (**Manage Access** → **Specific Access (Databases)** → **Add**). The database is created if it does not exist. See [Manage users and databases](./how-to/manage-users-databases.md).

### Why does the user created in the wizard not have access to my database?

The **Role** chosen in the cluster creation wizard applies to the `mysql` system database. Then grant access to your application databases via **Manage Access**.

### I lost a user's password. How do I recover it?

It cannot be read again. Generate a new one: **Actions** → **Change Password** → **Perform rotation**. The old password is revoked immediately.

### Can I limit the number of connections per user or change server parameters?

These settings are not offered in the console; contact support.

### Are backups available?

Backup configuration and restore are not offered in the console; contact support. See [Configure backups](./how-to/configure-backups.md).
