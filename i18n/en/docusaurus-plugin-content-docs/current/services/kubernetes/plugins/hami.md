---
sidebar_position: 11
title: HAMi
---

# HAMi

The **HAMi** addon provides **GPU virtualization**: it lets several pods share the same GPU, instead of assigning a whole GPU to each pod.

## In the console

HAMi requires the [GPU Operator](./gpu-operator.md) addon, and therefore a node group with GPUs.

1. At creation, **Addons** step, check **HAMi** (disabled by default). If **GPU Operator** is not checked, the console shows "Requires the GPU Operator addon" and blocks the next step.
2. On an existing cluster: **Edit** > **Extensions & Addons**, check **HAMi**, then **Save**.

The cluster detail page shows **HAMi** in the **Extensions** section when it is active.

## Override the configuration

Once the addon is checked, the **Helm Configuration (YAML) — optional** field appears. The value is passed to the HAMi Helm chart, under the `hami` key. The available options are described in the [HAMi documentation](https://project-hami.io/docs).

## Usage in the cluster

```bash
# HAMi pods
kubectl get pods -A | grep -i hami
```

Pods request a fraction of a GPU using the resources exposed by HAMi (GPU memory, compute share). See the [HAMi documentation](https://project-hami.io/docs) for the resource names and pod examples.

## Best practices

- Reserve GPU sharing for workloads that do not use a whole GPU (light inference, development, notebooks).
- Set GPU memory limits per pod to prevent one pod from starving the others.
