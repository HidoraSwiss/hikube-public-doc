---
sidebar_position: 6
title: FAQ
---

# FAQ — Kubernetes

### How do I create a Kubernetes cluster?

In the [Hikube console](https://console.hikube.cloud), open **Infrastructure** > **Kubernetes** and click **Create cluster**. The wizard has four steps: **General**, **Nodes**, **Addons** and **Summary**. The [quick start](./quick-start.md) details each step.

---

### Which instance types are available?

Hikube offers three instance series for Kubernetes nodes:

| Series | Prefix | vCPU:RAM ratio | Recommended use |
|-------|---------|----------------|------------------|
| **Standard (S)** | `s1` | 1:2 | Economical use, development, testing |
| **Universal (U)** | `u1` | 1:4 | General use: web servers, applications |
| **Memory (M)** | `m1` | 1:8 | Databases, caches, in-memory processing |

Each series is available in several sizes, for example `s1.small`, `u1.large`, `m1.2xlarge`. The full list is in the [concepts](./concepts.md#instance-types).

---

### Which storage class should I use in my cluster?

The persistent volumes of your workloads use the **`replicated`** storage class, replicated across several datacenters:

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
      storage: 10Gi
```

Choosing another storage class for the cluster is not offered in the console; contact support.

---

### Which addons are available?

The **Addons** step of the wizard offers:

| Addon | Description | Enabled by default |
|-------|-------------|-------------------|
| **Cert-Manager** | Automatic SSL/TLS certificate management | Yes |
| **Ingress NGINX** | NGINX-based Ingress controller | Yes |
| **Gateway API** | Kubernetes Gateway API CRDs | No |
| **GPU Operator** | NVIDIA GPU management | No (enforced if a group has GPUs) |
| **HAMi** | Sharing a GPU between several pods (requires GPU Operator) | No |
| **Flux CD** | GitOps continuous deployment | No |
| **Monitoring Agents** | Monitoring agents for logs and metrics | Yes |
| **Ouroboros** | Fixes Ingress NGINX hairpin NAT (requires Ingress NGINX) | No |
| **Velero** | Backup and restore | No |

**Cilium**, **CoreDNS** and **Vertical Pod Autoscaler** are always present; their configuration is overridden in the **Advanced Configuration** section. Addons are enabled at creation or from **Edit** > **Extensions & Addons**. See the Plugins section, starting with [Cilium](./plugins/cilium.md).

---

### How do I retrieve my kubeconfig?

Open the cluster detail page in the console and click **Kubeconfig** in the **Actions** section. The browser downloads the `kubeconfig-<cluster-name>.yaml` file:

```bash
export KUBECONFIG=~/Downloads/kubeconfig-<cluster-name>.yaml
kubectl get nodes
```

See [Access and tools](./how-to/toolbox.md).

---

### How do I scale node groups?

Scaling is controlled by the **Minimum nodes** and **Maximum nodes** of each group. The autoscaler automatically adjusts the number of nodes between these two bounds according to the load.

To change the bounds: **Edit** > **Node groups**, expand the group, change the values, then **Save**. See [How to configure autoscaling](./how-to/configure-autoscaling.md).

---

### How do I add GPU nodes to my cluster?

Add a new node group (**Edit** > **Add node group**) and choose the GPU model and number in its **GPU** section. The console then automatically enables the **GPU Operator** addon, which installs the NVIDIA drivers.

:::warning
- The chosen GPUs are attached to **each** node of the group, and the reservation is calculated on the maximum number of nodes: a group of at most 4 nodes with 1 GPU per node reserves 4 GPUs, with a direct impact on billing.
- An existing group created without GPUs cannot receive any: create a new group.
:::

See [How to add and modify a node group](./how-to/manage-node-groups.md).

---

### Can I modify the control plane after creation?

No. The **Control Plane Instance Size** and **Control Plane High Availability** cannot be changed in the console after creation; contact support. The Kubernetes version, the API endpoint, the node groups and the addons remain editable.
