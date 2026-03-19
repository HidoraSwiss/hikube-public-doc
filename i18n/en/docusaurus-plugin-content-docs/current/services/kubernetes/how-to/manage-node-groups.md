---
title: "How to add and modify a node group"
---

# How to add and modify a node group

Node groups allow you to segment your Kubernetes cluster nodes according to your workload needs. This guide explains how to add, modify, and remove node groups in your Hikube configuration.

## Prerequisites

- A deployed Hikube Kubernetes cluster (see the [quick start](../quick-start.md))
- `kubectl` configured to interact with the Hikube API
- Your cluster YAML configuration file

## Steps

### 1. Understand instance types

Hikube offers three instance series suited to different use cases:

| Series | CPU:RAM ratio | Use case |
|--------|---------------|----------|
| **S (Standard)** | 1:2 | General workloads, web applications |
| **U (Universal)** | 1:4 | Balanced workloads, databases |
| **M (Memory Optimized)** | 1:8 | Memory-intensive applications, caches |

**Available instance details:**

| Instance | vCPU | RAM |
|----------|------|-----|
| `s1.small` | 1 | 2 GB |
| `s1.medium` | 2 | 4 GB |
| `s1.large` | 4 | 8 GB |
| `s1.xlarge` | 8 | 16 GB |
| `s1.2xlarge` | 16 | 32 GB |
| `s1.4xlarge` | 32 | 64 GB |
| `s1.8xlarge` | 64 | 128 GB |
| `u1.medium` | 1 | 4 GB |
| `u1.large` | 2 | 8 GB |
| `u1.xlarge` | 4 | 16 GB |
| `u1.2xlarge` | 8 | 32 GB |
| `u1.4xlarge` | 16 | 64 GB |
| `u1.8xlarge` | 32 | 128 GB |
| `m1.large` | 2 | 16 GB |
| `m1.xlarge` | 4 | 32 GB |
| `m1.2xlarge` | 8 | 64 GB |
| `m1.4xlarge` | 16 | 128 GB |
| `m1.8xlarge` | 32 | 256 GB |

### 2. Add a node group

To add a new node group, add an entry under `spec.nodeGroups` in your cluster configuration file:

```yaml title="cluster-with-compute.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Kubernetes
metadata:
  name: my-cluster
spec:
  controlPlane:
    replicas: 3

  nodeGroups:
    # Existing node group
    general:
      minReplicas: 2
      maxReplicas: 5
      instanceType: "s1.large"
      ephemeralStorage: 50Gi
      roles:
        - ingress-nginx

    # New node group for intensive compute
    compute:
      minReplicas: 1
      maxReplicas: 10
      instanceType: "u1.4xlarge"
      ephemeralStorage: 100Gi
      roles: []
```

:::tip
Choose a descriptive name for your node groups (`compute`, `web`, `monitoring`, `gpu`) to make cluster management easier.
:::

### 3. Modify an existing node group

To modify a node group, update the desired fields in your YAML file. For example, to change the instance type and increase ephemeral storage:

```yaml title="cluster-updated.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Kubernetes
metadata:
  name: my-cluster
spec:
  controlPlane:
    replicas: 3

  nodeGroups:
    general:
      minReplicas: 2
      maxReplicas: 5
      instanceType: "u1.xlarge"       # Modified: from s1.large to u1.xlarge
      ephemeralStorage: 100Gi          # Modified: from 50Gi to 100Gi
      roles:
        - ingress-nginx
```

:::warning
Changing `instanceType` triggers a rolling update of the group's nodes. Ensure your cluster has enough capacity to absorb the load during the update.
:::

### 4. Remove a node group

To remove a node group, simply delete its block from the configuration and re-apply:

```yaml title="cluster-simplified.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Kubernetes
metadata:
  name: my-cluster
spec:
  controlPlane:
    replicas: 3

  nodeGroups:
    general:
      minReplicas: 2
      maxReplicas: 5
      instanceType: "s1.large"
      ephemeralStorage: 50Gi
      roles:
        - ingress-nginx
    # The "compute" node group has been removed
```

:::warning
Before removing a node group, ensure that the workloads running on it can be rescheduled on other groups. Use `kubectl drain` on the affected nodes if necessary.
:::

### 5. Apply the changes

Apply the changes with `kubectl`:

```bash
kubectl apply -f cluster-updated.yaml
```

## Verification

Verify that the changes have been applied:

```bash
# Check the cluster configuration
kubectl get kubernetes my-cluster -o yaml | grep -A 15 nodeGroups

# Watch the child cluster nodes
kubectl --kubeconfig=cluster-admin.yaml get nodes -w

# Check machines being provisioned
kubectl get machines -l cluster.x-k8s.io/cluster-name=my-cluster
```

**Expected output:**

```console
NAME                         STATUS   ROLES    AGE   VERSION
my-cluster-general-xxxxx     Ready    <none>   10m   v1.29.0
my-cluster-compute-yyyyy     Ready    <none>   2m    v1.29.0
```

## Next steps

- [API reference](../api-reference.md) -- Full details of `nodeGroups` fields
- [Concepts](../concepts.md) -- Hikube node group architecture
- [How to configure autoscaling](./configure-autoscaling.md) -- Manage automatic scaling of node groups
