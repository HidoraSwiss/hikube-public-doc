---
sidebar_position: 2
title: "Concepts — Backups"
sidebar_label: Concepts
description: "Understand Hikube backups: destinations, retention, locked buckets, schedules in UTC, runs, restorable archives, in-place restore or restore to another database, PostgreSQL point-in-time restore."
---

# Concepts — Backups

## Terminology

| Term | Description |
|------|-------------|
| **Destination** | An S3 bucket in the project, the bucket user whose credentials it borrows, and a retention period in days. Every backup is written to a destination. |
| **Retention** | How long an archive is kept, from 1 to 3,650 days. After that, the archive is deleted automatically. |
| **Schedule** (plan) | Recurring backup of a resource to a destination, at set times. |
| **Run** | A backup in progress, triggered by a schedule or **on demand**. A successful run produces an archive. |
| **Archive** | Stored copy of the state of a resource at a given moment, from which you restore. |
| **Restore** | Rewriting a resource from an archive. |
| **Source resource** | The database, VM or disk the archive was taken from. |
| **Target** | The resource a restore writes into: the source itself (**in-place** restore), or another database of the same type. |

---

## Covered resources

| Type | In-place restore | Restore to another resource | Point-in-time restore | Deleting an archive erases the data |
|------|:---:|:---:|:---:|:---:|
| PostgreSQL | Yes | Yes, to a PostgreSQL database of the same major version | Yes | No |
| MariaDB | Yes | Yes, to another MariaDB database | No | No |
| Virtual machine | Yes | No | No | Yes |
| Disk | Only if the disk has been deleted | No | No | Yes |

Other services (MongoDB, Redis, RabbitMQ, Kubernetes clusters, buckets) are not covered.

### A VM carries its disks

A virtual machine's archive contains **all the disks** of the VM. These disks therefore do not need a schedule of their own: in the **Backups** tab of such a disk, the console shows **Backed up with another resource**, and in **Backups** > **Protection**, the **Covered** state. The VM's archive also appears in the disk's list of archives.

Restoring this archive rewrites the VM **and** all its disks: you cannot restore only part of it.

---

## Destinations

A destination is created in **Backups** > **Destinations** > **Create a destination**. It holds:

| Item | Rule |
|------|------|
| **Name** | 1 to 40 characters: lowercase letters, digits and hyphens, not starting or ending with a hyphen. Unique in the project. |
| **Bucket** | An S3 bucket in the **same project**. You need to create one before the first destination. |
| **Credentials** | A user of the bucket. The console offers to **create a dedicated one** (recommended: its credentials serve backups only and can be revoked without touching anything else) or to reuse one. |
| **Retention** | Whole number of days, from 1 to 3,650. 30 days by default in the console. |

A destination serves all the covered resources in the project. Only the retention can be changed after creation; to change bucket, create another destination.

### Destination states

| State | Meaning |
|-------|---------|
| **Provisioning** | The destination is being set up, or deleted. |
| **Ready** | The destination accepts schedules, backups and restores. |
| **Error** | The bucket or its user can no longer be read, or a deletion did not complete. The message gives the cause. |
| **Unknown** | The state could not be read; try again in a moment. |

Only a **Ready** destination accepts a schedule, a backup or a restore. Credentials that are simply wrong are not detected at creation: for databases, the error shows up on the first backup.

### Retention

- For **MariaDB, VMs and disks**, each archive keeps the retention in force when it was written. Changing a destination's retention only affects later archives.
- For **PostgreSQL**, retention applies to the database's whole history: lowering it can delete archives already written, as soon as the next backup.
- An archive whose retention has elapsed is deleted automatically, along with the run line that produced it. The **last restorable archive** of a resource is always kept, whatever its age. An archive being read by a restore is never deleted.
- A VM or disk archive that reaches the end of its retention becomes non-restorable as soon as it expires, even before it is removed from the list.

### Locked bucket (WORM)

When a destination's bucket was created with object locking, the console shows **WORM · 365 d** next to the destination. Consequences:

- each archive is locked for 365 days after it is written: no one can delete it before then, not even support. The console shows **Locked (WORM) until** on the archive;
- the destination's retention cannot be shorter than the lock period (365 days);
- a locked archive remains restorable for the whole lock period.

### PostgreSQL: a single destination

