---
sidebar_position: 3
title: Quick start
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# Create a VM with a GPU

This guide creates an Ubuntu VM with an NVIDIA GPU from the [Hikube console](https://console.hikube.cloud), then checks that the GPU is usable. For GPUs in a Kubernetes cluster, see [Provision a GPU on Kubernetes](./how-to/provision-gpu-kubernetes.md).

---

## Prerequisites

- A Hikube account and a **project** (see [Hikube quick start](../../getting-started/quick-start.md)).
- Available quotas: at least 8 vCPU, 32 GB of memory and 50 GB of storage.
- A public SSH key (`cat ~/.ssh/id_ed25519.pub`).

---

## Step 1: Open the creation wizard

1. In the side menu, open **Infrastructure** > **VM Instances**.
2. Click **Create an Instance**.
3. **General** step: enter the **Instance name**, for example `vm-gpu01`, then **Next**.

---

## Step 2: Configure and validate

### Configuration: size and GPU

1. Under **Resources (CPU / RAM)**, choose **Universal (U)** > **2XLarge** (8 vCPU, 32 GB).
2. Under **Hardware Acceleration (GPU)**, click the **NVIDIA L40S** card (or another available model). The **1 GPU total** badge appears. The card's **+** and **−** buttons adjust the number of GPUs.
3. Click **Next**.

Models marked **Unavailable** cannot be selected for the moment.

### Storage

1. Under **Operating System**, select **ubuntu**, version **24.04**.
2. Set **Size (GB)** to `50`: the drivers, CUDA and the ML frameworks take up several tens of GB.
3. Click **Next**.

### Network

1. Leave **Public IPv4 Address** enabled and **SSH (22)** checked in **Allowed Ports**.
2. Add your key in **Authorized SSH keys**.
3. Optional: enable **Cloud-Init script (User Data)** to install the drivers automatically (script in [Install CUDA](../compute/how-to/install-cuda-drivers.md)).
4. Click **Next**.

### Summary

The **Summary** shows a **Hardware Acceleration (GPU)** line with the model and quantity. Check the estimated cost, then click **Create instance**.

---

## Step 3: Check the status

In the **VM Instances** list, wait for the **Running** status. On the detail page, the **Resources & Characteristics** section lists the GPU under **GPUs**.

**Expected result:** **Running** status and one badge per GPU under **GPUs**, in **Resources & Characteristics**. The badge shows the technical name of the model (for example `l40s` for an NVIDIA L40S).

---

## Step 4: Retrieve the connection details

Copy the command from the **SSH Connection** block (**Network & Security** section of the detail page), for example `ssh ubuntu@203.0.113.20`.

---

## Step 5: Connect and test

```bash
ssh -i ~/.ssh/id_ed25519 ubuntu@203.0.113.20

# The GPU is visible on the PCI bus
lspci | grep -i nvidia
```

**Expected result:**

```
06:00.0 3D controller: NVIDIA Corporation ...
```

Then install the NVIDIA drivers and CUDA by following [Install CUDA and GPU drivers](../compute/how-to/install-cuda-drivers.md), then:

```bash
nvidia-smi
```

**Expected result:** the `nvidia-smi` table lists the GPU (for example `NVIDIA L40S`) with its memory.

---

## Step 6: Quick troubleshooting

| Symptom | Action |
|---------|--------|
| The **Hardware Acceleration (GPU)** section does not appear | The platform offers no GPU for the moment: contact [support](mailto:support@hidora.io). |
| All cards are **Unavailable** | No free GPU: try again later or contact support. |
| **The following GPUs are not available: …** on creation | The requested GPUs are not free together on the same server: reduce the number of GPUs or change model. |
| `lspci` shows no NVIDIA GPU | Check on the detail page that the GPU is listed; otherwise, add it via **Edit**. |
| `nvidia-smi: command not found` | The drivers are not installed: see [Install CUDA](../compute/how-to/install-cuda-drivers.md). |

More cases in the [GPU troubleshooting](./troubleshooting.md) page.

---

## Step 7: Cleanup

1. On the VM's detail page, click **Delete**.
2. Enter the VM's name and click **Permanently delete**.
3. The system disk remains in the **Disks** menu: delete it from that menu if you no longer need it.

:::tip Stop rather than delete?
Stopping the VM (**Stop**) releases the GPU, which can be assigned to another workload: on restart, you may have to choose another model. Delete the VM if you no longer need it, stop it if you intend to start it again.
:::

---

## Next steps

- [Provision a GPU on Kubernetes](./how-to/provision-gpu-kubernetes.md)
- [GPU concepts](./concepts.md)
- [FAQ](./faq.md)

<NavigationFooter
  nextSteps={[
    {label: "How-to guides", href: "../how-to/provision-gpu-vm"},
    {label: "FAQ", href: "../faq"},
  ]}
  seeAlso={[
    {label: "Compute resources", href: "../../compute/"},
  ]}
/>
