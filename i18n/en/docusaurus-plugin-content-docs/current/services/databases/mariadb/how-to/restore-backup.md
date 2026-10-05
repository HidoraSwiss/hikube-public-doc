---
title: "How to restore a backup"
sidebar_position: 4
---

# How to restore a backup

:::info Availability
MariaDB backup restore is not yet available as self-service in the [Hikube console](https://console.hikube.cloud).
To restore a cluster from a backup managed by the platform, [contact support](mailto:support@hidora.io).
:::

## Information to prepare

| Information | Example |
|-------------|---------|
| Project and cluster name | `prod` / `shop-db` |
| Backup to restore | The most recent one, or a specific date |

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
