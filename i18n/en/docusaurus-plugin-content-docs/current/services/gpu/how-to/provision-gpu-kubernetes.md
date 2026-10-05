---
title: "How to provision a GPU on Kubernetes"
---

# How to provision a GPU on Kubernetes

Hikube lets you add node groups equipped with NVIDIA GPUs to your managed Kubernetes clusters. This guide explains how to configure this group in the console, then deploy pods that use the GPU.

## Prerequisites

- A Hikube account and a project with sufficient quotas
- [kubectl](https://kubernetes.io/docs/tasks/tools/#kubectl) installed on your workstation
- Familiarity with Hikube [managed Kubernetes](../../kubernetes/overview.md)

## Steps

### 1. Add a GPU node group

**New cluster**: open **Infrastructure** > **Kubernetes** > **Create cluster**, fill in the **General** step, then move on to the **Nodes** step.

**Existing cluster**: open the cluster, click **Edit** and go to **Node groups**.

Then:

1. Click **Add node group**.
2. **Group name**: for example `gpu-workers`.
3. **Instance type**: choose the series and size, for example **Universal (U)** > **2XLarge** (8 vCPU, 32 GB).
4. **Ephemeral storage size**: plan enough space for the CUDA container images, for example `100` GB.
5. **Minimum nodes** and **Maximum nodes**: for example `1` and `3`.
6. **GPU** section: click the card of the model you want (for example **NVIDIA L40S**); **+** and **−** set the number of GPUs **per node**.

:::tip Separate CPU and GPU
Keep a node group without GPUs for standard workloads and reserve the GPU group for the pods that need it: each group is sized independently.
:::

:::warning Existing groups
A group created **without** GPUs cannot receive any (**This node group was created without GPUs and cannot get any.**). A group created **with** GPUs can change model or count, but must keep at least one GPU. To change category, add a new node group.
:::

### 2. Check the addons

At the **Addons** step (**Extensions & Addons** section when editing), **GPU Operator** is checked and locked (**Required when a node group has GPUs**): it installs the NVIDIA drivers and the device plugin on the GPU nodes.

Also enable **HAMi** if you want to share the same GPU between several pods.

### 3. Deploy

At the **Summary** step, the GPU group shows the model and quantity (for example `l40s (x1)`). Click **Create cluster** (or **Save** for an existing cluster).

Wait for the cluster to be **Ready** or **Running** in the cluster list.

### 4. Retrieve the cluster's kubeconfig

On the cluster's detail page, click **Kubeconfig**. The console downloads `kubeconfig-<cluster-name>.yaml`.

```bash
export KUBECONFIG=~/Downloads/kubeconfig-<cluster-name>.yaml
kubectl get nodes
```

### 5. Check the GPUs on the nodes

Once the GPU Operator pods have started (a few minutes after the nodes arrive):

```bash
kubectl get nodes -o custom-columns=NAME:.metadata.name,GPU:.status.allocatable.'nvidia\.com/gpu'
```

**Expected result:** the nodes of the GPU group show `1` (or the number of GPUs per node you chose), the others `<none>`.

### 6. Deploy a pod with a GPU

```yaml title="gpu-pod.yaml"
apiVersion: v1
kind: Pod
metadata:
  name: gpu-test
spec:
  restartPolicy: Never
  containers:
  - name: cuda-test
    image: nvidia/cuda:12.4.1-base-ubuntu22.04
    command: ["nvidia-smi"]
    resources:
      limits:
        nvidia.com/gpu: 1
```

```bash
kubectl apply -f gpu-pod.yaml
kubectl wait --for=jsonpath='{.status.phase}'=Succeeded pod/gpu-test --timeout=300s
kubectl logs gpu-test
```

**Expected result:** the `nvidia-smi` table lists the GPU (for example `NVIDIA L40S`).

### 7. Target a GPU model

If your groups use different models, target them with the label set by the GPU Operator (GPU feature discovery):

```bash
kubectl get nodes -L nvidia.com/gpu.product
```

```yaml title="inference-deployment.yaml"
apiVersion: apps/v1
kind: Deployment
metadata:
  name: model-serving
spec:
  replicas: 2
  selector:
    matchLabels:
      app: model-serving
  template:
    metadata:
      labels:
        app: model-serving
    spec:
      nodeSelector:
        nvidia.com/gpu.product: <value shown by the previous command>
      containers:
      - name: inference
        image: my-model:latest
        resources:
          limits:
            nvidia.com/gpu: 1
```

## Verification

```bash
# Allocatable GPUs per node
kubectl get nodes -o custom-columns=NAME:.metadata.name,GPU:.status.allocatable.'nvidia\.com/gpu'

# GPUs already assigned on a node
kubectl describe node <node-name> | grep -A 8 "Allocated resources"

# GPU Operator pods
kubectl get pods -A | grep -i gpu-operator
```

## Further reading

- [GPU Operator plugin](../../kubernetes/plugins/gpu-operator.md)
- [Manage node groups](../../kubernetes/how-to/manage-node-groups.md)
- [Configure autoscaling](../../kubernetes/how-to/configure-autoscaling.md)
- [Provision a GPU on a VM](./provision-gpu-vm.md)
