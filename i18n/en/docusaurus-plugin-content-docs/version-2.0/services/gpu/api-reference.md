---
sidebar_position: 3
title: API Reference
---

# API Reference - GPU

This reference details the APIs for using GPUs on Hikube, whether with virtual machines or Kubernetes clusters.

---

## 🖥️ GPU with Virtual Machines

### **VirtualMachine API**

```yaml
apiVersion: apps.cozystack.io/v1alpha1
kind: VirtualMachine
metadata:
  name: vm-gpu
spec:
  running: true
  instanceProfile: ubuntu
  instanceType: u1.xlarge
  gpus:
    - name: "nvidia.com/AD102GL_L40S"
```

#### **GPU Parameters for VM**

| **Parameter** | **Type** | **Description** | **Required** |
|---------------|----------|-----------------|------------|
| `gpus` | `[]GPU` | List of GPUs to attach | ✅ |
| `gpus[].name` | `string` | NVIDIA GPU type | ✅ |

#### **Available GPU Types**

```yaml
# GPU for inference and development
gpus:
  - name: "nvidia.com/AD102GL_L40S"

# GPU for ML training
gpus:
  - name: "nvidia.com/GA100_A100_PCIE_80GB"

# GPU for LLM and exascale computing
gpus:
  - name: "nvidia.com/H100_94GB"
```

#### **Hardware Specifications**

| **GPU** | **Architecture** | **Memory** | **Performance** |
|---------|------------------|-------------|-----------------|
| **L40S** | Ada Lovelace | 48 GB GDDR6 | 362 TOPS (INT8) |
| **A100** | Ampere | 80 GB HBM2e | 312 TOPS (INT8) |
| **H100** | Hopper | 80 GB HBM3 | 1979 TOPS (INT8) |

#### **Complete GPU VM Example**

```yaml
apiVersion: apps.cozystack.io/v1alpha1
kind: VirtualMachine
metadata:
  name: ai-workstation
spec:
  running: true
  instanceProfile: ubuntu
  instanceType: u1.2xlarge  # 8 vCPU, 32 GB RAM
  gpus:
    - name: "nvidia.com/GA100_A100_PCIE_80GB"
  systemDisk:
    size: 200Gi
    storageClass: replicated
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
      # NVIDIA drivers
      - wget https://developer.download.nvidia.com/compute/cuda/repos/ubuntu2204/x86_64/cuda-keyring_1.0-1_all.deb
      - dpkg -i cuda-keyring_1.0-1_all.deb
      - apt-get update
      - apt-get install -y cuda-toolkit nvidia-driver-535
      
      # PyTorch with CUDA
      - pip3 install torch torchvision --index-url https://download.pytorch.org/whl/cu121
```

---

## ☸️ GPU with Kubernetes

### **Kubernetes API with GPU Workers**

```yaml
apiVersion: apps.cozystack.io/v1alpha1
kind: Kubernetes
metadata:
  name: cluster-gpu
spec:
  controlPlane:
    replicas: 1
  
  nodeGroups:
    gpu-workers:
      minReplicas: 1
      maxReplicas: 5
      instanceType: "u1.xlarge"
      ephemeralStorage: 100Gi
      gpus:
        - name: "nvidia.com/AD102GL_L40S"
```

#### **GPU Parameters for NodeGroups**

| **Parameter** | **Type** | **Description** | **Required** |
|---------------|----------|-----------------|------------|
| `nodeGroups.<name>.gpus` | `[]GPU` | GPUs for workers | ❌ |
| `gpus[].name` | `string` | NVIDIA GPU type | ✅ |

#### **Multi-GPU Configuration**

```yaml
nodeGroups:
  gpu-intensive:
    minReplicas: 1
    maxReplicas: 2
    instanceType: "u1.4xlarge"  # 16 vCPU, 64 GB RAM
    gpus:
      - name: "nvidia.com/GA100_A100_PCIE_80GB"
      - name: "nvidia.com/GA100_A100_PCIE_80GB"
      - name: "nvidia.com/GA100_A100_PCIE_80GB"
      - name: "nvidia.com/GA100_A100_PCIE_80GB"
```

#### **Usage in Pods**

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: ml-training
spec:
  containers:
  - name: trainer
    image: pytorch/pytorch:2.0.1-cuda11.7-cudnn8-runtime
    resources:
      limits:
        nvidia.com/gpu: 1
      requests:
        nvidia.com/gpu: 1
    command:
      - python
      - train.py
