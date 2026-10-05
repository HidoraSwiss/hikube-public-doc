---
sidebar_position: 7
title: Troubleshooting
---

# Troubleshooting — Disks

### "Size exceeds available quota"

**Cause**: the requested size exceeds the remaining storage in the project quota. The message indicates the maximum available.

**Solution**:

1. Reduce the **Size (GB)** to a value lower than or equal to the indicated maximum.
2. Free up storage by deleting unused disks or resources (detached disks also consume the quota).
3. If needed, have the project's storage quota increased.

---

### "Minimum size is 20 GB" or "Disk size must be at least 50 GB for Windows"

**Cause**: the size is below the minimum.

**Solution**: enter at least 20 GB, or 50 GB for a Windows system disk.

---

### The disk stays in "Downloading" or switches to "Error"

**Cause**: the image import takes a long time (large image) or failed (unreachable URL, unrecognized file).

**Solution**:

1. Follow the percentage progress on the disk page; a large import can take time.
2. For a custom image, check that the URL is publicly accessible over HTTPS and points to a valid ISO or QCOW2 file:
   ```bash
   curl -I https://example.com/image.qcow2
   ```
3. If the disk switches to **Error**, delete it and recreate it with a corrected URL. If the problem persists, [contact support](mailto:support@hidora.io) with the disk name and identifier.

---

### The disk does not appear in "Select an existing volume"

**Cause**: the disk is already attached to a VM, it is already selected on another volume, or its type does not match the volume.

**Solution**:

1. Check the **Attached to** field on the disk page: if it shows a VM, detach the disk first.
2. For the **System Disk (Boot)**, only system disks (created from an image) are offered; for data volumes, only data disks.

---

### The disk is not visible in the VM

**Cause**: the VM has not restarted yet after the storage change, or the disk was not saved on the VM.

**Solution**:

1. On the disk page, check that **Attached to** shows the right VM and that the status is **In Use**.
2. Wait for the VM restart to finish, then run `lsblk` again in the VM.

---

### The new size is not visible in the VM after a resize

**Cause**: the file system has not been extended, or the VM has not yet picked up the new device size.

**Solution**:

1. Check the device size with `lsblk`. If it has not changed, restart the VM.
2. Extend the partition and the file system (see [Resize a disk](./how-to/resize.md)).

---

### Disk deletion fails

**Cause**: the disk is attached to a VM ("The disk cannot be deleted as it is in use."), or the service is temporarily unavailable.

**Solution**:

1. Detach the disk from the VM edit page (**Storage** section), then try again.
2. If the message reads "The disk deletion service is temporarily unavailable.", try again a few minutes later.

---

### The disk name is rejected

**Cause**: the name does not follow the rules, or it ends with a reserved suffix ("This domain is reserved by Hikube").

**Solution**: use 3 to 16 characters (lowercase letters, digits and hyphens), start with a letter and end with a letter or a digit.
