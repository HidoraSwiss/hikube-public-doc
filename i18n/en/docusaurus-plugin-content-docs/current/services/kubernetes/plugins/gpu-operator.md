---
sidebar_position: 7
title: GPU Operator
---

# GPU Operator

The **GPU Operator** addon installs the **NVIDIA GPU Operator**, which automatically manages the cluster's GPUs: NVIDIA drivers, container runtime, `device plugin` and the monitoring tools needed to operate GPUs.

## In the console

- **With GPU nodes**: as soon as a node group has GPUs (**GPU** section of the **Nodes** step), the console enables **GPU Operator** and prevents you from unchecking it ("Required when a node group has GPUs").
- **Without GPU nodes**: check **GPU Operator** in the **Addons** step or from **Edit** > **Extensions & Addons**, then **Save**. It is disabled by default.

The cluster detail page shows **GPU Operator** in the **Extensions** section when it is active.

See [How to add and modify a node group](../how-to/manage-node-groups.md#5-add-gpus) for adding GPUs.

## Override the configuration

Once the addon is checked, the **Helm Configuration (YAML) — optional** field appears. The value is passed to the GPU Operator Helm chart, under the `gpu-operator` key.

```yaml title="gpu-operator-override.yaml"
gpu-operator:
  dcgmExporter:
    enabled: true
```

The available options are described in the [NVIDIA GPU Operator documentation](https://docs.nvidia.com/datacenter/cloud-native/gpu-operator/latest/getting-started.html).

:::warning
The drivers and the device plugin are preconfigured by the platform for Hikube nodes. Do not disable them through an override: the GPUs would no longer be exposed to pods.
:::

## Usage in the cluster

```bash
# GPU Operator pods
kubectl get pods -A | grep -i -E "gpu-operator|nvidia"

# Allocatable GPUs per node
kubectl get nodes -o custom-columns=NAME:.metadata.name,GPU:.status.allocatable.'nvidia\.com/gpu'
```

Example pod requesting a GPU:

```yaml title="gpu-test.yaml"
apiVersion: v1
kind: Pod
metadata:
  name: gpu-test
spec:
  restartPolicy: Never
  containers:
    - name: cuda
      image: nvidia/cuda:12.4.1-base-ubuntu22.04
      command: ["nvidia-smi"]
      resources:
        limits:
          nvidia.com/gpu: 1
```

```bash
kubectl apply -f gpu-test.yaml
kubectl logs gpu-test
```

See also [Provision GPUs in Kubernetes](../../gpu/how-to/provision-gpu-kubernetes.md).

## Best practices

- Place GPU workloads on a dedicated node group, with a minimum of 0 nodes if usage is occasional.
- To share a single GPU between several pods, enable [HAMi](./hami.md).
