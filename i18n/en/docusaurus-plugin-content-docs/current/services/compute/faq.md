---
sidebar_position: 6
title: FAQ
---

# FAQ — Virtual Machines

### What is the difference between PortList and WholeIP?

| Feature | `PortList` | `WholeIP` |
|---------|-----------|-----------|
| **Behavior** | Only ports listed in `externalPorts` are exposed | All VM ports are exposed |
| **Security** | Fine-grained control, reduced attack surface | Requires OS-level firewall |
| **Use case** | Production, targeted services | Development, quick testing |

:::warning
With `WholeIP`, you must configure a firewall inside the VM (iptables, nftables, ufw) to protect unexposed services.
:::

```yaml title="vm-portlist.yaml"
spec:
  external: true
  externalMethod: PortList
  externalPorts:
    - 22
    - 443
```

---

### What images are available?

Hikube provides pre-configured **Golden Images**:

| Operating System | Available versions |
|-----------------|-------------------|
| **Ubuntu** | 22.04, 24.04 |
| **Debian** | 11, 12, 13 |
| **CentOS Stream** | 9, 10 |
| **Rocky Linux** | 8, 9, 10 |
| **AlmaLinux** | 8, 9, 10 |

Images are specified in the `source.image.name` field of the **VMDisk** resource, using the `{os}-{version}` format. For example: `ubuntu-2404`, `debian-12`, `rocky-9`.

---

### How do I choose my instanceType?

Instances follow three families with different vCPU:RAM ratios:

| Family | Prefix | Ratio | Example use |
|--------|--------|-------|-------------|
| **Standard** | `s1` | 1:2 | Web servers, lightweight apps |
| **Universal** | `u1` | 1:4 | Business apps, databases |
| **Memory** | `m1` | 1:8 | Cache, in-memory processing |

Available sizes range from `small` to `8xlarge`. For example: `u1.xlarge` provides 4 vCPU and 16 GB RAM.

---

### How do I add an extra disk?

First create a `VMDisk` resource, then reference it in your `VMInstance`:

```yaml title="data-disk.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: VMDisk
metadata:
  name: data-volume
spec:
  size: 100Gi
  storageClass: replicated
```

```yaml title="vm.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: VMInstance
metadata:
  name: my-vm
spec:
  instanceType: u1.large
  instanceProfile: ubuntu
  disks:
    - data-volume
```

---

### How do I access my VM via SSH?

1. Inject your SSH public key in the VM manifest:
   ```yaml title="vm-ssh.yaml"
   spec:
     sshKeys:
       - "ssh-ed25519 AAAAC3... user@laptop"
   ```

2. Expose port 22 via `PortList`:
   ```yaml title="vm-ssh.yaml"
   spec:
     external: true
     externalMethod: PortList
     externalPorts:
       - 22
   ```

3. Retrieve the external IP address:
   ```bash
   kubectl get svc
   ```

4. Connect:
   ```bash
   ssh user@<external-ip>
   ```

:::note
The default username depends on the image: `ubuntu` for Ubuntu, `debian` for Debian, `cloud-user` for CentOS/Rocky/AlmaLinux.
:::

---

### How do I customize the VM at boot?

Use the `cloudInit` field to inject a cloud-init configuration in YAML format:

```yaml title="vm-cloudinit.yaml"
spec:
  cloudInit: |
    #cloud-config
    packages:
      - nginx
      - htop
    users:
      - name: admin
        sudo: ALL=(ALL) NOPASSWD:ALL
        ssh_authorized_keys:
          - ssh-ed25519 AAAAC3... admin@company
    runcmd:
      - systemctl enable nginx
      - systemctl start nginx
```

Cloud-init runs at the first boot of the VM and allows installing packages, creating users, running commands, and more.

---

### What is the difference between `instanceProfile` and `instanceType`?

| Parameter | Role | Examples |
|-----------|------|----------|
| `instanceProfile` | Loads the **drivers and kernels** adapted to the OS | `ubuntu`, `centos`, `windows.2k25.virtio` |
| `instanceType` | Defines the VM **size** (CPU/RAM) | `s1.small`, `u1.large`, `m1.2xlarge` |

`instanceProfile` does not determine the OS image — that is defined in the **VMDisk** resource via `source.image.name`. The profile loads optimized drivers and kernels for the operating system. It is mainly useful for **Windows** (virtio drivers). `instanceType` sizes the CPU and memory resources allocated to the VM.
