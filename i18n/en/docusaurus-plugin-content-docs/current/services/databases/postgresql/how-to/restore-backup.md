---
title: "How to restore a backup (PITR)"
sidebar_position: 4
description: "Restore a Hikube PostgreSQL cluster from the console: state of a backup, most recent state or point in time, onto the original cluster or onto another cluster."
---

# How to restore a backup (PITR)

A PostgreSQL archive is restored from the **Backups** tab of the cluster page, in the [Hikube console](https://console.hikube.cloud), or from **Infrastructure** > **Backups** > **Archives**.

## Principle

Thanks to the continuous archiving of transaction logs, a restore can bring the database back to:

- the **exact state of a backup**;
- its **most recent state**;
- a **precise point in time** (PITR, *Point-In-Time Recovery*), between two backups.

The restore writes either **onto the original cluster**, whose content is overwritten, or **onto another existing PostgreSQL cluster** in the project, of the same major version.

## Steps

- [Restore a PostgreSQL or MariaDB database](../../../backups/how-to/restore-database.md)
- [Restore a PostgreSQL database to a point in time](../../../backups/how-to/restore-point-in-time.md)

## After the restore

Check your data before putting your applications back into service:

```sql
-- Check the data volume
SELECT schemaname, relname, n_live_tup
FROM pg_stat_user_tables
ORDER BY n_live_tup DESC;
```

If you restored onto another cluster, update your applications' configuration with its address (**Host** field on its page) and its credentials.

## Restoring a logical export

If you have an export made with `pg_dump`, you can restore it yourself into an existing database:

```bash
pg_restore --no-owner --dbname "host=<host> port=5432 dbname=myapp user=app_user sslmode=require" \
  myapp-2026-06-15.dump
```

## Going further

- [Configure backups](./configure-backups.md)
- [Manage users and databases](./manage-users-databases.md)
