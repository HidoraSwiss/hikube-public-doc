---
title: "How to configure autoscaling"
---

# How to configure autoscaling

Autoscaling lets your Hikube cluster automatically adjust the number of nodes according to the load. This guide explains how to configure the scaling bounds of your node groups from the console, then observe scaling in the cluster.

## Prerequisites

- A deployed Hikube Kubernetes cluster (see the [quick start](../quick-start.md))
- The cluster kubeconfig downloaded from the console (**Kubeconfig** button)

## Steps

### 1. Understand how it works

Hikube autoscaling works at the node group level. Each group defines:

- **Minimum nodes**: number of nodes always active;
- **Maximum nodes**: maximum number of nodes that can be provisioned.

The cluster adds nodes when pods cannot be scheduled for lack of resources (CPU, memory). It removes underused nodes when the load decreases, without going below the minimum.

:::note
Scaling is triggered by resource pressure: when pods remain in `Pending` state for lack of capacity, new nodes are provisioned automatically.
:::

:::warning
The project quota is calculated on the **maximum number** of nodes of each group. A high maximum reserves CPU, memory and storage quota even if the nodes are not provisioned yet.
:::

### 2. Define the scaling bounds

1. In **Infrastructure** > **Kubernetes**, open the cluster's **Actions** menu and choose **Edit**.
2. In the **Node groups** section, expand the group's card.
3. Fill in **Minimum nodes** and **Maximum nodes**. For example:

| Group | Minimum | Maximum | Use |
|--------|---------|---------|-------|
| `web` | 2 | 10 | Moderate autoscaling, group exposed on the internet |
| `compute` | 1 | 20 | Wide range for processing |

4. Click **Save**.

The console rejects a maximum lower than the minimum ("Maximum node count must be greater than or equal to minimum") and a maximum greater than 100.

:::tip
For a production environment, set the minimum to at least 2 to guarantee high availability of your workloads.
:::

### 3. Configure scale to zero

For development environments or GPU workloads, a group can scale down to zero nodes when it is not in use: enter **0** in **Minimum nodes**.

Keep at least one group with a minimum greater than zero to host the cluster's system components.

:::warning
Scaling to zero implies a startup delay (cold start) when the first node is provisioned. Allow a few minutes before pods can be scheduled on the new node.
:::

### 4. Observe scaling in action

In the cluster, deploy a workload that requests more resources than the current nodes offer:

```yaml title="load-test.yaml"
apiVersion: apps/v1
kind: Deployment
metadata:
  name: load-test
spec:
  replicas: 20
  selector:
    matchLabels:
      app: load-test
  template:
    metadata:
      labels:
        app: load-test
    spec:
      containers:
        - name: busybox
          image: busybox
          command: ["sleep", "3600"]
          resources:
            requests:
              cpu: "500m"
              memory: "512Mi"
```

```bash
export KUBECONFIG=~/Downloads/kubeconfig-<cluster-name>.yaml

# Deploy the test workload
kubectl apply -f load-test.yaml

# Watch the pods pending (Pending) and then scheduled
kubectl get pods -l app=load-test -w

# Watch nodes being added
kubectl get nodes -w
```

In the console, the **Node Pools** section of the detail page shows the number of active nodes of each group, for example "4 active nodes (2 to 10)".

Delete the test workload once you are done observing:

```bash
kubectl delete -f load-test.yaml
```

## Verification

```bash
kubectl get nodes
```

**Expected result after scaling:**

```console
NAME                         STATUS   ROLES    AGE   VERSION
my-cluster-web-xxxxx         Ready    <none>   30m   v1.xx.x
my-cluster-web-yyyyy         Ready    <none>   30m   v1.xx.x
my-cluster-compute-zzzzz     Ready    <none>   2m    v1.xx.x
my-cluster-compute-wwwww     Ready    <none>   2m    v1.xx.x
```

## Going further

- [Concepts](../concepts.md): node group architecture and quotas
- [How to add and modify a node group](./manage-node-groups.md): node group management
- [Vertical Pod Autoscaler](../plugins/verticalpodautoscaler.md): adjust pod resources
