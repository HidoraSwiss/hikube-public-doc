---
title: "How to start, stop, edit and delete a VM"
---

# How to start, stop, edit and delete a VM

This guide covers the common actions on an existing VM from the console: start, stop, restart, changing resources, and deletion.

## Prerequisites

- A Hikube account and a project
- An existing VM in **Infrastructure** > **VM Instances**

## Where to find the actions

| Location | Available actions |
|-------------|---------------------|
| **VM Instances** list, **Actions** menu (⋯) of a row | **View details**, **Start**, **Stop**, **Restart**, **Reload UserData**, **Edit**, **Delete** |
| Detail page, header | **Edit**, **Delete** |
| Detail page, **Actions** section | **Start** (stopped VM), **Stop** and **Restart** (running VM), **Reload UserData** (running VM) |

The list also offers a search (**Search instances...**) and a status filter (**All statuses**, **Running**, **Stopped**).

## Steps

### 1. Stop a VM

1. Click **Stop**.
2. Confirm in the **Stop virtual machine?** dialog: hosted services are interrupted until the VM is started again.

The status changes to **Stopping**, then **Stopped**.

:::warning VM with GPU
Stopping releases the GPU, which may be assigned to another workload. You may not be able to start the VM again right away if no GPU is available afterwards. See [GPU unavailable at startup](../troubleshooting.md#gpu-unavailable-at-startup).
:::

### 2. Start a VM

Click **Start**. The status changes to **Starting**, then **Running**.

### 3. Restart a VM

Click **Restart** and confirm in **Restart virtual machine?**. Applications are temporarily unavailable. The status goes through **Restarting**.

### 4. Edit a VM

1. On the detail page, click **Edit** (or **Edit** in the **Actions** menu of the list, available only for a **Running** VM).
2. Change the sections you need:
   - **Resources (CPU / RAM)**: series and size, GPU;
   - **Storage**: adding or detaching disks;
   - **Network & Security**: public IP, firewall, ports, VPC;
   - **Advanced Configuration**: SSH keys, cloud-init script, **Automatic Restart**.
3. Check the quota summary at the top of the page and click **Save**.

If the instance type, the disks or the GPUs change, the console shows **Restart required**: the VM restarts, which may take several minutes. Otherwise, it shows **Instance updated**.

The name and the system image cannot be changed.

### 5. Delete a VM

1. Click **Delete**.
2. Type the exact name of the VM, then click **Permanently delete**.

The VM's disks are detached and remain in the **Disks** menu, where you can reattach them to another VM or delete them (see [Disks](../../storage/disks/overview.md)).

## Verification

The status shown in the list and on the detail page updates without reloading the page. The counters at the top of the list (**Active Instances**, **Stopped Instances**, **Total CPU**, **Total RAM**) reflect the changes.

## Further reading

- [Concepts: lifecycle](../concepts.md#lifecycle)
- [Troubleshooting](../troubleshooting.md)
