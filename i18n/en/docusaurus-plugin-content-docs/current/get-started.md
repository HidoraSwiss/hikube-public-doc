---
sidebar_position: 2
title: Getting Started
---

Welcome to **Hikube**! This documentation will guide you through the essential steps to start using the platform and manage your resources (tenants, Kubernetes clusters, virtual machines, and applications).

---

## Platform Access

Two methods are available to connect to your Hikube **tenant**:

### **1. Via Web Interface**

- Access the **Hikube Dashboard**: [https://dashboard.hikube.cloud/](https://dashboard.hikube.cloud/)
- Log in with your credentials.
- Once connected, you can **provision and manage your resources** (applications, Kubernetes, VMs) via a graphical interface.

### **2. Via Kubeconfig**

For advanced management, you can use the provided **Kubeconfig** file.

#### **Installing necessary tools:**

- [kubectl](https://kubernetes.io/docs/tasks/tools/)
- [kubelogin](https://github.com/int128/kubelogin)
- [Lens](https://k8slens.dev/) *(optional for a Desktop interface)*

Once these tools are installed, you can interact with your tenant directly from your terminal.

---

## Tenant Organization

Hikube is based on a **tenant system** that allows you to organize and isolate your resources.

### **Creating Tenants**

It is recommended to structure your organization into multiple tenants.
To create a **tenant**, use the web interface:

1. Go to the **"Catalog" tab**.
2. Select **the "Tenant" application**.
3. Define the desired parameters (**host, ingress, isolation...**).

Once your tenants are created, you can access them:

- **From the web interface** (dropdown menu in the top right).
- **Via their respective Kubeconfigs**, available in the **"Applications" tab** → click on the desired tenant → retrieve the file **in the "Secrets" section**.

For more information on managing and creating Tenants, feel free to check out **[our dedicated Tenants page.](./api/applications/tenants.md)**

---

## Deploying Kubernetes Applications

It is not recommended to install applications directly on tenant clusters.
**Best practice**:
🔹 **Create a Kubernetes cluster inside the tenant** (via web interface or CLI).
🔹 **Install your applications on this new cluster**, rather than directly on the tenant's cluster.

For more information on Kubernetes provisioning, see the **[Kubernetes](./api/applications/kuberneteses.md)** page.

---

## Creating a Virtual Machine (VM)

### **Creation Steps**

A VM on Hikube relies on two essential resources:

1. **VMDisk** – Defines the disk image to use.
2. **VMInstance** – Uses a VMDisk to start the VM.

### **Procedure**

1. **Create a VMDisk**
   - Select the **"VMDisk"** application in the **Catalog**.
   - Use a cloud ISO image, for example:

     ```yaml
     https://cloud-images.ubuntu.com/noble/current/noble-server-cloudimg-amd64.img
     ```

   - Configure the disk size and **StorageClass** (`replicated` or `local`).

2. **Create a VMInstance**
   - Select the **"VMInstance"** application.
   - Associate it with the previously created **VMDisk**.
   - Configure the machine (RAM, CPU, network, etc.).
   - Use **cloud-init** to automate VM configuration:
     - Documentation: [Cloud-Init](https://cloudinit.readthedocs.io/en/latest/)

For more information on Kubernetes provisioning, see the **[VMDisks](./api/applications/vmdisks.md)** and **[VMInstances](./api/applications/vminstances.md)** pages.

---

## Retrieving Tenant Kubeconfigs

Each tenant has a unique Kubeconfig, allowing access via **kubectl**.
To retrieve a **Kubeconfig**:

1. **Access the web interface**.
2. **Open the "Applications" tab**.
3. **Select your tenant**.
4. **Retrieve the Kubeconfig** in the **"Secrets"** section.

Once the Kubeconfig is retrieved, use the following command to add it:

```sh
export KUBECONFIG=/path/to/kubeconfig.yaml
kubectl get nodes
```

---

## General Recommendations

✔ **Isolate environments**: Use multiple tenants to organize your resources properly.
✔ **Create one Kubernetes per need**: Don't install applications directly on tenant clusters.
✔ **Use Cloud-Init for VMs**: Simplifies automation of installation and configuration.

---

Welcome to **Hikube**! 🎉 If you have any questions or need help, consult the documentation or contact our support.
