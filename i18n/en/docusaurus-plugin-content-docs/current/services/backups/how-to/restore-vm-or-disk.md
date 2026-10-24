---
title: "How to restore a VM or a disk"
sidebar_position: 5
description: "Restore a Hikube virtual machine and all its disks from an archive, choose what happens to the replaced disks, and recreate a deleted VM or disk."
---

# How to restore a VM or a disk

This guide restores a virtual machine, or a deleted disk, from an archive, from the [Hikube console](https://console.hikube.cloud).

## Prerequisites

- A **Ready** and restorable archive of the VM or the disk (see [Manage archives](./manage-archives.md)).

## What you need to know

- **A VM or a disk is restored onto itself**, never onto another resource.
- **A VM's archive contains all its disks**, and the restore rewrites them all. It is not possible to restore only one.
- **A disk backed up on its own is not restored onto itself while it exists.** To return an attached disk to an earlier state, restore an archive of the VM it is attached to. A disk's archive is used to **recreate** it if it has been deleted.
- The VM is stopped during the restore: plan for a service interruption.

## Restore a VM

1. Open **VM Instances**, the VM, then its **Backups** tab. You can also start from **Backups** > **Archives**.
2. On the archive's row, click **Restore**.
3. Choose what happens to **This machine's current disks**:

   | Choice | Effect |
   |--------|--------|
   | **Discard them** (default) | Each disk takes back the content of the archive; what it held until then is deleted once the restore has succeeded. |
   | **Keep them** | Each disk takes back the content of the archive; what it held until then becomes a separate disk, named `<disk>-orig-<identifier>`, detached, billed until you delete it. |

4. Type the name of the VM to confirm, then click **Restore**.

:::tip When to keep the old disks
Choose **Keep them** if you are not sure the archive is the right one: you will be able to attach an old disk to a VM to recover files from it. Remember to delete it afterwards from **Disks**.
:::

## Recreate a deleted VM or disk

If the VM or the disk has been deleted, the console says so (**“…” was deleted: it will be recreated from this archive.**). The restore recreates the resource under its original name.

For a deleted VM some of whose disks survived, the choice applies to **The disks that outlived this machine**.

If a **new** VM or disk now bears the same name, created after the backup, the restore is refused: it would replace the data of another resource. First delete this resource, then restore. The same applies if one of the disks contained in a VM's archive has been deleted then recreated since the backup.

## Track the restore

- The **Restores** section of the **Backups** tab shows the status, the percentage of data transferred and what happens to the original disks (**Original disks deleted if the restore succeeds**, **Original disks kept**…).
- Before moving to **Succeeded**, the restore checks that each disk of the archive has indeed been rewritten; it remains **In progress** during these few seconds.
- A restore that fails, or that you cancel, **deletes nothing**, even with **Discard them**: the old disks are kept under the name `<disk>-orig-<identifier>`, and the message says so (**Original disks kept: the restore did not succeed**). Running the restore again may succeed.
- A VM restore does not stop on its own if it gets stuck: you can cancel it (see [Cancel a backup or a restore](./cancel-backup-or-restore.md)).

## Verification

- The restore is **Succeeded**.
- Start the VM if it is stopped, connect to it and check your data.
- With **Keep them**, the `<disk>-orig-<identifier>` disks appear in **Disks**, not attached.

## Further reading

- [Concepts: restores](../concepts.md#restores)
- [Attach a disk to a VM](../../storage/disks/how-to/attach-to-vm.md)
