---
title: "How to restore a backup (PITR)"
sidebar_position: 4
---

# How to restore a backup (PITR)

:::info Availability
PostgreSQL backup restore is not yet available as self-service in the [Hikube console](https://console.hikube.cloud).
To restore a cluster, [contact support](mailto:support@hidora.io).
:::

## Principle

When backups are enabled on a cluster, continuous WAL archiving makes it possible to restore data to a **precise point in time** (Point-In-Time Recovery). The restore creates a **new cluster**, under a different name; the original cluster is not modified.

## Information to prepare

| Information | Example |
|-------------|---------|
| Project and original cluster name | `prod` / `orders-db` |
| Desired name for the restored cluster | `orders-restored` |
| Restore point in time (with time zone) | `2026-06-15 14:30 Europe/Zurich`, or "latest available state" |

## After the restore

The restored cluster appears in your project's **PostgreSQL Clusters** list. Check your data before switching your applications over:

```sql
-- Check the data volume
SELECT schemaname, relname, n_live_tup
FROM pg_stat_user_tables
ORDER BY n_live_tup DESC;
```

Then update your applications' configuration with the new cluster's address (**Host** field on its page) and the associated credentials.

## Restoring a logical export

If you have an export made with `pg_dump`, you can restore it yourself into an existing database:

```bash
pg_restore --no-owner --dbname "host=<host> port=5432 dbname=myapp user=app_user sslmode=require" \
  myapp-2026-06-15.dump
```

## Going further

- [Configure backups](./configure-backups.md)
- [Manage users and databases](./manage-users-databases.md)
