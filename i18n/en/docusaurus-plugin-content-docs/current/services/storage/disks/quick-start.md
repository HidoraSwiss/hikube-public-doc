---
sidebar_position: 3
title: Quick start
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# Create and use your first disk

This guide walks you through creating a **data disk** from the [Hikube console](https://console.hikube.cloud), attaching it to a virtual machine, then formatting and mounting it in the system.

---

## Objectives

By the end of this guide, you will have:

- A 20 GB **data disk** in your project
- This disk **attached** to an existing VM
- A file system **mounted** and usable in the VM

---

## Prerequisites

- A **Hikube account** and a **project** (see the [Hikube quick start](../../../getting-started/quick-start.md))
- A **Linux VM** in this project, reachable over SSH (see the [virtual machines quick start](../../compute/quick-start.md))
- At least 20 GB of available storage quota

---

## Step 1: Open the creation wizard

1. Log in to the [Hikube console](https://console.hikube.cloud) and select your project.
2. In the side menu, open **Infrastructure** → **Disks**. The **Storage Disks** page is displayed.
3. Click **Create a disk**.

---

## Step 2: Configure and create the disk

The **Create a disk** wizard has four steps.

1. **General**: enter the **Disk Name** (a name is suggested by default). Rules: lowercase letters, digits and hyphens; starts with a letter and ends with a letter or a digit; 16 characters maximum. Example: `data01`.
2. **Source**: choose **Empty Disk**.
3. **Configuration** (Size and Security):
   - **Size (GB)**: `20` (minimum 20 GB). The **Estimated project usage** gauge shows the impact on the project quota;
   - **Replication Type**: leave **Asynchronous Replication** (Recommended);
   - **Disk Encryption**: leave disabled for this guide.
4. **Summary**: check the name, size, encryption, replication and source, as well as the **Estimated Cost** displayed at the top of the wizard, then click **Create disk**.

The console displays "Disk created" and returns to the list of disks.

---

## Step 3: Check the disk status

In the **Storage Disks** list, the disk appears with the **Creating** status, then **Ready**.

Click the disk (or actions menu → **Preview**) to open its detail page:

- **Configuration**: **Capacity**, **Encryption**, **Replication**;
- **Source**: source image (**N/A** for an empty disk) and **Attached to** (**Not attached** for now).

---

## Step 4: Attach the disk to the VM

1. Open **Infrastructure** → **VM Instances**, then your VM's page, and click **Edit**.
2. In the **Storage** section, click **Add a disk**.
3. On the new volume, select **Existing**, then choose `data01` in **Select an existing volume**.
4. Click **Save**.

:::warning VM restart
Changing the storage restarts the VM ("The instance type or storage was modified. The instance will reboot"). Plan the operation accordingly.
:::

Once the operation is complete, the disk switches to the **In Use** status and its page shows the VM name in **Attached to**.

---

## Step 5: Format and mount the disk in the VM

Connect to the VM over SSH, then identify the new disk:

```bash
lsblk
```

The new disk appears without a partition or mount point, with a size of 20 GB (for example `vdb`). Adapt the device name in the following commands.

```bash
# Create a file system (erases the disk contents)
sudo mkfs.ext4 /dev/vdb

# Mount the disk
sudo mkdir -p /mnt/data
sudo mount /dev/vdb /mnt/data

# Mount automatically at boot
UUID=$(sudo blkid -s UUID -o value /dev/vdb)
echo "UUID=$UUID /mnt/data ext4 defaults,nofail 0 2" | sudo tee -a /etc/fstab

# Test
echo "hello hikube" | sudo tee /mnt/data/test.txt
df -h /mnt/data
```

**Expected result:** `df -h` shows a file system of about 20 GB mounted on `/mnt/data`.

---

## Step 6: Quick troubleshooting

| Symptom | Probable cause | Action |
|---------|----------------|--------|
| **Next** disabled at the **Configuration** step | Size below 20 GB or quota exceeded | Adjust the size; "Size exceeds available quota" indicates the maximum possible |
| The disk does not appear in **Select an existing volume** | Disk already attached to a VM, or system disk offered for a data volume | Check **Attached to** on the disk page; an empty disk goes on a data volume, not on the system disk |
| The disk does not appear in `lsblk` | The VM has not restarted yet | Wait for the restart to finish, then run `lsblk` again |
| **Error** status | Provisioning failed | [Contact support](mailto:support@hidora.io) with the disk name and identifier |

See also the [full troubleshooting guide](./troubleshooting.md).

---

## Step 7: Cleanup

1. In the VM, unmount the disk and remove its line from `/etc/fstab`:
   ```bash
   sudo umount /mnt/data
   sudo sed -i '\|/mnt/data|d' /etc/fstab
   ```
2. Detach the disk: VM page → **Edit** → **Storage** section, click the volume's delete icon, confirm by entering its name, then click **Save**. The disk returns to the **Ready** status.
3. Delete the disk: disk page → **Delete** (or actions menu → **Delete** in the list), enter its exact name in **Resource name to confirm**, then click **Permanently delete**.

:::warning
Deleting a disk is irreversible: all its data is lost. A disk attached to a VM cannot be deleted; detach it first.
:::

<NavigationFooter
  nextSteps={[
    {label: "Resize a disk", href: "../how-to/resize"},
    {label: "FAQ", href: "../faq"},
  ]}
  seeAlso={[
    {label: "Virtual machines", href: "../../../compute/overview"},
  ]}
/>
