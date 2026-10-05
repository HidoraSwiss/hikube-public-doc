---
sidebar_position: 7
title: Troubleshooting
---

# Troubleshooting — Virtual machines

### The Next button stays greyed out in the wizard

**Cause**: the VM would exceed a project quota (CPU, Memory or Storage). The wizard banner shows **Quota exceeded** and the breakdown per resource.

**Solution**:

1. Choose a smaller instance type or reduce the size of the disks.
2. Free up resources: delete unused VMs or disks (detached disks count against the storage quota).
3. Have the project quotas increased.

If the console says the project quotas are unavailable, creation stays blocked until they can be read: try again later or contact [support](mailto:support@hidora.io).

---

### Error at creation: name already in use or disk size rejected

**Cause and solution**:

| Message | Solution |
|---------|----------|
| **An instance with this name already exists.** | Choose another name. |
| **Min. 20 GB required** / **Min. 50 GB required** | Increase **Size (GB)**: 20 GB minimum, 50 GB for Windows. |
| Message mentioning a minimum size for Oracle Linux | The Oracle Linux system disk requires at least 40 GB. |
| **A system image is required for a new disk** | Select a card under **Operating System**. |
| **Invalid format. Expected: `<algorithm> <base64-key> [comment]`** | Paste the complete **public** key (`.pub` file), on a single line. |

---

### The VM stays in Error or Failed status

**Cause**: the VM could not be scheduled or started (resources unavailable, disk in error, GPU unavailable…). When the platform returns a reason, it is shown when you hover over the status badge.

**Solution**:

1. Open the detail page and check the **Storage & Disks** section: the disks must be present.
2. If the VM has GPUs, see [GPU unavailable at startup](#gpu-unavailable-at-startup).
3. Try **Stop** then **Start** from the **Actions** section.
4. If the status persists, contact [support](mailto:support@hidora.io), giving the VM name and its identifier (shown under the title of the detail page, with a copy button).

---

### SSH timeout

**Cause**: no public IP, port 22 not allowed, or SSH service not yet started in the VM.

**Solution**:

1. On the detail page, **Network & Security** section: **Public IP** must be **Active** and port **22** must appear under **Firewall & Ports**.
2. Otherwise, click **Edit**, enable **Public IPv4 Address**, check **SSH (22)** in **Allowed Ports**, then **Save**.
3. Right after creation, wait one to two minutes for the OS to finish booting.
4. Test in verbose mode:
   ```bash
   ssh -v ubuntu@<public-ip>
   ```

---

### Permission denied (publickey)

**Cause**: wrong user, wrong key, or key added after the first boot without reloading the user-data.

**Solution**:

1. Use the user shown in the **SSH Connection** block (or under **System Image** > **User**).
2. Check that the public key matching your private key appears in **Advanced Configuration** > **SSH Keys**.
3. If you just added the key via **Edit**, choose **Reload user-data** in the **SSH keys changed** dialog, or run **Reload UserData** from the **Actions** section, then **Restart**: the key is only installed at restart.

---

### The added disk does not appear in the VM

**Cause**: the VM has not restarted yet after the addition, or the disk is not formatted.

**Solution**:

1. After **Save**, the console shows **Restart required**: wait for the VM to return to the **Running** state.
2. Check the disk in the **Storage & Disks** section of the detail page.
3. In the VM, list the devices: a new disk appears with no partition and no mount point.
   ```bash
   lsblk
   ```
4. Format and mount it: see [Attach an extra disk](./how-to/attach-extra-disk.md).

---

### GPU unavailable at startup

**Cause**: a GPU is released when the VM is stopped and may be assigned to another workload in the meantime.

**Solution**: at startup, if the GPU is no longer available, the console opens the **Select an alternative GPU** dialog. Choose a model in **Available GPU**, then click **Update and Start**. If the dialog says **No GPUs are currently available.**, try again later or contact [support](mailto:support@hidora.io). See [GPU troubleshooting](../gpu/troubleshooting.md).

---

### .local DNS does not work in the VM

**Cause**: `systemd-resolved` treats `.local` domains as mDNS.

**Solution**: see [Resolve .local DNS in VMs](./how-to/fix-dns-local.md).

---

### The VM does not respond at all (neither SSH nor RDP)

**Cause**: OS hung, network misconfigured inside the VM, internal firewall too restrictive.

**Solution**:

1. Run **Restart** from the **Actions** section of the detail page.
2. If a recent cloud-init change is the cause, fix the script in **Edit** > **Advanced Configuration**, then run **Reload UserData** and **Restart**.
3. Serial console or VNC access is not offered in the console; contact [support](mailto:support@hidora.io) for low-level diagnostics.