```

#### **Multi-GPU Job**

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: distributed-training
spec:
  template:
    spec:
      containers:
      - name: trainer
        image: pytorch/pytorch:2.0.1-cuda11.7-cudnn8-runtime
        resources:
          limits:
            nvidia.com/gpu: 4
          requests:
            nvidia.com/gpu: 4
        env:
        - name: CUDA_VISIBLE_DEVICES
          value: "0,1,2,3"
      restartPolicy: Never
```

---

## 📋 Approach Comparison

### **VM GPU vs Kubernetes GPU**

| **Aspect** | **VM GPU** | **Kubernetes GPU** |
|------------|------------|-------------------|
| **Allocation** | 1 GPU = 1 VM (exclusive) | 1+ GPU per worker (shareable) |
| **Isolation** | Complete at VM level | Namespace/Pod |
| **Scaling** | Vertical (more GPUs) | Horizontal + Vertical |
| **Management** | Manual via YAML | Orchestrated by K8s |
| **Sharing** | No | Yes (between pods) |
| **Overhead** | Minimal | Orchestration overhead |

### **When to use each approach**

#### **VM GPU recommended for:**

- Legacy non-containerized applications
- Need for direct and complete GPU access
- Development and prototyping
- Monolithic workloads
- Graphics applications (rendering, CAD)

#### **Kubernetes GPU recommended for:**

- Containerized applications
- Workloads requiring automatic scaling
- Parallel and distributed jobs
- GPU resource sharing
- Complex ML/AI pipelines

---

## 🔧 Advanced Configuration

### **Multi-GPU on VM**

```yaml
apiVersion: apps.cozystack.io/v1alpha1
kind: VirtualMachine
metadata:
  name: multi-gpu-vm
spec:
  instanceType: u1.8xlarge  # 32 vCPU, 128 GB RAM
  gpus:
    - name: "nvidia.com/H100_94GB"
    - name: "nvidia.com/H100_94GB"
    - name: "nvidia.com/H100_94GB"
    - name: "nvidia.com/H100_94GB"
```

### **Specialized GPU NodeGroup**

```yaml
nodeGroups:
  gpu-inference:
    minReplicas: 2
    maxReplicas: 10
    instanceType: "u1.large"
    gpus:
      - name: "nvidia.com/AD102GL_L40S"
    
  gpu-training:
    minReplicas: 1
    maxReplicas: 3
    instanceType: "u1.4xlarge"
    gpus:
      - name: "nvidia.com/GA100_A100_PCIE_80GB"
      - name: "nvidia.com/GA100_A100_PCIE_80GB"
```

### **Pod with Specific GPU**

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: specific-gpu-pod
spec:
  nodeSelector:
    gpu-type: "L40S"
  containers:
  - name: app
    image: nvidia/cuda:12.0-runtime-ubuntu20.04
    resources:
      limits:
        nvidia.com/gpu: 1
```

---

## ✅ Verification and Monitoring

### **VM GPU Verification**

```bash
# Access VM
virtctl ssh ubuntu@vm-gpu

# Check GPUs
nvidia-smi

# CUDA test
nvidia-smi --query-gpu=name,memory.total,utilization.gpu --format=csv
```

### **Kubernetes GPU Verification**

```bash
# See GPU resources on nodes
kubectl describe nodes

# Check GPU allocation
kubectl get nodes -o custom-columns=NAME:.metadata.name,GPU:.status.allocatable.'nvidia\.com/gpu'

# Monitor GPU usage
kubectl top nodes
```

### **GPU Monitoring in a Pod**

```bash
# Exec into a pod with GPU
kubectl exec -it <pod-name> -- nvidia-smi

# See GPU metrics
kubectl exec -it <pod-name> -- nvidia-smi --query-gpu=utilization.gpu,memory.used,memory.total --format=csv -l 5
```

---

## 💡 Best Practices

### **For VM GPU:**

- Use `replicated` storage class for production
- Size CPU/RAM according to GPU (ratio 8-16 vCPU per GPU)
- Install NVIDIA drivers via cloud-init
- Stop VMs when unused to optimize costs

### **For Kubernetes GPU:**

- Configure appropriate resource limits
- Use nodeSelector or nodeAffinity to target specific GPUs
- Implement PodDisruptionBudgets for critical workloads
- Monitor GPU usage with custom metrics

### **General:**

- L40S for inference/development
- A100 for standard ML training  
- H100 for LLM and exascale computing
- Test with L40S before moving to more expensive GPUs

