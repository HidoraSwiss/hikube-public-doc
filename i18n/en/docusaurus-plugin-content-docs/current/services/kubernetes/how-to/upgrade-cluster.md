---
title: "How to upgrade a cluster"
---

# How to upgrade a cluster

This guide explains how to upgrade the Kubernetes version of a Hikube cluster from the console. Upgrades are performed as rolling updates.

## Prerequisites

- A deployed Hikube Kubernetes cluster (see the [quick start](../quick-start.md))
- The cluster kubeconfig downloaded from the console (**Kubeconfig** button), to check the result

## Steps

### 1. Check the current version

In **Infrastructure** > **Kubernetes**, the **Version** column of the list shows the version of each cluster. The detail page also shows it in the **General** section (**Version**).

On the cluster side, the version of the nodes is visible with:

```bash
export KUBECONFIG=~/Downloads/kubeconfig-<cluster-name>.yaml
kubectl get nodes
```

### 2. Prepare the upgrade

:::warning
Always test the upgrade on a staging cluster before production. Some applications may not be compatible with a new Kubernetes version (APIs deprecated and then removed).
:::

:::note
Upgrade incrementally (for example, v1.29 to v1.30). Do not skip several minor versions at once.
:::

### 3. Change the version

1. Open the cluster's **Actions** menu and choose **Edit** (or click **Edit** on the detail page).
2. In the **General information** section, open the **Kubernetes Version** list and select the target version. The list only contains the versions offered by the platform.
3. Click **Save**. The console shows "Cluster updated" and returns to the detail page.

:::note
If the cluster's current version is no longer offered by the platform, the console indicates it ("current version") and prompts you to select a supported version.
:::

### 4. Follow the rolling update

The nodes are replaced progressively. Follow the replacement in the cluster:

```bash
kubectl get nodes -w
```

:::tip
During a rolling update, the nodes are replaced one by one: your workloads keep running if they have several replicas. Define `PodDisruptionBudget` objects for your critical applications.
:::

## Verification

Once the replacement is complete, confirm the new version:

```bash
# Nodes in Ready state with the new version
kubectl get nodes

# API server version
kubectl version

# Your workloads are running
kubectl get pods -A
```

**Expected result:**

```console
NAME                         STATUS   ROLES    AGE   VERSION
my-cluster-general-xxxxx     Ready    <none>   5m    v1.30.x
my-cluster-general-yyyyy     Ready    <none>   3m    v1.30.x
```

:::warning
If pods remain in error after the upgrade, check that your manifests are compatible with the new Kubernetes version. Some deprecated APIs may have been removed.
:::

## Going further

- [Concepts](../concepts.md): control plane architecture
- [Access and tools](./toolbox.md): diagnostic commands in the cluster
