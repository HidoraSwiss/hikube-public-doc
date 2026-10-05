---
title: "How to restore a backup"
---

# How to restore a backup

This guide explains how to restore a MySQL database from a Restic backup stored in an S3-compatible bucket. The restoration is performed via the **Restic** CLI from your workstation.

## Prerequisites

- **Restic CLI** installed on your local machine
- The **S3 credentials** used when configuring backups (Access Key, Secret Key)
- The **Restic password** used to encrypt the backups
- The **S3 bucket name** and repository path
- A **mysql** client to import the restored data

## Steps

### 1. Install Restic CLI

Install Restic according to your operating system:

```bash
# macOS (Homebrew)
brew install restic

# Debian / Ubuntu
sudo apt install restic

# Depuis les binaires officiels
# https://github.com/restic/restic/releases
```

### 2. Configure Restic environment variables

Export the necessary variables so Restic can access the backup repository:

```bash
export AWS_ACCESS_KEY_ID="HIKUBE123ACCESSKEY"
export AWS_SECRET_ACCESS_KEY="HIKUBE456SECRETKEY"
export RESTIC_PASSWORD="SuperStrongResticPassword!"
export RESTIC_REPOSITORY="s3:s3.hikube.cloud/mysql-backups/example"
```

:::warning
The repository path (`RESTIC_REPOSITORY`) corresponds to the `s3Bucket` configured in the MySQL manifest, followed by the **instance name**. For example, for an instance named `example` with `s3Bucket: s3.hikube.cloud/mysql-backups`, the repository will be `s3:s3.hikube.cloud/mysql-backups/example`.
:::

### 3. List available snapshots

Display all backups stored in the repository:

```bash
restic snapshots
```

**Expected output:**

```console
repository abc12345 opened successfully
ID        Time                 Host        Tags        Paths
---------------------------------------------------------------
a1b2c3d4  2025-01-15 02:00:05  mysql-example            /backup
e5f6g7h8  2025-01-16 02:00:03  mysql-example            /backup
i9j0k1l2  2025-01-17 02:00:04  mysql-example            /backup
---------------------------------------------------------------
3 snapshots
```

:::tip
You can filter snapshots by date with `restic snapshots --latest 5` to display only the 5 most recent ones.
:::

### 4. Restore a snapshot

Restore the latest snapshot (or a specific one) to a local directory:

```bash
# Restaurer le dernier snapshot
restic restore latest --target /tmp/mysql-restore

# Ou restaurer un snapshot spécifique par son ID
restic restore a1b2c3d4 --target /tmp/mysql-restore
```

The restored content will be available in `/tmp/mysql-restore/backup/`.

### 5. Import the data into MySQL

Once the backup files are extracted, import them into your MySQL instance:

```bash
# Identifier les fichiers de dump restaurés
ls /tmp/mysql-restore/backup/

# Importer le dump dans la base de données cible
mysql -h <host-mysql> -P 3306 -u <utilisateur> -p <base_de_donnees> < /tmp/mysql-restore/backup/dump.sql
```

:::note
The MySQL host address depends on your configuration:
- **Internal access** (port-forward): `127.0.0.1` after `kubectl port-forward svc/mysql-example 3306:3306`
- **External access** (LoadBalancer): the external IP of the `mysql-example-primary` service
:::

### 6. Clean up temporary files

Once the restoration is completed and verified, delete the temporary files:

```bash
rm -rf /tmp/mysql-restore
```

## Verification

Connect to the MySQL instance and verify that the data has been correctly restored:

```bash
mysql -h <host-mysql> -P 3306 -u <utilisateur> -p <base_de_donnees>
```

```sql
-- Vérifier les tables présentes
SHOW TABLES;

-- Vérifier le nombre de lignes dans une table
SELECT COUNT(*) FROM <nom_table>;
```

:::warning Test restoration regularly
It is strongly recommended to test the restoration procedure regularly, ideally in a development environment. A backup that has never been tested does not guarantee a successful restoration.
:::

## Going further

- [API Reference](../api-reference.md): complete configuration of backup parameters
- [How to configure automatic backups](./configure-backups.md): setting up Restic + S3 backups
