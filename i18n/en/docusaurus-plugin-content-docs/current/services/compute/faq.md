---
sidebar_position: 6
title: FAQ
---

# FAQ — Virtual machines

### What is the difference between firewall enabled and disabled?

| | **Enable Firewall** checked | Firewall unchecked |
|---|---|---|
| **Ports open on the public IP** | Only the **Allowed Ports** | All |
| **Security** | Reduced attack surface | Firewall to configure in the OS (ufw, firewalld, nftables) |
| **Use cases** | Production, targeted services | VPN, gateway, protocols with dynamic ports |

Ports can be changed at any time from the detail page > **Edit** > **Network & Security**. See [Configure the network](./how-to/configure-network.md).

---

### Which images are available?

AlmaLinux, CentOS Stream, CloudLinux, Debian, openSUSE, Oracle Linux, Rocky Linux, Ubuntu and Windows Server. The versions are listed in the [overview](./overview.md#operating-systems); the list shown at the **Storage** step of the wizard is authoritative.

---

### Can I use my own image?

Yes, in two steps: first create a disk from your image URL (ISO or QCOW2, over HTTPS) in the **Disks** menu, then, in the VM creation wizard, choose **Existing** for the **System Disk (Boot)** and select that disk. The **Custom Image** card is greyed out (**Reserved**) in the VM wizard: it can only be used when creating a disk. See [Create a system disk from an image](../storage/disks/how-to/create-from-image.md).

---

### How do I choose my instance type?

| Series | Label | Ratio | Example use |
|-------|---------|-------|-----------------|
| `s1` | **Standard (S)** | 1:2 | Development, testing |
| `u1` | **Universal (U)** | 1:4 | Web servers, applications |
| `m1` | **Memory (M)** | 1:8 | Databases, caches |

For example, `u1.xlarge` offers 4 vCPU and 16 GB of RAM. The instance type can be changed later from **Edit**; the VM restarts.

---

### How do I add an extra disk?

At creation, click **Add a disk** at the **Storage** step. On an existing VM, open the detail page, click **Edit**, then **Add a disk** in the **Storage** section, and **Save**. The VM restarts. The complete guide, including formatting in the OS, is [here](./how-to/attach-extra-disk.md).

---

### How do I connect over SSH?

1. Add your public key in **Authorized SSH keys** (**Network** step of the wizard, or **Edit** > **Advanced Configuration** > **SSH Keys**).
2. Leave **Public IPv4 Address** enabled and port **SSH (22)** allowed.
3. Copy the command from the **SSH Connection** block on the detail page and add your private key:
   ```bash
   ssh -i ~/.ssh/ma-cle ubuntu@<public-ip>
   ```

Default users by image:

| Image | User |
|-------|-------------|
| Ubuntu | `ubuntu` |
| Debian | `debian` |
| Rocky Linux | `rocky` |
| AlmaLinux | `almalinux` |
| CentOS Stream, CloudLinux | `cloud-user` |
| Oracle Linux | `opc` |
| openSUSE | `opensuse` |

The actual user is always shown on the detail page, under **System Image**.

---

### How do I customize the VM at boot?

At the **Network** step of the wizard, enable **Cloud-Init script (User Data)** and enter your configuration:

```yaml title="user-data.yaml"
#cloud-config
packages:
  - nginx
  - htop
runcmd:
  - systemctl enable --now nginx
```

See [Configure cloud-init](./how-to/configure-cloud-init.md).

---

### What happens to the disks when I delete a VM?

They are detached, not deleted. They remain in the **Disks** menu, can be reattached to another VM (**Existing** option) and keep counting against the project's storage quota until they are deleted.

---

### Can I access the VM's serial console or VNC?

This option is not offered in the console; contact [support](mailto:support@hidora.io). Access is over SSH (Linux) or RDP (Windows).

---

### Why is the Edit button greyed out in the list?

In the **Actions** menu of the list, **Edit** is only available when the VM is **Running**. To edit a stopped VM, open its detail page and click **Edit**.
