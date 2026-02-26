---
sidebar_position: 3
title: API Reference
---

# PostgreSQL API Reference

This reference details the use of **PostgreSQL** on Hikube, highlighting its operation in a replicated cluster with a primary and standbys for high availability, as well as the ability to enable automatic backups to S3-compatible storage.

---

## Base Structure

### **Postgres Resource**

#### YAML Configuration Example

```yaml
apiVersion: apps.cozystack.io/v1alpha1
kind: Postgres
metadata:
  name: example
spec:
```

---

## Parameters

### **Common Parameters**

| **Parameter**       | **Type**   | **Description**                                                                 | **Default** | **Required** |
|----------------------|------------|---------------------------------------------------------------------------------|------------|------------|
| `replicas`           | `int`      | Number of PostgreSQL replicas (instances in the cluster)                       | `2`        | Yes        |
| `resources`          | `object`   | Explicit CPU and memory configuration for each PostgreSQL replica. If empty, `resourcesPreset` is applied | `{}`       | No        |
| `resources.cpu`      | `quantity` | CPU available to each replica                                                   | `null`     | No        |
| `resources.memory`   | `quantity` | Memory (RAM) available to each replica                                          | `null`     | No        |
| `resourcesPreset`    | `string`   | Default sizing preset (`nano`, `micro`, `small`, `medium`, `large`, `xlarge`, `2xlarge`) | `"micro"` | Yes        |
| `size`               | `quantity` | Persistent Volume Claim size, available for application data                    | `10Gi`     | Yes        |
| `storageClass`       | `string`   | StorageClass used to store the data                                             | `""`       | No        |
| `external`           | `bool`     | Enable external access from outside the cluster                                 | `false`    | No        |

#### YAML Configuration Example

```yaml title="postgresql.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Postgres
metadata:
  name: postgres-example
spec:
  # Number of PostgreSQL replicas (instances in the cluster)
  replicas: 3
  # Explicit resource configuration
  resources:
    cpu: 2000m     # 2 vCPU per instance
    memory: 2Gi    # 2 GiB RAM per instance
  # Use a preset if resources is empty
  resourcesPreset: micro
  # Persistent volume for each PostgreSQL instance
  size: 10Gi
  # Storage class (leave empty to use cluster default)
  storageClass: "replicated"
  # Expose database outside the cluster (LoadBalancer if true)
  external: false
```

---

### **Application-Specific Parameters**

| **Parameter**                         | **Type**             | **Description**                                                                 | **Default** | **Required** |
|---------------------------------------|----------------------|---------------------------------------------------------------------------------|------------|------------|
| `postgresql`                          | `object`             | PostgreSQL server configuration                                                 | `{}`       | No        |
| `postgresql.parameters`               | `object`             | PostgreSQL server parameters                                                    | `{}`       | No        |
| `postgresql.parameters.max_connections` | `int`               | Maximum number of concurrent connections to the database server (default: 100) | `100`   | No        |
| `quorum`                              | `object`             | Quorum configuration for synchronous replication                                | `{}`       | No        |
| `quorum.minSyncReplicas`              | `int`                | Minimum number of synchronous replicas that must acknowledge a transaction      | `0`        | No        |
| `quorum.maxSyncReplicas`              | `int`                | Maximum number of synchronous replicas that can acknowledge a transaction       | `0`        | No        |
| `users`                               | `map[string]object`  | Users configuration                                                             | `{...}`    | No        |
| `users[name].password`                | `string`             | Password for the user                                                           | `null`     | Yes        |
| `users[name].replication`             | `bool`               | Whether the user has replication privileges                                     | `null`     | No        |
| `databases`                           | `map[string]object`  | Databases configuration                                                         | `{...}`    | No        |
| `databases[name].roles`               | `object`             | Roles for the database                                                          | `null`     | No        |
| `databases[name].roles.admin`         | `[]string`           | List of users with admin privileges                                             | `[]`       | No        |
| `databases[name].roles.readonly`      | `[]string`           | List of users with read-only privileges                                         | `[]`       | No        |
| `databases[name].extensions`          | `[]string`           | Extensions enabled for the database                                             | `[]`       | No        |

