---
title: "How to cancel a backup or a restore"
sidebar_position: 6
description: "Cancel an ongoing backup or a stuck VM restore on Hikube: what can be interrupted, what cannot, and what remains after cancellation."
---

# How to cancel a backup or a restore

This guide stops an ongoing backup, or a VM or disk restore that does not finish, from the [Hikube console](https://console.hikube.cloud).

## What can be cancelled

| Operation | Can be cancelled |
|-----------|------------------|
| Backup not started yet | Yes |
| PostgreSQL backup | While it is waiting to start. Once started, it is not interrupted: it finishes or fails on its own. |
| MariaDB backup | Yes |
| VM or disk backup | Yes, except in the very first seconds |
| VM or disk restore | Yes, except in the very first seconds |
| PostgreSQL or MariaDB restore | No. It fails on its own after 30 minutes if it does not complete. |
| Operation finished or about to finish | No |

## Cancel a backup

1. Find the ongoing backup: **Run status** section of the resource's **Backups** tab, or **Backups** > **Activity**.
2. Click **Cancel**.
3. In the **Cancel the backup of “…”?** window, click **Cancel backup** (or **Let it run** to give up).

The backup shows as **Cancelled** in the activity, and produces no archive.

## Cancel a VM or disk restore

1. In the **Restores** section of the **Backups** tab, or in **Backups** > **Activity**, click **Cancel restore**.
2. Confirm with **Cancel restore**.

:::warning Nothing is undone
Ongoing transfers stop, but what the restore has already done stays as it is: the VM may remain stopped and its disks set aside under the name `<disk>-orig-<identifier>`, as after a failure. A new restore is what brings the VM back.
:::

## When cancellation is refused or incomplete

| Message | Meaning | What to do |
|---------|---------|------------|
| **Cannot cancel yet** | The VM or the disk is still copying its configuration; no transfer has started yet. | Click **Retry** a few seconds later. |
| **Cancellation refused** | The operation cannot be interrupted (PostgreSQL backup already started, database restore, operation finished). The message gives the reason. | Wait for the operation to finish. |
| **Cancellation to finish** | The operation has indeed stopped, but part of the work in progress could not be stopped on the first attempt. | Click **Retry**. Otherwise, Hikube finishes the cleanup on its own within the following minutes. |

## Further reading

- [Restore a VM or a disk](./restore-vm-or-disk.md)
- [Concepts: cancellation](../concepts.md#cancellation)
