---
sidebar_position: 3
title: API Reference
---

# API Reference - GPU

This reference details how to use GPUs on Hikube, whether with virtual machines (`VMInstance`) or managed Kubernetes clusters (`Kubernetes`).

---

## 🎮 Available GPUs

GPUs are attached by their **resource name** (`nvidia.com/<model>`). The models available on Hikube:

| GPU | Resource name | Architecture | Memory | Typical usage |
|-----|------------------|--------------|---------|---------------|
| **L40S** | `nvidia.com/AD102GL_L40S` | Ada Lovelace | 48 GB GDDR6 | Inference, dev, rendering |
| **A100 PCIe 80 GB** | `nvidia.com/GA100_A100_PCIE_80GB` | Ampere | 80 GB HBM2e | ML training |
| **A100 SXM4 80 GB** | `nvidia.com/GA100_A100_SXM4_80GB` | Ampere | 80 GB HBM2e | ML training (multi-GPU NVLink) |
| **RTX PRO 6000 Blackwell** | `nvidia.com/GB202GL_RTX_PRO_6000_BLACKWELL_SERVER_EDITION` | Blackwell | 96 GB GDDR7 | LLM, intensive computing |

:::note Availability
The available GPU hardware varies by zone. Check the allocatable resources on the platform side before planning a workload. The NVIDIA driver requires **at least 4 GiB of RAM** on the VM or worker.
:::

---

## 🖥️ GPU with Virtual Machines

