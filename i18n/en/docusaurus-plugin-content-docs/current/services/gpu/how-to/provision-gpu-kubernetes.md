---
title: "How to provision a GPU on Kubernetes"
---

# How to provision a GPU on Kubernetes

Hikube allows you to add NVIDIA GPU-equipped node groups to your Kubernetes clusters. This guide explains how to configure a cluster with GPU workers, deploy pods that leverage GPU acceleration, and set up specialized node groups.

## Prerequisites

- **kubectl** configured with your Hikube kubeconfig
- An existing **Kubernetes cluster** on Hikube (or a manifest ready to deploy)
- Familiarity with [Kubernetes](../overview.md) concepts on Hikube

## Steps

### 1. Add a GPU node group to the cluster

Modify your cluster manifest to add a node group with GPU. GPU configuration is done at the node group level via `gpus[].name`:

```yaml title="cluster-gpu.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Kubernetes
metadata:
  name: cluster-gpu
spec:
  controlPlane:
    replicas: 1

  nodeGroups:
    default-workers:
      minReplicas: 1
      maxReplicas: 3
      instanceType: "u1.large"
      ephemeralStorage: 50Gi

    gpu-workers:
      minReplicas: 1
      maxReplicas: 5
      instanceType: "u1.xlarge"
      ephemeralStorage: 100Gi
      gpus:
        - name: "nvidia.com/AD102GL_L40S"
```

:::tip
Separate your CPU and GPU workloads into distinct node groups. This allows independent scaling and better cost control.
:::

### 2. Apply the cluster configuration

```bash
kubectl apply -f cluster-gpu.yaml
```

Wait for the GPU nodes to be ready:

```bash
kubectl get nodes -w
```

**Expected output:**

```
NAME                        STATUS   ROLES    AGE   VERSION
cluster-gpu-cp-0            Ready    master   5m    v1.29.x
cluster-gpu-gpu-workers-0   Ready    <none>   3m    v1.29.x
```

### 3. Verify GPU availability on the nodes

Confirm that GPUs are properly exposed as Kubernetes resources:

```bash
kubectl get nodes -o custom-columns=NAME:.metadata.name,GPU:.status.allocatable.'nvidia\.com/gpu'
```

**Expected output:**

```
NAME                        GPU
cluster-gpu-cp-0            <none>
cluster-gpu-gpu-workers-0   1
```

### 4. Deploy a pod with GPU

Create a test pod that uses a GPU via `resources.limits`:

```yaml title="gpu-pod.yaml"
apiVersion: v1
kind: Pod
metadata:
  name: gpu-test
spec:
  containers:
  - name: cuda-test
    image: nvidia/cuda:12.0-runtime-ubuntu22.04
    command: ["nvidia-smi"]
    resources:
      limits:
        nvidia.com/gpu: 1
      requests:
        nvidia.com/gpu: 1
```

Apply and verify:

```bash
kubectl apply -f gpu-pod.yaml
```

Wait for the pod to complete its execution:

```bash
kubectl wait --for=condition=Ready pod/gpu-test --timeout=120s
```

Check the logs to confirm the GPU is visible:

```bash
kubectl logs gpu-test
```

**Expected output:**

```
+-----------------------------------------------------------------------------+
| NVIDIA-SMI 535.xx.xx    Driver Version: 535.xx.xx    CUDA Version: 12.x     |
|-------------------------------+----------------------+----------------------+
| GPU  Name        Persistence-M| Bus-Id        Disp.A | Volatile Uncorr. ECC |
|===============================+======================+======================|
|   0  NVIDIA L40S         Off  | 00000000:00:06.0 Off |                    0 |
+-------------------------------+----------------------+----------------------+
```

### 5. Configure specialized node groups

For production environments, create dedicated node groups for inference and training with different GPUs:

```yaml title="cluster-multi-gpu.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Kubernetes
metadata:
  name: cluster-ml
spec:
  controlPlane:
    replicas: 3

  nodeGroups:
    default-workers:
      minReplicas: 2
      maxReplicas: 5
      instanceType: "u1.large"
      ephemeralStorage: 50Gi

    gpu-inference:
      minReplicas: 2
      maxReplicas: 10
      instanceType: "u1.large"
      ephemeralStorage: 100Gi
      gpus:
        - name: "nvidia.com/AD102GL_L40S"

    gpu-training:
      minReplicas: 1
      maxReplicas: 3
      instanceType: "u1.4xlarge"
      ephemeralStorage: 200Gi
      gpus:
        - name: "nvidia.com/GA100_A100_PCIE_80GB"
        - name: "nvidia.com/GA100_A100_PCIE_80GB"
```

To target a specific node group in your deployments, use `nodeSelector`:

```yaml title="inference-deployment.yaml"
apiVersion: apps/v1
kind: Deployment
metadata:
  name: model-serving
spec:
  replicas: 3
  selector:
    matchLabels:
      app: model-serving
  template:
    metadata:
      labels:
        app: model-serving
    spec:
      nodeSelector:
        gpu-type: "L40S"
      containers:
      - name: inference
        image: my-model:latest
        resources:
          limits:
            nvidia.com/gpu: 1
          requests:
            nvidia.com/gpu: 1
```

:::note
The GPUs available for Kubernetes are the same as for VMs: **L40S** (inference/dev), **A100** (ML training), and **H100** (LLM/exascale). See the [GPU API reference](../api-reference.md) for full specifications.
:::

## Verification

After deployment, confirm that your GPU configuration is working:

1. **Check GPU nodes**:

```bash
kubectl get nodes -o custom-columns=NAME:.metadata.name,GPU:.status.allocatable.'nvidia\.com/gpu'
```

2. **Check GPU allocation on a node**:

```bash
kubectl describe node cluster-gpu-gpu-workers-0 | grep -A 5 "Allocated resources"
```

3. **Test with an interactive pod**:

```bash
kubectl run gpu-debug --rm -it --image=nvidia/cuda:12.0-runtime-ubuntu22.04 \
  --overrides='{"spec":{"containers":[{"name":"gpu-debug","image":"nvidia/cuda:12.0-runtime-ubuntu22.04","command":["nvidia-smi"],"resources":{"limits":{"nvidia.com/gpu":"1"},"requests":{"nvidia.com/gpu":"1"}}}]}}' \
  --restart=Never
```

## Next steps

- [GPU API reference](../api-reference.md)
- [How to provision a GPU on a VM](./provision-gpu-vm.md)
- [How to configure autoscaling](../../../services/kubernetes/how-to/configure-autoscaling.md)
- [How to manage node groups](../../../services/kubernetes/how-to/manage-node-groups.md)
