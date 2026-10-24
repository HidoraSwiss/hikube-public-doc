---
title: "How to schedule backups and back up on demand"
sidebar_position: 2
description: "Schedule the recurring backup of a Hikube database, VM or disk, run an on-demand backup and spot unprotected resources."
---

# How to schedule backups and back up on demand

This guide schedules the recurring backup of a resource from the [Hikube console](https://console.hikube.cloud), runs an immediate backup, and shows how to spot resources that are not protected.

## Prerequisites

- A **Ready** destination in the project (see [Create a destination](./create-destination.md)).
- A PostgreSQL or MariaDB database, a VM or a disk.

## Schedule a backup

1. Open the resource (for example **PostgreSQL** > your database, or **VM Instances** > your VM), then its **Backups** tab.
2. In the **Schedule** card, click **Schedule**.
3. In the **Schedule a backup** window:
   - **Plan name**: lowercase letters, digits and hyphens, at most 40 characters;
   - **Destination**: a **Ready** destination;
   - the time pattern, in one of the two ways below.
4. Click **Schedule**.

### Time pattern from a preset

In the **Preset** tab, choose a **Frequency**:

| Frequency | Fields |
|-----------|--------|
| **Hourly** | **Minute** |
| **Daily** | **Hour**, **Minute** |
| **Weekly** | **Day**, **Hour**, **Minute** |

The time is entered in **local time** and converted to UTC when saving. The console shows the resulting expression followed by **(UTC)**, and the **Next run**.

### Time pattern as a cron expression

In the **Cron expression** tab, enter a five-field expression (minute, hour, day of month, month, day of week), **interpreted in UTC**:

| Expression | Meaning |
|------------|---------|
| `0 1 * * *` | Every day at 01:00 UTC |
| `30 2 * * 0` | Every Sunday at 02:30 UTC |
| `0 3 1 * *` | On the 1st of every month at 03:00 UTC |
| `@daily` | Every day at 00:00 UTC |

The following are refused: an expression that triggers more than once an hour (for example `*/30 * * * *`), `@every` intervals, and the `CRON_TZ=` or `TZ=` time zone prefixes.

:::note Daylight saving time
A time pattern is fixed in UTC: it shifts by one hour in local time at each daylight saving change. A backup scheduled at 02:00 in winter in Zurich runs at 03:00 in summer.
:::

## Edit or delete a schedule

- **Edit**: only the time pattern can be changed. The name, the resource and the destination are fixed at creation; to change destination, delete the schedule and create another one.
- **Delete**: future runs stop and archives already taken are kept. The run history of this schedule disappears with it.

A resource can have several schedules, for example a daily one and a monthly one.

:::warning PostgreSQL: a single destination
All schedules and backups of a given PostgreSQL database must target the **same** destination. A second destination is refused. See [Concepts](../concepts.md#postgresql-a-single-destination).
:::

## Back up now

1. In the resource's **Backups** tab, **On-demand backup** section, choose the **Destination** if several are ready.
2. Click **Back up now**.

The backup appears in **Run status**. For a VM or a disk, the console shows the percentage of data transferred.

An on-demand backup is refused while the same resource is being restored.

## Back up the disks of a VM

A VM's archive contains all its disks: scheduling the VM is enough. In the **Backups** tab of an attached disk, the console then shows **Backed up with another resource**. A schedule specific to the disk is still possible (**Schedule a backup of this resource**), but such an archive cannot be restored onto the disk while it exists: see [Restore a VM or a disk](./restore-vm-or-disk.md).

## Spot unprotected resources

Open **Backups** > **Protection**. Every covered resource in the project is listed there with its state:

| State | Meaning |
|-------|---------|
| **Scheduled** | At least one valid schedule. |
| **Covered** | No schedule of its own, but contained in the archives of another resource (disk of a scheduled VM). |
| **Schedule failing** | All its schedules are in error. |
| **Unprotected** | No schedule. |

The **Schedule** button on this page opens the schedule window directly. The **Backup status** widget on the dashboard sums up unprotected applications, latest failed runs and unavailable destinations.

## Verification

- The **Schedule** card shows the time pattern, the **Next** and the **Last** run.
- **Backups** > **Activity** lists each run with its status and duration.

## Further reading

- [Manage archives](./manage-archives.md)
- [Cancel a backup or a restore](./cancel-backup-or-restore.md)
