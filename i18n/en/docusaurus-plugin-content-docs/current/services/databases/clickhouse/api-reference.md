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
appVersion: 0.13.0
kind: ClickHouse
metadata:
  name: clickhouse-name
  namespace: default
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

