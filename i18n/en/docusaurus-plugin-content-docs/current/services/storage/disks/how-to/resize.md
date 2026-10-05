---
title: "How to resize a disk"
---

# How to resize a disk

This guide explains how to expand a disk from the [Hikube console](https://console.hikube.cloud), then extend its file system in the VM.

## Prerequisites

- A **disk** in your project
- Sufficient storage quota for the new size

:::warning No shrinking
Size reduction is not supported. The new size must be greater than or equal to the current size, and at least 20 GB.
:::

## Steps

### 1. Open the disk edit page

1. Open **Infrastructure** → **Disks**.
2. Open the disk's actions menu and choose **Edit**, or open the disk page and click **Edit**.

The **Edit disk** page shows the **CURRENT SIZE** and the encryption status.

### 2. Enter the new size

1. In **New Size (GB)**, enter the desired size.
2. Check the **Estimated project usage** gauge. If the size exceeds the quota, the console displays "The size exceeds the project quota" and the button remains disabled.
3. Click **Save changes**.

The console confirms: "The disk was successfully resized to N GB."

### 3. Extend the file system in the VM

Resizing expands the block device live, without restarting the VM; the partition and the file system must then be extended from the VM, also without a restart. Connect over SSH and check the new device size:

```bash
lsblk
```

If the new size is still not visible after a few minutes, restart the VM from the console.

**Disk formatted without a partition** (for example `/dev/vdb` mounted directly):

```bash
# ext4
sudo resize2fs /dev/vdb

# XFS (specify the mount point)
sudo xfs_growfs /mnt/data
```

**Partitioned disk** (for example the system disk `/dev/vda`, partition 1):

```bash
# Expand the partition (cloud-guest-utils or cloud-utils-growpart package)
sudo growpart /dev/vda 1

# Then extend the file system
sudo resize2fs /dev/vda1      # ext4
sudo xfs_growfs /             # XFS
```

:::tip
Many cloud images automatically extend the root partition at boot (cloud-init). If you prefer not to run `growpart` yourself, a restart is often enough for a system disk.
:::

## Verification

- The disk page shows the new **Capacity**.
- In the VM, `df -h` shows the new file system size.

## Further reading

- [Attach a disk to a VM](./attach-to-vm.md)
- [FAQ](../faq.md)
