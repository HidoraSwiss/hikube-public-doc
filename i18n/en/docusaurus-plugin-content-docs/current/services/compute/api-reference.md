---
sidebar_position: 3
title: API Reference
---

## API Reference – Virtual Machines

This reference provides an exhaustive description of Hikube's **VMInstance** and **VMDisk** APIs: available parameters, default values, usage examples, and recommended best practices.

The fields documented below correspond to the schema actually exposed by the platform (`apps.cozystack.io/v1alpha1`).

---

## VMInstance

### Overview

The `VMInstance` API lets you create, configure, and manage virtual machines in Hikube. A VM relies on one or more disks described separately via the [`VMDisk`](#vmdisk) resource.

```yaml title="vm-instance.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: VMInstance
metadata:
  name: example-vm
spec:
  # Detailed configuration below
```

:::warning Correct Kind
The resource is named **`VMInstance`** (not `VirtualMachine`). The disk is **not** a built-in `systemDisk` field: you must create a separate `VMDisk` resource and reference it in `disks`.
:::

---

### Full specification

| Parameter         | Type             | Description                                                                 | Default      | Required |
| ----------------- | ---------------- | --------------------------------------------------------------------------- | ------------ | -------- |
| `external`        | `boolean`        | Enables network exposure from outside the cluster                           | `false`      | no       |
| `externalMethod`  | `string`         | Exposure method: `PortList` or `WholeIP`                                    | `PortList`   | no       |
| `externalPorts`   | `[]integer`      | Ports to forward from the outside (used with `PortList`)                    | `[22]`       | no       |
| `runStrategy`     | `string`         | Desired running state (see [runStrategy](#runstrategy))                     | `Always`     | no       |
| `instanceType`    | `string`         | CPU / memory size (see [instance types](#instance-types))                   | `u1.medium`  | no       |
| `instanceProfile` | `string`         | OS profile / preferences (drivers, kernel) — see [profiles](#os-profiles)   | `ubuntu`     | no       |
| `disks`           | `[]object`       | List of `VMDisk` resources to attach (see [disks](#disks))                  | `[]`         | no       |
| `subnets`         | `[]object`       | Additional subnets (VPC) — see [subnets](#subnets)                          | `[]`         | no       |
| `gpus`            | `[]object`       | GPUs to attach in passthrough (see [gpus](#gpu))                            | `[]`         | no       |
| `resources`       | `object`         | Explicit CPU / memory / sockets override (see [resources](#resources))      | `{}`         | no       |
| `cpuModel`        | `string`         | CPU model exposed to the VM (e.g. `host-passthrough`)                        | `""`         | no       |
| `sshKeys`         | `[]string`       | Injected public SSH keys                                                    | `[]`         | no       |
| `cloudInit`       | `string`         | Cloud-init configuration (user-data YAML)                                   | `""`         | no       |
| `cloudInitSeed`   | `string`         | Seed used to generate a stable SMBIOS UUID                                  | `""`         | no       |

:::note
All fields are optional: a minimal VM only requires a bootable disk referenced in `disks`. The default values above are those applied by the platform.
:::

---

### runStrategy

`runStrategy` controls the VM running state. It replaces the former boolean `running` field.

| Value             | Behavior                                                                |
| ----------------- | ----------------------------------------------------------------------- |
| `Always`          | The VM is kept running (restarts automatically if it stops)             |
| `Halted`          | The VM is stopped                                                       |
| `Manual`          | The state is driven manually (`virtctl start` / `stop`)                 |
| `RerunOnFailure`  | Restarts only after a failure                                           |
| `Once`            | Starts once, without automatic restart                                  |

```yaml
spec:
  runStrategy: Always
```

To stop/restart an existing VM:

```bash
kubectl patch vminstance my-vm --type='merge' -p '{"spec":{"runStrategy":"Halted"}}'
kubectl patch vminstance my-vm --type='merge' -p '{"spec":{"runStrategy":"Always"}}'
```

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

See [Network exposure methods](#network-exposure-methods).

---

### Instance types

`instanceType` references a `VirtualMachineClusterInstancetype`. Hikube exposes several series, each with sizes from `nano` → `8xlarge`:

| Series | Usage                                                                 |
| ------ | --------------------------------------------------------------------- |
| `s1`   | **Standard** — shared/burstable CPUs, 1:2 vCPU:RAM ratio              |
| `u1`   | **Universal** — general purpose, 1:4 ratio (default)                 |
| `m1`   | **Memory optimized** — 1:8 ratio                                     |

```yaml
# Examples from the Universal series (1:4 ratio)
instanceType: u1.medium    # 1 vCPU, 4 GB RAM
instanceType: u1.large     # 2 vCPU, 8 GB RAM
instanceType: u1.xlarge    # 4 vCPU, 16 GB RAM
instanceType: u1.2xlarge   # 8 vCPU, 32 GB RAM
instanceType: u1.4xlarge   # 16 vCPU, 64 GB RAM
instanceType: u1.8xlarge   # 32 vCPU, 128 GB RAM
```

```yaml
# Standard series (1:2 ratio)
instanceType: s1.small     # 1 vCPU, 2 GB RAM
instanceType: s1.medium    # 2 vCPU, 4 GB RAM
instanceType: s1.large     # 4 vCPU, 8 GB RAM
instanceType: s1.xlarge    # 8 vCPU, 16 GB RAM
instanceType: s1.2xlarge   # 16 vCPU, 32 GB RAM
```

```yaml
# Memory optimized series (1:8 ratio)
instanceType: m1.large     # 2 vCPU, 16 GB RAM
instanceType: m1.xlarge    # 4 vCPU, 32 GB RAM
instanceType: m1.2xlarge   # 8 vCPU, 64 GB RAM
instanceType: m1.4xlarge   # 16 vCPU, 128 GB RAM
instanceType: m1.8xlarge   # 32 vCPU, 256 GB RAM
```

:::tip GPU and `instanceType`
To attach a GPU, choose a general-purpose series (`u1`, `s1`…) and declare the GPU via the [`gpus`](#gpu) field. The NVIDIA driver requires **at least 4 GiB of RAM**.
:::

---

### OS profiles

`instanceProfile` loads the **KubeVirt preferences** (drivers, machine model, kernel) suited to the OS. It does **not** define the image — that is carried by the `VMDisk`. It is especially decisive for Windows (virtio drivers).

Available values (excerpt):

| Family      | Profiles                                                                                 |
| ----------- | ---------------------------------------------------------------------------------------- |
| Ubuntu      | `ubuntu`                                                                                 |
| RHEL        | `rhel.7`, `rhel.8`, `rhel.9`, `rhel.10` (+ variants `.desktop`, `.arm64`, `.dpdk`, `.realtime`) |
| CentOS      | `centos.7`, `centos.stream8`, `centos.stream9`, `centos.stream10` (+ `.desktop`, `.dpdk`) |
| Fedora      | `fedora`, `fedora.arm64`                                                                  |
| openSUSE    | `opensuse.leap`, `opensuse.tumbleweed`                                                    |
| SLES        | `sles`                                                                                    |
| Others      | `alpine`, `cirros`                                                                        |
| Windows     | `windows.2k22.virtio`, `windows.2k25.virtio`, `windows.10.virtio`, `windows.11.virtio` (the `.virtio` variants are **recommended**); non-virtio variants are also available (`windows.2k22`…) |

:::note
There is **no** dedicated `debian`, `rocky`, or `almalinux` profile. For those distributions, use `ubuntu` (Debian base) or leave `instanceProfile: ""`. For Windows, always use a `.virtio` variant (e.g. `windows.2k25.virtio`) so that the virtio drivers are loaded.
:::

---

### Disks

`disks` is a **list of objects** referencing [`VMDisk`](#vmdisk) resources by name. The first disk listed is usually the bootable disk.

| Field           | Type     | Description                                          |
| --------------- | -------- | ---------------------------------------------------- |
| `disks[].name`  | `string` | Name of the `VMDisk` to attach                       |
| `disks[].bus`   | `string` | Bus type (`virtio`, `sata`, `scsi`) — optional      |

```yaml
spec:
  disks:
    - name: vm-system-disk
    - name: vm-data-disk
      bus: scsi
```

:::warning
The VM does not take a new disk into account until it is restarted (`virtctl restart` or a `runStrategy` toggle).
:::

---

### GPU

`gpus` attaches one or more NVIDIA GPUs in PCI passthrough.

| Field          | Type     | Description                                |
| -------------- | -------- | ------------------------------------------ |
| `gpus[].name`  | `string` | Name of the GPU resource (`nvidia.com/...`) |

```yaml
spec:
  instanceType: u1.2xlarge
  gpus:
    - name: nvidia.com/AD102GL_L40S
```

The models available on Hikube are detailed in the [GPU API reference](../gpu/api-reference.md). A GPU is assigned **exclusively** to a single VM.

---

### Subnets

`subnets` attaches the VM to additional subnets of a VPC.

| Field             | Type     | Description           |
| ----------------- | -------- | --------------------- |
| `subnets[].name`  | `string` | Subnet name           |

```yaml
spec:
  subnets:
    - name: subnet-ab2c3e47
```

---

### Resources

By default, CPU/memory sizing is carried by `instanceType`. The `resources` block lets you explicitly **override** those values (and define a socket topology).

| Field                | Type            | Description                          |
| -------------------- | --------------- | ------------------------------------ |
| `resources.cpu`      | `int`/`string`  | Number of allocated CPU cores        |
| `resources.memory`   | `int`/`string`  | Amount of allocated memory           |
| `resources.sockets`  | `int`/`string`  | Number of CPU sockets (topology)     |

```yaml
spec:
  resources:
    cpu: "4"
    memory: 8Gi
    sockets: "2"
```

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
  # Optional seed to pin the SMBIOS UUID (licensing, machine identity)
  cloudInitSeed: ""
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
  runStrategy: Always
  instanceType: u1.2xlarge
  instanceProfile: ubuntu
  disks:
    - name: vm-system-disk
  sshKeys:
    - ssh-rsa AAAA...
```

---

## VMDisk

### Overview

The `VMDisk` API manages the virtual disks attached to VMs. It supports several image sources: **HTTP**, a preloaded **Golden Image**, or an empty disk.

```yaml title="disk-example.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: VMDisk
metadata:
  name: disk-example
spec:
  source:
    image:
      name: ubuntu-2404
  optical: false
  storage: 30Gi
  storageClass: replicated
```

### Main parameters

| Parameter      | Type            | Description                                  | Default      | Required |
| -------------- | --------------- | -------------------------------------------- | ------------ | -------- |
| `storage`      | `int`/`string`  | Disk size                                    | `5Gi`        | ✅       |
| `storageClass` | `string`        | Storage class                                | `replicated` | ✅       |
| `source`       | `object`        | Disk image source (see below)                | `{}`         | no       |
| `optical`      | `boolean`       | Optical disk / ISO (installer)               | `false`      | no       |

---

## Image sources

### HTTP / HTTPS source

```yaml
spec:
  source:
    http:
      url: https://cloud-images.ubuntu.com/noble/current/noble-server-cloudimg-amd64.img
```

### Golden Images (Hikube preloaded images)

**Golden Images** are system images maintained and preloaded in Hikube, for fast provisioning without an external dependency.

```yaml
spec:
  source:
    image:
      name: ubuntu-2404
```

#### Available images

| Name | Operating System | Type | Min. storage |
| --- | ---------------------- | ---- | :-----------: |
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
| `windows-server-2022` | Windows Server 2022 | ISO | 28 Gi |
| `windows-server-2025` | Windows Server 2025 | ISO | 28 Gi |
| `proxmox-8` | Proxmox VE 8 | ISO | 2 Gi |
| `proxmox-9` | Proxmox VE 9 | ISO | 2 Gi |
| `talos-112` | Talos Linux 1.12 | Cloud | 8 Gi |

:::warning ISO images
**ISO** type images (Windows, Proxmox) are installers, not ready-to-use cloud images. Plan for an initial installation through the VNC console. For Windows, see the [Install a Windows VM](how-to/install-windows-vm.md) guide.
:::

### Empty disk

```yaml
spec:
  source: {}
```

An empty disk is useful for additional data volumes.

---

### VMDisk example using a Golden Image

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

Hikube exposes several `storageClass` options based on LINSTOR. For a VM, `replicated` is recommended.

| Class                                  | Replication | Encryption  | Notes                                            |
| -------------------------------------- | :---------: | :---------: | ------------------------------------------------ |
| `local`                                | ❌          | ❌          | Node-local storage (default), not resilient      |
| `local-encrypted`                      | ❌          | ✅ (LUKS)   | Local + encrypted                                |
| `replicated`                           | ✅          | ❌          | Synchronous replication — **recommended** for VMs |
| `replicated-encrypted`                 | ✅          | ✅ (LUKS)   | Replicated + encrypted                           |
| `replicated-async`                     | ✅ (async)  | ❌          | Asynchronous replication                         |
| `replicated-async-encrypted`           | ✅ (async)  | ✅ (LUKS)   | Asynchronous replication + encrypted             |
| `replicated-async-windows`             | ✅ (async)  | ❌          | Variant tailored for Windows disks               |
| `replicated-async-windows-encrypted`   | ✅ (async)  | ✅ (LUKS)   | Windows variant + encrypted                      |

:::note
The `-windows` variants are optimized for Windows VM disks. Encryption (`-encrypted`) relies on LUKS at the volume level.
:::

---

## Network exposure methods

### PortList

* Automatic firewall
* Only the ports listed in `externalPorts` are accessible
* **Recommended in production**

### WholeIP

* A dedicated public IP, all ports exposed
* No network filtering on the platform side
* Reserve for development or controlled gateways

:::warning Security
With `WholeIP`, the VM is fully exposed to the Internet. An OS-level firewall is mandatory.
:::

---

## Best practices

### Security

* SSH key authentication only
* OS firewall active, `PortList` rather than `WholeIP`

### Storage

* `replicated` (or encrypted/Windows variants) in production
* Separate the system disk from data disks

### Performance

* Match `instanceType` to the workload, or override via `resources`
* For GPUs, plan for ≥ 4 GiB of RAM and a suitable CPU/RAM ratio

:::tip Recommended architecture
In production, use at least **2 disks** (system + data) with replicated storage.
:::
