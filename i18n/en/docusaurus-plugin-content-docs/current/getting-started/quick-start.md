---
sidebar_position: 3
title: Quick Start
---

# 🚀 Quick Start with Hikube

Welcome! This guide will walk you through creating your first project on Hikube. By the end of this tutorial, you will have deployed your first application in a completely secure environment.

---

## Prerequisites

### **Platform Access**
If you don't have a Hikube account yet, contact our team at **sales@hidora.io** to get your access.

### **Required Tools Installation**

#### **kubectl** (required)

**macOS**
```bash
# Homebrew
brew install kubectl
```

**Linux**
```bash
# Ubuntu/Debian
sudo apt-get update && sudo apt-get install -y kubectl

# RHEL/CentOS/Fedora
sudo dnf install kubectl
# or for older versions
sudo yum install kubectl

# Alpine Linux
sudo apk add kubectl
```

**Windows**
```powershell
# Chocolatey
choco install kubernetes-cli

# winget
winget install Kubernetes.kubectl
```

📖 **Official documentation** : [Install kubectl](https://kubernetes.io/docs/tasks/tools/#kubectl)

#### **kubelogin** (required for OIDC authentication)

[kubelogin](https://github.com/int128/kubelogin) is a kubectl plugin for OpenID Connect (OIDC) authentication.

**macOS / Linux (Homebrew)**
```bash
brew install kubelogin
```

**Krew (macOS, Linux, Windows)**
```bash
kubectl krew install oidc-login
```

**Windows (Chocolatey)**
```powershell
choco install kubelogin
```

📖 **Official documentation**: [int128/kubelogin](https://github.com/int128/kubelogin)

:::warning Warning
Do **not** use the Azure kubelogin (`Azure/kubelogin`). Hikube uses standard OIDC authentication and requires the [int128/kubelogin](https://github.com/int128/kubelogin) plugin.
:::

### **Recommended Optional Tools**

For a better Kubernetes management experience:

- **[Lens](https://k8slens.dev/)** - Modern graphical interface for Kubernetes
- **[K9s](https://k9scli.io/)** - Interactive terminal interface for Kubernetes  
- **[Helm](https://helm.sh/)** - Package manager for Kubernetes
- **[kubectx + kubens](https://github.com/ahmetb/kubectx)** - Tools to quickly switch context and namespace

---

## Step 1: Access Your Tenant

### **kubectl Configuration**
1. **Retrieve your kubeconfig** from your Hikube administrator
2. **Configure kubectl** with your configuration file:
   ```bash
   # Option 1: Environment variable
   export KUBECONFIG=/path/to/your/hikube-kubeconfig.yaml
   
   # Option 2: Copy to default directory
   cp hikube-kubeconfig.yaml ~/.kube/config
   ```
3. **Verify the connection**:
   ```bash
   kubectl get pods
   ```

:::tip Multiple Configuration
You can manage multiple clusters with `kubectl config get-contexts` and `kubectl config use-context <context-name>`
:::

### **Tenant Verification**
Your tenant is your **isolated workspace**. Verify that you are in the correct context:
```bash
kubectl config current-context
```

---

## Step 2: Create Your First Kubernetes Cluster

### **Deployment via kubectl**
1. **Create a YAML file** for your Kubernetes cluster
2. **Customize the configuration** according to your needs
3. **Deploy with kubectl**:

```yaml
apiVersion: apps.cozystack.io/v1alpha1
kind: Kubernetes
metadata:
  name: kube
spec:
  addons:
    certManager:
      enabled: true
      valuesOverride: {}
    fluxcd:
      enabled: false
      valuesOverride: {}
    ingressNginx:
      enabled: true
      hosts:
      - my-app.example.com
      valuesOverride: {}
    monitoringAgents:
      enabled: false
      valuesOverride: {}
    verticalPodAutoscaler:
      valuesOverride: {}
  controlPlane:
    replicas: 3
  host: k8s-api.example.com
  kamajiControlPlane:
    addons:
      konnectivity:
        server:
          resources: {}
          resourcesPreset: small
    apiServer:
      resources: {}
      resourcesPreset: small
    controllerManager:
      resources: {}
      resourcesPreset: small
    scheduler:
      resources: {}
      resourcesPreset: small
  nodeGroups:
    md0:
      ephemeralStorage: 30Gi
      instanceType: u1.large
      maxReplicas: 6
      minReplicas: 3
      resources:
        cpu: ""
        memory: ""
      roles:
      - ingress-nginx
  storageClass: replicated

```

4. **Deploy the cluster**:
   ```bash
   # Save the configuration in a file
   kubectl apply -f my-kubernetes-cluster.yaml
   ```

### **⏳ Deployment Monitoring**
- The cluster will be ready in **1-3 minutes**
- Monitor the status with kubectl:
  ```bash
  kubectl get kubernetes
  kubectl describe kubernetes kube
  ```
- Status "Ready" = Cluster operational ✅

---

## DNS Configuration

### **Required DNS Records**

For your cluster to be accessible, you must create the following DNS records with your DNS provider:

```bash
# Retrieve the public IP of your cluster
kubectl get kubernetes kube -o jsonpath='{.status.controlPlaneEndpoint}' 

# Create DNS records (with your provider):
# Type A: k8s-api.example.com → <CLUSTER_IP>
# Type A: my-app.example.com → <CLUSTER_IP>
```

:::tip DNS Configuration
- **k8s-api.example.com** : Kubernetes API access point
- **my-app.example.com** : Domain for your applications via Ingress
- Replace `example.com` with your actual DNS zone
:::

---

## Step 3: Retrieve the Kubeconfig

### **Cluster Kubeconfig Extraction**
Once your cluster is deployed and ready, retrieve its credentials with this command:

```bash
# Retrieve the kubeconfig of the created cluster (adjust the names)
kubectl get secret -n tenant-<name> kubernetes-<clusterName>-admin-kubeconfig \
  -o go-template='{{ printf "%s\n" (index .data "admin.conf" | base64decode) }}' > admin.conf

# Concrete example:
kubectl get secret -n tenant-mycompany kubernetes-kube-admin-kubeconfig \
  -o go-template='{{ printf "%s\n" (index .data "admin.conf" | base64decode) }}' > admin.conf
```

:::info Variables to Customize
- `<name>` : Replace with your tenant name (e.g., `mycompany`)
- `<clusterName>` : Replace with your cluster name (e.g., `kube` according to the YAML config)
:::

### **Local Configuration**
```bash
# Use the new cluster's kubeconfig
export KUBECONFIG=./admin.conf

# Verify connection to the created cluster
kubectl get nodes

# Expected result:
# NAME                STATUS   ROLES           AGE   VERSION
# cluster-node-1      Ready    control-plane   2m    v1.28.x
# cluster-node-2      Ready    worker          2m    v1.28.x
# cluster-node-3      Ready    worker          2m    v1.28.x
```

:::success Congratulations!
Your Kubernetes cluster is now operational with **native high availability**!
:::

---

## Summary

You have created:

- A **high-availability Kubernetes cluster**
- A **completely secure environment** (network isolation)
- **Resilient storage** (automatic replication)
---

## Need Help?

### **Documentation**
- **[FAQ](../resources/faq.md)** → Answers to common questions
- **[Troubleshooting](../resources/troubleshooting.md)** → Problem solutions

### **Support**
- **Email:** support@hidora.io
- **Documentation:** This platform
- **Community:** Forums and real-time chat

:::tip Well Done! 🎊
You've just taken your first steps on Hikube. Your infrastructure is now ready to host all your most ambitious projects!
:::

---

**Recommended next step:** [📖 Key Concepts](./concepts.md) → Master Hikube fundamentals