A PostgreSQL database continuously archives its transaction logs, between two backups, to **a single** destination. Two destinations on the same database would share this stream: neither would contain a complete, and therefore restorable, history. Hikube therefore refuses to back up a PostgreSQL database to a second destination, whether by schedule or on demand.

To keep archives at different frequencies (for example daily and monthly), use several schedules to the **same** destination. For MariaDB, VMs and disks, several destinations are possible.

---

## Schedules

A schedule combines a resource, a destination and a time pattern. The name, the resource and the destination are fixed at creation; only the time pattern can be changed.

| Item | Rule |
|------|------|
| **Plan name** | 1 to 40 characters: lowercase letters, digits and hyphens, not starting or ending with a hyphen. Unique in the project. |
| **Time pattern** | A preset (**Hourly**, **Daily**, **Weekly**) or a five-field cron expression. |
| **Maximum frequency** | One run per hour. |

### Schedule times and time zone

A schedule's time pattern is **stored in UTC**.

- With the **Preset** tab, you choose a **local** time; the console converts it to UTC when saving.
- With the **Cron expression** tab, you enter an expression directly **in UTC**, for example `30 1 * * *` for 01:30 UTC every day. `@hourly`, `@daily`, `@weekly`, `@monthly` and `@yearly` are accepted; intervals (`@every`) and time zone prefixes (`CRON_TZ=`, `TZ=`) are refused.
- Since the time pattern is fixed in UTC, a scheduled backup **shifts by one hour in local time** at each daylight saving change. The console says so and shows the **Next run** in local time.

### Schedule states

| State | Meaning |
|-------|---------|
| **Ready** | The time pattern is valid, the resource and the destination exist. |
| **Error** | The time pattern is not valid, or the resource or the destination no longer exists. The message says which. |
| **Unknown** | The state could not be read. |

Deleting a schedule stops future runs and **keeps the archives** already taken. The run history of this schedule disappears with it.

---

## Runs

A run goes through the **Pending** and **In progress** states, then **Succeeded** or **Failed**. A run you have cancelled shows as **Cancelled**.

- For a VM or a disk, the console shows the percentage of **data transferred**. This figure measures the data read, not the space taken up in the bucket: blocks already present in a previous archive are not written again.
- For PostgreSQL and MariaDB, no progress is available.

---

## Archives

### Archive states

| State | Meaning |
|-------|---------|
| **Pending** | The archive is being written. |
| **Ready** | The archive is complete. |
| **Failed** | The backup did not complete; the archive is not restorable. |

### Restorable or not

A **Ready** archive is only restorable if its destination still exists, is not being deleted and is indeed the one the archive was written to. When this is not the case, the console shows the reason:

| Reason shown | What to do |
|--------------|------------|
| The archive is not ready | Wait for the write to finish, or use another archive if the backup failed. |
| Its destination has been deleted | The archive does not become restorable again, even if you create a destination of the same name again. Use a more recent archive. |
| Its destination is being deleted | Use another archive. |
| The destination of that name was created again after the backup | It is no longer the destination the archive was written to, even if it points at the same bucket. Use an archive taken since. |
| The destinations could not be read | Try again in a moment. |
| The archive's data is no longer stored | VMs and disks: the archive was erased, for instance at the end of its retention. |

Restorable means that the restore will be accepted; Hikube does not read back the contents of the bucket to check.

### Deleting an archive

| Type | Effect | Confirmation |
|------|--------|--------------|
| PostgreSQL, MariaDB | Removes the archive from the list; its data **stays in your bucket**. | Simple |
| Virtual machine, disk | Removes the archive **and erases its data**. This is irreversible. | Typing the archive name |

An archive being read by a restore cannot be deleted. Neither can an archive locked by a WORM bucket, until its lock ends.

---

## Restores

### In-place restore or restore to another database

- **In place**: the archive is restored onto its source resource, whose current content is overwritten. The console asks you to type the resource name to confirm.
- **To another database** (PostgreSQL and MariaDB only): the archive is restored into another **existing** database in the project, of the same type. To get a copy, first create an empty database, then restore the archive into it.
  - **PostgreSQL**: the target database is entirely replaced by the content of the archive. It must have the **same major version** of PostgreSQL as the backed-up database.
  - **MariaDB**: the archive is an export replayed into the target database. Each table it contains replaces the table of the same name; tables and databases it does not contain are kept.

