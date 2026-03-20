---
sidebar_position: 1
title: Overview
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# Presentation of Managed Kubernetes on Hikube

Hikube provides a **managed Kubernetes service** designed to offer a highly available, secure, and high-performance infrastructure.
The control plane is fully managed by the platform, while **worker nodes** are deployed inside your tenant as virtual machines.

---

## 🏗️ Architecture Diagram

### **High-Level Overview**

Hikube Kubernetes clusters rely on a **multi-datacenter infrastructure** (3 Swiss locations), ensuring replication, fault tolerance, and service continuity.

* **Control Plane**: hosted and operated by Hikube
  Components:

  * `kube-apiserver`
  * `etcd`
  * `kube-scheduler`
  * `kube-controller-manager`
* **Worker Nodes**: virtual machines inside your tenant
* **Networking**: CNI with support for `LoadBalancer`, `Ingress`, and `NetworkPolicy`
* **Storage**: persistent volumes replicated across the 3 datacenters
* **Add-ons**: cert-manager, FluxCD, monitoring stack, etc.
* **Kubernetes Versioning**: multi-version support with controlled upgrades

---

## ⚙️ Cluster Composition and Configuration

Clusters are fully declarative and configurable via API or YAML manifests.
The main configuration elements include:

| Element          | Description                                         |
| ---------------- | --------------------------------------------------- |
| **nodeGroups**   | Homogeneous groups of nodes (size, role, GPU, etc.) |
| **storageClass** | Defines persistence and replication behavior        |
| **addons**       | Optional features that can be enabled               |
| **version**      | Kubernetes server version                           |
| **network**      | CNI configuration, LoadBalancer, Ingress            |

---

## ⚙️ How the Platform Works

### 🧠 **Control Plane**

* Managed entirely by Hikube — no customer maintenance required
* Critical components replicated across multiple sites
* High availability, monitoring, and automated patching included
* Access via the standard Kubernetes API (`kubectl`, SDK clients, etc.)

### 🧩 **Worker Nodes / NodeGroups**

NodeGroups allow you to adapt compute resources to your needs.
Each group can define instance type, roles, and autoscaling parameters.

#### Example NodeGroup

```yaml
nodeGroups:
  web:
    minReplicas: 2
    maxReplicas: 10
    instanceType: "s1.large"
    roles: ["ingress-nginx"]
```

#### Key Characteristics

* **Autoscaling** via `minReplicas` / `maxReplicas`
* **GPU support** with dynamically attached NVIDIA GPUs
* **Instance types**: `S1` (standard), `U1` (universal), `M1` (memory-optimized)

---

## 💾 Persistent Storage

### **Storage Class: `replicated`**

* Automatic replication across **all 3 Swiss datacenters**
* Dynamic provisioning of Persistent Volumes (PVC)
* Built-in fault tolerance and high availability

Example usage:

```yaml
storageClassName: replicated
resources:
  requests:
    storage: 20Gi
```

---

## 🔢 Kubernetes Versioning

* Clusters can be created with a **specific Kubernetes version**
* Hikube handles minor and patch upgrades in a controlled manner
* Customers may plan major upgrades when needed

Example:

```yaml
version: "1.30.3"
```

---

## 🧩 Integrated Add-ons

### **Cert-Manager**

* Automated SSL/TLS certificate management
* Supports Let’s Encrypt and private authorities
* Automatic renewal

### **Ingress NGINX**

* Built-in ingress controller
* Wildcard support, SNI, and Prometheus metrics

### **Flux CD (GitOps)**

* Continuous sync with your Git repositories
* Automated deployments and rollback

### **Monitoring Stack**

* **Node Exporter**, **FluentBit**, **Kube-State-Metrics**
* Full integration with your tenant’s Grafana and Prometheus

---

## 🚀 Example Use Cases

### **Web Applications**

```yaml
nodeGroups:
  web:
    minReplicas: 2
    maxReplicas: 10
    instanceType: "s1.large"
    roles: ["ingress-nginx"]
```

### **ML/AI Workloads**

```yaml
nodeGroups:
  ml:
    minReplicas: 1
    maxReplicas: 5
    instanceType: "u1.xlarge"
    gpus:
      - name: "nvidia.com/AD102GL_L40S"
```

### **Critical Applications**

```yaml
nodeGroups:
  production:
    minReplicas: 3
    maxReplicas: 20
    instanceType: "m1.large"
```

---

## 📚 Resources

* **[Concepts & Architecture](./concepts.md)** → Learn how a Hikube Kubernetes cluster is built
* **[Quick Start](./quick-start.md)** → Create your first Hikube cluster
* **[API Reference](./api-reference.md)** → Full configuration documentation

---

## 💡 Key Takeaways

* **Managed control plane** – no master maintenance required
* **Workers in your tenant** – full control over compute resources
* **Autoscaling** – dynamic adjustment based on load
* **Multi-datacenter replication** – built-in high availability
* **Full compatibility** – standard Kubernetes API support

<NavigationFooter
  nextSteps={[
    {label: "Concepts", href: "../concepts"},
    {label: "Quick Start", href: "../quick-start"},
  ]}
/>

---
