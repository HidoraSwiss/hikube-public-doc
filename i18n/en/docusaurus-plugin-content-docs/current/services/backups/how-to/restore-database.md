---
title: "How to restore a PostgreSQL or MariaDB database"
sidebar_position: 3
description: "Restore a Hikube PostgreSQL or MariaDB archive onto the original database or onto another database in the project, with the precautions to take before and the checks to run after."
---

# How to restore a PostgreSQL or MariaDB database

This guide restores a database archive from the [Hikube console](https://console.hikube.cloud), either onto the original database or onto another database in the project. To bring a PostgreSQL database back to a point in time, see [Restore to a point in time](./restore-point-in-time.md).

## Prerequisites

- A **Ready** and restorable archive of the database (see [Manage archives](./manage-archives.md)).
- To restore to another database: an **existing** database of the same type in the project. For PostgreSQL, it must have the **same major version** as the backed-up database.

## Before you start

:::warning A restore overwrites the data
Restoring onto the original database replaces its current content. This is irreversible. To recover some data without touching the database in service, restore to an empty database created for the occasion instead.
:::

- **Check the database's schedules** (PostgreSQL). An on-demand backup is refused during a restore, but a **scheduled** backup can trigger during it and make it fail. If the **Next** run of one of the database's schedules falls within the next 30 minutes, wait for it to finish before starting an in-place restore.
- **One restore at a time**: a second restore of the same database is refused until the first one has finished.

## Restore

1. Open the database (**PostgreSQL** or **MariaDB**), then its **Backups** tab. You can also start from **Backups** > **Archives**, which lists the archives of the whole project.
2. On the archive's row, click **Restore**.
3. Choose the **Restore target**:
   - **In place**: overwrites the current content of the database;
   - **Another application**: choose an existing database in the project, whose current content will be overwritten.
4. PostgreSQL only: choose the state to restore in **Restore up to** (by default, the state of the backup; see [Restore to a point in time](./restore-point-in-time.md)).
5. Type the requested name to confirm, then click the restore button.

The console shows **Restore of "…" started.** The restore appears in the **Restores** section of the **Backups** tab and in **Backups** > **Activity**.

### What happens to the target database

| Type | Effect of the restore |
|------|-----------------------|
| **PostgreSQL** | The target database is entirely rebuilt from the archive. Its previous data disappears. |
| **MariaDB** | The archive's export is replayed into the target database: each table it contains replaces the table of the same name; tables and databases it does not contain are kept. |

### The original database no longer exists

If the backed-up database has been deleted, the console shows **“…” no longer exists: pick another application.** Create a database of the same type (and of the same major version for PostgreSQL), then restore the archive onto it.

If a new database was created under the same name after the backup, it is treated as another database: the restore is accepted after confirmation.

## Track the restore

The restore goes through **Pending**, **In progress**, then **Succeeded** or **Failed**. A database restore that does not complete fails on its own after 30 minutes; it cannot be cancelled before then.

If a PostgreSQL restore has failed, the database may remain unavailable. An on-demand backup is then refused until the database is ready again: run a restore again, that is what brings it back.

## Verification

- The restore is **Succeeded** in the **Restores** section.
- Connect to the database and check your data, for example:

  ```sql
  -- PostgreSQL
  SELECT count(*) FROM my_table;
  ```

  ```sql
  -- MariaDB
  SELECT COUNT(*) FROM my_table;
  ```

- After an in-place PostgreSQL restore, run an on-demand backup: archives taken before the restore belong to the old branch of the database's history (see [Concepts](../concepts.md#branches-of-the-history)). This first backup may fail; run it again once (see [Troubleshooting](../troubleshooting.md#the-first-backup-of-a-postgresql-database-fails)).

## Further reading

- [Restore to a point in time](./restore-point-in-time.md)
- [Troubleshooting: a restore is refused](../troubleshooting.md#a-restore-is-refused)
