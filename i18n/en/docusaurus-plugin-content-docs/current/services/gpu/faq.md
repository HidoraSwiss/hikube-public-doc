---
sidebar_position: 6
title: FAQ
---

# FAQ — GPU

### Where is the GPU page in the console?

There is none: you choose the GPU in the wizard of the resource that uses it.

- **VM**: **VM Instances** > **Create an Instance**, **Configuration** step, **Hardware Acceleration (GPU)** section; or **Edit** on an existing VM.
- **Kubernetes**: **Kubernetes** > **Create cluster** (or **Edit**), **Nodes** step, **GPU** section of a node group.

---

### Which GPU models are available?

| Model | Memory | Use cases |
|-------|--------|-----------|
| **NVIDIA L40S** | 48 GB | Inference, rendering, prototyping |
| **NVIDIA A100 80GB** | 80 GB | ML training, scientific computing |
| **NVIDIA H100 80GB** | 80 GB | Training and inference of large models |
| **NVIDIA RTX 6000 Pro** | 96 GB | LLM, intensive computing |

The selector shows all models; those with no free unit left are marked **Unavailable**.

---

### Why is a model marked Unavailable?

All its units are assigned to other workloads. The console does not show the number of free units. Try again later, choose another model, or contact [sales@hidora.io](mailto:sales@hidora.io) for a capacity requirement.

---

### Can I put several GPUs on a VM?

Yes: click a card then use **+** to add GPUs of the same model, or select several models. All of them must be free on the same physical server; otherwise, creation fails with **The following GPUs are not available: …**.

---

### What is the difference between a GPU on a VM and a GPU on Kubernetes?

| Aspect | GPU on VM | GPU on Kubernetes |
|--------|-----------|-------------------|
| **Access** | GPU dedicated to the VM | GPU assigned to pods by the scheduler |
| **Drivers** | To be installed in the OS (cloud-init or manually) | Installed by the GPU Operator addon |
| **Sharing** | No | Yes, with the HAMi addon |
| **Use cases** | Workstation, CUDA development | Containerized workloads, batch, inference |

---

### What CPU/GPU ratio is recommended?

Plan for **8 to 16 vCPUs per GPU**, preferably in the **Universal (U)** series:

| Configuration | Instance | vCPU | RAM |
|---------------|----------|------|-----|
| 1 GPU | `u1.2xlarge` | 8 | 32 GB |
| 1 GPU (intensive) | `u1.4xlarge` | 16 | 64 GB |
| Multi-GPU | `u1.8xlarge` | 32 | 128 GB |

---

### How are the NVIDIA drivers installed?

**On a VM**: by you, in the OS. Follow [Install CUDA and GPU drivers](../compute/how-to/install-cuda-drivers.md), which also provides a cloud-init script to paste into **Cloud-Init script (User Data)**.

**On Kubernetes**: by the **GPU Operator** addon, enabled automatically as soon as a node group has GPUs.

---

### What happens when I stop a VM with a GPU?

The GPU is released and can be assigned to another workload. The console warns you about this in the stop confirmation. On start, if the GPU is no longer available, the **Select an alternative GPU** dialog offers you another model.

---

### Can I add GPUs to an existing Kubernetes node group?

Not to a group created without GPUs: add a new node group with GPUs. A group created with GPUs can change model or count, while keeping at least one GPU.

---

### How do I request a GPU in a Kubernetes pod?

```yaml title="pod-gpu.yaml"
apiVersion: v1
kind: Pod
metadata:
  name: gpu-workload
spec:
  containers:
    - name: cuda-app
      image: nvidia/cuda:12.4.1-base-ubuntu22.04
      command: ["sleep", "infinity"]
      resources:
        limits:
          nvidia.com/gpu: 1
```

:::note
Without the HAMi addon, a pod cannot request a fraction of a GPU: the value of `nvidia.com/gpu` is a whole number of physical GPUs.
:::

---

### How do I check that the GPU is detected?

**On a VM**:

```bash
lspci | grep -i nvidia   # the GPU is visible
nvidia-smi               # the drivers are installed
```

**On Kubernetes** (with the cluster's kubeconfig, **Kubeconfig** button on the cluster page):

```bash
kubectl get nodes -o custom-columns=NAME:.metadata.name,GPU:.status.allocatable.'nvidia\.com/gpu'
kubectl exec -it <pod> -- nvidia-smi
```
