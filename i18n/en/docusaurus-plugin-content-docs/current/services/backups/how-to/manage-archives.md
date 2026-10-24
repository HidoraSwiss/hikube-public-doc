---
title: "How to view and delete archives"
sidebar_position: 7
description: "View the Hikube backup archives of a resource or of the whole project, understand why an archive is not restorable, and delete archives."
---

# How to view and delete archives

This guide shows where to find backup archives in the [Hikube console](https://console.hikube.cloud), how to tell whether they are restorable, and how to delete them.

## View the archives

- **For a resource**: **Backups** tab of the database, VM or disk. A disk's list also contains the archives of the VM it is attached to.
- **For the whole project**: **Backups** > **Archives**. This view also lists the archives of deleted resources (**Application deleted**), from which they can be recreated.

For each archive, the console shows the **Archive**, its **Date**, its **Duration**, its **Status**, its **Origin** (the name of the schedule, or **On demand**) and its **Destination**. The **Size** column stays empty: archive size is not measured today.

## Find out whether an archive is restorable

A **Ready** archive is restored with the **Restore** button. When it cannot be, the console shows **Cannot be restored:** followed by the reason:

| Reason | What to do |
|--------|------------|
| The archive is not ready | Wait for the write to finish, or choose another archive if the backup failed. |
| Its destination has been deleted | The archive will not become restorable again, even if you create a destination of the same name again. Choose a more recent archive. |
| Its destination is being deleted | Choose another archive. |
| The destination of that name was created again after the backup | It is no longer the destination the archive was written to. Choose an archive taken since. |
| The destinations could not be read | Try again in a moment. |
| The archive's data is no longer stored | VMs and disks: the archive was erased, for instance at the end of its retention. Choose another archive. |

## Delete an archive

1. On the archive's row, click **Delete**.
2. Confirm:
   - **PostgreSQL, MariaDB**: the record is removed; **the archive stays in your bucket**. To free up the space, empty the bucket yourself.
   - **VM, disk**: **the stored archive is destroyed along with the record**. This is irreversible: type the name of the archive to confirm.

To delete several archives of the same resource, select them then click **Delete N archives**. The console asks you to type the number of selected archives to confirm.

A deletion is refused in two cases:

- the archive is being read by a restore: wait for the restore to finish;
- the archive is on a **WORM** destination and its lock is still running: the console shows **"…" is locked** with the lock end date. It remains restorable until then. A bulk deletion leaves these archives out.

## Automatic retention

You do not need to delete archives by hand: each one is deleted automatically at the end of its retention, along with the corresponding run line. The last restorable archive of a resource is always kept, even if it is past its retention. See [Concepts: retention](../concepts.md#retention).

## Further reading

- [Create and manage a destination](./create-destination.md)
- [Restore a database](./restore-database.md)
- [Restore a VM or a disk](./restore-vm-or-disk.md)
