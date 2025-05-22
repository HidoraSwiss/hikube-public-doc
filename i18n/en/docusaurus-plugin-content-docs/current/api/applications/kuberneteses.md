---
title: Kubernetes
---

The **Managed Kubernetes** service offers an optimized solution for efficiently managing server workloads. Kubernetes, now an industry standard, provides a unified and accessible API, primarily configured in YAML, making infrastructure management easier for teams.

---

## Overview

The Kubernetes service is built on robust software design patterns, enabling continuous recovery through the reconciliation method. It also ensures seamless scaling across multiple servers, eliminating the challenges of complex APIs from traditional virtualization platforms.

This managed solution significantly simplifies workload management by eliminating the need for custom solutions or source code modifications, saving time and effort.

---

## Deployment Details

The service deploys a standard Kubernetes cluster using:

- **Cluster API**: For Kubernetes cluster management.
- **Kamaji**: Control Plane provider.
- **KubeVirt**: Infrastructure provider for virtual machine orchestration.

Workloads use worker nodes deployed as virtual machines, while the control plane runs in containers.

### Available Features

- **LoadBalancer** services to manage external access.
- Easy provisioning of persistent volumes for applications.

**Useful Links**:

- [Kamaji Documentation](https://github.com/clastix/kamaji)
- [Cluster API Documentation](https://cluster-api.sigs.k8s.io/)
- [GitHub KubeVirt CSI Driver](https://github.com/kubevirt/csi-driver)

---

## Accessing the Deployed Cluster

To access the deployed Kubernetes cluster, use the following command to obtain the kubeconfig file:

```bash
kubectl get secret -n <namespace> kubernetes-<clusterName>-admin-kubeconfig -o go-template='{{ printf "%s\n" (index .data "super-admin.conf" | base64decode) }}' > kubeconfig.yaml
```

This generates a `kubeconfig.yaml` file that you can use with `kubectl` to interact with the cluster.

---

## Virtual Machines and Resource Series

The worker nodes of the Kubernetes cluster are deployed as **virtual machines** with characteristics adapted to different workloads. These characteristics include:

- **Burstable CPU** for variable workloads.
- **Hugepages** to improve memory performance.
- **vCPU-To-Memory Ratios** for optimal resource utilization.

For more details on virtual machine series and resources, see the [Virtual Machines](virtualmachines.md) page.

---

## Configurable Parameters

### **General Parameters**

| **Name**                  | **Description**                                                           | **Default Value**        |
|-----------------------------|---------------------------------------------------------------------------------|---------------------------|
| `host`                     | Hostname used to access the Kubernetes cluster.                         | `""` (cluster name)       |
| `controlPlane.replicas`    | Number of replicas for control plane components.                         | `2`                      |
| `storageClass`             | Storage class used for user data.                                       | `"replicated"` or `"local"`             |

### **Node Group Configuration**

| **Name**         | **Description**                                                                                | **Default Value** |
|--------------------|-----------------------------------------------------------------------------------------------------|------------------------|
| `nodeGroups`       | Node group configuration, including instance types, storage, and assigned roles. | `{}`                  |

Example for a node group:

```yaml
nodeGroups:
  md0:
    minReplicas: 0
    maxReplicas: 10
    instanceType: "u1.medium"
    ephemeralStorage: 20Gi
    roles:
    - ingress-nginx
    resources:
      cpu: ""
      memory: ""
```

## Available Add-ons

The following features can be enabled to enhance the cluster capabilities:

### Cert-Manager

Automatically manages SSL/TLS certificates.

Configuration:

```yaml
addons:
  certManager:
    enabled: true
    valuesOverride: {}
```

---

### Ingress-NGINX Controller

Manages HTTP/HTTPS access to the cluster.

Configuration:

```yaml
addons:
  ingressNginx:
    enabled: true
    hosts:
    - example.org
    - foo.example.net
    valuesOverride: {}
```

---

### Flux CD

Implements GitOps practices for application deployment.

Configuration:

```yaml
addons:
  fluxcd:
    enabled: true
    valuesOverride: {}
```

---

### Monitoring Agents

Enables integration with monitoring agents like FluentBit for log and metrics collection.

Configuration:

```yaml
addons:
  monitoringAgents:
    enabled: true
    valuesOverride: {}
```

---

## Additional Resources

- **[Official Kubernetes Documentation](https://kubernetes.io/docs/)**
  Official guide covering all aspects of Kubernetes.
- **[Cluster API Documentation](https://cluster-api.sigs.k8s.io/)**
  Detailed documentation for managing Kubernetes clusters via Cluster API.
- **[Kamaji Documentation](https://github.com/clastix/kamaji)**
  Guide on using Kamaji as a control plane provider.
- **[KubeVirt Documentation](https://kubevirt.io/)**
  Information on orchestrating virtual machines in Kubernetes.
