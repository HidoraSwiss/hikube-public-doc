---
sidebar_position: 3
title: Quick start
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# Create your first virtual machine

This guide walks you through creating an Ubuntu VM from the [Hikube console](https://console.hikube.cloud), up to the first SSH connection.

---

## Goal

By the end of this guide, you will have:

- an Ubuntu VM with status **Running**;
- a public IP with port 22 open;
- key-based SSH access;
- a replicated system disk.

---

## Prerequisites

- A Hikube account and a **project** (see [Hikube quick start](../../getting-started/quick-start.md)).
- Available quotas in that project: at least 4 vCPU, 16 GB of memory and 20 GB of storage for the example below.
- An SSH key pair. If you don't have one:

```bash
ssh-keygen -t ed25519 -f ~/.ssh/hikube-vm
cat ~/.ssh/hikube-vm.pub
```

Keep the displayed public key (line starting with `ssh-ed25519`): you will paste it into the wizard.

---

## Step 1: Open the creation wizard

1. Sign in to [https://console.hikube.cloud](https://console.hikube.cloud) and select your project.
2. In the side menu, open **Infrastructure** > **VM Instances**.
3. Click **Create an Instance**.

The **Create a new instance** wizard opens. It has five steps: **General**, **Configuration**, **Storage**, **Network** and **Summary**.

---

## Step 2: Configure and confirm

### General

Enter the **Instance name**, for example `vm-demo`. The name must be 3 to 16 characters long, start with a letter, end with a letter or a digit, and contain only lowercase letters, digits and hyphens. Click **Next**.

### Configuration

1. Under **Resources (CPU / RAM)**, choose the **Universal (U)** series, then the **XLARGE** size (4 vCPU, 16 GB).
2. Leave the **Hardware Acceleration (GPU)** section empty (see [GPU](../gpu/overview.md) for a VM with a GPU).
3. Leave **Automatic Restart** disabled, or enable it if you need it.
4. Click **Next**.

The banner at the top of the step shows the estimated cost and the project's quota usage.

### Storage

The **System Disk (Boot)** is prefilled: it is named after the VM and is 20 GB.

1. Under **Operating System**, select the **ubuntu** card and version **24.04**.
2. Keep **Size (GB)** at `20`.
3. Keep **Asynchronous Replication** (Recommended).
4. Enable **Disk Encryption** if you want to encrypt data at rest.
5. Click **Next**.

### Network

1. Check that **Public IPv4 Address** is enabled.
2. Check that **Enable Firewall** is checked and that **SSH (22)** is selected in **Allowed Ports**.
3. Under **Authorized SSH keys**, paste your public key into the **Add a public SSH key** field, then confirm with Enter or the add button. The expected format is `<algorithm> <base64-key> [comment]`.
4. Click **Next**.

### Summary

The **Summary** shows the instance, the storage and the **Network & Security** section (public IP, firewall, open ports, SSH keys). Click **Create instance**.

The console shows **Instance created** and returns to the list of instances.

---

## Step 3: Check the status

In the **VM Instances** list, the VM goes from **Creating** to **Running**. The update is automatic, without reloading the page.

Click the VM name to open its detail page. There you will find:

- **Resources & Characteristics**: instance type, system image, default user, vCPU and RAM;
- **Storage & Disks**: attached disks, size, replication, encryption;
- **Network & Security**: **Public IP**, **SSH Connection**, **IP Addresses**, **Firewall & Ports**.

**Expected result:** status **Running**, **Public IP** set to **Active**, port **22** listed under **Firewall & Ports**.

---

## Step 4: Get the connection details

In the **Network & Security** section of the detail page, the **SSH Connection** block shows the ready-to-use command, for example:

```bash
ssh ubuntu@203.0.113.10
```

Click the copy icon to copy it to the clipboard. The default user depends on the image; it is also shown under **System Image** (**User**).

---

## Step 5: Connect and test

Connect with your private key:

```bash
ssh -i ~/.ssh/hikube-vm ubuntu@203.0.113.10
```

Once connected, check the resources and the disk:

```bash
nproc
free -h
lsblk
```

**Expected result:** 4 processors, about 16 GB of memory and a `vda` disk of about 20 GB.

---

## Step 6: Quick troubleshooting

| Symptom | Check |
|----------|--------------|
| **Next** stays greyed out at the Configuration or Storage step | A project quota is exceeded: reduce the instance type or the disk size, or have the project quotas increased. |
| `Connection timed out` over SSH | On the detail page, check that **Public IP** is **Active** and that port 22 appears in **Firewall & Ports**. |
| `Permission denied (publickey)` | Check the user (**SSH Connection** block) and that the private key you use matches the public key listed in **Advanced Configuration** > **SSH Keys**. |
| Status **Error** or **Failed** | See [Troubleshooting](./troubleshooting.md). |

---

## Step 7: Cleanup

1. Open the VM detail page, or the **Actions** menu of its row in the list.
2. Click **Delete**.
3. Type the exact name of the VM to confirm, then click **Permanently delete**.

The system disk is detached but **not deleted**: it remains in the **Disks** menu and keeps consuming storage quota. Delete it from **Disks** if you no longer need it (see [Disks](../storage/disks/overview.md)).

:::warning Irreversible deletion
Deleting a VM, and then its disks, is permanent. Back up important data first.
:::

---

## Next steps

- [Attach a data disk](./how-to/attach-extra-disk.md)
- [Configure cloud-init](./how-to/configure-cloud-init.md)
- [Configure the network and firewall](./how-to/configure-network.md)
- [Connect the VM to a private network (VPC)](../networking/quick-start.md)

<NavigationFooter
  nextSteps={[
    {label: "How-to guides", href: "../how-to/attach-extra-disk"},
    {label: "FAQ", href: "../faq"},
  ]}
/>
