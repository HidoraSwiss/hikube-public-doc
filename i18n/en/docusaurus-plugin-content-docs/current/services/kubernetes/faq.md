---
sidebar_position: 6
title: FAQ
---

# FAQ — Kubernetes

### What instance types are available?

Hikube offers three instance families for Kubernetes nodes:

| Family | Prefix | vCPU:RAM ratio | Recommended use |
|--------|--------|----------------|-----------------|
| **Standard** | `s1` | 1:2 | General workloads, web servers |
| **Universal** | `u1` | 1:4 | Business apps, databases |
| **Memory** | `m1` | 1:8 | Cache, analytics, in-memory processing |

Each family is available in sizes from `small` to `8xlarge`. For example: `s1.small`, `u1.large`, `m1.2xlarge`.

---

### How does `storageClass` work in a Kubernetes cluster?

The storageClass chosen in the cluster manifest is **replicated inside the tenant cluster**. When your workloads create PVCs in the cluster, storage is provisioned with this storageClass on the infrastructure side.

The available storageClasses are: `local`, `replicated`, and `replicated-async`.

| Feature | `local` | `replicated` / `replicated-async` |
|---------|---------|-------------------------------------|
| **Replication** | Single datacenter | Multi-datacenter (synchronous or asynchronous) |
| **Performance** | Faster (low latency) | Slightly slower |
| **High availability** | No (at storage level) | Yes |

:::tip
The default recommendation for Kubernetes is **`replicated`**, which ensures data durability at the storage level.
:::

:::note
**Current limitation**: only one storageClass can be passed to the tenant cluster. An improvement is in progress to allow passing all storageClasses and letting the client choose based on their needs.
:::

---

### What addons are available?

The following addons can be enabled on your cluster:

| Addon | Description |
|-------|-------------|
| `certManager` | Automatic TLS certificate management (Let's Encrypt) |
| `ingressNginx` | NGINX Ingress controller for HTTP/HTTPS routing |
| `fluxcd` | Continuous GitOps deployment |
| `monitoringAgents` | Monitoring agents (metrics, logs) |
| `gpuOperator` | NVIDIA GPU Operator for GPU workloads |

Each addon is enabled in the cluster manifest:

```yaml title="cluster.yaml"
spec:
  addons:
    certManager:
      enabled: true
    ingressNginx:
      enabled: true
```

---

### How do I retrieve my kubeconfig?

The kubeconfig is stored in a Kubernetes Secret automatically generated when the cluster is created:

```bash
kubectl get tenantsecret <cluster-name>-admin-kubeconfig -o jsonpath='{.data.super-admin\.conf}' | base64 -d > kubeconfig.yaml
```

You can then use it:

```bash
export KUBECONFIG=kubeconfig.yaml
kubectl get nodes
```

---

### How do I scale nodeGroups?

Scaling is controlled by the `minReplicas` and `maxReplicas` parameters of each nodeGroup. The autoscaler automatically adjusts the number of nodes between these bounds based on load.

To modify the limits, update your manifest and apply it:

```yaml title="cluster.yaml"
spec:
  nodeGroups:
    workers:
      minReplicas: 3
      maxReplicas: 15
      instanceType: "s1.large"
```

```bash
kubectl apply -f cluster.yaml
```

---

### How do I add GPU nodes to my cluster?

Add a dedicated nodeGroup with the `gpus` field specifying the desired GPU model:

```yaml title="cluster-gpu.yaml"
spec:
  nodeGroups:
    gpu-workers:
      minReplicas: 1
      maxReplicas: 4
      instanceType: "u1.2xlarge"
      gpus:
        - name: "nvidia.com/AD102GL_L40S"
  addons:
    gpuOperator:
      enabled: true
```

:::warning
- Don't forget to enable the `gpuOperator` addon so that NVIDIA drivers are automatically installed on GPU nodes.
- Each node in the GPU nodeGroup consumes **1 physical GPU**. A nodeGroup with `minReplicas: 4` requires 4 available GPUs, with a direct impact on billing.
:::

