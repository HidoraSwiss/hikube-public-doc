---
title: "How to configure automatic backups"
---

# How to configure automatic backups

This guide explains how to enable and configure automatic backups for your PostgreSQL database to S3-compatible storage, via the CloudNativePG operator.

## Prerequisites

- **kubectl** configured with your Hikube kubeconfig
- A **PostgreSQL** instance deployed on Hikube (or a manifest ready to deploy)
- An accessible **S3-compatible bucket** (Hikube Object Storage, AWS S3, etc.)
- **S3 credentials**: access key, secret key, endpoint URL

## Steps

### 1. Prepare S3 credentials

Before enabling backups, gather the following information:

| Parameter | Description | Example |
|-----------|-------------|---------|
| `destinationPath` | S3 destination bucket path | `s3://backups/postgresql/production/` |
| `endpointURL` | S3 endpoint URL | `https://prod.s3.hikube.cloud` |
| `s3AccessKey` | S3 access key | `oobaiRus9pah8PhohL1ThaeTa4UVa7gu` |
| `s3SecretKey` | S3 secret key | `ju3eum4dekeich9ahM1te8waeGai0oog` |

:::tip
If you are using Hikube object storage, the default endpoint is `https://prod.s3.hikube.cloud`. For an external provider (AWS S3, Scaleway, etc.), enter the corresponding URL.
:::

### 2. Create the PostgreSQL manifest with backup enabled

Create or modify your manifest to include the `backup` section:

```yaml title="postgresql-with-backup.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Postgres
metadata:
  name: my-database
spec:
  replicas: 3
  resourcesPreset: medium
  size: 20Gi

  users:
    admin:
      password: SecureAdminPassword

  databases:
    myapp:
      roles:
        admin:
          - admin

  backup:
    enabled: true
    schedule: "0 2 * * *"
    retentionPolicy: 30d
    destinationPath: s3://backups/postgresql/my-database/
    endpointURL: https://prod.s3.hikube.cloud
    s3AccessKey: oobaiRus9pah8PhohL1ThaeTa4UVa7gu
    s3SecretKey: ju3eum4dekeich9ahM1te8waeGai0oog
```

**Backup parameter details:**

| Parameter | Description | Default value |
|-----------|-------------|---------------|
| `backup.enabled` | Enable automatic backups | `false` |
| `backup.schedule` | Cron schedule (here: every day at 2 AM) | `"0 2 * * * *"` |
| `backup.retentionPolicy` | Backup retention duration | `"30d"` |
| `backup.destinationPath` | S3 destination path | _(required)_ |
| `backup.endpointURL` | S3 endpoint URL | _(required)_ |
| `backup.s3AccessKey` | S3 access key | _(required)_ |
| `backup.s3SecretKey` | S3 secret key | _(required)_ |

:::note
The `schedule` uses standard cron syntax. Common examples:
- `"0 2 * * *"`: every day at 2:00 AM
- `"0 */6 * * *"`: every 6 hours
- `"0 2 * * 0"`: every Sunday at 2:00 AM
:::

### 3. Apply the configuration

```bash
kubectl apply -f postgresql-with-backup.yaml
```

### 4. Verify that backups are configured

Verify that the PostgreSQL instance is properly deployed with backup enabled:

```bash
kubectl get postgres my-database -o yaml | grep -A 10 backup
```

**Expected output:**

```console
  backup:
    enabled: true
    schedule: "0 2 * * *"
    retentionPolicy: 30d
    destinationPath: s3://backups/postgresql/my-database/
    endpointURL: https://prod.s3.hikube.cloud
```

## Verification

To confirm that backups are working correctly:

1. **Check the logs** of the primary PostgreSQL pod for backup-related messages:

```bash
kubectl logs postgres-my-database-1 -c postgres | grep -i backup
```

2. **Check the S3 bucket contents** to confirm that WAL files and base backups are being sent.

3. **Check events** related to the instance:

```bash
kubectl describe postgres my-database
```

:::warning
Regularly test the restoration of your backups. A backup that has never been tested is not a reliable backup. See the guide [How to restore a backup (PITR)](./restore-backup.md).
:::

## Going further

- **[PostgreSQL API Reference](../api-reference.md)**: complete documentation of all backup parameters
- **[How to restore a backup (PITR)](./restore-backup.md)**: restore your data to a specific point in time
