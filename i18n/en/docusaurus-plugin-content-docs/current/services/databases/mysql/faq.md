---
sidebar_position: 6
title: FAQ
---

# FAQ — MySQL

### Why does Hikube use MariaDB for the MySQL service?

The MySQL service on Hikube is based on **MariaDB**, deployed via the **MariaDB Operator**. MariaDB is an open-source fork of MySQL, fully compatible with the MySQL protocol and syntax. This choice guarantees:

- **Full compatibility** with existing MySQL clients and applications
- An active and transparent **open-source** development
- Advanced features (column compression, Aria engine, etc.)

Your MySQL applications work without modification with the Hikube MySQL service.

### What is the difference between `resourcesPreset` and `resources`?

The `resourcesPreset` field lets you choose a predetermined resource profile for each MySQL replica. If the `resources` field (explicit CPU/memory) is defined, `resourcesPreset` is **completely ignored**.

| **Preset** | **CPU** | **Memory** |
|------------|---------|------------|
| `nano`     | 250m    | 128Mi      |
| `micro`    | 500m    | 256Mi      |
| `small`    | 1       | 512Mi      |
| `medium`   | 1       | 1Gi        |
| `large`    | 2       | 2Gi        |
| `xlarge`   | 4       | 4Gi        |
| `2xlarge`  | 8       | 8Gi        |

```yaml title="mysql.yaml"
spec:
  # Using a preset
  resourcesPreset: small

  # OR explicit configuration (the preset is then ignored)
  resources:
    cpu: 2000m
    memory: 2Gi
```

### How does MySQL replication work on Hikube?

MySQL replication on Hikube uses **binlog replication** (binary log) managed by the MariaDB Operator:

- One node is designated as the **primary** (read-write)
- Other nodes are **replicas** (read-only)
- Automatic failover (**auto-failover**) is managed by the operator in case of primary failure

With 3 replicas, you get 1 primary + 2 replicas, which ensures high availability.

### How to configure backups with Restic?

MySQL backups use **Restic** for encryption and compression. Configure the `backup` section with S3-compatible storage:

```yaml title="mysql.yaml"
spec:
  backup:
    enabled: true
    s3Region: eu-central-1
    s3Bucket: s3.example.com/mysql-backups
    schedule: "0 3 * * *"
    cleanupStrategy: "--keep-last=7 --keep-daily=7 --keep-weekly=4"
    s3AccessKey: your-access-key
    s3SecretKey: your-secret-key
    resticPassword: your-restic-password
```

:::warning
Keep the `resticPassword` in a safe place. Without this password, backups cannot be decrypted.
:::

### How to perform a primary switchover?

To switch the primary role to another replica, modify the `spec.replication.primary.podIndex` field in your manifest:

```yaml title="mysql.yaml"
spec:
  replication:
    primary:
      podIndex: 1    # Index of the pod that will become the new primary
```

Then apply the change:

```bash
kubectl apply -f mysql.yaml
```

:::note
The switchover causes a **brief interruption** of writes during the failover. Reads remain available on replicas.
:::

### How to manage users and databases?

Use the `users` and `databases` maps to define your users and databases. Each user can have a connection limit, and each database can have `admin` and `readonly` roles:

```yaml title="mysql.yaml"
spec:
  users:
    appuser:
      password: SecurePassword123
      maxUserConnections: 100
    analyst:
      password: AnalystPassword456
      maxUserConnections: 20

  databases:
    production:
      roles:
        admin:
          - appuser
        readonly:
          - analyst
    analytics:
      roles:
        admin:
          - appuser
        readonly:
          - analyst
```
