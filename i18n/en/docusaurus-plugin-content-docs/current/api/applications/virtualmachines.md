---
title: Virtual Machines
---

**Virtual Machines (VMs)** offer flexible and customizable resources to meet the varied needs of applications. Hikube provides several VM series adapted to different scenarios, as well as preferences for guest operating systems.

---

## Configuration Example

Here is a YAML configuration example for a VM using a CX type instance with Ubuntu as the operating system:

```yaml
apiVersion: apps.cozystack.io/v1alpha1
kind: VirtualMachine
metadata:
  name: vm-example
spec:
  instanceType: "cx1.xlarge"
  guestOS: "ubuntu"
  disks:
    - name: "root-disk"
      size: "20Gi"
      storageClass: "replicated"
  networks:
    - name: "default"
      type: "bridge"
```

Using the kubeconfig provided by Hikube and this example yaml, saved as a `manifest.yaml` file, you can easily test the application deployment using the following command:

```sh
kubectl apply -f manifest.yaml
```

---

## Available Series

### **U Series**

- **Description**: Designed for general applications. VMs share physical cores on a time basis.
- **Characteristics**:
  - **Burstable CPU Performance**: Computing performance can exceed the base limit if additional resources are available.
  - **vCPU-To-Memory Ratio**: 1:4, to reduce noise per node.

---

### **O Series**

- **Description**: Based on the U series with overcommitted memory.
- **Characteristics**:
  - **Burstable CPU Performance**: Like the U series.
  - **Overcommitted Memory**: Allows higher load density.
  - **vCPU-To-Memory Ratio**: 1:4.

---

### **CX Series**

- **Description**: Provides exclusive resources for compute-intensive applications.
- **Characteristics**:
  - **Hugepages**: Improved memory performance.
  - **Dedicated CPU**: Each vCPU is associated with a physical core.
  - **Isolated Emulator Threads**: Reduced impact of emulation threads.
  - **vNUMA**: Cache optimization through physical NUMA topology.
  - **vCPU-To-Memory Ratio**: 1:2.

---

### **M Series**

- **Description**: Designed for memory-intensive applications.
- **Characteristics**:
  - **Hugepages**: Improved memory performance.
  - **Burstable CPU Performance**: Allows variable performance.
  - **vCPU-To-Memory Ratio**: 1:8.

---

### **RT Series**

- **Description**: Ideal for real-time applications (e.g., Oslat).
- **Characteristics**:
  - **Hugepages**: Memory performance optimization.
  - **Dedicated CPU**: High computing guarantees.
  - **Isolated Emulator Threads**: Reduced impact of emulation threads.
  - **vCPU-To-Memory Ratio**: 1:4 (from medium size and up).

---

## Available Resources

### **Instance Types**

| **Name**      | **vCPUs** | **Memory** |
|---------------|-----------|-------------|
| `cx1.medium`  | 1         | 2Gi         |
| `cx1.large`   | 2         | 4Gi         |
| `cx1.xlarge`  | 4         | 8Gi         |
| `cx1.2xlarge` | 8         | 16Gi        |
| `cx1.4xlarge` | 16        | 32Gi        |
| `cx1.8xlarge` | 32        | 64Gi        |
| `m1.large`    | 2         | 16Gi        |
| `m1.xlarge`   | 4         | 32Gi        |
| `m1.2xlarge`  | 8         | 64Gi        |
| `m1.4xlarge`  | 16        | 128Gi       |
| `m1.8xlarge`  | 32        | 256Gi       |
| …             | …         | …           |

---

### **Guest Operating Systems**

| **Name**                | **Description**                           |
|--------------------------|-------------------------------------------|
| `ubuntu`                 | Ubuntu                                   |
| `fedora`                 | Fedora (amd64)                           |
| `centos.stream9`         | CentOS Stream 9                          |
| `rhel.9`                 | Red Hat Enterprise Linux 9 (amd64)       |
| `windows.11`             | Microsoft Windows 11                     |
| `windows.2k22.virtio`    | Microsoft Windows Server 2022 (virtio)   |
| `alpine`                 | Alpine                                   |
| `cirros`                 | Cirros                                   |
| …                        | …                                        |
