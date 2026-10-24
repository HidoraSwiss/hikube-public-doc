---
sidebar_position: 3
title: "Back up and restore a PostgreSQL database"
sidebar_label: Quick start
description: "Create a backup destination from the Hikube console, schedule the backup of a PostgreSQL database, run one on demand, then restore the archive."
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# Back up and restore a PostgreSQL database

This guide creates a backup destination from the [Hikube console](https://console.hikube.cloud), schedules a daily backup of a PostgreSQL database, runs one on demand, then restores the resulting archive. The procedure is the same for a MariaDB database, a VM or a disk.

---

## Prerequisites

- A Hikube project containing:
  - an **S3 bucket** (see [Create a bucket](../storage/buckets/quick-start.md));
  - a **PostgreSQL database**, for example `orders-db` (see [PostgreSQL quick start](../databases/postgresql/quick-start.md)).

---

## Step 1: Open destination creation

1. In the side menu, open **Infrastructure** > **Backups**.
2. Open the **Destinations** tab, then click **Create a destination**.

The **New destination** page opens.

---

## Step 2: Configure and confirm

1. **Name**: `daily` (lowercase letters, digits and hyphens, at most 40 characters).
2. **Bucket**: choose the project's bucket.
3. **Credentials**: leave **Create a dedicated user** selected and enter a **User name**, for example `backup`. Its credentials will serve backups only.
4. **Retention (days)**: keep `30`.
5. Click **Create**.

The console shows **Destination created**: “daily” is being provisioned.

---

## Step 3: Check the state

In the **Destinations** tab, the state of `daily` goes from **Provisioning** to **Ready** within moments.

**Expected result:** destination **Ready**, with the bucket, the user and a 30-day retention.

---

## Step 4: Schedule and run a backup

1. Open **PostgreSQL**, click `orders-db`, then the **Backups** tab.
2. In **Schedule**, click **Schedule**. The **Schedule a backup** window opens:
   - **Plan name**: `orders-db-daily`;
   - **Destination**: `daily`;
   - **Preset** tab, **Frequency**: **Daily**, **Hour** `02`, **Minute** `00` (local time).
3. Click **Schedule**. The **Schedule** card shows the time pattern and the **Next** run.
4. In **On-demand backup**, click **Back up now**. The console shows **Backup started to “daily”**.

The backup appears in **Run status**, then in the database's list of archives.

**Expected result:** after a few minutes, the archive moves to **Ready**.

:::note Time in UTC
The time chosen in the preset is converted to UTC. It will therefore shift by one hour in local time at the next daylight saving change. See [Concepts](./concepts.md#schedule-times-and-time-zone).
:::

---

## Step 5: Restore and check

First add a marker, so you can see that it is gone after the restore:

```sql
CREATE TABLE after_backup (id int);
```

Then restore the archive onto the original database:

1. In the **Backups** tab of `orders-db`, on the archive's row, click **Restore**.
2. **Restore target**: **In place**.
3. **Restore up to**: leave the state of the selected backup.
4. Type `orders-db` to confirm, then click the restore button (**Restore the state of the backup of…**).

:::warning
An in-place restore **overwrites** the current content of the database. To test without touching your data, create a second, empty PostgreSQL database of the same version and choose **Another application**.
:::

The restore appears in **Restores**, then moves to **Succeeded**. Reconnect to the database:

```sql
SELECT to_regclass('after_backup');
```

**Expected result:** `NULL`: the table created after the backup no longer exists.

---

## Step 6: Quick troubleshooting

| Symptom | Action |
|---------|--------|
| **No bucket in this project** | Create a bucket from **S3 Buckets**, then come back to destination creation. |
| The destination stays in **Error** | The bucket or its user can no longer be read: see [Troubleshooting](./troubleshooting.md#the-destination-is-in-error). |
| **No destination ready in this project.** in the schedule window | Wait for the destination to be **Ready**. |
| The archive is **Failed** | Read the run's message in **Backups** > **Activity**, then see [Troubleshooting](./troubleshooting.md#a-backup-fails). |
| The restore is refused | See [Troubleshooting](./troubleshooting.md#a-restore-is-refused). |

---

## Step 7: Cleanup

1. In the **Backups** tab of `orders-db`, **Schedule** card, click **Delete** and confirm. The archives are kept.
2. Delete the test archives with **Delete** on each row. For PostgreSQL, only the record disappears: the data stays in the bucket, which you can empty from **S3 Buckets**.
3. In **Backups** > **Destinations**, open the menu of `daily` and choose **Delete**. Deletion is refused as long as a schedule, a backup or a restore uses it.

---

## Next steps

- [Schedule backups](./how-to/schedule-backups.md)
- [Restore a database to a point in time](./how-to/restore-point-in-time.md)
- [Restore a VM or a disk](./how-to/restore-vm-or-disk.md)

<NavigationFooter
  nextSteps={[
    {label: "How-to guides", href: "../how-to/create-destination"},
    {label: "FAQ", href: "../faq"},
  ]}
/>
