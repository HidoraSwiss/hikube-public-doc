---
sidebar_position: 3
title: API Reference
---

# ClickHouse API Reference

This reference details the use of **ClickHouse** on Hikube, whether in simple or distributed configuration with shards and replicas.

---

## Base Structure

### **ClickHouse Resource**

#### YAML Configuration Example

```yaml
apiVersion: apps.cozystack.io/v1alpha1
kind: ClickHouse
metadata:
  name: clickhouse-name
spec:
```

## Parameters

### **Common Parameters**

| **Parameter**       | **Type**   | **Description**                                                                 | **Default** | **Required** |
|----------------------|------------|---------------------------------------------------------------------------------|------------|------------|
| `replicas`           | `int`      | Number of ClickHouse replicas                                                   | `2`        | Yes        |
| `shards`             | `int`      | Number of ClickHouse shards                                                     | `1`        | Yes        |
| `resources`          | `object`   | Explicit CPU and memory configuration for each replica. If empty, `resourcesPreset` is applied | `{}`       | No        |
| `resources.cpu`      | `quantity` | CPU available to each replica                                                   | `null`     | No        |
| `resources.memory`   | `quantity` | Memory (RAM) available to each replica                                          | `null`     | No        |
| `resourcesPreset`    | `string`   | Default sizing preset (`nano`, `micro`, `small`, `medium`, `large`, `xlarge`, `2xlarge`) | `"small"`  | Yes        |
| `size`               | `quantity` | Persistent Volume Claim size, available for application data                    | `10Gi`     | Yes        |
| `storageClass`       | `string`   | StorageClass used to store the data                                             | `""`       | No        |

#### YAML Configuration Example

```yaml title="clickhouse.yaml"
replicas: 2
shards: 1
resources:
  cpu: 4000m
  memory: 4Gi
resourcesPreset: small
size: 20Gi
storageClass: replicated
```

### **Application-Specific Parameters**

| **Parameter**           | **Type**             | **Description**                                             | **Default** | **Required** |
|--------------------------|----------------------|-------------------------------------------------------------|------------|------------|
| `logStorageSize`         | `quantity`           | Size of Persistent Volume for logs                          | `2Gi`      | No        |
| `logTTL`                 | `int`                | TTL (expiration time) for `query_log` and `query_thread_log`| `15`       | No        |
| `users`                  | `map[string]object`  | Users configuration                                         | `{...}`    | No        |
| `users[name].password`   | `string`             | Password for the user                                       | `null`     | Yes        |
| `users[name].readonly`   | `bool`               | User is readonly, default is false                          | `null`     | No        |

#### YAML Configuration Example

```yaml title="clickhouse.yaml"
logStorageSize: 5Gi
logTTL: 30
users:
  analyst:
    password: analyst123
    readonly: true
  admin:
    password: adminStrongPwd
```

### **Backup Parameters**

| **Parameter**           | **Type**   | **Description**                                | **Default**                                   | **Required** |
|--------------------------|------------|------------------------------------------------|-----------------------------------------------|------------|
| `backup`                 | `object`   | Backup configuration                           | `{}`                                          | No        |
| `backup.enabled`         | `bool`     | Enable regular backups                         | `false`                                       | No        |
| `backup.s3Region`        | `string`   | AWS S3 region where backups are stored         | `us-east-1`                                   | No        |
| `backup.s3Bucket`        | `string`   | S3 bucket used for storing backups             | `s3.example.org/clickhouse-backups`           | No        |
| `backup.schedule`        | `string`   | Cron schedule for automated backups            | `"0 2 * * *"`                                 | No        |
| `backup.cleanupStrategy` | `string`   | Retention strategy for cleaning up old backups | `"--keep-last=3 --keep-daily=3 --keep-within-weekly=1m"` | No        |
| `backup.s3AccessKey`     | `string`   | Access key for S3, used for authentication     | `<your-access-key>`                           | Yes        |
| `backup.s3SecretKey`     | `string`   | Secret key for S3, used for authentication     | `<your-secret-key>`                           | Yes        |
| `backup.resticPassword`  | `string`   | Password for Restic backup encryption          | `<password>`                                  | Yes        |

