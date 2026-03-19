---
title: "How to upgrade a cluster"
---

# How to upgrade a cluster

This guide explains how to upgrade the Kubernetes version on a Hikube cluster. Upgrades are performed via rolling update, without control plane downtime.

## Prerequisites

- A deployed Hikube Kubernetes cluster (see the [quick start](../quick-start.md))
- `kubectl` configured to interact with the Hikube API
- The child cluster kubeconfig retrieved

## Steps

### 1. Check the current version

Identify the Kubernetes version currently deployed on your cluster:

```bash
# Version in the Hikube configuration
kubectl get kubernetes my-cluster -o yaml | grep version

# Version reported by the nodes
kubectl --kubeconfig=cluster-admin.yaml get nodes
```

**Expected output:**

```console
NAME                         STATUS   ROLES    AGE   VERSION
my-cluster-general-xxxxx     Ready    <none>   30d   v1.29.0
my-cluster-general-yyyyy     Ready    <none>   30d   v1.29.0
```

### 2. Check available versions

Before upgrading, check the versions supported by Hikube:

```bash
# Check the current cluster configuration
kubectl get kubernetes my-cluster -o yaml
```

:::warning
Always test the upgrade in a staging environment before production. Some applications may not be compatible with newer Kubernetes versions.
:::

:::note
Upgrades must be performed incrementally (for example, v1.29 to v1.30). Do not skip multiple minor versions at once.
:::

### 3. Upgrade the version

**Option A: Direct patch**

```bash
kubectl patch kubernetes my-cluster --type='merge' -p='
spec:
  version: "v1.30.0"
'
```

**Option B: Modify the YAML file**

```yaml title="cluster-upgrade.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Kubernetes
metadata:
  name: my-cluster
spec:
  version: "v1.30.0"

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
```

```bash
kubectl apply -f cluster-upgrade.yaml
```

### 4. Follow the rolling update

Monitor the upgrade progress:

```bash
# Track the Hikube cluster status
kubectl get kubernetes my-cluster -w

# Watch machine replacements
kubectl get machines -l cluster.x-k8s.io/cluster-name=my-cluster -w

# Check events
kubectl describe kubernetes my-cluster
```

:::tip
Upgrades are performed via rolling update: nodes are replaced one by one. The control plane is upgraded first, followed by the node groups. Your workloads continue running during the upgrade.
:::

### 5. Verify the upgrade

Once the rolling update is complete, confirm the new version:

```bash
# Check the node versions
kubectl --kubeconfig=cluster-admin.yaml get nodes

# Check the API server version
kubectl --kubeconfig=cluster-admin.yaml version
```

## Verification

Validate that the cluster is functioning correctly after the upgrade:

```bash
# Nodes in Ready state with the new version
kubectl --kubeconfig=cluster-admin.yaml get nodes

# System pods operational
kubectl --kubeconfig=cluster-admin.yaml get pods -n kube-system

# Your workloads are running
kubectl --kubeconfig=cluster-admin.yaml get pods -A
```

**Expected output:**

```console
NAME                         STATUS   ROLES    AGE   VERSION
my-cluster-general-xxxxx     Ready    <none>   5m    v1.30.0
my-cluster-general-yyyyy     Ready    <none>   3m    v1.30.0
```

:::warning
If pods remain in error state after the upgrade, check the compatibility of your manifests with the new Kubernetes version. Some deprecated APIs may have been removed.
:::

## Next steps

- [API reference](../api-reference.md) -- `version` field and full configuration
- [Concepts](../concepts.md) -- Control plane architecture and rolling updates
- [Access and tools](./toolbox.md) -- Debugging and monitoring commands
