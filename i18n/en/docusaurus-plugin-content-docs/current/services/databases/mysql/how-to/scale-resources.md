---
title: "How to vertically scale"
---

# How to vertically scale

This guide explains how to adjust the CPU and memory resources of your MySQL instance on Hikube, either via a predetermined preset or by defining explicit values.

## Prerequisites

- **kubectl** configured with your Hikube kubeconfig
- A **MySQL** instance deployed on your tenant
- Knowledge of your workload's resource requirements

## Steps

### 1. Check current resources

Review the current configuration of your MySQL instance:

```bash
kubectl get mariadb example -o yaml | grep -A 5 -E "resources:|resourcesPreset"
```

**Expected output (with preset):**

```console
  resourcesPreset: nano
```

**Expected output (with explicit resources):**

```console
  resources:
    cpu: 1000m
    memory: 1Gi
```

### 2. Choose the scaling method

Hikube offers two approaches for defining resources:

#### Option A: Use a `resourcesPreset`

Presets offer predefined resource profiles suited to different use cases:

| Preset | CPU | Memory | Use case |
|---|---|---|---|
| `nano` | 250m | 128Mi | Tests, minimal development |
| `micro` | 500m | 256Mi | Development, small applications |
| `small` | 1 | 512Mi | Lightweight applications |
| `medium` | 1 | 1Gi | Standard applications |
| `large` | 2 | 2Gi | Moderate workloads |
| `xlarge` | 4 | 4Gi | Standard production |
| `2xlarge` | 8 | 8Gi | Intensive production |

#### Option B: Define explicit resources

For precise control, define `resources.cpu` and `resources.memory` values directly.

:::warning
If the `resources` field is defined (explicit CPU and memory), the `resourcesPreset` value is **ignored**. The two approaches are mutually exclusive.
:::

### 3. Option A: Modify the resourcesPreset

To switch from one preset to another, use `kubectl patch`:

```bash
kubectl patch mariadb example --type='merge' -p='
spec:
  resourcesPreset: medium
'
```

Or modify the manifest directly:

```yaml title="mysql-scaled.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: MariaDB
metadata:
  name: example
spec:
  replicas: 3
  size: 10Gi
  resourcesPreset: medium
```

```bash
kubectl apply -f mysql-scaled.yaml
```

### 4. Option B: Define explicit resources

For fine-grained resource control, specify CPU and memory values directly:

```bash
kubectl patch mariadb example --type='merge' -p='
spec:
  resources:
    cpu: 2000m
    memory: 4Gi
'
```

Or via the full manifest:

```yaml title="mysql-custom-resources.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: MariaDB
metadata:
  name: example
spec:
  replicas: 3
  size: 10Gi
  resources:
    cpu: 2000m
    memory: 4Gi
```

```bash
kubectl apply -f mysql-custom-resources.yaml
```

:::tip
To switch back to a preset after using explicit resources, remove the `resources` field and set `resourcesPreset` in your manifest.
:::

## Verification

Follow the rolling update of MySQL pods:

```bash
kubectl get pods -w | grep mysql-example
```

**Expected output:**

```console
mysql-example-0   1/1     Running   0   5m
mysql-example-1   1/1     Running   0   3m
mysql-example-2   1/1     Running   0   1m
```

Verify that the new resources are properly applied:

```bash
kubectl get mariadb example -o yaml | grep -A 5 -E "resources:|resourcesPreset"
```

:::note
Vertical scaling triggers a **rolling update** of the pods. Replicas are restarted one by one to minimize the impact on availability. During this process, the cluster remains accessible for reads via already updated replicas.
:::

## Going further

- [API Reference](../api-reference.md): complete list of presets and resource parameters
