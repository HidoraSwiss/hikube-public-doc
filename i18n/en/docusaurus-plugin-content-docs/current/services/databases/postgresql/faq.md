---
sidebar_position: 6
title: "FAQ — PostgreSQL"
sidebar_label: FAQ
description: "Answers to common questions about PostgreSQL on Hikube: presets, replicas, connection address, lost password, rejected names, extensions and backups."
---

# FAQ — PostgreSQL

### Which instance presets are available?

The **Instance preset** sets the CPU and memory of each node of the cluster. Presets are the [virtual machine](../../compute/overview.md) sizes of the `u1`, `s1` and `m1` series: a preset has the same resources as the VM of the same name. The list displayed by the wizard is authoritative:

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

The preset can be changed after creation from **Edit**. Defining custom CPU/memory values is not offered in the console; contact support.

### How many replicas should I choose?

- **1 (Standalone)**: development and testing. A failure of the instance makes the database unavailable until it restarts.
- **2 (High Availability)**: a standby ready to take over if the primary fails.
- **3 (Max High Availability)**: recommended for critical production.

The number of replicas cannot be changed after creation; contact support if you need to change it.

### Where can I find the connection address?

On the cluster page, in the **Connection and Databases** card. The **Internal** zone always shows the internal host; the **External** zone shows the public address when **External Access** is enabled, **Disabled** otherwise. The port is `5432`.

### How do I connect from a VM or a Kubernetes cluster in the same project without external access?

Use the host in the **Internal** zone, on port `5432`: it is reachable from the project's VMs and Kubernetes clusters, without external access, but not from another project. Copy the full name; on a Debian 13 VM, see [Reaching a managed service in the project](../../compute/how-to/configure-network.md#reaching-a-managed-service-in-the-project).

### I lost a user's password. How do I recover it?

Passwords are displayed only once and cannot be read again. Generate a new one: **Users** tab → **Actions** → **Change Password** → **Perform rotation**. The old password is revoked immediately.

### Why is my username rejected?

PostgreSQL usernames are 3 to 16 characters long, made of lowercase letters, digits and underscores (`_`), and start with a letter or an underscore. The hyphen (`-`) is not accepted. The names `postgres`, `admin`, `root`, `owner`, `superuser`, `streaming_replica` and all those starting with `pg_` are reserved.

### Why is my database name rejected?

A database name is 1 to 54 characters long: lowercase letters, digits, underscores (`_`) and hyphens (`-`). It starts with a letter or an underscore, but not with `pg_`. The system databases `postgres`, `template0` and `template1` cannot be created.

### Why is a right on the `postgres` database locked?

`postgres`, `template0` and `template1` are system databases, reserved for the platform: no right can be granted or changed on them anymore. The cluster creation wizard used to preselect the `postgres` database for users; the rights granted this way are kept. In **Manage Access**, such a row is shown locked, with a warning: remove it, then give the user access to an application database.

### How do I add PostgreSQL extensions?

When creating a database (**Databases** tab → **Create**, **PostgreSQL Extensions** section) or later, via **Actions** → **Manage extensions**. The extensions offered include `pg_stat_statements`, `pgcrypto`, `uuid-ossp`, `pg_trgm`, `hstore`, `citext`, `postgres_fdw`, `pgaudit` and `vector` (pgvector).

### Can I create several databases and users?

Yes. Add as many databases as needed in the **Databases** tab, and as many users as needed in the **Users** tab. Each user can have a different right on each database (**Administrator (Admin)** or **Read-only**).

### Can I change PostgreSQL parameters (`max_connections`, `shared_buffers`…)?

These parameters are not offered in the console; contact support.

### Are backups available?

Yes, from the **Backups** tab of the cluster page: scheduling, on-demand backup and restore, including to a point in time. See [Configure backups](./how-to/configure-backups.md) and the [backup service](../../backups/overview.md).