#### YAML Configuration Example

```yaml title="clickhouse.yaml"
backup:
  enabled: true
  s3Region: eu-central-1
  s3Bucket: backups.hikube.clickhouse
  schedule: "0 3 * * *"
  cleanupStrategy: "--keep-last=5 --keep-daily=7 --keep-weekly=4"
  s3AccessKey: "<your-access-key>"
  s3SecretKey: "<your-secret-key>"
  resticPassword: "<password>"
```

### **ClickHouse Keeper Parameters**

| **Parameter**                   | **Type**   | **Description**                                                                 | **Default** | **Required** |
|---------------------------------|------------|---------------------------------------------------------------------------------|------------|------------|
| `clickhouseKeeper`              | `object`   | ClickHouse Keeper configuration                                                 | `{}`       | No        |
| `clickhouseKeeper.enabled`      | `bool`     | Deploy ClickHouse Keeper for cluster coordination                               | `true`     | Yes        |
| `clickhouseKeeper.size`         | `quantity` | Persistent Volume Claim size, available for application data                    | `1Gi`      | Yes        |
| `clickhouseKeeper.resourcesPreset` | `string` | Default sizing preset (`nano`, `micro`, `small`, `medium`, `large`, `xlarge`, `2xlarge`) | `micro` | Yes        |
| `clickhouseKeeper.replicas`     | `int`      | Number of Keeper replicas                                                       | `3`        | Yes        |

#### YAML Configuration Example

```yaml title="clickhouse.yaml"
clickhouseKeeper:
  enabled: true
  replicas: 3
  resourcesPreset: medium
  size: 5Gi  
```  

### resources and resourcesPreset

The `resources` field allows explicitly defining the CPU and memory configuration of each ClickHouse replica.  
If this field is left empty, the value of the `resourcesPreset` parameter is used.  

#### YAML Configuration Example

```yaml title="clickhouse.yaml"
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

```yaml title="clickhouse-production.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: ClickHouse
metadata:
  name: production
spec:
  replicas: 3
  shards: 2
  resources:
    cpu: 4000m
    memory: 8Gi
  size: 100Gi
  storageClass: replicated

  logStorageSize: 10Gi
  logTTL: 30

  clickhouseKeeper:
    enabled: true
    replicas: 3
    resourcesPreset: small
    size: 5Gi

  users:
    admin:
      password: SecureAdminPassword
    analyst:
      password: SecureAnalystPassword
      readonly: true

  backup:
    enabled: true
    schedule: "0 3 * * *"
    cleanupStrategy: "--keep-last=7 --keep-daily=7 --keep-weekly=4"
    s3Region: eu-central-1
    s3Bucket: s3.hikube.cloud/clickhouse-backups
    s3AccessKey: your-access-key
    s3SecretKey: your-secret-key
    resticPassword: SecureResticPassword
```

### Development Cluster

```yaml title="clickhouse-development.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: ClickHouse
metadata:
  name: development
spec:
  replicas: 1
  shards: 1
  resourcesPreset: nano
  size: 10Gi

  logStorageSize: 2Gi
  logTTL: 7

  clickhouseKeeper:
    enabled: true
    replicas: 1
    resourcesPreset: nano
    size: 1Gi

  users:
    dev:
      password: devpassword
```

---

:::tip Best Practices

- **Odd number of Keepers**: always deploy 3 or 5 Keeper replicas to ensure quorum (majority required for leader election)
- **`logTTL`**: adjust the retention period for system logs (`query_log`, `query_thread_log`) to avoid unnecessary data accumulation
- **Shards vs replicas**: use shards to distribute data horizontally (more capacity) and replicas for redundancy (more availability)
- **`readonly` user**: create a read-only user for analytics and reporting tools
:::

:::warning Warning

- **Deletions are irreversible**: deleting a ClickHouse resource results in permanent data loss if no backup is configured
- **Changing shards**: modifying the number of shards on an existing cluster can lead to complex data redistribution
- **Keeper and quorum**: with fewer than 3 Keepers, the cluster cannot maintain quorum in case of a node failure
:::

