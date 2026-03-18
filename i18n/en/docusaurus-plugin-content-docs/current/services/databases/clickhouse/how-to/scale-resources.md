---
title: "How to vertically scale ClickHouse"
---

# How to vertically scale ClickHouse

This guide explains how to adjust the CPU, memory, and storage resources of your ClickHouse instance on Hikube, either via a predefined preset or by defining explicit values.

## Prerequisites

- A ClickHouse instance deployed on Hikube (see the [quick start](../quick-start.md))
- `kubectl` configured to interact with the Hikube API
- The YAML configuration file for your ClickHouse instance

## Steps

### 1. Check current resources

Review the current configuration of your ClickHouse instance:

```bash
kubectl get clickhouse my-clickhouse -o yaml
```

Note the values of `resourcesPreset`, `resources`, `replicas`, `shards` and `size` in the `spec` section.

### 2. Modify the resourcesPreset or explicit resources

#### Option A: Use a preset

Here are the available presets:

| **Preset** | **CPU** | **Memory** |
|------------|---------|------------|
| `nano`     | 250m    | 128Mi      |
| `micro`    | 500m    | 256Mi      |
| `small`    | 1       | 512Mi      |
| `medium`   | 1       | 1Gi        |
| `large`    | 2       | 2Gi        |
| `xlarge`   | 4       | 4Gi        |
| `2xlarge`  | 8       | 8Gi        |

For example, to go from `small` (default value) to `large`:

```yaml title="clickhouse-large.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: ClickHouse
metadata:
  name: my-clickhouse
spec:
  replicas: 2
  shards: 1
  resourcesPreset: large
  size: 20Gi
  clickhouseKeeper:
    enabled: true
    replicas: 3
    resourcesPreset: micro
    size: 1Gi
```

#### Option B: Define explicit resources

For precise control, specify CPU and memory directly:

```yaml title="clickhouse-custom-resources.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: ClickHouse
metadata:
  name: my-clickhouse
spec:
  replicas: 2
  shards: 1
  resources:
    cpu: 4000m
    memory: 8Gi
  size: 50Gi
  clickhouseKeeper:
    enabled: true
    replicas: 3
    resourcesPreset: small
    size: 2Gi
```

:::warning
If the `resources` field is defined, the `resourcesPreset` value is entirely ignored. Remove `resourcesPreset` from the manifest to avoid confusion.
:::

### 3. Adjust storage if needed

ClickHouse stores data on disk (unlike Redis). Remember to increase the persistent volume (`size`) based on the expected data volume:

```yaml title="clickhouse-storage.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: ClickHouse
metadata:
  name: my-clickhouse
spec:
  replicas: 2
  shards: 1
  resourcesPreset: xlarge
  size: 100Gi
  storageClass: replicated
  clickhouseKeeper:
    enabled: true
    replicas: 3
    resourcesPreset: micro
    size: 1Gi
```

:::tip
Use `storageClass: replicated` in production to protect data against physical node loss.
:::

### 4. Apply the update

```bash
kubectl apply -f clickhouse-large.yaml
```

## Verification

Verify that the resources have been updated:

```bash
# Verifier la configuration de la ressource ClickHouse
kubectl get clickhouse my-clickhouse -o yaml | grep -A 5 resources

# Verifier l'etat des pods ClickHouse
kubectl get pods -l app.kubernetes.io/instance=my-clickhouse
```

**Expected output:**

```console
NAME                READY   STATUS    RESTARTS   AGE
my-clickhouse-0-0   1/1     Running   0          3m
my-clickhouse-0-1   1/1     Running   0          3m
```

## Going further

- [API Reference](../api-reference.md) -- `resources`, `resourcesPreset`, `size` and `storageClass` parameters
- [How to configure sharding](./configure-sharding.md) -- Horizontal data distribution
- [How to manage users and profiles](./manage-users.md) -- User access management
