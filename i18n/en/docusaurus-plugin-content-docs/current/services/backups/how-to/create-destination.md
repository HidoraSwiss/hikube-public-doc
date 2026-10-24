---
title: "How to create and manage a backup destination"
sidebar_position: 1
description: "Create a Hikube backup destination on a bucket in your project, change its retention, use a locked bucket (WORM) and delete a destination."
---

# How to create and manage a backup destination

A destination says where the project's backups are written, and how long they are kept. This guide creates one from the [Hikube console](https://console.hikube.cloud), then explains how to change its retention and delete it.

## Prerequisites

- An **S3 bucket** in the project (see [Create a bucket](../../storage/buckets/quick-start.md)). For archives that no one can delete for a year, create it with object locking (see [Locked bucket](#use-a-locked-bucket-worm)).

## Create a destination

1. Open **Infrastructure** > **Backups**, **Destinations** tab, then click **Create a destination**.
2. Fill in the **New destination** page:

   | Field | Value |
   |-------|-------|
   | **Name** | Lowercase letters, digits and hyphens, at most 40 characters, not starting or ending with a hyphen. Unique in the project. |
   | **Bucket** | A bucket in the project. |
   | **Credentials** | **Create a dedicated user** (recommended) with a **User name**, or **Use an existing user** of the bucket. |
   | **Retention (days)** | Whole number of days, from 1 to 3,650. |

3. Click **Create**. The console shows **Destination created**.

In the **Destinations** tab, the destination goes from **Provisioning** to **Ready**. It can then be used by all the PostgreSQL and MariaDB databases, VMs and disks in the project.

:::tip A dedicated user
A bucket user reserved for backups can be revoked or have its keys renewed without touching the applications that use the same bucket. If creating the user succeeds but creating the destination does not, the console says so: try again choosing this existing user, or delete it from the bucket screen.
:::

## Change the retention

1. In the **Destinations** tab, open the destination's menu and choose **Change retention**.
2. Enter the **Days kept**, then click **Save**.

The new value does not apply the same way to all archives:

- **MariaDB, VMs, disks**: archives already written keep their retention; only the following ones take the new value.
- **PostgreSQL**: the new value applies to the whole history. Lowering it can delete existing archives as soon as the next backup.

## Use a locked bucket (WORM)

If the chosen bucket was created with object locking, each archive is locked there for 365 days: no one can delete it before then. The console shows **WORM · 365 d** next to the destination.

- The retention must be at least 365 days. A shorter value is refused, at creation as well as when changing it, with the exact minimum.
- A bucket's locking never changes: it is set when the bucket is created.

## Delete a destination

1. In the **Destinations** tab, open the destination's menu and choose **Delete**.
2. Confirm.

Before confirming, keep in mind that:

- deletion is **refused** as long as a schedule, an ongoing backup or a restore uses the destination: first delete the schedules concerned;
- archives already taken **stay in your bucket**: nothing is erased;
- these archives **are no longer restorable**, even if you then create a destination of the same name on the same bucket again;
- for PostgreSQL, retention stops being enforced: archives are no longer deleted automatically.

If the deletion does not fully complete, the destination stays listed in **Error** with a message that says what could not be released: delete it again.

## Verification

- The destination is **Ready** in the **Destinations** tab.
- In the **Backups** tab of a database, a VM or a disk, the destination is offered in **Schedule** and **Back up now**.

## Further reading

- [Schedule backups](./schedule-backups.md)
- [Concepts: destinations](../concepts.md#destinations)
