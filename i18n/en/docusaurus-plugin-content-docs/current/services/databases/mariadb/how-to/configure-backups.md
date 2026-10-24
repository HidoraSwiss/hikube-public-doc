---
title: "How to configure automatic backups — MariaDB"
sidebar_label: "How to configure automatic backups"
sidebar_position: 3
description: "Schedule the backups of a Hikube MariaDB cluster from the console, to a bucket in your project, and export a database on demand with mysqldump."
---

# How to configure automatic backups

MariaDB clusters are backed up with the Hikube [backup service](../../../backups/overview.md), from the **Backups** tab of the cluster page in the [Hikube console](https://console.hikube.cloud).

## Principle

Each backup is a full export of the cluster, scheduled or on demand, written to an S3 bucket in your project and kept according to the destination's **retention**.

## Steps

1. Create a destination in **Infrastructure** > **Backups** > **Destinations**: see [Create a destination](../../../backups/how-to/create-destination.md).
2. Open **MariaDB**, the cluster, then the **Backups** tab.
3. Click **Schedule**, choose the destination and the time pattern, then **Schedule**. See [Schedule backups](../../../backups/how-to/schedule-backups.md).

To keep backups for different periods (for example daily ones kept 7 days and weekly ones kept 30 days), create two destinations, each with its own retention, and a schedule to each.

## On-demand logical backup

Independently of the backups managed by the platform, you can export a database at any time with `mysqldump` (or `mariadb-dump`):

```bash
mysqldump -h <host> -P 3306 -u app-user -p \
  --single-transaction --routines --triggers \
  myapp > myapp-$(date +%F).sql
```

The `--single-transaction` option produces a consistent export without locking InnoDB tables.

## Going further

- [Restore a backup](./restore-backup.md)
- [Backup concepts](../../../backups/concepts.md)
