---
sidebar_position: 6
title: FAQ
---

# FAQ — PostgreSQL

### What is the difference between `resourcesPreset` and `resources`?

The `resourcesPreset` field lets you choose a predetermined resource profile for each PostgreSQL replica. If the `resources` field (explicit CPU/memory) is defined, `resourcesPreset` is **completely ignored**.

| **Preset** | **CPU** | **Memory** |
|------------|---------|------------|
| `nano`     | 250m    | 128Mi      |
| `micro`    | 500m    | 256Mi      |
| `small`    | 1       | 512Mi      |
| `medium`   | 1       | 1Gi        |
| `large`    | 2       | 2Gi        |
| `xlarge`   | 4       | 4Gi        |
| `2xlarge`  | 8       | 8Gi        |

```yaml title="postgresql.yaml"
spec:
  # Using a preset
  resourcesPreset: medium

  # OR explicit configuration (the preset is then ignored)
  resources:
    cpu: 2000m
    memory: 2Gi
```

### How to choose between `local` and `replicated` storageClass?

Hikube offers two types of storage classes:

- **`local`**: data is stored on the physical node where the pod runs. This mode offers the **best performance** (minimal latency) but does not protect against node failure.
- **`replicated`**: data is replicated across multiple physical nodes. This mode ensures **multi-DC high availability** and protects against node loss, at the cost of slightly higher latency.

:::tip
Use `storageClass: local` if you configure multiple replicas (`replicas` > 1): application-level replication (PostgreSQL standby) already ensures high availability. Use `storageClass: replicated` if you have a single replica (`replicas` = 1): replicated storage compensates for the lack of application replication. In development with a single replica, `local` may be sufficient if data loss is acceptable.
:::

### How to connect to PostgreSQL from within the cluster?

The PostgreSQL service is accessible via the following Kubernetes service name:

- **Read-write service**: `pg-<name>-rw` on port `5432`

Connection credentials are stored in a Kubernetes Secret named `pg-<name>-app`.

```bash
# Get the password
kubectl get tenantsecret pg-mydb-app -o jsonpath='{.data.password}' | base64 -d

# Get the username
kubectl get tenantsecret pg-mydb-app -o jsonpath='{.data.username}' | base64 -d

# Connect from a pod
psql -h pg-mydb-rw -p 5432 -U <username> -d <database>
```

### How to configure synchronous replication?

Synchronous replication ensures that a transaction is only confirmed when it has been written to a minimum number of replicas. Configure the `quorum` parameters in your manifest:

```yaml title="postgresql.yaml"
spec:
  replicas: 3
  quorum:
    minSyncReplicas: 1    # At least 1 replica must acknowledge
    maxSyncReplicas: 2    # At most 2 replicas acknowledge
```

- **`minSyncReplicas`**: minimum number of synchronous replicas that must acknowledge a transaction.
- **`maxSyncReplicas`**: maximum number of synchronous replicas that can acknowledge.

:::warning
Synchronous replication increases write latency. Make sure you have enough replicas (`replicas` >= `maxSyncReplicas` + 1).
:::

### How to enable PITR backup?

PostgreSQL on Hikube uses **CloudNativePG** with WAL archiving to enable Point-In-Time Recovery (PITR). Configure the `backup` section with S3-compatible storage:

```yaml title="postgresql.yaml"
spec:
  backup:
    enabled: true
    schedule: "0 2 * * *"
    retentionPolicy: 30d
    destinationPath: s3://my-bucket/postgresql-backups/
    endpointURL: https://prod.s3.hikube.cloud
    s3AccessKey: your-access-key
    s3SecretKey: your-secret-key
```

Backups automatically include WAL files, which allows restoring the database to any point in time between two backups.

### How to add PostgreSQL extensions?

You can enable PostgreSQL extensions for each database using the `databases[name].extensions` field:

```yaml title="postgresql.yaml"
spec:
  databases:
    myapp:
      extensions:
        - uuid-ossp
        - pgcrypto
        - hstore
      roles:
        admin:
          - admin
```

Extensions are automatically enabled when the database is created. Available extensions depend on the deployed PostgreSQL version.

### Can I create multiple databases and users?

Yes. Use the `users` and `databases` maps to define as many users and databases as needed. Each database can have distinct `admin` and `readonly` roles:

```yaml title="postgresql.yaml"
spec:
  users:
    admin:
      password: AdminPassword123
      replication: true
    appuser:
      password: AppPassword456
    analyst:
      password: AnalystPassword789

  databases:
    production:
      roles:
        admin:
          - admin
        readonly:
          - analyst
      extensions:
        - uuid-ossp
    analytics:
      roles:
        admin:
          - admin
        readonly:
          - appuser
          - analyst
```
