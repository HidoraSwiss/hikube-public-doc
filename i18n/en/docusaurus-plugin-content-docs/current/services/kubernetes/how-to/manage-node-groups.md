---
title: "How to add and modify a node group"
---

# How to add and modify a node group

Node groups let you segment the nodes of your Kubernetes cluster according to the needs of your workloads. This guide explains how to add, modify and delete node groups from the Hikube console.

## Prerequisites

- A deployed Hikube Kubernetes cluster (see the [quick start](../quick-start.md))
- The cluster kubeconfig downloaded from the console (**Kubeconfig** button), to check the nodes with `kubectl`

## Steps

### 1. Understand the instance types

Hikube offers three instance series suited to different use cases:

| Series | CPU:RAM ratio | Use case |
|-------|---------------|-------------|
| **Standard (S)** | 1:2 | Economical use, development, testing |
| **Universal (U)** | 1:4 | General use: web servers, applications |
| **Memory (M)** | 1:8 | Memory-optimized: databases, caches |

The flavors of each series are detailed in the [concepts](../concepts.md#instance-types).

### 2. Open the cluster edit page

1. In the console, open **Infrastructure** > **Kubernetes**.
2. Open the cluster's **Actions** menu and choose **Edit** (or click **Edit** on the cluster detail page).

The edit page shows the **General information**, **Node groups** and **Extensions & Addons** sections, as well as the project quota gauges.

### 3. Add a node group

1. In the **Node groups** section, click **Add node group**. A new card opens.
2. Fill in the fields:
   - **Group name**: for example `compute` (3 to 16 characters: lowercase letters, digits and hyphens);
   - **Ephemeral storage size**: for example 100 GB;
   - **Minimum nodes** and **Maximum nodes**: for example 1 and 10;
   - **Instance type**: for example **Universal (U)** series, size **4XLarge** (`u1.4xlarge`);
   - **Exposed on the internet (Public IP)**: enable only if this group must receive incoming traffic (Ingress NGINX);
   - **GPU**: if needed, see [Add GPUs](#5-add-gpus).
3. Click **Save**.

:::tip
Choose a descriptive name for your groups (`compute`, `web`, `monitoring`, `gpu`) to make cluster management easier.
:::

### 4. Modify an existing group

In the **Node groups** section, expand the group's card, change the desired fields (instance type, ephemeral storage, minimum or maximum number of nodes, exposure), then click **Save**.

:::warning
Changing the instance type replaces all the nodes in the group: the platform creates the new nodes and removes the old ones one by one, without waiting for each replacement to be ready. A single-node group is therefore unavailable during the replacement (several minutes): plan at least two nodes for workloads that cannot tolerate interruption. The project quota must be able to accommodate the additional nodes during the replacement.
:::

:::note
Avoid renaming an existing group: a renamed group is treated as a new group.
:::

### 5. Add GPUs

A card's **GPU** section only appears if GPUs are available for your project.

- For a **new** group, select the GPU model and number per node. The **GPU Operator** addon is then enabled automatically and can no longer be unchecked.
- A group **created without GPUs** cannot receive any: add a new GPU node group.
- A group **created with GPUs** can change model or number, but must keep at least one GPU: to go back to nodes without GPUs, add a new group without GPUs instead.

See also [Provision GPUs in Kubernetes](../../gpu/how-to/provision-gpu-kubernetes.md).

### 6. Delete a node group

:::warning
Before deleting a group, make sure the workloads running on it can be rescheduled on other groups. Use `kubectl drain` on the relevant nodes if necessary.
:::

1. In the **Node groups** section, click the **Remove this group** icon on the relevant card.
2. Click **Save**.

The first group of the cluster cannot be deleted; a cluster must always keep at least one node group.

## Verification

After saving, the console shows "Cluster updated" and returns to the detail page. The **Node Pools** section lists each group with its instance type and its number of active nodes.

In the cluster, watch the new nodes arrive:

```bash
export KUBECONFIG=~/Downloads/kubeconfig-<cluster-name>.yaml
kubectl get nodes -w
```

**Expected result:**

```console
NAME                        STATUS   ROLES    AGE   VERSION
my-cluster-general-xxxxx    Ready    <none>   10m   v1.xx.x
my-cluster-compute-yyyyy    Ready    <none>   2m    v1.xx.x
```

## Going further

- [Concepts](../concepts.md): description of each field of a node group
- [How to configure autoscaling](./configure-autoscaling.md): manage automatic scaling of the groups
