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

### What is the difference between `storageClass` local and replicated?

The three available storageClasses are: `local`, `replicated`, and `replicated-async`.

| Feature | `local` | `replicated` / `replicated-async` |
|---------|---------|-------------------------------------|
| **Replication** | Single datacenter | Multi-datacenter (synchronous or asynchronous) |
| **Performance** | Faster (low latency) | Slightly slower |
| **High availability** | No (at storage level) | Yes |
| **Use case** | K8s clusters (nodes provide application-level HA) | Single instances, critical data without application-level replication |

:::tip
For a Kubernetes cluster, the nodes already provide high availability at the application level. Use `local` for better performance. Reserve `replicated` for single-instance workloads without built-in application-level replication.
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
Don't forget to enable the `gpuOperator` addon so that NVIDIA drivers are automatically installed on GPU nodes.
:::

---

### Why does `kubectl get ... -A` return Forbidden?

Access to Hikube clusters is limited to your tenant scope. Cluster-scope queries (with the `-A` or `--all-namespaces` flag) are forbidden by the RBAC configuration.

**What does not work:**

```bash
kubectl get pods -A
# Error: pods is forbidden: User "..." cannot list resource "pods" at the cluster scope
```

**What works:**

```bash
kubectl get pods
kubectl get pods -n my-namespace
```

:::note
This restriction is a multi-tenant security measure. You can only query namespaces that your tenant has access to.
:::
