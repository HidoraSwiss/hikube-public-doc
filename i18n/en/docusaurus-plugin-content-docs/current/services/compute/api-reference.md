---
sidebar_position: 3
title: API Reference
---

## API Reference – Virtual Machines

This reference provides a comprehensive description of Hikube **VMInstance** and **VMDisk** APIs, including available parameters, usage examples, and recommended best practices.

---

## VMInstance

### Overview

The `VMInstance` API allows you to create, configure, and manage virtual machines in Hikube.

```yaml
apiVersion: apps.cozystack.io/v1alpha1
kind: VMInstance
metadata:
  name: example-vm
spec:
  # Detailed configuration below
```

---

### Full specification

#### General parameters

| Parameter         | Type       | Description                                  | Default    | Required |
| ----------------- | ---------- | -------------------------------------------- | ---------- | -------- |
| `external`        | `boolean`  | Enables external network exposure for the VM | `false`    | ✅        |
| `externalMethod`  | `string`   | Exposure method (`PortList`, `WholeIP`)      | `PortList` | ✅        |
| `externalPorts`   | `[]int`    | List of externally exposed ports             | `[]`       | ✅        |
| `running`         | `boolean`  | Desired VM running state                     | `true`     | ✅        |
| `instanceType`    | `string`   | CPU / memory instance size                   | –          | ✅        |
| `instanceProfile` | `string`   | OS profile for the VM                        | –          | ✅        |
| `disks`           | `[]string` | List of attached `VMDisk` resources          | `[]`       | ✅        |
| `sshKeys`         | `[]string` | Injected public SSH keys                     | `[]`       | ✅        |
| `cloudInit`       | `string`   | Cloud-init configuration (YAML)              | `""`       | ✅        |
| `cloudInitSeed`   | `string`   | Cloud-init seed data                         | `""`       | ✅        |

---

### Network configuration

```yaml
spec:
  external: true
  externalMethod: PortList
  externalPorts:
    - 22
    - 80
    - 443
```

---

### Instance types

#### S Series – Standard (1:2 ratio)

General-purpose workloads, shared and burstable CPU.

```yaml
instanceType: s1.small     # 1 vCPU, 2 GB RAM
instanceType: s1.medium    # 2 vCPU, 4 GB RAM
instanceType: s1.large     # 4 vCPU, 8 GB RAM
instanceType: s1.xlarge    # 8 vCPU, 16 GB RAM
instanceType: s1.3large    # 12 vCPU, 24 GB RAM
instanceType: s1.2xlarge   # 16 vCPU, 32 GB RAM
instanceType: s1.3xlarge   # 24 vCPU, 48 GB RAM
instanceType: s1.4xlarge   # 32 vCPU, 64 GB RAM
instanceType: s1.8xlarge   # 64 vCPU, 128 GB RAM
```

#### U Series – Universal (1:4 ratio)

```yaml
instanceType: u1.medium    # 1 vCPU, 4 GB RAM
instanceType: u1.large     # 2 vCPU, 8 GB RAM
instanceType: u1.xlarge    # 4 vCPU, 16 GB RAM
instanceType: u1.2xlarge   # 8 vCPU, 32 GB RAM
instanceType: u1.4xlarge   # 16 vCPU, 64 GB RAM
instanceType: u1.8xlarge   # 32 vCPU, 128 GB RAM
```

#### M Series – Memory Optimized (1:8 ratio)

```yaml
instanceType: m1.large     # 2 vCPU, 16 GB RAM
instanceType: m1.xlarge    # 4 vCPU, 32 GB RAM
instanceType: m1.2xlarge   # 8 vCPU, 64 GB RAM
instanceType: m1.4xlarge   # 16 vCPU, 128 GB RAM
instanceType: m1.8xlarge   # 32 vCPU, 256 GB RAM
```

---

### Supported OS profiles

*(List preserved as-is, Linux and Windows profiles)*

---

### SSH configuration

```yaml
spec:
  sshKeys:
    - ssh-rsa AAAA... user@host
    - ssh-ed25519 AAAA... user2@host
```

---

### Cloud-init

```yaml
spec:
  cloudInit: |
    #cloud-config
    users:
      - name: admin
        sudo: ALL=(ALL) NOPASSWD:ALL
        ssh_authorized_keys:
          - ssh-rsa AAAA...

    packages:
      - htop
      - docker.io
      - curl
```

---

### Full VMInstance example

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
  instanceProfile: ubuntu
  disks:
    - vm-system-disk
  sshKeys:
    - ssh-rsa AAAA...
```

---

## VMDisk

### Overview

The `VMDisk` API manages virtual disks attached to virtual machines.
It supports **multiple image sources**: HTTP, empty disks, and **Golden Images**.

```yaml
apiVersion: apps.cozystack.io/v1alpha1
kind: VMDisk
metadata:
  name: disk-example
