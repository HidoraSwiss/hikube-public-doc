---
title: "How to restore a backup (PITR)"
---

# How to restore a backup (PITR)

This guide explains how to restore a PostgreSQL database to a specific point in time using the **Point-In-Time Recovery (PITR)** mechanism built into Hikube.

:::warning
PITR restoration creates a **new PostgreSQL instance** with a different name. It does not restore the existing instance in place. The old instance is not modified.
:::

## Prerequisites

- **kubectl** configured with your Hikube kubeconfig
- An original PostgreSQL instance with **backups enabled** (`backup.enabled: true`)
- Backups must have been correctly sent to the S3 bucket
- The **name of the old PostgreSQL instance** (`bootstrap.oldName`)
- (Optional) An **RFC 3339 timestamp** for point-in-time restoration

## Steps

### 1. Identify the recovery point

Determine the point in time to which you want to restore your data. The timestamp must be in **RFC 3339** format:

```
YYYY-MM-DDTHH:MM:SSZ
```

**Examples:**

| Timestamp | Description |
|-----------|-------------|
| `2025-06-15T10:30:00Z` | June 15, 2025 at 10:30 AM UTC |
| `2025-06-15T14:00:00+02:00` | June 15, 2025 at 2:00 PM (Paris time) |
| _(empty)_ | Restore to the latest available state |

:::tip
If you leave `recoveryTime` empty, the restoration is performed up to the latest available WAL, i.e., the most recent state possible.
:::

### 2. Prepare the new instance manifest

Create a manifest for the new PostgreSQL instance. The name must be **different** from the original instance. The configuration (replicas, resources, storage) should be **identical** to the original instance.

Add the `bootstrap` section to enable restoration:

```yaml title="postgresql-restored.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Postgres
metadata:
  name: my-database-restored
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
    destinationPath: s3://backups/postgresql/my-database-restored/
    endpointURL: https://prod.s3.hikube.cloud
    s3AccessKey: oobaiRus9pah8PhohL1ThaeTa4UVa7gu
    s3SecretKey: ju3eum4dekeich9ahM1te8waeGai0oog

  bootstrap:
    enabled: true
    oldName: "my-database"
    recoveryTime: "2025-06-15T10:30:00Z"
```

**Key parameters of the `bootstrap` section:**

| Parameter | Description | Required |
|-----------|-------------|----------|
| `bootstrap.enabled` | Enable restoration from a backup | Yes |
| `bootstrap.oldName` | Name of the old PostgreSQL instance | Yes |
| `bootstrap.recoveryTime` | RFC 3339 timestamp of the recovery point. Empty = latest available state | No |

:::note
The `bootstrap.oldName` field corresponds to the `metadata.name` of the original instance. In this example, the old instance was called `my-database`.
:::

### 3. Apply the manifest

```bash
kubectl apply -f postgresql-restored.yaml
```

Creating the new instance and the restoration may take several minutes depending on the data volume.

### 4. Verify the restoration

Monitor the state of the new instance:

```bash
kubectl get postgres my-database-restored
```

**Expected output:**

```console
NAME                      READY   AGE     VERSION
my-database-restored      True    3m12s   0.18.0
```

Verify that the pods are in `Running` state:

```bash
kubectl get po | grep postgres-my-database-restored
```

**Expected output:**

```console
postgres-my-database-restored-1   1/1     Running   0   3m
postgres-my-database-restored-2   1/1     Running   0   2m
postgres-my-database-restored-3   1/1     Running   0   1m
```

### 5. Validate the restored data

Retrieve the connection credentials for the new instance:

```bash
kubectl get secret postgres-my-database-restored-credentials -o json | jq -r '.data | to_entries[] | "\(.key): \(.value|@base64d)"'
```

Connect to the database and verify that the data is present:

```bash
kubectl port-forward svc/postgres-my-database-restored-rw 5432:5432
```

```bash
psql -h 127.0.0.1 -U admin myapp
```

```sql
-- Vérifier les tables et les données
\dt
SELECT count(*) FROM votre_table;
```

## Verification

The restoration is successful if:

- The `my-database-restored` instance is in `READY: True` state
- All PostgreSQL pods are in `Running` state
- Data is present and consistent at the requested timestamp
- The `psql` connection works correctly

:::tip
Once the restoration is validated, remember to update your applications to point to the new instance (`postgres-my-database-restored-rw` instead of `postgres-my-database-rw`).
:::

## Going further

- **[PostgreSQL API Reference](../api-reference.md)**: complete documentation of `bootstrap` parameters
- **[How to configure automatic backups](./configure-backups.md)**: enable backups on the new instance
