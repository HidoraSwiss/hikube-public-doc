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

The **Preset** sets the CPU and memory of each node. Presets are the [virtual machine](../../compute/overview.md) sizes of the `u1`, `s1` and `m1` series: a preset has the same resources as the VM of the same name.

| **Preset** | **CPU** | **Memory** |
|------------|---------|------------|
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
