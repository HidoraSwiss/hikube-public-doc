---
title: "How to attach an extra disk"
---

# How to attach an extra disk

Separating application data from the system disk is a best practice for reliability and flexibility of your VMs. This guide explains how to create an extra disk, attach it to an existing VMInstance, then format and mount it in the operating system.

## Prerequisites

- **kubectl** configured with your Hikube kubeconfig
- An existing and running **VMInstance**
- **SSH** or **console** access to the VM

## Steps

### 1. Create an extra VMDisk

Create an empty disk of the desired size. An empty disk uses `source: {}` without a URL or image:

```yaml title="data-disk.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: VMDisk
metadata:
  name: vm-data-disk
spec:
  source: {}
  optical: false
  storage: 50Gi
  storageClass: replicated
```

Apply the manifest:

```bash
kubectl apply -f data-disk.yaml
```

Verify that the disk is ready:

```bash
kubectl get vmdisk vm-data-disk -w
```

**Expected output:**

```
NAME            STATUS   SIZE   STORAGECLASS   AGE
vm-data-disk    Ready    50Gi   replicated     30s
```

### 2. Reference the disk in the VMInstance

Add the new disk name to the `spec.disks[]` list of your VMInstance. For example, if your VM already uses a system disk `vm-system-disk`:

```yaml title="vm-instance.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: VMInstance
metadata:
  name: my-vm
spec:
  running: true
  instanceType: u1.xlarge
  instanceProfile: ubuntu
  external: true
  externalMethod: PortList
  externalPorts:
    - 22
  disks:
    - vm-system-disk
    - vm-data-disk
  sshKeys:
    - ssh-ed25519 AAAA... user@host
```

### 3. Apply the changes

```bash
kubectl apply -f vm-instance.yaml
```

:::note
The VM may automatically restart to take the new disk into account. Wait until the VM is back in `Running` state before continuing.
:::

### 4. Format and mount the disk in the VM

Connect to the VM:

```bash
virtctl ssh ubuntu@my-vm
```

Identify the new disk with `lsblk`:

```bash
lsblk
```

**Expected output:**

```
NAME    MAJ:MIN RM  SIZE RO TYPE MOUNTPOINTS
vda     252:0    0   20G  0 disk
├─vda1  252:1    0 19.9G  0 part /
└─vda15 252:15   0  106M  0 part /boot/efi
vdb     252:16   0   50G  0 disk
```

The new disk appears as `vdb` (without partition or mount point).

Format the disk as ext4:

```bash
sudo mkfs.ext4 /dev/vdb
```

Create the mount point and mount the disk:

```bash
sudo mkdir -p /mnt/data
sudo mount /dev/vdb /mnt/data
```

To make the mount persistent across reboots, add an entry to `/etc/fstab`:

```bash
echo '/dev/vdb /mnt/data ext4 defaults 0 2' | sudo tee -a /etc/fstab
```

## Verification

Verify that the disk is correctly mounted and accessible:

```bash
df -h /mnt/data
```

**Expected output:**

```
Filesystem      Size  Used Avail Use% Mounted on
/dev/vdb         49G   24K   47G   1% /mnt/data
```

Test writing:

```bash
sudo touch /mnt/data/test.txt && echo "OK"
```

:::tip Replicated storage
Always use `storageClass: replicated` for data disks in production. This ensures replication across multiple datacenters.
:::

## Going further

- [API Reference](../api-reference.md)
- [Quick start](../quick-start.md)
