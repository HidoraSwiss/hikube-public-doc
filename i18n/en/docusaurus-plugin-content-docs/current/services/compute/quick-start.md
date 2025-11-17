---
sidebar_position: 2
title: Quick Start
---

# Create Your First Virtual Machine

This guide walks you through creating your first Hikube virtual machine in **5 minutes**!

---

## Objective

By the end of this guide, you will have:

- A functional Ubuntu virtual machine
- SSH access configured
- Operational network connectivity
- Persistent storage attached

---

## Prerequisites

Before starting, make sure you have:

- **kubectl** configured with your Hikube kubeconfig
- **Administrator rights** on your tenant

---

## 🚀 Step 1: Create the VM Disk (2 minutes)

### **Prepare the manifest file**

Create a `vm-disk.yaml` file with an Ubuntu Cloud image:

```yaml title="vm-disk.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: VMDisk
metadata:
  name: disk-example
spec:
  source:
    http:
      url: https://cloud-images.ubuntu.com/noble/current/noble-server-cloudimg-amd64.img
  optical: false
  storage: 20Gi
  storageClass: "replicated"
```

### **Deploy the disk**

```bash
# Create the VM disk
kubectl apply -f vm-disk.yaml

# Check status (may take 1-2 minutes)
kubectl get vmdisk disk-example -w
```

**Expected result:**

```
NAME          STATUS   SIZE   STORAGECLASS   AGE
disk-example  Ready    20Gi   replicated     90s
```

---

## Step 2: Create the Virtual Machine (2 minutes)

### **Generate your SSH key**

If you don't have an SSH key yet:

```bash
# Generate an Ed25519 SSH key (modern and secure)
ssh-keygen -t ed25519 -f ~/.ssh/hikube-vm

# Display the public key
cat ~/.ssh/hikube-vm.pub
```

### **Prepare the VM manifest**

Create a `vm-instance.yaml` file:

```yaml title="vm-instance.yaml"
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
  instanceType: u1.xlarge
  instanceProfile: "ubuntu"
  disks:
    - name: disk-example # Specify your disk name
  resources:
    cpu: ""
    memory: ""
  sshKeys:
    - your-public-key-here
  cloudInit: |
    #cloud-config
  cloudInitSeed: ""
```

:::warning Attention
Replace `your-public-key-here` with your real SSH public key!
:::

### **Deploy the VM**

```bash
# Create the virtual machine
kubectl apply -f vm-instance.yaml

# Monitor startup
kubectl get vminstance vm-example -w
```

---

## Understanding Exposure Methods

### **PortList vs WholeIP: What's the difference?**

Hikube offers two external exposure methods, each with its specificities:

#### **PortList (Recommended)**

- **Controlled firewall** : Only ports specified in `externalPorts` are accessible
- **Enhanced security** : Automatic protection against unauthorized access
- **Usage** : Production, secure environments
- **Configuration** : `externalMethod: PortList` + `externalPorts: [22, 80, 443]`

#### **WholeIP**

- **Complete access** : All VM ports are directly accessible
- **No firewall** : No network-level protection configured via the service
- **Usage** : Development, complete administrative access
- **Configuration** : `externalMethod: WholeIP` (no need for `externalPorts`)

:::tip Method Choice

- **Production/Secure** → `PortList` with specific ports
- **Development/Debug** → `WholeIP` for complete access
:::

---

## 🔌 Step 3: Access Your VM (1 minute)

### **virtctl Installation**

If you don't have `virtctl` installed yet:

```bash
# Install virtctl
export VERSION=$(curl https://storage.googleapis.com/kubevirt-prow/release/kubevirt/kubevirt/stable.txt)
wget https://github.com/kubevirt/kubevirt/releases/download/${VERSION}/virtctl-${VERSION}-linux-amd64
chmod +x virtctl
sudo mv virtctl /usr/local/bin/

# Verify installation
virtctl version
```

### **Access methods**

#### **Option 1: Direct SSH**

```bash
# SSH via virtctl (with custom key)
virtctl ssh -i ~/.ssh/hikube-vm ubuntu@vm-example
# or SSH via public IP (with custom key)
ssh -i ~/.ssh/hikube-vm ubuntu@public-ip
```

#### **Option 2: Serial Console (always available)**

```bash
# Direct console access
virtctl console vm-example
```

#### **Option 3: VNC Interface**

```bash
# Graphical access
virtctl vnc vm-example
```

---

## 🎉 Congratulations

Your Hikube virtual machine is **operational**!

### **What you've accomplished:**

- **Ubuntu VM** deployed with 4 vCPU / 16 GB RAM
- **Persistent storage** of 20 GB replicated
- **SSH access** securely configured
- **External connectivity** enabled
- **Resilient infrastructure** with compute/storage separation

---

## Cleanup (Optional)

If you want to delete the created resources:

```bash
# Delete the VM (attention!)
kubectl delete vminstance vm-example

# Delete the disk (attention!)
kubectl delete vmdisk disk-example
```

:::warning Irreversible Deletion
Deletion of VMs and disks is **irreversible**. Make sure you have backed up all important data before proceeding.
:::

---

## 🎯 Next Steps

<div style={{display: 'flex', gap: '20px', flexWrap: 'wrap'}}>

**📚 Advanced Configuration**  
→ [Complete API Reference](./api-reference.md)

**📖 Technical Architecture**  
→ [Understand how it works](./overview.md)

</div>

---

**💡 Key Points to Remember:**

- Your **data is always safe** thanks to 3-datacenter replication
- Your VM can be **automatically relocated** in case of node failure
- **Complete isolation** guarantees security between tenants

