---
title: "How to scale the cluster"
---

# How to scale the RabbitMQ cluster

This guide explains how to adjust the resources of a RabbitMQ cluster on Hikube: number of replicas, CPU/memory resources, and storage.

## Prerequisites

- **kubectl** configured with your Hikube kubeconfig
- A **RabbitMQ** cluster deployed on Hikube

## Available presets

Hikube offers predefined resource presets for RabbitMQ:

| Preset | CPU | Memory |
|--------|-----|--------|
| `nano` | 100m | 128Mi |
| `micro` | 250m | 256Mi |
| `small` | 500m | 512Mi |
| `medium` | 500m | 1Gi |
| `large` | 1 | 2Gi |
| `xlarge` | 2 | 4Gi |
| `2xlarge` | 4 | 8Gi |

:::warning
If the `resources` field (explicit CPU/memory) is defined, the `resourcesPreset` value is **entirely ignored**. Make sure to clear the `resources` field if you want to use a preset.
:::

:::note
RabbitMQ presets differ slightly from other services (Kafka, NATS, databases). Refer to the table above for exact values.
:::

## Steps

### 1. Check current resources

Review the current cluster configuration:

```bash
kubectl get rabbitmq my-rabbitmq -o yaml | grep -A 5 -E "replicas:|resources:|resourcesPreset|size:"
```

**Example output:**

```console
  replicas: 3
  resourcesPreset: small
  resources: {}
  size: 10Gi
```

### 2. Modify the number of replicas

The number of replicas determines the number of nodes in the RabbitMQ cluster.

```bash
kubectl patch rabbitmq my-rabbitmq --type='merge' -p='
spec:
  replicas: 3
'
```

:::warning
With fewer than 3 replicas, quorum queues cannot guarantee message durability in case of failure. Use **3 replicas minimum** in production.
:::

**Recommendations by environment:**

| Environment | Replicas | Justification |
|-------------|----------|---------------|
| Development | 1 | Sufficient for testing |
| Staging | 3 | Simulates production |
| Production | 3 or 5 | High availability and quorum queues |

### 3. Modify the preset or explicit resources

**Option A: change the preset**

```bash
kubectl patch rabbitmq my-rabbitmq --type='merge' -p='
spec:
  resourcesPreset: large
  resources: {}
'
```

:::note
It is important to reset `resources: {}` when switching to a preset, so that the preset is properly applied.
:::

**Option B: define explicit resources**

For fine-grained control, directly define CPU and memory values:

```bash
kubectl patch rabbitmq my-rabbitmq --type='merge' -p='
spec:
  resources:
    cpu: 2000m
    memory: 4Gi
'
```

You can also modify the full manifest:

```yaml title="rabbitmq-scaled.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: RabbitMQ
metadata:
  name: my-rabbitmq
spec:
  replicas: 3
  resources:
    cpu: 2000m
    memory: 4Gi
  size: 20Gi
  storageClass: replicated

  users:
    admin:
      password: SecureAdminPassword

  vhosts:
    production:
      roles:
        admin:
          - admin
```

```bash
kubectl apply -f rabbitmq-scaled.yaml
```

### 4. Apply and verify

Monitor the rolling update of the pods:

```bash
kubectl get po -w | grep my-rabbitmq
```

**Expected output (during rolling update):**

```console
my-rabbitmq-server-0   1/1     Running       0   45m
my-rabbitmq-server-1   1/1     Terminating   0   44m
my-rabbitmq-server-1   0/1     Pending       0   0s
my-rabbitmq-server-1   1/1     Running       0   30s
```

Wait for all pods to be in `Running` state:

```bash
kubectl get po | grep my-rabbitmq
```

```console
my-rabbitmq-server-0   1/1     Running   0   10m
my-rabbitmq-server-1   1/1     Running   0   8m
my-rabbitmq-server-2   1/1     Running   0   6m
```

Check the RabbitMQ cluster status:

```bash
kubectl exec -it my-rabbitmq-server-0 -- rabbitmqctl cluster_status
```

## Verification

Confirm that the new resources are applied:

```bash
kubectl get rabbitmq my-rabbitmq -o yaml | grep -A 5 -E "replicas:|resources:|resourcesPreset|size:"
```

Verify that the cluster is functional:

```bash
kubectl exec -it my-rabbitmq-server-0 -- rabbitmqctl node_health_check
```

**Expected output:**

```console
Health check passed
```

## Next steps

- **[RabbitMQ API reference](../api-reference.md)**: full documentation of `replicas`, `resources`, `resourcesPreset` parameters and the presets table
- **[How to manage vhosts and users](./manage-vhosts-users.md)**: configure users and permissions
