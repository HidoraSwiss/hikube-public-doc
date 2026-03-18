---
title: "How to install a Windows VM"
---

# How to install a Windows VM

Installing a Windows Server VM on Hikube requires several manual steps: preparing the ISO disks, creating the VM, installing Windows via VNC, and then loading the virtio drivers. This guide details the entire process.

## Prerequisites

- **kubectl** configured with your Hikube kubeconfig
- **virtctl** installed for VNC access
- **Windows Server 2025** license or evaluation (the evaluation ISO is used in this guide)
- Sufficient storage space (approximately 70 Gi total)

## Steps

### 1. Create the Windows Server 2025 ISO disk

Create an optical VMDisk containing the Windows Server installation ISO:

```yaml title="win-iso-disk.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: VMDisk
metadata:
  name: win2k25-iso
spec:
  source:
    http:
      url: https://software-static.download.prss.microsoft.com/dbazure/888969d5-f34g-4e03-ac9d-1f9786c66749/SERVER_EVAL_x64FRE_en-us.iso
  optical: true
  storage: 7Gi
  storageClass: replicated
```

```bash
kubectl apply -f win-iso-disk.yaml
```

### 2. Create the virtio drivers ISO disk

The virtio drivers are essential for Windows to recognize disks and network in a KubeVirt environment:

```yaml title="virtio-drivers-disk.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: VMDisk
metadata:
  name: virtio-drivers
spec:
  source:
    http:
      url: https://fedorapeople.org/groups/virt/virtio-win/direct-downloads/stable-virtio/virtio-win.iso
  optical: true
  storage: 1Gi
  storageClass: replicated
```

```bash
kubectl apply -f virtio-drivers-disk.yaml
```

### 3. Create the system disk

Create an empty disk that will serve as the system disk for Windows:

```yaml title="win-system-disk.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: VMDisk
metadata:
  name: win-system
spec:
  source: {}
  optical: false
  storage: 60Gi
  storageClass: replicated
```

```bash
kubectl apply -f win-system-disk.yaml
```

### 4. Verify that all three disks are ready

```bash
kubectl get vmdisk win2k25-iso virtio-drivers win-system
```

**Expected output:**

```
NAME              STATUS   SIZE   STORAGECLASS   AGE
win2k25-iso       Ready    7Gi    replicated     2m
virtio-drivers    Ready    1Gi    replicated     2m
win-system        Ready    60Gi   replicated     1m
```

:::note Download time
Downloading the Windows ISO (~5 GB) may take several minutes depending on bandwidth. Wait until all disks are in `Ready` status.
:::

### 5. Create the VMInstance

Create the VM with the three attached disks. The system disk must be in the first position:

```yaml title="windows-vm.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: VMInstance
metadata:
  name: windows-server
spec:
  runStrategy: Always
  instanceType: u1.xlarge
  external: true
  externalMethod: PortList
  externalPorts:
    - 3389
  disks:
    - win-system
    - win2k25-iso
    - virtio-drivers
```

```bash
kubectl apply -f windows-vm.yaml
```

Wait for the VM to start:

```bash
kubectl get vminstance windows-server -w
```

### 6. Access via VNC for installation

Open a VNC session to the VM:

```bash
virtctl vnc windows-server
```

The Windows installer should start automatically from the ISO. Follow the standard installation steps:

1. Choose the language and keyboard
2. Click **Install now**
3. Select the desired Windows Server edition
4. Accept the license agreement
5. Choose **Custom installation**

### 7. Load the virtio drivers during installation

During the disk selection step, Windows will not detect any disks. You need to load the virtio drivers:

1. Click **Load driver**
2. Click **Browse**
3. Navigate to the virtio drivers CD drive (usually `E:\`)
4. Select the folder `vioscsi\2k25\amd64` (storage controller)
5. Click **OK** then **Next**

The 60 GB disk should now appear. Select it and continue the installation.

:::warning Network drivers
After installation, also install the network drivers (NetKVM) and memory balloon driver (Balloon) from the virtio CD for optimal performance. Navigate to the `NetKVM\2k25\amd64` and `Balloon\2k25\amd64` folders.
:::

### 8. Post-installation: remove the ISO disks

Once Windows is installed and functional, remove the ISO disks from the manifest to free resources and avoid booting from the ISO:

```yaml title="windows-vm.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: VMInstance
metadata:
  name: windows-server
spec:
  runStrategy: Always
  instanceType: u1.xlarge
  external: true
  externalMethod: PortList
  externalPorts:
    - 3389
  disks:
    - win-system
```

```bash
kubectl apply -f windows-vm.yaml
```

You can then delete the ISO VMDisks if you no longer need them:

```bash
kubectl delete vmdisk win2k25-iso virtio-drivers
```

### 9. Configure RDP access (optional)

The VM already exposes port 3389 (RDP). Retrieve the external IP address:

```bash
kubectl get vminstance windows-server -o yaml
```

Connect with your RDP client:

```bash
# Depuis Linux
xfreerdp /v:<IP-EXTERNE> /u:Administrator

# Depuis macOS (Microsoft Remote Desktop)
# Ajoutez un PC avec l'adresse <IP-EXTERNE>
```

## Verification

Verify that the Windows VM is running correctly:

```bash
kubectl get vminstance windows-server
```

**Expected output:**

```
NAME              STATUS    AGE
windows-server    Running   15m
```

Test RDP access on port 3389:

```bash
nc -zv <IP-EXTERNE> 3389
```

## Going further

- [API Reference](../api-reference.md)
- [How to configure external networking](./configure-network.md)
