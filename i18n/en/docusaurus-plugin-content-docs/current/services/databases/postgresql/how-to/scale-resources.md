---
title: "How to vertically scale"
---

# How to vertically scale

This guide explains how to adjust the CPU and memory resources of your PostgreSQL instance on Hikube, either via a predefined preset or with explicit values.

## Prerequisites

- **kubectl** configured with your Hikube kubeconfig
- A **PostgreSQL** instance deployed on Hikube

## Available presets

Hikube offers predefined resource presets to simplify sizing:

| Preset | CPU | Memory |
|--------|-----|--------|
| `nano` | 250m | 128Mi |
| `micro` | 500m | 256Mi |
| `small` | 1 | 512Mi |
| `medium` | 1 | 1Gi |
| `large` | 2 | 2Gi |
| `xlarge` | 4 | 4Gi |
| `2xlarge` | 8 | 8Gi |

:::warning
If the `resources` field (explicit CPU/memory) is defined, the `resourcesPreset` value is **entirely ignored**. Make sure to clear the `resources` field if you want to use a preset.
:::

## Steps

### 1. Check current resources

Review the current configuration of your instance:

```bash
kubectl get postgres my-database -o yaml | grep -A 5 -E "resources:|resourcesPreset"
```

**Example output with a preset:**

```console
  resourcesPreset: micro
  resources: {}
```

**Example output with explicit resources:**

```console
  resourcesPreset: micro
  resources:
    cpu: 2000m
    memory: 2Gi
```

### 2. Option A: Change the resource preset

To switch from one preset to another (for example from `micro` to `large`), apply a patch:

```bash
kubectl patch postgres my-database --type='merge' -p='
spec:
  resourcesPreset: large
  resources: {}
'
```

:::note
It is important to reset `resources: {}` when switching to a preset, so that the preset is properly applied. If `resources` contains explicit values, the preset is ignored.
:::

You can also modify the full YAML manifest:

```yaml title="postgresql-scaled.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Postgres
metadata:
  name: my-database
spec:
  replicas: 3
  resourcesPreset: large
  size: 20Gi

  users:
    admin:
      password: SecureAdminPassword

  databases:
    myapp:
      roles:
        admin:
          - admin
```

Then apply:

```bash
kubectl apply -f postgresql-scaled.yaml
```

### 3. Option B: Define explicit resources

For fine-grained control, define CPU and memory values directly:

```bash
kubectl patch postgres my-database --type='merge' -p='
spec:
  resources:
    cpu: 4000m
    memory: 4Gi
'
```

Or via the full manifest:

```yaml title="postgresql-custom-resources.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Postgres
metadata:
  name: my-database
spec:
  replicas: 3
  resources:
    cpu: 4000m
    memory: 4Gi
  size: 20Gi

  users:
    admin:
      password: SecureAdminPassword

  databases:
    myapp:
      roles:
        admin:
          - admin
```

```bash
kubectl apply -f postgresql-custom-resources.yaml
```

:::tip
For PostgreSQL sizing, a good starting rule is to allocate `shared_buffers` at about 25% of total memory. Adjust PostgreSQL parameters accordingly via the `postgresql.parameters` section.
:::

### 4. Verify the rolling update

After changing resources, the operator performs a **rolling update** of the PostgreSQL pods. Monitor the progress:

```bash
kubectl get po -w | grep postgres-my-database
```

**Expected output (during the rolling update):**

```console
postgres-my-database-2   1/1     Terminating   0   45m
postgres-my-database-2   0/1     Pending       0   0s
postgres-my-database-2   1/1     Running       0   30s
```

Wait for all pods to be in `Running` state:

```bash
kubectl get po | grep postgres-my-database
```

```console
postgres-my-database-1   1/1     Running   0   2m
postgres-my-database-2   1/1     Running   0   4m
postgres-my-database-3   1/1     Running   0   6m
```

## Verification

Confirm that the new resources are applied:

```bash
kubectl get postgres my-database -o yaml | grep -A 5 -E "resources:|resourcesPreset"
```

Verify that the instance is functional:

```bash
kubectl get postgres my-database
```

**Expected output:**

```console
NAME          READY   AGE   VERSION
my-database   True    1h    0.18.0
```

## Going further

- **[PostgreSQL API Reference](../api-reference.md)**: complete documentation of `resources`, `resourcesPreset` parameters and preset table