One restore at a time per resource. During a restore, no on-demand backup of that resource is accepted.

### Source resource deleted or recreated

| Situation | PostgreSQL, MariaDB | VM, disk |
|-----------|---------------------|----------|
| The source has been deleted | Choose another database as the target. | The restore **recreates** the resource from the archive. |
| A new resource bears the source's name, created after the backup | It is treated as another database: the restore is accepted after confirmation. | Refused: first delete the recreated resource, then restore. |

### Restoring a VM: the replaced disks

Restoring a VM in place replaces each of its disks with its copy from the archive. The **This machine's current disks** choice decides what happens to what they held until then:

- **Discard them** (default): their old content is deleted once the restore has succeeded and been verified.
- **Keep them**: their old content becomes a separate disk, named `<disk>-orig-<identifier>`, detached from any VM, listed in **Disks** and billed like any disk until you delete it.

A restore that fails or is cancelled deletes **nothing**, even with **Discard them**: the old disks are then kept under the same `<disk>-orig-<identifier>` name, and the restore's message says so. Delete them when you no longer need them.

Before moving to **Succeeded**, a VM or disk restore checks that each disk of the archive has indeed been rewritten. During this check (a few seconds), it remains **In progress**. If a disk was not restored, the restore moves to **Failed** and names it; running the restore again may succeed.

### A disk is not restored over itself

The archive of a disk backed up on its own cannot be restored onto that disk while it exists. To return a disk attached to a VM to an earlier state, restore an archive **of the VM**: it rewrites all its disks. A deleted disk, on the other hand, is recreated by restoring its archive.

### Cancellation

| Operation | Can be cancelled | Notes |
|-----------|------------------|-------|
| Backup not started yet | Yes, all types | |
| PostgreSQL backup | While it is waiting to start | A PostgreSQL backup that has started is not interrupted: it finishes or fails on its own. |
| MariaDB backup | Yes | |
| VM or disk backup | Yes | In the first few seconds, while the configuration is being copied, cancellation is refused: try again a few seconds later. |
| PostgreSQL or MariaDB restore | No | A database restore that does not complete fails on its own after 30 minutes. |
| VM or disk restore | Yes | Nothing is undone: the VM may remain stopped and its disks set aside. A new restore brings it back. |

A cancelled backup shows as **Cancelled** in the activity, not as a failure, and produces no archive.

---

## Point-in-time restore (PostgreSQL)

A backed-up PostgreSQL database continuously archives its **transaction logs** to its destination. A restore can therefore bring the database back to:

| Choice | Result |
|--------|--------|
| **State of the backup** (default) | The exact state of the chosen archive. |
| **Most recent state** | The archive, then all the logs archived since: the most recent known state. |
| **A point in time** | The state of the database just before the first transaction after the chosen point. |

### Restore window

Each PostgreSQL archive has a **window** of reachable points in time, which the console shows on a time bar:

- it starts at the **end** of the backup (not its start: the database is only consistent once the backup has finished);
- it ends **before the last transaction** present in the archived logs. A point after the last transaction cannot be reached, because the restore stops on the first transaction that follows it: in that case choose **Most recent state**, which includes this last transaction;
- logs are archived with a slight delay: the very last minutes are not restorable yet.

### Branches of the history

Restoring a PostgreSQL database **in place** starts a new **branch** of its history. Archives taken before this restore belong to the old branch. If, from a given archive, the most recent state or a given point would have to start from an archive on another branch, it would not give back the data of the chosen archive: the console does not offer these points, and the restore is refused. Choose an earlier point, or an archive on the branch you want.

---

## Lifecycle

| Action | Behavior |
|--------|----------|
| Create a destination | **Provisioning**, then **Ready**. |
| Change the retention | See [Retention](#retention). Not possible below the lock period of a WORM bucket. |
| Delete a destination | Refused as long as a schedule, a backup or a restore uses it. Archives stay in the bucket but are no longer restorable; for PostgreSQL, their retention stops being enforced. |
| Delete a schedule | Future runs stop; archives are kept. |
| Delete an archive | See [Deleting an archive](#deleting-an-archive). |
| Delete a backed-up resource | Its archives are kept and remain restorable. |

---

## Further reading

- [Overview](./overview.md)
- [Quick start](./quick-start.md)
- [Restore a database to a point in time](./how-to/restore-point-in-time.md)
