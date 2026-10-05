---
title: "How to attach an extra disk"
---

# How to attach an extra disk

Separating application data from the system disk makes backups, migrations and resizing easier. This guide explains how to add a data disk to a VM from the console, then format and mount it in the operating system.

## Prerequisites

- A Hikube account and a project with available **Storage** quota
- An existing **VM instance**
- **SSH** access to the VM

## Steps

### 1. Open the VM for editing

1. Open **Infrastructure** > **VM Instances** and click the VM name.
2. Click **Edit**.

### 2. Add the disk

In the **Storage** section, click **Add a disk**. A **Storage Volume #1** block appears. Two options:

**New disk** (**New** tab):

1. **Volume Name**: keep the suggested name or enter your own (lowercase letters, digits and hyphens).
2. **Size (GB)**: 20 GB minimum, for example `50`.
3. **Replication Type**: **Asynchronous Replication** (Recommended) or **Synchronous Replication**.
4. **Disk Encryption**: enable it to encrypt data at rest.

**Existing disk** (**Existing** tab): under **Select an existing volume**, choose a data disk of the project that is not attached to any VM. Disks can also be created independently in the **Disks** menu (see [Disks](../../storage/disks/quick-start.md)).

### 3. Save

Check the quota summary at the top of the page, then click **Save**.

The console shows **Restart required**: the VM restarts to take the new disk into account. Wait for it to return to **Running** status. The disk appears in the **Storage & Disks** section of the detail page.

:::note Disk added at creation
You can also add disks directly when creating the VM, with **Add a disk** at the **Storage** step of the wizard. They are then named after the VM with a suffix (`ma-vm-2`, `ma-vm-3`…).
:::

### 4. Format and mount the disk in the VM

Connect to the VM with the command from the **SSH Connection** block:

```bash
ssh -i ~/.ssh/hikube-vm ubuntu@<public-ip>
```

Identify the new disk:

```bash
lsblk
```

**Expected result:**

```
NAME    MAJ:MIN RM  SIZE RO TYPE MOUNTPOINTS
vda     252:0    0   20G  0 disk
├─vda1  252:1    0 19.9G  0 part /
└─vda15 252:15   0  106M  0 part /boot/efi
vdb     252:16   0   50G  0 disk
```

The new disk appears as `vdb`, with no partition and no mount point.

Format it as ext4:

```bash
sudo mkfs.ext4 /dev/vdb
```

Mount it:

```bash
sudo mkdir -p /mnt/data
sudo mount /dev/vdb /mnt/data
```

Make the mount persistent using the file system UUID, which is more stable than the device name:

```bash
UUID=$(sudo blkid -s UUID -o value /dev/vdb)
echo "UUID=$UUID /mnt/data ext4 defaults,nofail 0 2" | sudo tee -a /etc/fstab
```

## Verification

```bash
df -h /mnt/data
```

**Expected result:**

```
Filesystem      Size  Used Avail Use% Mounted on
/dev/vdb         49G   24K   47G   1% /mnt/data
```

Test writing:

```bash
sudo touch /mnt/data/test.txt && echo "OK"
```

## Detach a disk

In **Edit** > **Storage**, click the volume's delete icon, confirm by typing its name, then click **Save**. The disk is detached from the VM (which restarts) and remains available in the **Disks** menu. Unmount it in the OS first and remove its line from `/etc/fstab`.

## Further reading

- [Disks: overview](../../storage/disks/overview.md)
- [Attach an existing disk to a VM](../../storage/disks/how-to/attach-to-vm.md)
- [Resize a disk](../../storage/disks/how-to/resize.md)
- [VM quick start](../quick-start.md)
