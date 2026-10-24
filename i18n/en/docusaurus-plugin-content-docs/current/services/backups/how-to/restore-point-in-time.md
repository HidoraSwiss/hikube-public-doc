---
title: "How to restore a PostgreSQL database to a point in time"
sidebar_position: 4
description: "Restore a Hikube PostgreSQL database to the exact state of a backup, to its most recent state or to a point in time, thanks to transaction logs archived continuously."
---

# How to restore a PostgreSQL database to a point in time

A backed-up PostgreSQL database continuously archives its **transaction logs** to its destination, between two backups. This guide uses them to bring a database back to a point in time, for example just before an accidental deletion, from the [Hikube console](https://console.hikube.cloud).

## Prerequisites

- A PostgreSQL database with at least one **Ready** and restorable archive, taken **before** the target point in time.
- Having read [Restore a PostgreSQL or MariaDB database](./restore-database.md#before-you-start): the same precautions apply.

## What you can restore

| Choice in **Restore up to** | Result |
|-----------------------------|--------|
| **State of the backup of …** (default) | The exact state of the chosen archive. |
| **Most recent state** | The archive, then all the logs archived since, up to the last known write. |
| A point on the time bar, or a **Date** and a **Time (24 h)** | The state of the database just before the first transaction after this point. |

## Steps

### 1. Choose the archive

1. Open **PostgreSQL**, the database, then its **Backups** tab.
2. On the row of the most recent archive **before** the target point in time, click **Restore**.
3. Choose the **Restore target**. To examine the data without touching the database in service, choose **Another application** and an empty database of the same version.

### 2. Choose the point in time

The **Restore up to** section shows a time bar. Set the **Scale** (**1 h**, **6 h**, **1 day**, **7 days**) and navigate with **Previous backup** / **Next backup**.

- Click the time bar, or enter a **Date** and a **Time (24 h)** in local time. The console shows the bounds of the window: **Restorable from … to …**.
- A point outside the window is moved to the nearest bound, and the console says so (**Before the first backup: moved to …**, **Not archived yet: moved to …**).
- **Back to the most recent** selects the most recent state.

The button label reflects your choice: **Restore the state at …**, **Restore the most recent state**, **Restore the state of the backup of …**.

### 3. Confirm

Type the requested name, then click the restore button.

## Understanding the window

```mermaid
flowchart LR
    A["Start of the backup"] --> B["End of the backup<br/>(first restorable point)"]
    B --> C["Restorable points"]
    C --> D["Last archived transaction<br/>(not included)"]
    D --> E["Not archived yet"]
```

- **First point**: the end of the backup, not its start. The database is only consistent once the backup has finished.
- **Last point**: just before the last archived transaction. A restore stops on the first transaction that **follows** the requested point; after the last transaction, there is none left, and the point cannot be reached. To include this last write, choose **Most recent state**.
- **Not archived yet**: logs leave for the destination with a delay of a few minutes; the very last minutes are not restorable yet.
- **No write**: if nothing has been written since the backup, the most recent state is that of the backup, and the console says so (**Same as the most recent state**).

## Special cases

| Message | Meaning | What to do |
|---------|---------|------------|
| **Last write unknown** | The archived logs could not be read: the window shown is only an estimate. | Try again later, or restore the state of the backup. |
| "log archiving is not working on this database" | No point after the backup can be guaranteed. | Restore the state of the backup; contact support if archiving does not resume. |
| Points not offered **from … on** (another branch of the history) | An earlier in-place restore created a new branch of the history; beyond that date, the restore would start from an archive on the other branch. | Choose an earlier point, or an archive on the branch you want. |
| **No transaction after this point** | The point is after the last archived write. | Choose **Most recent state**: the result is the same. |

## Verification

- The restore is **Succeeded**; the **Recovery point** column of the **Restores** section shows the restored point, **State of the backup** or **Most recent state**.
- Connect to the database and check that the targeted data is present, and that changes made after the chosen point are not.

## Further reading

- [Concepts: point-in-time restore](../concepts.md#point-in-time-restore-postgresql)
- [Troubleshooting](../troubleshooting.md#a-restore-is-refused)
