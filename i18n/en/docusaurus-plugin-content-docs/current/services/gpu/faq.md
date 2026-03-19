---
sidebar_position: 6
title: FAQ
---

# FAQ — GPU

### What GPU models are available?

Hikube offers three NVIDIA GPU families:

| GPU | Architecture | Memory | Use case |
|-----|-------------|--------|----------|
| **L40S** | Ada Lovelace | 48 GB GDDR6 | Inference, graphical rendering |
| **A100** | Ampere | 80 GB HBM2e | ML training, scientific computing |
| **H100** | Hopper | 80 GB HBM3 | LLM, exascale computing |

Identifiers to use in manifests:

```yaml
gpus:
  - name: "nvidia.com/AD102GL_L40S"       # L40S
  - name: "nvidia.com/GA100_A100_PCIE_80GB" # A100
  - name: "nvidia.com/H100_94GB"           # H100
```

---

### What is the difference between GPU in VM and GPU in Kubernetes?

| Aspect | GPU in VM | GPU in Kubernetes |
|--------|----------|-------------------|
| **Access mode** | Exclusive PCI passthrough | Shared via device plugin |
| **Isolation** | GPU dedicated to the VM | Scheduling orchestrated by K8s |
| **Driver installation** | Manual (cloud-init) | Automatic (GPU Operator) |
| **Use case** | Dedicated workstation, CUDA dev | Containerized workloads, batch |

In a VM, the GPU is directly attached via PCI passthrough: the VM has exclusive access to the hardware. In Kubernetes, the GPU Operator manages drivers and scheduling allows sharing GPU resources across multiple pods.

---

### What CPU/GPU ratio is recommended?

For optimal usage, plan for **8 to 16 vCPU per GPU**. **Universal (u1)** instances with a 1:4 ratio are recommended:

| Configuration | Instance | vCPU | RAM |
|--------------|----------|------|-----|
| 1 GPU | `u1.2xlarge` | 8 | 32 GB |
| 1 GPU (intensive) | `u1.4xlarge` | 16 | 64 GB |
| Multi-GPU | `u1.8xlarge` | 32 | 128 GB |

---

### How are NVIDIA drivers installed?

Installation depends on the usage mode:

**In a VM**: install manually via cloud-init at boot:

```yaml title="vm-gpu.yaml"
spec:
  cloudInit: |
    #cloud-config
    runcmd:
      - apt-get update
      - apt-get install -y linux-headers-$(uname -r)
      - apt-get install -y nvidia-driver-550 nvidia-utils-550
```

**In Kubernetes**: enable the GPU Operator addon which automatically installs drivers on GPU nodes:

```yaml title="cluster-gpu.yaml"
spec:
  addons:
    gpuOperator:
      enabled: true
```

---

### How do I verify that the GPU is detected?

**In a VM**:

```bash
nvidia-smi
```

This command displays detected GPUs, their memory usage, and active processes.

**In Kubernetes**:

```bash
kubectl get nodes -o json | jq '.items[].status.allocatable["nvidia.com/gpu"]'
```

You can also verify from within a pod:

```bash
kubectl exec -it <pod-name> -- nvidia-smi
```

---

### How do I request a GPU in a Kubernetes pod?

Specify the `nvidia.com/gpu` resource in the container limits:

```yaml title="pod-gpu.yaml"
apiVersion: v1
kind: Pod
metadata:
  name: gpu-workload
spec:
  containers:
    - name: cuda-app
      image: nvidia/cuda:12.0-base
      resources:
        limits:
          nvidia.com/gpu: 1
```

:::note
The number of GPUs requested in `limits` must correspond to physical GPUs available on the nodes. A pod cannot request a fraction of a GPU.
:::
