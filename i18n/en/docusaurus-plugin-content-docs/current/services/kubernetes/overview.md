---
sidebar_position: 1
title: Overview
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# Managed Kubernetes on Hikube

Hikube offers a **managed Kubernetes** service designed to provide a highly available, secure and high-performance infrastructure.
The control plane is fully managed by the platform, while the **worker nodes** are deployed in your project as virtual machines.

Clusters are created, modified and deleted from the [Hikube console](https://console.hikube.cloud), menu **Infrastructure** > **Kubernetes**. Once the cluster is ready, you download its kubeconfig from the console and work in the cluster with your usual tools (`kubectl`, `helm`, SDK client, etc.).

---

## Architecture

Hikube Kubernetes clusters rely on a **multi-datacenter infrastructure** (3 Swiss sites) that ensures replication, fault tolerance and service continuity.

- **Control Plane**: hosted and operated by Hikube. It consists of:
  - `kube-apiserver`
  - `etcd`
  - `kube-scheduler`
  - `kube-controller-manager`
- **Worker nodes**: virtual machines in your project, grouped into node groups
- **Networking**: Cilium CNI, support for `LoadBalancer` Services, `Ingress` and `NetworkPolicy`
- **Storage**: persistent volumes replicated across the 3 datacenters
- **Addons**: Cert-Manager, Ingress NGINX, Flux CD, monitoring agents, Velero, GPU Operator, etc.
- **Kubernetes versions**: you choose the version among those offered by the platform

---

## What you configure in the console

The **Create cluster** wizard groups the configuration into four steps:

| Step | What you define |
|-------|------------------------|
| **General** | Cluster name, Kubernetes version, API endpoint (optional), size and number of control plane instances |
| **Nodes** | One or more node groups: name, instance type, ephemeral storage, minimum and maximum number of nodes, exposure on the internet, GPU |
| **Addons** | Enabling the cluster addons and optionally overriding their Helm values |
| **Summary** | Summary before deployment |

Each field is described in detail in the [concepts](./concepts.md) and the [quick start](./quick-start.md).

---

## How it works in detail

### Control Plane

- Managed by Hikube, with no maintenance required on your side
- Sized by a preset (**Control Plane Instance Size**) and a number of instances (**Control Plane High Availability**: 1, 3 or 5)
- Access through the standard Kubernetes API (`kubectl`, SDK client, etc.) with the kubeconfig downloaded from the console

### Node groups

**Node groups** let you adapt resources to your workloads. Each group has its own instance type and its own autoscaling bounds.

- **Autoscaling**: minimum and maximum number of nodes per group
- **GPU support**: NVIDIA GPUs attached to the nodes of a group, chosen in the wizard
- **Instance types**: Standard (S), Universal (U) and Memory (M) series

---

## Persistent storage

Persistent volumes (PVCs) created in the cluster use the **`replicated`** storage class:

- Automatic replication across the **3 Swiss datacenters**
- Dynamic provisioning of persistent volumes
- Native fault tolerance and high availability

Example PVC to deploy in your cluster:

```yaml title="pvc.yaml"
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: my-data
spec:
  accessModes:
    - ReadWriteOnce
  storageClassName: replicated
  resources:
    requests:
      storage: 20Gi
```

---

## Kubernetes versions

- The version is chosen when the cluster is created, among those offered by the platform (the most recent one is preselected)
- Upgrades are done from the cluster's edit page (see [How to upgrade a cluster](./how-to/upgrade-cluster.md))

---

## Built-in addons

### Cert-Manager

- Automated management of SSL/TLS certificates
- Support for Let's Encrypt and private authorities
- Automatic renewal

### Ingress NGINX

- Built-in ingress controller, exposed by a `LoadBalancer` Service
- Deployed on the node groups exposed on the internet

### Flux CD (GitOps)

- Continuous synchronization with your Git repositories
- Automated deployment and rollback

### Monitoring Agents

- Collection of the cluster's metrics and logs (VictoriaMetrics Agent, Fluent Bit, kube-state-metrics, node exporter)

The full list is in the [Plugins](./plugins/cilium.md) section.

---

## Example use cases

| Use case | Recommended node group |
|-------------|---------------------------|
| **Web applications** | Standard series (S), 2 to 10 nodes, group exposed on the internet to host the Ingress |
| **ML/AI workloads** | Universal series (U) with GPU, GPU Operator addon enabled |
| **Critical applications** | At least 3 nodes minimum, highly available control plane (3 instances) |

---

## Resources

- **[Concepts and architecture](./concepts.md)**: understand how a Hikube Kubernetes cluster is deployed
- **[Quick start](./quick-start.md)**: create your first cluster from the console

---

## Key points

- **Managed control plane**: no master maintenance required
- **Nodes in your project**: full control over the workers
- **Autoscaling**: dynamic adjustment to the load
- **Multi-datacenter**: native high availability and replication
- **Full compatibility**: standard Kubernetes API

<NavigationFooter
  nextSteps={[
    {label: "Concepts", href: "../concepts"},
    {label: "Quick start", href: "../quick-start"},
  ]}
/>
