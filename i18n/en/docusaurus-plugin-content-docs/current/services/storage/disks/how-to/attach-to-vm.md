---
title: "How to attach a disk to a VM"
---

# How to attach a disk to a VM

This guide explains how to attach an existing disk to a virtual machine, make it usable in the system, then detach it, from the [Hikube console](https://console.hikube.cloud).

## Prerequisites

- A **disk** with the **Ready** status (not attached) in your project (see the [quick start](../quick-start.md))
- A **VM** in the same project

## Principle

Attachment is configured **on the VM side**, in the **Storage** section:

- when creating a VM (**Storage** step of the wizard);
- or on an existing VM (VM page → **Edit** → **Storage** section).

Each VM volume can be **New** (the console creates the disk) or **Existing** (you choose a disk that has already been created). The first volume is the **System Disk (Boot)**; the following ones are data volumes.

| Volume | Disks offered in **Existing** mode |
|--------|------------------------------------|
| **System Disk (Boot)** | Unattached system disks (created from an image) |
| **Storage Volume #N** | Unattached data disks |

## Attach a disk to an existing VM

1. Open **Infrastructure** → **VM Instances**, then the VM page, and click **Edit**.
2. In the **Storage** section, click **Add a disk**.
3. On the new volume, select **Existing**.
4. In **Select an existing volume**, search for and choose the disk. The list shows its name and size.
5. Click **Save**.

:::warning Restart
A storage change restarts the VM. The console indicates it: "The instance type or storage was modified. The instance will reboot, which may take several minutes."
:::

## Attach a disk when creating a VM

At the **Storage** step of the VM creation wizard, click **Add a disk**, select **Existing**, then the disk in **Select an existing volume**. To boot the VM from a system disk created in advance, select **Existing** on the **System Disk (Boot)**.

## Make the disk usable in the VM (Linux)

Connect to the VM over SSH and identify the disk:

```bash
lsblk
```

For an **empty disk**, create a file system and mount it:

```bash
# Warning: mkfs erases the disk contents
sudo mkfs.ext4 /dev/vdb
sudo mkdir -p /mnt/data
sudo mount /dev/vdb /mnt/data

# Automatic mount at boot
UUID=$(sudo blkid -s UUID -o value /dev/vdb)
echo "UUID=$UUID /mnt/data ext4 defaults,nofail 0 2" | sudo tee -a /etc/fstab
```

For a disk that is **already formatted** (for example detached from another VM), do not run `mkfs`: mount it directly.

:::tip
Use the UUID rather than the device name (`/dev/vdb`) in `/etc/fstab`: the device order can change when you add or remove disks.
:::

## Detach a disk

1. In the VM, unmount the disk and remove its line from `/etc/fstab`.
2. Open the VM page → **Edit** → **Storage** section.
3. Click the volume's delete icon (**Remove disk**), then confirm by entering the disk name.
4. Click **Save**. The VM restarts.

The disk is **detached**, not deleted: it remains in **Infrastructure** → **Disks** with the **Ready** status, and can be attached to another VM. To delete it permanently, use the **Delete** action on the disk page.

:::note
Deleting a VM also detaches its disks without deleting them. Remember to delete disks that are no longer needed: they keep consuming the project's storage quota.
:::

## Verification

- The disk page shows the VM name in **Attached to** (link to the VM) and the **In Use** status.
- In the VM, `lsblk` lists the disk and `df -h` shows the mount point.

## Further reading

- [Resize a disk](./resize.md)
- [Create a system disk from an image](./create-from-image.md)
- [Virtual machines](../../../compute/overview.md)
