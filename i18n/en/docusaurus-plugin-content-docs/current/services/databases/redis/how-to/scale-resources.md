---
title: "How to vertically scale Redis"
---

# How to vertically scale Redis

This guide explains how to adjust the CPU, memory, and storage resources of your Redis instance on Hikube, either via a predefined preset or by defining explicit values.

## Prerequisites

- A Redis instance deployed on Hikube (see the [quick start](../quick-start.md))
- `kubectl` configured to interact with the Hikube API
- The YAML configuration file for your Redis instance

## Steps

### 1. Check current resources

Review the current configuration of your Redis instance:

```bash
kubectl get redis my-redis -o yaml
```

Note the values of `resourcesPreset`, `resources`, `replicas` and `size` in the `spec` section.

### 2. Option A: Modify the resourcesPreset

The simplest way to scale is to use a predefined preset. Here are the available presets:

| **Preset** | **CPU** | **Memory** |
|------------|---------|------------|
| `nano`     | 250m    | 128Mi      |
| `micro`    | 500m    | 256Mi      |
| `small`    | 1       | 512Mi      |
| `medium`   | 1       | 1Gi        |
| `large`    | 2       | 2Gi        |
| `xlarge`   | 4       | 4Gi        |
| `2xlarge`  | 8       | 8Gi        |

For example, to go from `nano` to `medium`:

```yaml title="redis-medium.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Redis
metadata:
  name: my-redis
spec:
  replicas: 2
  resourcesPreset: medium
  size: 2Gi
  authEnabled: true
```

### 3. Option B: Define explicit resources

For precise control, specify CPU and memory directly with the `resources` field:

```yaml title="redis-custom-resources.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Redis
metadata:
  name: my-redis
spec:
  replicas: 2
  resources:
    cpu: 2000m
    memory: 4Gi
  size: 5Gi
  authEnabled: true
```

:::warning
If the `resources` field is defined, the `resourcesPreset` value is entirely ignored. Remove `resourcesPreset` from the manifest to avoid confusion.
:::

### 4. Adjust the number of replicas if needed

You can also increase the number of replicas to distribute the read load:

```yaml title="redis-scaled.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Redis
metadata:
  name: my-redis
spec:
  replicas: 3
  resourcesPreset: large
  size: 5Gi
  storageClass: replicated
  authEnabled: true
```

### 5. Apply the update

```bash
kubectl apply -f redis-medium.yaml
```

:::tip
Redis is an in-memory data store: the allocated memory (`resources.memory` or that of the preset) must be sufficient to hold your entire dataset. Monitor memory usage before scaling.
:::

## Verification

Verify that the resources have been updated:

```bash
# Verifier la configuration de la ressource Redis
kubectl get redis my-redis -o yaml | grep -A 5 resources

# Verifier l'etat des pods Redis
kubectl get pods -l app.kubernetes.io/instance=my-redis
```

**Expected output:**

```console
NAME              READY   STATUS    RESTARTS   AGE
my-redis-0        1/1     Running   0          2m
my-redis-1        1/1     Running   0          2m
```

## Going further

- [API Reference](../api-reference.md) -- `resources`, `resourcesPreset` and `replicas` parameters
- [How to configure high availability](./configure-ha.md) -- Redis HA configuration with Sentinel
