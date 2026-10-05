---
sidebar_position: 4
title: Vertical Pod Autoscaler
---

# Vertical Pod Autoscaler

The **Vertical Pod Autoscaler (VPA)** automatically adjusts the CPU and memory resources of pods. It continuously analyzes the actual consumption of workloads, then recommends or applies adjustments.

| Component | Role |
|-----------|------|
| `recommender` | Analyzes metrics and recommends resources for pods |
| `updater` | Recreates pods when the recommendations change |
| `admissionController` | Applies the recommended resources when pods are created |

## In the console

The Vertical Pod Autoscaler is part of the **Advanced Configuration** of the **Addons** step: it is always present in the cluster and cannot be disabled. You can only override its configuration.

1. At creation (**Addons** step) or from **Edit** > **Extensions & Addons**, expand the **Vertical Pod Autoscaler** block in the **Advanced Configuration** section.
2. Enter your values in **Helm Configuration (YAML) — optional**.
3. Confirm with **Next** then **Create cluster** (creation) or **Save** (modification).

:::warning
On an existing cluster, the console does not save a first override entered from **Edit**: the **Save** button confirms the update, but the value is ignored. Define the override when creating the cluster, or [contact support](mailto:support@hidora.io). An override defined at creation remains editable from **Edit**.
:::

On the cluster detail page, the **VPA** line of the **Network** section shows **VPA** when the addon is configured.

## Override the configuration

The YAML value is passed to the VPA Helm chart, under the `vertical-pod-autoscaler` key. For example, to disable the updater and only use the recommendations:

```yaml title="vpa-override.yaml"
vertical-pod-autoscaler:
  updater:
    enabled: false
```

The available options are described in the [Vertical Pod Autoscaler Helm chart](https://github.com/cowboysysop/charts/tree/master/charts/vertical-pod-autoscaler).

## Usage in the cluster

Create a `VerticalPodAutoscaler` object for each workload to track:

```yaml title="vpa-my-app.yaml"
apiVersion: autoscaling.k8s.io/v1
kind: VerticalPodAutoscaler
metadata:
  name: my-app
spec:
  targetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: my-app
  updatePolicy:
    updateMode: "Off"
```

```bash
kubectl apply -f vpa-my-app.yaml

# Read the recommendations
kubectl describe vpa my-app
```

## Best practices

- Start with `updateMode: "Off"` to observe the recommendations before applying them.
- Do not use the VPA and a `HorizontalPodAutoscaler` on the same metric (CPU or memory) of the same workload.
- Combine the VPA with [node group autoscaling](../how-to/configure-autoscaling.md) to adapt both the pods and the cluster capacity.
