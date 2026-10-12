---
sidebar_position: 6
title: FAQ
---

# FAQ — MongoDB

### Which version should I choose?

The wizard offers **6.0**, **7.0** and **8.0** (default). Choose the most recent one for a new project. For a migration, start from the version of your current environment, then upgrade one version at a time from **Edit**. A version cannot be downgraded.

### How many replicas should I choose?

- **1 (Standalone)**: development and testing, no fault tolerance.
- **3 (Max High Availability)**: recommended in production; the cluster stays available if one member goes down.
- **5 (Ultra High Availability)**: tolerates the loss of two members.

The number of replicas cannot be changed after creation.

### When should I enable sharding?

When the data volume or write throughput exceeds what a single replica set can absorb. Sharding is decided at creation and multiplies the resources consumed (2 shards, configuration servers and Mongos routers). For most applications, a replica set is enough. See [Configure sharding](./how-to/configure-sharding.md).

### Which presets are available?

| **Preset** | **CPU** | **Memory** |
|------------|---------|------------|
| `nano`     | 250m    | 128Mi      |
| `micro`    | 500m    | 256Mi      |
| `small`    | 1       | 512Mi      |
| `medium`   | 1       | 1Gi        |
| `large`    | 2       | 2Gi        |
| `xlarge`   | 4       | 4Gi        |
| `2xlarge`  | 8       | 8Gi        |

The list displayed by the wizard is authoritative. The preset cannot be changed after creation.

### Where can I find the connection address?

In the **Network and Connection** card of the cluster page, when **External Access** is enabled: **Host** field for a sharded cluster, **Replica set rs0 members** list and **External connection string** for a replica set. The port is `27017`. On a replica set, connect to one member with `directConnection=true`, without the `replicaSet` parameter. Without external access, the field shows **Not defined**: the cluster remains reachable from the project's VMs and Kubernetes clusters through an internal address, which the console does not display; [contact support](mailto:support@hidora.io) to obtain it.

### Why doesn't the user created in the wizard have access to my database?

The **Role** chosen in the wizard applies to the **Database** entered for that user, and to it alone. Grant access to your other databases via **Manage Access**. See [Manage users and databases](./how-to/manage-users-databases.md).

Users created before console v1.3.0 received their role on the `admin` system database. In **Manage Access**, remove the `admin` line, shown in error, and add their application database.

### Why can't I save a user?

A MongoDB user must have access to at least one database: otherwise, the console displays "Please grant access to at least one database.". The system databases `admin`, `local` and `config` are refused. Also check the naming rules: lowercase letters, digits and hyphens only, no underscores; 3 to 16 characters for a username.

### I lost a user's password. How can I recover it?

It cannot be read back. Generate a new one: **Actions** → **Change Password** → **Perform rotation**. The old password is revoked immediately.

### Are backups available?

Backup configuration and restore are not offered in the console; [contact support](mailto:support@hidora.io). You can make a logical export with `mongodump` at any time:

```bash
mongodump --uri "mongodb://<user>@<host>:27017/myapp?authSource=admin" --out ./dump-$(date +%F)
```
