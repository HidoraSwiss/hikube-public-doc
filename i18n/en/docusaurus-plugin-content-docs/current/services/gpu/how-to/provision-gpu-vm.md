---
title: "How to provision a GPU on a VM"
---

# How to provision a GPU on a VM

Hikube lets you attach one or more NVIDIA GPUs to a virtual machine, at creation or afterwards. This guide explains how to choose the GPU, add it from the console and check that it is usable.

## Prerequisites

- A Hikube account and a project with sufficient quotas (8 vCPU and 32 GB of memory per GPU recommended)
- A public SSH key
- Familiarity with Hikube [virtual machines](../../compute/overview.md)

## Steps

### 1. Choose the GPU model

| Model | Memory | Use cases |
|-------|--------|-----------|
| **NVIDIA L40S** | 48 GB | Inference, development, prototyping |
| **NVIDIA A100 80GB** | 80 GB | ML training, fine-tuning |
| **NVIDIA H100 80GB** | 80 GB | Training and inference of large models |
| **NVIDIA RTX 6000 Pro** | 96 GB | LLM, intensive computing |

:::tip Which GPU should I choose?
Start with an **L40S** for development and prototyping. Move to an **A100** or an **H100** for training, and keep the **RTX 6000 Pro** for the models that need the most memory.
:::

### 2. Add the GPU when creating the VM

1. Open **Infrastructure** > **VM Instances** > **Create an Instance**.
2. **Configuration** step:
   - under **Resources (CPU / RAM)**, choose a suitable size, for example **Universal (U)** > **2XLarge** (8 vCPU, 32 GB) for one GPU;
   - under **Hardware Acceleration (GPU)**, click the card of the model you want. Use **+** to add more GPUs of the same model, or click another card to combine models.
3. **Storage** step: choose the image (for example **ubuntu** 24.04) and at least **50 GB**.
4. **Network** step: add your SSH key and the required ports (for example `8888` for Jupyter, via **Custom port...**).
5. **Summary** step: check the **Hardware Acceleration (GPU)** line and the estimated cost, then click **Create instance**.

:::warning Several GPUs on a VM
All the GPUs of a VM must be free on the same physical server. If that is not the case, creation fails with **The following GPUs are not available: …**. In that case, reduce the number of GPUs or choose another model. Size the instance accordingly: a `u1.8xlarge` (32 vCPU, 128 GB) is suitable for 4 GPUs.
:::

### 3. Add or change a GPU on an existing VM

1. Open the VM's detail page and click **Edit**.
2. In **Resources (CPU / RAM)**, adjust the **Hardware Acceleration (GPU)** selection (add, remove, change model). Adapt the size if needed.
3. Click **Save**. The console shows **Restart required**: the VM restarts with the new configuration.

### 4. Install the drivers

Hikube images do not include the NVIDIA drivers. Follow [Install CUDA and GPU drivers](../../compute/how-to/install-cuda-drivers.md), or paste that guide's cloud-init script into **Cloud-Init script (User Data)** at creation.

## Verification

1. **In the console**: the detail page shows the **Running** status and the GPU under **GPUs** (**Resources & Characteristics** section), under its technical name: `l40s`, `a100-80gb`, `h100-80gb` or `rtx-6000-pro`.
2. **In the VM**:

```bash
ssh -i ~/.ssh/id_ed25519 ubuntu@<public-ip>
lspci | grep -i nvidia
nvidia-smi --query-gpu=name,memory.total,driver_version --format=csv
```

**Expected result** (after installing the drivers):

```
name, memory.total [MiB], driver_version
NVIDIA L40S, 46068 MiB, 560.xx.xx
```

:::note Stopping a VM with a GPU
Stopping the VM (**Stop**) releases its GPUs. On the next start, if a GPU has been assigned to another workload, the console opens **Select an alternative GPU**: choose a model in **Available GPU**, then **Update and Start**.
:::

## Further reading

- [Provision a GPU on Kubernetes](./provision-gpu-kubernetes.md)
- [Install CUDA and GPU drivers](../../compute/how-to/install-cuda-drivers.md)
- [GPU troubleshooting](../troubleshooting.md)
