---
sidebar_position: 6
title: FAQ
---

# FAQ — PostgreSQL

### Which instance presets are available?

The **Instance preset** sets the CPU and memory of each node of the cluster. The list displayed by the wizard is authoritative; for reference:

| **Preset** | **CPU** | **Memory** |
|------------|---------|-------------|
| `nano`     | 250m    | 128Mi       |
| `micro`    | 500m    | 256Mi       |
| `small`    | 1       | 512Mi       |
| `medium`   | 1       | 1Gi         |
| `large`    | 2       | 2Gi         |
| `xlarge`   | 4       | 4Gi         |
| `2xlarge`  | 8       | 8Gi         |

The preset can be changed after creation from **Edit**. Defining custom CPU/memory values is not offered in the console; contact support.

### How many replicas should I choose?

- **1 (Standalone)**: development and testing. A failure of the instance makes the database unavailable until it restarts.
- **2 (High Availability)**: a standby ready to take over if the primary fails.
- **3 (Max High Availability)**: recommended for critical production.

The number of replicas cannot be changed after creation; contact support if you need to change it.

### Where can I find the connection address?

On the cluster page, in the **Connection and Databases** card, **Host** field. An address appears there only if **External Access** is enabled; otherwise the field shows **Not defined**. The port is `5432`.

### How do I connect from a VM or a Kubernetes cluster in the same project without external access?

Without external access, the cluster remains reachable from the project's VMs through an address internal to the project, which the console does not display. [Contact support](mailto:support@hidora.io) to obtain it.

### I lost a user's password. How do I recover it?

Passwords are displayed only once and cannot be read again. Generate a new one: **Users** tab → **Actions** → **Change Password** → **Perform rotation**. The old password is revoked immediately.

### Why is my username rejected?

PostgreSQL usernames are 3 to 16 characters long, made of lowercase letters, digits and underscores (`_`), and start with a letter or an underscore. The hyphen (`-`) is not accepted. The names `postgres`, `admin`, `root`, `owner`, `superuser`, `streaming_replica`, `cnpg_pooler_pgbouncer` and all those starting with `pg_` are reserved.

### How do I add PostgreSQL extensions?

When creating a database (**Databases** tab → **Create**, **PostgreSQL Extensions** section) or later, via **Actions** → **Manage extensions**. The extensions offered include `pg_stat_statements`, `pgcrypto`, `uuid-ossp`, `pg_trgm`, `hstore`, `citext`, `postgres_fdw`, `pgaudit` and `vector` (pgvector).

### Can I create several databases and users?

Yes. Add as many databases as needed in the **Databases** tab, and as many users as needed in the **Users** tab. Each user can have a different right on each database (**Administrator (Admin)** or **Read-only**).

### Can I change PostgreSQL parameters (`max_connections`, `shared_buffers`…)?

These parameters are not offered in the console; contact support.

### Are backups available?

Backup configuration and restore are not offered in the console; contact support. See [Configure backups](./how-to/configure-backups.md).
