---
title: "How to configure automatic backups"
sidebar_position: 3
---

# How to configure automatic backups

:::info Availability
MariaDB backup configuration is not yet available as self-service in the [Hikube console](https://console.hikube.cloud).
To enable or change a cluster's backups, [contact support](mailto:support@hidora.io).
:::

## Principle

MariaDB cluster backups rely on **encrypted** snapshots sent to S3-compatible object storage, scheduled at regular intervals and subject to a **retention strategy** that determines how long they are kept.

## Information to prepare

For an activation request, give support the following:

| Information | Example |
|-------------|---------|
| Project and cluster name | `prod` / `shop-db` |
| Backup frequency | Every day at 2 a.m. |
| Desired retention | 7 daily backups, 4 weekly |
| Destination bucket | A dedicated [Hikube Object Storage](../../../storage/buckets/overview.md) bucket or external S3 storage |

:::warning
Never send S3 access keys through an unsecured channel. Support will tell you the appropriate procedure.
:::

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
- [MariaDB concepts](../concepts.md)
