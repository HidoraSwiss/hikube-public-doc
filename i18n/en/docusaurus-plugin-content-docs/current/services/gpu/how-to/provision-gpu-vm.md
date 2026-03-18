---
title: "How to provision a GPU on a VM"
---

# How to provision a GPU on a VM

Hikube allows you to attach one or more NVIDIA GPUs directly to a virtual machine. This guide explains how to choose the right GPU type for your workload, create a VM with GPU, and verify that hardware acceleration is available.

## Prerequisites

- **kubectl** configured with your Hikube kubeconfig
- **SSH** access to the VM (public SSH key available)
- Familiarity with [virtual machine](../../compute/overview.md) concepts on Hikube

## Steps

### 1. Choose the GPU type

Hikube offers three NVIDIA GPU families suited to different use cases:

| GPU | Architecture | Memory | Performance | Use case |
|-----|-------------|---------|-------------|----------|
| **L40S** | Ada Lovelace | 48 GB GDDR6 | 362 TOPS (INT8) | Inference, development, prototyping |
| **A100** | Ampere | 80 GB HBM2e | 312 TOPS (INT8) | ML training, fine-tuning |
| **H100** | Hopper | 80 GB HBM3 | 1979 TOPS (INT8) | LLM, exascale computing, distributed training |

:::tip Which GPU to choose?
Start with an **L40S** for development and prototyping. Move to an **A100** for standard ML model training, and reserve the **H100** for demanding workloads such as LLM training or high-performance computing.
:::

The GPU identifiers to use in your manifests are:

| GPU | `gpus[].name` value |
|-----|---------------------|
| L40S | `nvidia.com/AD102GL_L40S` |
| A100 | `nvidia.com/GA100_A100_PCIE_80GB` |
| H100 | `nvidia.com/H100_94GB` |

### 2. Create the VM manifest with GPU

Create a manifest that declares the desired GPU in the `spec.gpus` section:

```yaml title="gpu-vm.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: VMInstance
metadata:
  name: gpu-workstation
spec:
  running: true
  instanceProfile: ubuntu
  instanceType: u1.2xlarge
  gpus:
    - name: "nvidia.com/AD102GL_L40S"
  systemDisk:
    size: 100Gi
    storageClass: replicated
  external: true
  externalMethod: PortList
  externalPorts:
    - 22
    - 8888
  sshKeys:
    - ssh-ed25519 AAAA... user@host
```

:::tip Recommended CPU/GPU ratio
Plan for **8 to 16 vCPUs per GPU**. For a single GPU, a `u1.2xlarge` (8 vCPU, 32 GB RAM) is a good starting point. For multi-GPU, scale up to `u1.4xlarge` or `u1.8xlarge`.
:::

### 3. Deploy the VM

Apply the manifest:

```bash
kubectl apply -f gpu-vm.yaml
```

Wait for the VM to reach the `Running` state:

```bash
kubectl get vminstance gpu-workstation -w
```

**Expected output:**

```
NAME               STATUS    AGE
gpu-workstation    Running   2m
```

:::note
Provisioning a VM with GPU may take a few extra minutes compared to a standard VM, as the GPU needs to be allocated and attached.
:::

### 4. Verify the GPU in the VM

Connect to the VM via SSH:

```bash
virtctl ssh ubuntu@gpu-workstation
```

Verify that the GPU is detected:

```bash
nvidia-smi
```

**Expected output:**

```
+-----------------------------------------------------------------------------+
| NVIDIA-SMI 535.xx.xx    Driver Version: 535.xx.xx    CUDA Version: 12.x     |
|-------------------------------+----------------------+----------------------+
| GPU  Name        Persistence-M| Bus-Id        Disp.A | Volatile Uncorr. ECC |
| Fan  Temp  Perf  Pwr:Usage/Cap|         Memory-Usage | GPU-Util  Compute M. |
|===============================+======================+======================|
|   0  NVIDIA L40S         Off  | 00000000:00:06.0 Off |                    0 |
| N/A   30C    P0    35W / 350W |      0MiB / 46068MiB |      0%      Default |
+-------------------------------+----------------------+----------------------+
```

For detailed information:

```bash
nvidia-smi --query-gpu=name,memory.total,utilization.gpu --format=csv
```

### 5. Configure a multi-GPU VM

For intensive workloads (distributed training, large-scale inference), you can attach multiple GPUs to a single VM by repeating entries in `spec.gpus`:

```yaml title="multi-gpu-vm.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: VMInstance
metadata:
  name: multi-gpu-workstation
spec:
  running: true
  instanceProfile: ubuntu
  instanceType: u1.8xlarge
  gpus:
    - name: "nvidia.com/H100_94GB"
    - name: "nvidia.com/H100_94GB"
    - name: "nvidia.com/H100_94GB"
    - name: "nvidia.com/H100_94GB"
  systemDisk:
    size: 200Gi
    storageClass: replicated
  external: true
  externalMethod: PortList
  externalPorts:
    - 22
    - 8888
  sshKeys:
    - ssh-ed25519 AAAA... user@host
```

:::warning
For multi-GPU, size the instance type accordingly. Plan for at least 8 vCPUs and 32 GB of RAM per GPU. A `u1.8xlarge` (32 vCPU, 128 GB RAM) is suitable for 4 GPUs.
:::

## Verification

After deployment, confirm that everything is working:

1. **Check the VM status**:

```bash
kubectl get vminstance gpu-workstation
```

2. **Check the GPU in the VM**:

```bash
virtctl ssh ubuntu@gpu-workstation -- nvidia-smi
```

3. **Test CUDA** (if drivers are installed):

```bash
virtctl ssh ubuntu@gpu-workstation -- nvidia-smi --query-gpu=name,memory.total,driver_version,cuda_version --format=csv,noheader
```

## Next steps

- [GPU API reference](../api-reference.md)
- [How to provision a GPU on Kubernetes](./provision-gpu-kubernetes.md)
- [How to install CUDA drivers](../../compute/how-to/install-cuda-drivers.md)