#### YAML Configuration Example

```yaml title="postgresql.yaml"
spec:
  replicas: 3
  size: 10Gi
  storageClass: replicated
  resourcesPreset: medium

  # PostgreSQL server configuration
  postgresql:
    parameters:
      max_connections: 200
      shared_buffers: 512MB
      work_mem: 64MB

  # Quorum configuration for synchronous replication
  quorum:
    minSyncReplicas: 1
    maxSyncReplicas: 2

  # Users
  users:
    admin:
      password: StrongAdminPwd123
      replication: true
    appuser:
      password: AppUserPwd456
    readonly:
      password: ReadOnlyPwd789

  # Databases
  databases:
    myapp:
      roles:
        admin:
          - admin
        readonly:
          - readonly
      extensions:
        - hstore
        - uuid-ossp

    analytics:
      roles:
        admin:
          - admin
        readonly:
          - appuser
      extensions:
        - pgcrypto
```

---

### **Backup Parameters**

| **Parameter**              | **Type**   | **Description**                                         | **Default**                       | **Required** |
|-----------------------------|------------|---------------------------------------------------------|-----------------------------------|------------|
| `backup`                    | `object`  | Backup configuration                                    | `{}`                              | No        |
| `backup.enabled`            | `bool`    | Enable regular backups                                  | `false`                           | No        |
| `backup.schedule`           | `string`  | Cron schedule for automated backups                     | `"0 2 * * * *"`                   | No        |
| `backup.retentionPolicy`    | `string`  | Retention policy                                        | `"30d"`                           | No        |
| `backup.destinationPath`    | `string`  | Path to store the backup (i.e. s3://bucket/path/)       | `"s3://bucket/path/to/folder/"`   | Yes        |
| `backup.endpointURL`        | `string`  | S3 Endpoint used to upload data to the cloud            | `"http://minio-gateway-service:9000"` | Yes    |
| `backup.s3AccessKey`        | `string`  | Access key for S3, used for authentication              | `<your-access-key>`               | Yes        |
| `backup.s3SecretKey`        | `string`  | Secret key for S3, used for authentication              | `<your-secret-key>`               | Yes        |

To backup a **PostgreSQL** database, an external **S3-compatible** storage is required.  

To enable regular backups:  

1. Update your PostgreSQL application configuration.  
2. Set the `backup.enabled` parameter to `true`.  
3. Fill in the destination path and credentials in the `backup.*` fields.

#### YAML Configuration Example

```yaml title="postgresql.yaml"
## @param backup.enabled Enable regular backups
## @param backup.schedule Cron schedule for automated backups
## @param backup.retentionPolicy Retention policy
## @param backup.destinationPath Path to store the backup (i.e. s3://bucket/path/to/folder)
## @param backup.endpointURL S3 Endpoint used to upload data to the cloud
## @param backup.s3AccessKey Access key for S3, used for authentication
## @param backup.s3SecretKey Secret key for S3, used for authentication
backup:
  enabled: false
  retentionPolicy: 30d
  destinationPath: s3://bucket/path/to/folder/
  endpointURL: http://minio-gateway-service:9000
  schedule: "0 2 * * * *"
  s3AccessKey: oobaiRus9pah8PhohL1ThaeTa4UVa7gu
  s3SecretKey: ju3eum4dekeich9ahM1te8waeGai0oog
```

### **Backup Restoration Parameters**

| **Parameter**             | **Type**   | **Description**                                                                                       | **Default** | **Required** |
|----------------------------|------------|-------------------------------------------------------------------------------------------------------|------------|------------|
| `bootstrap`                | `object`   | Bootstrap configuration                                                                               | `{}`       | No        |
| `bootstrap.enabled`        | `bool`     | Restore database cluster from a backup                                                                | `false`    | No        |
| `bootstrap.recoveryTime`   | `string`   | Timestamp (PITR) until which restoration should occur (RFC 3339 format). Empty = latest backup | `""`       | No        |
| `bootstrap.oldName`        | `string`   | Name of the PostgreSQL cluster before deletion                                                           | `""`       | Yes        |

Hikube supports **Point-In-Time Recovery (PITR)**.  
Recovery is performed by creating a **new PostgreSQL instance** with a different name, but identical configuration to the original instance.  

#### Steps  

1. Create a new PostgreSQL application.  
2. Give it a different name from the original instance.  
3. Enable the `bootstrap.enabled` parameter.  
4. Fill in:  
   - `bootstrap.oldName` : the name of the old PostgreSQL instance.  
   - `bootstrap.recoveryTime` : the time until which to restore, in **RFC 3339** format. If left empty, restoration will be to the latest available state.  

---

#### YAML Configuration Example

```yaml title="postgresql.yaml"
bootstrap:
  enabled: true
  oldName: "postgres-example"   # name of the old instance
  recoveryTime: "2025-01-15T10:30:00Z"  # restore to a specific time (RFC 3339)
```

### resources and resourcesPreset  

The `resources` field allows explicitly defining the CPU and memory configuration of each PostgreSQL replica.  
If this field is left empty, the value of the `resourcesPreset` parameter is used.  

#### YAML Configuration Example

```yaml title="postgresql.yaml"
resources:
  cpu: 4000m
  memory: 4Gi
```  

⚠️ Attention: if resources is defined, the resourcesPreset value is ignored.

| **Preset name** | **CPU** | **Memory** |
|-----------------|---------|-------------|
| `nano`          | 250m    | 128Mi       |
| `micro`         | 500m    | 256Mi       |
| `small`         | 1       | 512Mi       |
| `medium`        | 1       | 1Gi         |
| `large`         | 2       | 2Gi         |
| `xlarge`        | 4       | 4Gi         |
| `2xlarge`       | 8       | 8Gi         |

---

## Complete Examples

### Production Cluster

```yaml title="postgresql-production.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Postgres
metadata:
  name: production
spec:
  replicas: 3
  resources:
    cpu: 4000m
    memory: 8Gi
  size: 50Gi
  storageClass: replicated
  external: false

  postgresql:
    parameters:
      max_connections: 300
      shared_buffers: 2GB
      work_mem: 64MB
      effective_cache_size: 6GB

  quorum:
    minSyncReplicas: 1
    maxSyncReplicas: 2

  users:
    admin:
      password: SecureAdminPassword
      replication: true
    appuser:
      password: SecureAppPassword
    readonly:
      password: SecureReadOnlyPassword

  databases:
    production:
      roles:
        admin:
          - admin
        readonly:
          - readonly
          - appuser
      extensions:
        - uuid-ossp
        - pgcrypto

  backup:
    enabled: true
    schedule: "0 2 * * *"
    retentionPolicy: 30d
    destinationPath: s3://backups/postgresql/production/
    endpointURL: http://minio-gateway-service:9000
    s3AccessKey: your-access-key
    s3SecretKey: your-secret-key
```

### Development Cluster

```yaml title="postgresql-development.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Postgres
metadata:
  name: development
spec:
  replicas: 1
  resourcesPreset: nano
  size: 5Gi
  external: true

  users:
    dev:
      password: devpassword

  databases:
    devdb:
      roles:
        admin:
          - dev
```

---

:::tip Best Practices

- **Synchronous replication**: configure `quorum.minSyncReplicas: 1` in production to ensure at least one replica acknowledges each transaction
- **S3 backups**: enable automatic backups with `backup.enabled: true` and regularly test restoration
- **Role separation**: create distinct users for administration, application, and read-only access
- **PostgreSQL parameters**: adjust `shared_buffers` (~25% of RAM), `work_mem`, and `max_connections` according to your workload
:::

:::warning Warning

- **Deletions are irreversible**: deleting a Postgres resource results in permanent data loss if no backup is configured
- **`resources` vs `resourcesPreset`**: if `resources` is defined, `resourcesPreset` is entirely ignored
- **PITR restoration**: restoration creates a **new instance** with a different name -- it does not restore the existing instance
:::

