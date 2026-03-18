---
title: "How to configure autoscaling"
---

# How to configure autoscaling

Autoscaling allows your Hikube cluster to automatically adjust the number of nodes based on load. This guide explains how to configure and observe automatic scaling of your node groups.

## Prerequisites

- A deployed Hikube Kubernetes cluster (see the [quick start](../quick-start.md))
- `kubectl` configured to interact with the Hikube API
- Your cluster YAML configuration file

## Steps

### 1. Understand how it works

Hikube autoscaling operates at the node group level. Each node group defines:

- **`minReplicas`**: minimum number of nodes always active
- **`maxReplicas`**: maximum number of nodes that can be provisioned

The cluster automatically adds nodes when pods cannot be scheduled due to insufficient resources (CPU, memory). It removes underutilized nodes when the load decreases, always respecting the `minReplicas` threshold.

:::note
Scaling is triggered by resource pressure: when pods remain in `Pending` state due to insufficient capacity, new nodes are automatically provisioned.
:::

### 2. Configure minReplicas and maxReplicas

Define the scaling bounds in your cluster configuration:

```yaml title="cluster-autoscaling.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Kubernetes
metadata:
  name: my-cluster
spec:
  controlPlane:
    replicas: 3

  nodeGroups:
    # Node group with moderate autoscaling
    web:
      minReplicas: 2
      maxReplicas: 10
      instanceType: "s1.large"
      ephemeralStorage: 50Gi
      roles:
        - ingress-nginx

    # Compute node group with wide range
    compute:
      minReplicas: 1
      maxReplicas: 20
      instanceType: "u1.2xlarge"
      ephemeralStorage: 100Gi
      roles: []
```

:::tip
For a production environment, set `minReplicas` to at least 2 to ensure high availability of your workloads.
:::

### 3. Configure scale-to-zero

For development environments or GPU workloads, you can configure a node group that scales down to zero nodes when not in use:

```yaml title="cluster-scale-to-zero.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Kubernetes
metadata:
  name: my-cluster
spec:
  controlPlane:
    replicas: 2

  nodeGroups:
    # Permanent node group
    system:
      minReplicas: 2
      maxReplicas: 5
      instanceType: "s1.large"
      ephemeralStorage: 50Gi
      roles:
        - ingress-nginx

    # GPU node group with scale-to-zero
    gpu:
      minReplicas: 0
      maxReplicas: 8
      instanceType: "u1.2xlarge"
      ephemeralStorage: 500Gi
      roles: []
```

:::warning
Scale-to-zero implies a cold start delay when provisioning the first node. Allow a few minutes before pods can be scheduled on the new node.
:::

### 4. Observe scaling in action

Apply the configuration and observe the scaling behavior:

```bash
# Apply the configuration
kubectl apply -f cluster-autoscaling.yaml

# Watch the nodes in real time
kubectl --kubeconfig=cluster-admin.yaml get nodes -w
```

To trigger scaling, deploy a workload that consumes resources:

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
# Deploy the test workload
kubectl --kubeconfig=cluster-admin.yaml apply -f load-test.yaml

# Watch pods going from Pending to Scheduled
kubectl --kubeconfig=cluster-admin.yaml get pods -w

# Watch nodes being added
kubectl --kubeconfig=cluster-admin.yaml get nodes -w
```

### 5. Adjust the limits

You can adjust scaling limits at any time with a patch:

```bash
kubectl patch kubernetes my-cluster --type='merge' -p='
spec:
  nodeGroups:
    compute:
      maxReplicas: 30
'
```

Or by modifying the YAML file and re-applying:

```bash
kubectl apply -f cluster-autoscaling.yaml
```

## Verification

Verify that autoscaling is correctly configured:

```bash
# Check the current cluster configuration
kubectl get kubernetes my-cluster -o yaml | grep -A 8 nodeGroups

# Check machine status
kubectl get machines -l cluster.x-k8s.io/cluster-name=my-cluster

# Check nodes in the child cluster
kubectl --kubeconfig=cluster-admin.yaml get nodes
```

**Expected output after scaling:**

```console
NAME                         STATUS   ROLES    AGE   VERSION
my-cluster-web-xxxxx         Ready    <none>   30m   v1.29.0
my-cluster-web-yyyyy         Ready    <none>   30m   v1.29.0
my-cluster-compute-zzzzz     Ready    <none>   2m    v1.29.0
my-cluster-compute-wwwww     Ready    <none>   2m    v1.29.0
```

## Next steps

- [API reference](../api-reference.md) -- `minReplicas` and `maxReplicas` parameters
- [Concepts](../concepts.md) -- Node group architecture and scalability
- [How to add and modify a node group](./manage-node-groups.md) -- Node group management
