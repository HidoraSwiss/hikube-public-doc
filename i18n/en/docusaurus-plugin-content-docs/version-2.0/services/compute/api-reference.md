---
sidebar_position: 3
title: API Reference
---

# API Reference - Virtual Machines

This complete reference details Hikube's **VMInstance** and **VMDisk** APIs, their parameters, usage examples, and best practices.

---

## VMInstance

### **Overview**

The `VMInstance` API allows creating and managing virtual machines in Hikube.

```yaml
apiVersion: apps.cozystack.io/v1alpha1
kind: VMInstance
metadata:
  name: example-vm
spec:
  # Detailed configuration below
```

### **Complete Specification**

#### **General Parameters**

| **Parameter** | **Type** | **Description** | **Default** | **Required** |
|---------------|----------|-----------------|------------|------------|
| `external` | `boolean` | Enables external access from outside the cluster | `false` | ✅ |
| `externalMethod` | `string` | External exposure method (WholeIP, PortList) | `PortList` | ✅ |
| `externalPorts` | `[]int` | List of ports to expose externally | `[]` | ✅ |
| `running` | `boolean` | Desired running state of the VM | `true` | ✅ |
| `instanceType` | `string` | Instance type defining CPU/Memory | - | ✅ |
| `instanceProfile` | `string` | Predefined OS profile for the VM | - | ✅ |
| `disks` | `[]string` | List of VMDisk names to attach | `[]` | ✅ |
| `sshKeys` | `[]string` | Public SSH keys for access | `[]` | ✅ |
| `cloudInit` | `string` | cloud-init YAML configuration | `""` | ✅ |
| `cloudInitSeed` | `string` | Seed data for cloud-init | `""` | ✅ |

#### **Network Configuration**

```yaml
spec:
  external: true
  externalMethod: PortList
  externalPorts:
    - 22    # SSH
    - 80    # HTTP
    - 443   # HTTPS
    - 8080  # Custom application
```

#### **Instance Types**

##### **S Series (Standard) - Ratio 1:2**

Optimized for general workloads with shared and burstable CPU.

```yaml
# Available instances
instanceType: "s1.small"     # 1 vCPU, 2 GB RAM
instanceType: "s1.medium"    # 2 vCPU, 4 GB RAM
instanceType: "s1.large"     # 4 vCPU, 8 GB RAM
instanceType: "s1.xlarge"    # 8 vCPU, 16 GB RAM
instanceType: "s1.3large"    # 12 vCPU, 24 GB RAM
instanceType: "s1.2xlarge"   # 16 vCPU, 32 GB RAM
instanceType: "s1.3xlarge"   # 24 vCPU, 48 GB RAM
instanceType: "s1.4xlarge"   # 32 vCPU, 64 GB RAM
instanceType: "s1.8xlarge"   # 64 vCPU, 128 GB RAM
```

##### **U Series (Universal) - Ratio 1:4**

Optimized for general workloads with shared and burstable CPU.

```yaml
# Available instances
instanceType: "u1.medium"  # 1 vCPU, 4 GB RAM
instanceType: "u1.large"  # 2 vCPU, 8 GB RAM  
instanceType: "u1.xlarge"  # 4 vCPU, 16 GB RAM
instanceType: "u1.2xlarge"  # 8 vCPU, 32 GB RAM
instanceType: "u1.4xlarge"  # 16 vCPU, 64 GB RAM
instanceType: "u1.8xlarge"  # 32 vCPU, 128 GB RAM
```

##### **M Series (Memory Optimized) - Ratio 1:8**

Optimized for applications requiring a lot of memory.

```yaml
# Available instances
instanceType: "m1.large"     # 2 vCPU, 16 GB RAM
instanceType: "m1.xlarge"    # 4 vCPU, 32 GB RAM
instanceType: "m1.2xlarge"   # 8 vCPU, 64 GB RAM
instanceType: "m1.4xlarge"   # 16 vCPU, 128 GB RAM
instanceType: "m1.8xlarge"   # 32 vCPU, 256 GB RAM
```

#### **OS Profiles**

Hikube supports many predefined OS profiles:

