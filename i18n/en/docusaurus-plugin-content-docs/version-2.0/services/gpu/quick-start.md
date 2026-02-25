---
sidebar_position: 2
title: Quick Start
---

# Using GPUs on Hikube

This guide presents the two methods of using GPUs: with virtual machines and with Kubernetes clusters.

---

## 🎯 Usage Methods

Hikube offers two approaches for using GPUs:

1. **GPU with VM** : Direct attachment of a GPU to a virtual machine
2. **GPU with Kubernetes** : GPU allocation to workers for use by pods

---

## 🖥️ Method 1: GPU with Virtual Machine

### **Step 1: Create the disk**

```yaml title="vm-disk.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: VMDisk
metadata:
  name: ubuntu-gpu-disk
spec:
  source:
    http:
      url: https://cloud-images.ubuntu.com/noble/current/noble-server-cloudimg-amd64.img
  optical: false
  storage: 50Gi
  storageClass: "replicated"
```

### **Step 2: Create the VM with GPU**

```yaml title="vm-gpu.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: VirtualMachine
metadata:
  name: vm-gpu-example
spec:
  running: true
  instanceProfile: ubuntu
  instanceType: u1.xlarge  # 4 vCPU, 16 GB RAM
  gpus:
    - name: "nvidia.com/AD102GL_L40S"
  systemDisk:
    size: 50Gi
    storageClass: replicated
  external: true
  externalMethod: PortList
  externalPorts:
    - 22
  sshKeys:
    - "ssh-rsa AAAAB3NzaC... your-public-key"
  cloudInit: |
    #cloud-config
    users:
      - name: ubuntu
        sudo: ALL=(ALL) NOPASSWD:ALL
        shell: /bin/bash
    
    package_update: true
    packages:
      - curl
      - wget
      - build-essential
    
    runcmd:
      # Install NVIDIA drivers
      - wget https://developer.download.nvidia.com/compute/cuda/repos/ubuntu2204/x86_64/cuda-keyring_1.0-1_all.deb
      - dpkg -i cuda-keyring_1.0-1_all.deb
      - apt-get update
      - apt-get install -y cuda-toolkit nvidia-driver-535
      - nvidia-smi -pm 1
```

### **Step 3: Deploy**

```bash
kubectl apply -f vm-disk.yaml
kubectl apply -f vm-gpu.yaml

# Check status
kubectl get virtualmachine vm-gpu-example
```

### **Step 4: Access and test**

```bash
# SSH access
virtctl ssh ubuntu@vm-gpu-example

# Check GPU
nvidia-smi
```

---

## ☸️ Method 2: GPU with Kubernetes

### **Step 1: Create a cluster with GPU workers**

```yaml title="cluster-gpu.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Kubernetes
metadata:
  name: cluster-gpu
spec:
  controlPlane:
    replicas: 1
  
  nodeGroups:
    # GPU workers
    gpu-nodes:
      minReplicas: 1
      maxReplicas: 3
      instanceType: "u1.xlarge"
      ephemeralStorage: 100Gi
      gpus:
        - name: "nvidia.com/AD102GL_L40S"
    
    # Standard workers (optional)
    standard-nodes:
      minReplicas: 1
      maxReplicas: 2
      instanceType: "s1.medium"
      ephemeralStorage: 50Gi
  
  storageClass: "replicated"
```

### **Step 2: Deploy the cluster**

```bash
kubectl apply -f cluster-gpu.yaml

# Wait for cluster to be ready
kubectl get kubernetes cluster-gpu -w
```

### **Step 3: Configure access**

```bash
# Retrieve kubeconfig
kubectl get secret cluster-gpu-admin-kubeconfig \
  -o go-template='{{ printf "%s\n" (index .data "super-admin.conf" | base64decode) }}' \
  > cluster-gpu-kubeconfig.yaml

# Use GPU cluster
export KUBECONFIG=cluster-gpu-kubeconfig.yaml
kubectl get nodes
```

### **Step 4: Deploy a GPU pod**

```yaml title="pod-gpu.yaml"
apiVersion: v1
kind: Pod
metadata:
  name: gpu-test
spec:
  containers:
  - name: gpu-container
    image: nvidia/cuda:12.0-runtime-ubuntu20.04
    command: ["sleep", "infinity"]
    resources:
      limits:
        nvidia.com/gpu: 1
      requests:
        nvidia.com/gpu: 1
```

```bash
kubectl apply -f pod-gpu.yaml

# Check GPU allocation
kubectl describe pod gpu-test

# Test GPU
kubectl exec -it gpu-test -- nvidia-smi
```

---

## 📋 Practical Comparison

| **Aspect** | **VM GPU** | **Kubernetes GPU** |
|------------|------------|-------------------|
| **Setup time** | ~5 minutes | ~10 minutes |
| **Complexity** | Simple | Moderate |
| **Isolation** | Total | Partial |
| **Flexibility** | Limited | High |
| **Scaling** | Manual | Automatic |

---

## 🔧 Available GPU Types

### **Configuration by usage**

```yaml
# For inference/development
gpus:
  - name: "nvidia.com/AD102GL_L40S"  # 48 GB GDDR6

# For ML training
gpus:
  - name: "nvidia.com/GA100_A100_PCIE_80GB"  # 80 GB HBM2e

# For LLM/exascale computing
gpus:
  - name: "nvidia.com/H100_94GB"  # 80 GB HBM3
```

---

## ✅ Post-Deployment Verification

### **VM GPU**

```bash
# Check GPU
virtctl ssh ubuntu@vm-gpu-example -- nvidia-smi

# CUDA test
virtctl ssh ubuntu@vm-gpu-example -- nvcc --version
```

### **Kubernetes GPU**

```bash
# See available GPU resources
kubectl describe nodes

# Check allocation
kubectl top nodes
```

---

## 🚀 Next Steps

### **To deepen VM GPU:**

- [Advanced VM configuration](./api-reference.md)
- [Optimized instance types](../compute/api-reference.md)

### **To deepen Kubernetes GPU:**

- [Clusters with GPU](../kubernetes/api-reference.md)
- [Automatic scaling](../kubernetes/overview.md)

---

## 💡 Tips

- **VM GPU** : Ideal for prototyping and legacy applications
- **Kubernetes GPU** : Recommended for scalable production workloads
- Start with **L40S** to test before using A100/H100
- Use `replicated` storage class for production