On a VM, the GPU is attached in **PCI passthrough** (exclusive allocation) via the `gpus` field of a [`VMInstance`](../compute/api-reference.md) resource. The disk is defined separately by a [`VMDisk`](../compute/api-reference.md#vmdisk) resource.

```yaml title="vm-gpu.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: VMInstance
metadata:
  name: vm-gpu
spec:
  runStrategy: Always
  instanceProfile: ubuntu
  instanceType: u1.xlarge
  gpus:
    - name: "nvidia.com/AD102GL_L40S"
  disks:
    - name: vm-gpu-disk
```

:::warning Common pitfalls
- The resource is named **`VMInstance`** (not `VirtualMachine`).
- The state is driven via **`runStrategy: Always`** (not `running: true`).
- The disk is **not** a built-in `systemDisk` field: create a `VMDisk` resource and reference it in `disks` (a list of `{name}` objects).
:::

### GPU parameters for VM

| **Parameter** | **Type** | **Description** | **Required** |
|---------------|----------|-----------------|------------|
| `gpus` | `[]object` | List of GPUs to attach | no |
| `gpus[].name` | `string` | GPU resource name (`nvidia.com/...`) | yes (if `gpus` is set) |

### Complete GPU VM example

```yaml title="ai-workstation.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: VMDisk
metadata:
  name: ai-workstation-disk
spec:
  source:
    image:
      name: ubuntu-2404
  storage: 200Gi
  storageClass: replicated
---
apiVersion: apps.cozystack.io/v1alpha1
kind: VMInstance
metadata:
  name: ai-workstation
spec:
  runStrategy: Always
  instanceProfile: ubuntu
  instanceType: u1.2xlarge  # 8 vCPU, 32 GB RAM
  gpus:
    - name: "nvidia.com/GA100_A100_PCIE_80GB"
  disks:
    - name: ai-workstation-disk
  external: true
  externalMethod: PortList
  externalPorts:
    - 22
    - 8888  # Jupyter
  cloudInit: |
    #cloud-config
    users:
      - name: ubuntu
        sudo: ALL=(ALL) NOPASSWD:ALL
    packages:
      - python3-pip
      - build-essential
    runcmd:
      # NVIDIA drivers + CUDA (see the dedicated guide for the exact version)
      - wget https://developer.download.nvidia.com/compute/cuda/repos/ubuntu2404/x86_64/cuda-keyring_1.1-1_all.deb
      - dpkg -i cuda-keyring_1.1-1_all.deb
      - apt-get update
      - apt-get install -y cuda-toolkit nvidia-driver-570
      # PyTorch with CUDA
      - pip3 install torch torchvision
```

### Multi-GPU on VM

```yaml
spec:
  instanceType: u1.8xlarge  # 32 vCPU, 128 GB RAM
  gpus:
    - name: "nvidia.com/GA100_A100_SXM4_80GB"
    - name: "nvidia.com/GA100_A100_SXM4_80GB"
    - name: "nvidia.com/GA100_A100_SXM4_80GB"
    - name: "nvidia.com/GA100_A100_SXM4_80GB"
```

---

## ☸️ GPU with Kubernetes

On a managed Kubernetes cluster, GPUs are attached to the **node groups**, and the **`gpuOperator`** addon must be enabled to expose the GPUs to pods.

```yaml title="cluster-gpu.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Kubernetes
metadata:
  name: cluster-gpu
spec:
  controlPlane:
    replicas: 2

  nodeGroups:
    gpu-workers:
      minReplicas: 1
      maxReplicas: 5
      instanceType: "u1.xlarge"
      ephemeralStorage: 100Gi
      gpus:
        - name: "nvidia.com/AD102GL_L40S"

  addons:
    # Required: installs the NVIDIA drivers and the device plugin
    gpuOperator:
      enabled: true
```

:::warning `gpuOperator` addon required
Without `gpuOperator: enabled: true`, the workers' GPUs are not exposed to pods (`nvidia.com/gpu` stays at 0).
:::

### GPU parameters for NodeGroups

| **Parameter** | **Type** | **Description** | **Required** |
|---------------|----------|-----------------|------------|
| `nodeGroups.<name>.gpus` | `[]object` | GPUs attached to the group's workers | no |
| `gpus[].name` | `string` | GPU resource name (`nvidia.com/...`) | yes (if `gpus` is set) |
| `addons.gpuOperator.enabled` | `boolean` | Enables the NVIDIA GPU Operator | yes (to use the GPUs) |

### Multi-GPU configuration per worker

```yaml
nodeGroups:
  gpu-intensive:
    minReplicas: 1
    maxReplicas: 2
    instanceType: "u1.4xlarge"  # 16 vCPU, 64 GB RAM
    gpus:
      - name: "nvidia.com/GA100_A100_SXM4_80GB"
      - name: "nvidia.com/GA100_A100_SXM4_80GB"
      - name: "nvidia.com/GA100_A100_SXM4_80GB"
      - name: "nvidia.com/GA100_A100_SXM4_80GB"
```

### Usage in Pods

Once `gpuOperator` is active, pods reserve GPUs via the `nvidia.com/gpu` resource:

```yaml title="ml-training.yaml"
apiVersion: v1
kind: Pod
metadata:
  name: ml-training
spec:
  containers:
  - name: trainer
    image: pytorch/pytorch:2.4.1-cuda12.4-cudnn9-runtime
    resources:
      limits:
        nvidia.com/gpu: 1
      requests:
        nvidia.com/gpu: 1
    command: ["python", "train.py"]
```

---

## 📋 VM GPU vs Kubernetes GPU

| **Aspect** | **VM GPU** | **Kubernetes GPU** |
|------------|------------|-------------------|
| **Allocation** | 1 GPU = 1 VM (exclusive passthrough) | 1+ GPU per worker |
| **Isolation** | Complete at VM level | Namespace / Pod |
| **Scaling** | Vertical (more GPUs) | Horizontal + Vertical (autoscaling) |
| **Management** | Manual via `VMInstance` | Orchestrated by Kubernetes |
| **Sharing** | No | Yes (between pods) |
| **Overhead** | Minimal | Orchestration overhead |

**VM GPU**: non-containerized applications, direct GPU access, dev/prototyping, rendering/CAD.

**Kubernetes GPU**: containerized workloads, autoscaling, parallel/distributed jobs, ML/AI pipelines.

---

## ✅ Verification

### VM GPU

```bash
virtctl ssh ubuntu@vm-gpu
nvidia-smi
nvidia-smi --query-gpu=name,memory.total,utilization.gpu --format=csv
```

### Kubernetes GPU

```bash
# GPUs exposed on the nodes (requires gpuOperator active)
kubectl get nodes -o custom-columns=NAME:.metadata.name,GPU:.status.allocatable.'nvidia\.com/gpu'

# Check from a pod
kubectl exec -it <pod-name> -- nvidia-smi
```

---

## 💡 Best Practices

- **L40S** for inference and development, **A100** for ML training, **RTX PRO 6000 (Blackwell)** for the most demanding workloads.
- Test with an L40S before reserving the most expensive GPUs.
- Size CPU/RAM according to the GPU (≈ 8–16 vCPU per GPU) and plan for ≥ 4 GiB of RAM.
- On VM: install the NVIDIA drivers via cloud-init (see [Install CUDA drivers](../compute/how-to/install-cuda-drivers.md)).
- On Kubernetes: always enable the `gpuOperator` addon.
- Use the `replicated` `storageClass` in production.
