---
title: "How to configure automatic backups — PostgreSQL"
sidebar_label: "How to configure automatic backups"
sidebar_position: 3
description: "Schedule the backups of a Hikube PostgreSQL cluster from the console, to a bucket in your project, and export a database on demand with pg_dump."
---

# How to configure automatic backups

PostgreSQL clusters are backed up with the Hikube [backup service](../../../backups/overview.md), from the **Backups** tab of the cluster page in the [Hikube console](https://console.hikube.cloud).

## Principle

- **Full backups**, scheduled or on demand, written to an S3 bucket in your project;
- **Continuous archiving of transaction logs** between two backups, which makes it possible to restore the database to a point in time;
- **Retention** in days, set by the destination.

## Steps

1. Create a destination in **Infrastructure** > **Backups** > **Destinations**: see [Create a destination](../../../backups/how-to/create-destination.md).
2. Open **PostgreSQL**, the cluster, then the **Backups** tab.
3. Click **Schedule**, choose the destination and the time pattern, then **Schedule**. See [Schedule backups](../../../backups/how-to/schedule-backups.md).

:::warning A single destination per cluster
All backups of a given PostgreSQL cluster must target the same destination: a second destination is refused.
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
- [Backup concepts](../../../backups/concepts.md)