```yaml
# Linux
instanceProfile: "alpine"                    # Alpine
instanceProfile: "centos.7"                  # CentOS 7
instanceProfile: "centos.7.desktop"          # CentOS 7 Desktop
instanceProfile: "centos.stream10"           # CentOS Stream 10
instanceProfile: "centos.stream10.desktop"   # CentOS Stream 10 Desktop
instanceProfile: "centos.stream8"            # CentOS Stream 8
instanceProfile: "centos.stream8.desktop"    # CentOS Stream 8 Desktop
instanceProfile: "centos.stream9"            # CentOS Stream 9
instanceProfile: "centos.stream9.desktop"    # CentOS Stream 9 Desktop
instanceProfile: "cirros"                    # Cirros
instanceProfile: "fedora"                    # Fedora
instanceProfile: "opensuse.leap"             # OpenSUSE Leap
instanceProfile: "opensuse.tumbleweed"       # OpenSUSE Tumbleweed
instanceProfile: "rhel.10"                   # Red Hat Enterprise Linux 10 Beta
instanceProfile: "rhel.7"                    # Red Hat Enterprise Linux 7
instanceProfile: "rhel.7.desktop"            # Red Hat Enterprise Linux 7 Desktop
instanceProfile: "rhel.8"                    # Red Hat Enterprise Linux 8
instanceProfile: "rhel.8.desktop"            # Red Hat Enterprise Linux 8 Desktop
instanceProfile: "rhel.9"                    # Red Hat Enterprise Linux 9
instanceProfile: "rhel.9.desktop"            # Red Hat Enterprise Linux 9 Desktop
instanceProfile: "sles"                      # SUSE Linux Enterprise Server
instanceProfile: "ubuntu"                    # Ubuntu

# Windows
instanceProfile: "windows.2k16"        # Microsoft Windows Server 2016
instanceProfile: "windows.2k16.virtio" # Microsoft Windows Server 2016 (virtio)
instanceProfile: "windows.2k19"        # Microsoft Windows Server 2019
instanceProfile: "windows.2k19.virtio" # Microsoft Windows Server 2019 (virtio)
instanceProfile: "windows.2k22"        # Microsoft Windows Server 2022
instanceProfile: "windows.2k22.virtio" # Microsoft Windows Server 2022 (virtio)
instanceProfile: "windows.2k25"        # Microsoft Windows Server 2025
instanceProfile: "windows.2k25.virtio" # Microsoft Windows Server 2025 (virtio)
```

#### **SSH Configuration**

```yaml
spec:
  sshKeys:
    - "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQ... user@host"
    - "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAI... user2@host"
```

#### **Cloud-Init Configuration**

```yaml
spec:
  cloudInit: |
    #cloud-config
    users:
      - name: admin
        sudo: ALL=(ALL) NOPASSWD:ALL
        shell: /bin/bash
        ssh_authorized_keys:
          - "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQ..."
    
    packages:
      - htop
      - docker.io
      - curl
      - jq
    
    write_files:
      - path: /etc/motd
        content: |
          Welcome to your Hikube VM!
          
    runcmd:
      - systemctl enable docker
      - systemctl start docker
      - usermod -aG docker admin
      - echo "Setup complete" > /tmp/setup-done
    
    final_message: "VM ready after $UPTIME seconds"
```

### **Complete VMInstance Example**

```yaml title="production-vm.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: VMInstance
metadata:
  name: vm-example
spec:
  external: true
  externalMethod: PortList
  externalPorts:
    - 22
  running: true
  instanceType: u1.2xlarge
  instanceProfile: "ubuntu"
  disks:
    - vm-system-disk
  resources:
    cpu: ""
    memory: ""
  sshKeys:
    - ssh-rsa AAAAB3Nza...
  cloudInit: |
    #cloud-config
  cloudInitSeed: ""
```

---

## VMDisk

### **Overview**

The `VMDisk` API manages virtual disks used by virtual machines. It supports various image sources and storage options.

```yaml
apiVersion: apps.cozystack.io/v1alpha1
kind: VMDisk
metadata:
  name: disk-example
spec:
  source:
    http:
      url: https://cloud-images.ubuntu.com/noble/current/noble-server-cloudimg-amd64.img
  optical: false
  storage: 30Gi
  storageClass: "replicated"
```

### **Complete Specification**

#### **Main Parameters**

| **Parameter** | **Type** | **Description** | **Default** | **Required** |
|---------------|----------|-----------------|------------|------------|
| `source` | `object` | Disk image source | `{}` | ✅ |
| `optical` | `boolean` | Optical disk (ISO/CD-ROM) | `false` | ✅ |
| `storage` | `string` | Disk size | - | ✅ |
| `storageClass` | `string` | Storage class | `replicated` | ✅ |

#### **Image Sources**

##### **HTTP/HTTPS Source**

```yaml
spec:
  source:
    http:
      url: "https://cloud-images.ubuntu.com/noble/current/noble-server-cloudimg-amd64.img"
```

##### **Empty Disk**

```yaml
spec:
  source: {}  # Creates an empty disk
```

### **VMDisk Examples**

#### **Ubuntu System Disk**

