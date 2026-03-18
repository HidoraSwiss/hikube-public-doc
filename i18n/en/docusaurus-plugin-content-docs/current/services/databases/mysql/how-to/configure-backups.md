---
title: "How to configure automatic backups"
---

# How to configure automatic backups

This guide explains how to enable and configure automatic backups for your MySQL database on Hikube. Backups use **Restic** and are stored in an **S3-compatible** bucket, enabling reliable restoration in case of data loss.

## Prerequisites

- **kubectl** configured with your Hikube kubeconfig
- A **MySQL** instance deployed on your tenant
- An accessible **S3-compatible bucket** (Hikube Object Storage, AWS S3, MinIO, etc.)
- **S3 access credentials** (Access Key and Secret Key)

## Steps

### 1. Prepare S3 storage and credentials

Before configuring backups, make sure you have the following information:

| Information | Example | Description |
|---|---|---|
| **S3 Region** | `eu-central-1` | S3 bucket region |
| **S3 Bucket** | `s3.hikube.cloud/mysql-backups` | Full bucket path |
| **Access Key** | `HIKUBE123ACCESSKEY` | S3 access key |
| **Secret Key** | `HIKUBE456SECRETKEY` | S3 secret key |
| **Restic password** | `SuperStrongResticPassword!` | Password for backup encryption |

:::warning
Keep the **Restic password** in a safe place. Without this password, it is impossible to restore encrypted backups.
:::

### 2. Configure the backup section in the manifest

Create or modify your MySQL manifest to include the `backup` section:

```yaml title="mysql-with-backup.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: MariaDB
metadata:
  name: example
spec:
  replicas: 3
  size: 10Gi
  resourcesPreset: small

  users:
    appuser:
      password: strongpassword
      maxUserConnections: 100

  databases:
    myapp:
      roles:
        admin:
          - appuser

  backup:
    enabled: true
    schedule: "0 2 * * *"                                              # Tous les jours à 2h du matin
    cleanupStrategy: "--keep-last=3 --keep-daily=3 --keep-within-weekly=1m"
    s3Region: eu-central-1
    s3Bucket: s3.hikube.cloud/mysql-backups
    s3AccessKey: "HIKUBE123ACCESSKEY"
    s3SecretKey: "HIKUBE456SECRETKEY"
    resticPassword: "SuperStrongResticPassword!"
```

#### Backup parameters

| Parameter | Description | Default value |
|---|---|---|
| `backup.enabled` | Enable backups | `false` |
| `backup.schedule` | Cron schedule | `"0 2 * * *"` |
| `backup.s3Region` | AWS S3 region | `"us-east-1"` |
| `backup.s3Bucket` | S3 bucket | - |
| `backup.s3AccessKey` | S3 access key | - |
| `backup.s3SecretKey` | S3 secret key | - |
| `backup.resticPassword` | Restic password | - |
| `backup.cleanupStrategy` | Retention strategy | `"--keep-last=3 --keep-daily=3 --keep-within-weekly=1m"` |

:::tip
Adapt the `schedule` to your needs. Some common examples:
- `"0 2 * * *"`: every day at 2 AM
- `"0 */6 * * *"`: every 6 hours
- `"0 3 * * 0"`: every Sunday at 3 AM
:::

### 3. Apply the configuration

```bash
kubectl apply -f mysql-with-backup.yaml
```

### 4. Adapt the retention strategy

The `cleanupStrategy` uses Restic retention options. Here are some examples:

| Strategy | Description |
|---|---|
| `--keep-last=3` | Keep the last 3 snapshots |
| `--keep-daily=7` | Keep 1 snapshot per day for 7 days |
| `--keep-weekly=4` | Keep 1 snapshot per week for 4 weeks |
| `--keep-within-weekly=1m` | Keep all weekly snapshots from the last month |

Example for a production environment:

```yaml title="mysql-production-backup.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: MariaDB
metadata:
  name: production
spec:
  replicas: 3
  resourcesPreset: medium
  size: 50Gi

  backup:
    enabled: true
    schedule: "0 */6 * * *"
    cleanupStrategy: "--keep-last=7 --keep-daily=7 --keep-weekly=4"
    s3Region: eu-central-1
    s3Bucket: s3.hikube.cloud/mysql-backups
    s3AccessKey: "PROD_ACCESS_KEY"
    s3SecretKey: "PROD_SECRET_KEY"
    resticPassword: "ProdResticPassword!"
```

## Verification

Verify that the configuration has been applied correctly:

```bash
kubectl get mariadb example -o yaml | grep -A 10 backup
```

**Expected output:**

```console
  backup:
    enabled: true
    schedule: "0 2 * * *"
    s3Region: eu-central-1
    s3Bucket: s3.hikube.cloud/mysql-backups
    cleanupStrategy: "--keep-last=3 --keep-daily=3 --keep-within-weekly=1m"
```

:::note
The first backup will be executed according to the cron schedule defined in `schedule`. You can check available snapshots with the Restic command (see the guide [How to restore a backup](./restore-backup.md)).
:::

## Going further

- [API Reference](../api-reference.md): complete list of backup parameters
- [How to restore a backup](./restore-backup.md): restoration procedure from a Restic snapshot
