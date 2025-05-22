---
title: ClickHouse
---

**ClickHouse** is a column-oriented analytical database designed for fast and efficient queries. This page describes the configuration options available for ClickHouse, including backup management.

---

## Configuration Example

Here is a YAML configuration example for a ClickHouse cluster with two replicas per shard, custom storage size, and enabled backups:

```yaml
apiVersion: apps.cozystack.io/v1alpha1
kind: ClickHouse
metadata:
  name: clickhouse-example
spec:
  size: 20Gi
  logStorageSize: 5Gi
  shards: 2
  replicas: 2
  storageClass: "replicated"
  logTTL: 30
  users:
    user1:
      password: "securepassword"
    user2:
      readonly: true
      password: "readonlypassword"
  backup:
    enabled: false
  #  s3Region: "hikube"
  #  s3Bucket: "s3.tenant.hikube.cloud/clickhouse-backups"
  #  schedule: "0 3 * * *"
  #  cleanupStrategy: "--keep-last=5 --keep-daily=7 --keep-within-weekly=2m"
  #  s3AccessKey: "your-s3-access-key"
  #  s3SecretKey: "your-s3-secret-key"
  #  resticPassword: "your-restic-password"
```

Using the kubeconfig provided by Hikube and this example yaml, saved as a `manifest.yaml` file, you can easily test the application deployment using the following command:

```sh
kubectl apply -f manifest.yaml
```

---

## Configurable Parameters

### **General Parameters**

| **Name**           | **Description**                                                                 | **Default Value** |
|--------------------|---------------------------------------------------------------------------------|------------------------|
| `size`            | Persistent volume size for data.                                   | `10Gi`                |
| `logStorageSize`  | Persistent volume size for logs.                           | `2Gi`                 |
| `shards`          | Number of ClickHouse shards.                                                    | `1`                   |
| `replicas`        | Number of ClickHouse replicas in each shard.                                | `2`                   |
| `storageClass`    | Storage class used for data and logs.                   | `"replicated"` or `"local"`    |
| `logTTL`          | Retention time for `query_log` and `query_thread_log`, expressed in days.    | `15`                  |

---

### **Configuration Parameters**

| **Name**  | **Description**                                                      | **Default Value** |
|----------|----------------------------------------------------------------------|------------------------|
| `users`  | ClickHouse users configuration. Each user can have custom permissions. | `{}`                  |

**Example**:

```yaml
users:
  user1:
    password: strongpassword
  user2:
    readonly: true
    password: hackme
```

---

### **Backup Parameters**

| **Name**                | **Description**                                                | **Default Value**                         |
|-------------------------|----------------------------------------------------------------|-----------------------------------------------|
| `backup.enabled`       | Enables or disables periodic backups.               | `false`                                      |
| `backup.s3Region`      | AWS S3 region where backups are stored.                | `us-east-1`                                  |
| `backup.s3Bucket`      | S3 bucket name used for backups.                 | `s3.example.org/clickhouse-backups`          |
| `backup.schedule`      | Backup schedule (Cron format).                   | `0 2 * * *`                                  |
| `backup.cleanupStrategy` | Cleanup strategy for old backups.        | `--keep-last=3 --keep-daily=3 --keep-within-weekly=1m` |
| `backup.s3AccessKey`   | AWS S3 access key for authentication.                    | `oobaiRus9pah8PhohL1ThaeTa4UVa7gu`           |
| `backup.s3SecretKey`   | AWS S3 secret key for authentication.                    | `ju3eum4dekeich9ahM1te8waeGai0oog`           |
| `backup.resticPassword` | Password for Restic backup encryption.      | `ChaXoveekoh6eigh4siesheeda2quai0`           |

---

## Restoring a Backup

You can restore a ClickHouse backup using Restic. Here are the main steps:

### Finding a Snapshot

Use the following command to list available snapshots in your S3 bucket:

```bash
restic -r s3:s3.tenant.hikube.cloud/clickhouse-backups/table_name snapshots
```

### Restoring the Snapshot

To restore the most recent snapshot, run the following command specifying a restoration target:

```bash
restic -r s3:s3.tenant.hikube.cloud/clickhouse-backups/table_name restore latest --target /tmp/
```

---

## Additional Resources

To learn more about ClickHouse and its management, check the following resources:

- **[Official ClickHouse Documentation](https://clickhouse.com/docs/)**
  Comprehensive guide for configuring and optimizing ClickHouse.
- **[Restic Documentation](https://restic.net/)**
  Guide for configuring and using Restic for backups.
