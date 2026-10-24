---
title: "How to restore a backup"
sidebar_position: 4
description: "Restore a Hikube MariaDB cluster from the console, onto the original cluster or onto another cluster, or replay a mysqldump export yourself."
---

# How to restore a backup

A MariaDB archive is restored from the **Backups** tab of the cluster page, in the [Hikube console](https://console.hikube.cloud), or from **Infrastructure** > **Backups** > **Archives**. See [Restore a PostgreSQL or MariaDB database](../../../backups/how-to/restore-database.md).

The restore writes either **onto the original cluster**, or **onto another existing MariaDB cluster** in the project. The archive is replayed into the target: each table it contains replaces the table of the same name; tables and databases it does not contain are kept.

## Restoring a logical export

If you have an export made with `mysqldump`, restore it yourself into an existing database. The user must have the **Administrator (Admin)** right on the target database:

```bash
mysql -h <host> -P 3306 -u app-user -p myapp < myapp-2026-06-15.sql
```

## Verification

```sql
-- Check the row count of the restored tables
SELECT table_name, table_rows
FROM information_schema.tables
WHERE table_schema = 'myapp'
ORDER BY table_rows DESC;
```

## Going further

- [Configure backups](./configure-backups.md)
- [Manage users and databases](./manage-users-databases.md)