```yaml title="ubuntu-disk.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: VMDisk
metadata:
  name: ubuntu-system-disk
spec:
  source:
    http:
      url: "https://cloud-images.ubuntu.com/noble/current/noble-server-cloudimg-amd64.img"
  optical: false
  storage: 20Gi
  storageClass: "replicated"
```

#### **Data Disk**

```yaml title="data-disk.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: VMDisk
metadata:
  name: application-data
spec:
  source: {}  # Empty disk
  optical: false
  storage: 500Gi
  storageClass: "replicated"
```

#### **Installation ISO**

```yaml title="ubuntu-iso.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: VMDisk
metadata:
  name: ubuntu-server-iso
spec:
  source:
    http:
      url: "https://releases.ubuntu.com/22.04/ubuntu-22.04.4-live-server-amd64.iso"
  optical: true  # Optical disk
  storage: 2Gi
  storageClass: "replicated"
```

---

## Resource Management

### **Storage Classes**

| **Class** | **Description** | **Replication** |
|------------|-----------------|-----------------|
| `local` | Local storage on the node | ❌ |
| `replicated` | 3x replicated storage | ✅ |

### **Exposure Methods**

| **Method** | **Description** | **Usage** | **Firewall** |
|-------------|-----------------|-----------|--------------|
| `PortList` | Exposure with controlled port list | Selective exposure via dedicated IP | ✅ Only specified ports |
| `WholeIP` | Complete public IP for the VM | Complete direct access | ❌ No network protection |

#### **Method Details**

##### PortList

- **Security** : Automatic firewall - only ports in `externalPorts` are accessible
- **Configuration** : Requires `externalPorts` to specify allowed ports
- **Recommended usage** : Production, secure environments, web applications
- **Example** : `externalMethod: PortList` + `externalPorts: [22, 80, 443]`

##### WholeIP

- **Security** : No protection - all TCP/UDP ports are accessible from the Internet
- **Configuration** : `externalPorts` ignored and unnecessary (all ports are open)
- **Recommended usage** : Development, debug, complete administrative access
- **Example** : `externalMethod: WholeIP` (without `externalPorts`)

:::warning WholeIP Security ⚠️
With `WholeIP`, your VM is fully exposed on the Internet. You must configure a firewall in the OS (UFW, iptables) to secure access.
:::

---

## Complete Examples

### **Production VM with Data**

```yaml title="production-complete.yaml"
---
# System disk
apiVersion: apps.cozystack.io/v1alpha1
kind: VMDisk
metadata:
  name: prod-system
spec:
  source:
    http:
      url: "https://cloud-images.ubuntu.com/noble/current/noble-server-cloudimg-amd64.img"
  optical: false
  storage: 50Gi
  storageClass: "replicated"

---
# Data disk
apiVersion: apps.cozystack.io/v1alpha1
kind: VMDisk
metadata:
  name: prod-data
spec:
  source: {}
  optical: false
  storage: 200Gi
  storageClass: "replicated"

---
# Virtual machine
apiVersion: apps.cozystack.io/v1alpha1
kind: VMInstance
metadata:
  name: vm-production
spec:
  external: true
  externalMethod: PortList
  externalPorts:
    - 22    # SSH
    - 80    # HTTP
    - 443   # HTTPS
  running: true
  instanceType: "u1.2xlarge"  # 8 vCPU, 32 GB RAM
  instanceProfile: "ubuntu"
  disks:
    - prod-system
    - prod-data
  sshKeys:
    - "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQ... admin@company.com"
  cloudInit: |
    #cloud-config
    users:
      - name: admin
        sudo: ALL=(ALL) NOPASSWD:ALL
        ssh_authorized_keys:
          - "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQ..."
    
    packages:
      - nginx
      - certbot
      - htop
    
    runcmd:
      - systemctl enable nginx
      - systemctl start nginx
      - ufw allow ssh
      - ufw allow http
      - ufw allow https
      - ufw --force enable
```

---

## ⚠️ Best Practices

### **Security**

- Always use **SSH keys** rather than passwords
- Enable **UFW firewall** with restrictive default rules

### **Storage**

- Use `replicated` for **production environments**
- Plan extra space for **logs and temporary data**
- Configure **regular snapshots** for backups

### **Performance**

- Choose the **appropriate instance type** according to your workload
- Monitor usage via `kubectl top pod`
- Adjust resources according to actual needs

### **Monitoring**

- Monitor VM metrics via Kubernetes
- Keep a history of performance for optimization

---

:::tip Recommended Architecture
For production, use at minimum 2 separate disks (system + data) with the `replicated` class to guarantee high availability.
:::