spec:
  source:
    http:
      url: https://...
  optical: false
  storage: 30Gi
  storageClass: replicated
```

---

### Main parameters

| Parameter      | Type      | Description        | Default      | Required |
| -------------- | --------- | ------------------ | ------------ | -------- |
| `source`       | `object`  | Disk image source  | `{}`         | ✅        |
| `optical`      | `boolean` | Optical disk (ISO) | `false`      | ✅        |
| `storage`      | `string`  | Disk size          | –            | ✅        |
| `storageClass` | `string`  | Storage class      | `replicated` | ✅        |

---

## Image sources

### HTTP / HTTPS source

```yaml
spec:
  source:
    http:
      url: https://cloud-images.ubuntu.com/noble/current/noble-server-cloudimg-amd64.img
```

---

### Empty disk

```yaml
spec:
  source: {}
```

---

### Golden Images (Hikube preloaded images)

**Golden Images** are OS images preloaded and maintained by Hikube.
They allow **fast provisioning**, standardization, and no external network dependency.

:::tip Naming convention
Images follow the `{os}-{version}` format (e.g., `ubuntu-2404`, `rocky-9`).
Always specify the version to ensure workload compatibility.
:::

#### Usage

```yaml
spec:
  source:
    image:
      name: ubuntu-2404
```

#### Available images

| Name | Operating System | Type | Min. storage |
| --- | ---------------- | ---- | :----------: |
| `almalinux-8` | AlmaLinux 8 | Cloud | 11 Gi |
| `almalinux-9` | AlmaLinux 9 | Cloud | 11 Gi |
| `almalinux-10` | AlmaLinux 10 | Cloud | 11 Gi |
| `rocky-8` | Rocky Linux 8 | Cloud | 11 Gi |
| `rocky-9` | Rocky Linux 9 | Cloud | 11 Gi |
| `rocky-10` | Rocky Linux 10 | Cloud | 11 Gi |
| `debian-11` | Debian 11 (Bullseye) | Cloud | 4 Gi |
| `debian-12` | Debian 12 (Bookworm) | Cloud | 4 Gi |
| `debian-13` | Debian 13 (Trixie) | Cloud | 4 Gi |
| `ubuntu-2204` | Ubuntu 22.04 LTS (Jammy) | Cloud | 4 Gi |
| `ubuntu-2404` | Ubuntu 24.04 LTS (Noble) | Cloud | 4 Gi |
| `centos-stream-9` | CentOS Stream 9 | Cloud | 11 Gi |
| `centos-stream-10` | CentOS Stream 10 | Cloud | 11 Gi |
| `oracle-8` | Oracle Linux 8 | Cloud | 40 Gi |
| `oracle-9` | Oracle Linux 9 | Cloud | 40 Gi |
| `oracle-10` | Oracle Linux 10 | Cloud | 40 Gi |
| `opensuse-156` | openSUSE Leap 15.6 | Cloud | 1 Gi |
| `opensuse-160` | openSUSE Leap 16.0 | Cloud | 2 Gi |
| `cloudlinux-8` | CloudLinux 8 | Cloud | 8 Gi |
| `cloudlinux-9` | CloudLinux 9 | Cloud | 9 Gi |
| `proxmox-8` | Proxmox VE 8 | ISO | 2 Gi |
| `proxmox-9` | Proxmox VE 9 | ISO | 2 Gi |
| `talos-112` | Talos Linux 1.12 | Cloud | 4 Gi |

:::warning ISO images
**ISO** type images (Proxmox) are installers, not ready-to-use cloud images.
They require manual installation through the VNC console.
:::

---

### VMDisk examples

#### System disk using a Golden Image

```yaml title="ubuntu-golden-disk.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: VMDisk
metadata:
  name: ubuntu-system
spec:
  source:
    image:
      name: ubuntu-2404
  optical: false
  storage: 20Gi
  storageClass: replicated
```

---

## Storage classes

| Class        | Description        | Replication |
| ------------ | ------------------ | ----------- |
| `local`      | Node-local storage | ❌           |
| `replicated` | Replicated storage | ✅           |

---

## Network exposure methods

### PortList

* Automatic firewall
* Explicit port allowlist
* **Recommended for production**

### WholeIP

* All ports exposed
* No network filtering
* Development use only

:::warning Security
With `WholeIP`, the VM is fully exposed to the Internet.
An OS-level firewall is mandatory.
:::

---

## Best practices

### Security

* Use SSH keys only
* Enable OS firewall

### Storage

* Use `replicated` in production
* Separate system and data disks

### Performance

* Select instance types according to workload
* Monitor real usage

:::tip Recommended architecture
For production, use at least **two disks** (system + data) with replicated storage.
:::
