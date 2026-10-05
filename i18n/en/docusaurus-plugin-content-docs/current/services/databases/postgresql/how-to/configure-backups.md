---
title: "How to configure automatic backups"
sidebar_position: 3
---

# How to configure automatic backups

:::info Availability
PostgreSQL backup configuration is not yet available as self-service in the [Hikube console](https://console.hikube.cloud).
To enable or change a cluster's backups, [contact support](mailto:support@hidora.io).
:::

## Principle

Hikube PostgreSQL clusters can back up a database to S3-compatible object storage:

- **Full backups** (base backups) scheduled at regular intervals;
- **Continuous WAL archiving**, which allows restoring to a precise point in time (PITR, Point-In-Time Recovery);
- **Retention policy** that determines how long backups are kept.

## Information to prepare

For an activation request, give support the following:

| Information | Example |
|-------------|---------|
| Project and cluster name | `prod` / `orders-db` |
| Full backup frequency | Every day at 2 a.m. |
| Retention period | 30 days |
| Destination bucket | A dedicated [Hikube Object Storage](../../../storage/buckets/overview.md) bucket or external S3 storage |

:::warning
Never send S3 access keys through an unsecured channel. Support will tell you the appropriate procedure.
:::

## On-demand logical backup

Independently of the backups managed by the platform, you can export a database at any time with the standard PostgreSQL tools:

```bash
# Export a database in custom format
pg_dump "host=<host> port=5432 dbname=myapp user=app_user sslmode=require" \
  --format=custom --file=myapp-$(date +%F).dump
```

The user must have the **Administrator (Admin)** or **Read-only** right on the exported database.

## Going further

- [Restore a backup](./restore-backup.md)
- [PostgreSQL concepts](../concepts.md)
