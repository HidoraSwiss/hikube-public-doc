---
title: "How to scale the cluster"
---

# How to scale the Kafka cluster

This guide explains how to adjust the resources of a Kafka cluster on Hikube: number of brokers, CPU/memory resources, storage, as well as the associated ZooKeeper configuration.

## Prerequisites

- **kubectl** configured with your Hikube kubeconfig
- A **Kafka** cluster deployed on Hikube

## Available presets

Hikube offers predefined resource presets, applicable to Kafka brokers and ZooKeeper nodes:

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

Review the current cluster configuration:

```bash
kubectl get kafka my-kafka -o yaml | grep -A 8 -E "kafka:|zookeeper:"
```

**Example output:**

```console
  kafka:
    replicas: 3
    resourcesPreset: small
    size: 10Gi
  zookeeper:
    replicas: 3
    resourcesPreset: small
    size: 5Gi
```

### 2. Scale Kafka brokers

You can adjust the number of brokers, resources, and storage independently.

**Option A: change the broker preset**

```bash
kubectl patch kafka my-kafka --type='merge' -p='
spec:
  kafka:
    replicas: 5
    resourcesPreset: large
    resources: {}
'
```

**Option B: define explicit resources**

```bash
kubectl patch kafka my-kafka --type='merge' -p='
spec:
  kafka:
    replicas: 5
    resources:
      cpu: 4000m
      memory: 8Gi
'
```

You can also modify the full manifest:

```yaml title="kafka-scaled.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Kafka
metadata:
  name: my-kafka
spec:
  kafka:
    replicas: 5
    resources:
      cpu: 4000m
      memory: 8Gi
    size: 50Gi
  zookeeper:
    replicas: 3
    resourcesPreset: small
    size: 5Gi
  topics: []
```

```bash
kubectl apply -f kafka-scaled.yaml
```

:::warning
Reducing the number of brokers on an existing cluster can lead to data loss if partitions are not redistributed beforehand. Always increase the number of brokers rather than reducing it.
:::

### 3. Scale ZooKeeper

ZooKeeper uses a quorum mechanism: the number of replicas must be **odd** (1, 3, 5) to ensure leader election.

```bash
kubectl patch kafka my-kafka --type='merge' -p='
spec:
  zookeeper:
    replicas: 3
    resourcesPreset: medium
    resources: {}
'
```

Or with explicit resources:

```yaml title="kafka-zookeeper-scaled.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Kafka
metadata:
  name: my-kafka
spec:
  kafka:
    replicas: 5
    resourcesPreset: large
    size: 50Gi
  zookeeper:
    replicas: 3
    resources:
      cpu: 1000m
      memory: 1Gi
    size: 10Gi
  topics: []
```

```bash
kubectl apply -f kafka-zookeeper-scaled.yaml
```

:::tip
In production, 3 ZooKeeper replicas are sufficient in most cases. 5 replicas are recommended only for very large clusters (10+ brokers).
:::

### 4. Increase storage if needed

If brokers are running out of disk space, increase the persistent volume size:

```bash
kubectl patch kafka my-kafka --type='merge' -p='
spec:
  kafka:
    size: 100Gi
'
```

:::warning
The number of replicas for a topic cannot exceed the number of brokers. After scaling up brokers, you can increase the replication factor of your existing topics.
:::

### 5. Apply and verify

If you haven't applied the changes yet:

```bash
kubectl apply -f kafka-scaled.yaml
```

Monitor the rolling update of the pods:

```bash
kubectl get po -w | grep my-kafka
```

**Expected output (during rolling update):**

```console
my-kafka-kafka-0       1/1     Running       0   45m
my-kafka-kafka-1       1/1     Running       0   44m
my-kafka-kafka-2       1/1     Terminating   0   43m
my-kafka-kafka-2       0/1     Pending       0   0s
my-kafka-kafka-2       1/1     Running       0   30s
```

Wait for all pods to be in `Running` state:

```bash
kubectl get po | grep my-kafka
```

```console
my-kafka-kafka-0       1/1     Running   0   10m
my-kafka-kafka-1       1/1     Running   0   8m
my-kafka-kafka-2       1/1     Running   0   6m
my-kafka-kafka-3       1/1     Running   0   4m
my-kafka-kafka-4       1/1     Running   0   2m
my-kafka-zookeeper-0   1/1     Running   0   10m
my-kafka-zookeeper-1   1/1     Running   0   8m
my-kafka-zookeeper-2   1/1     Running   0   6m
```

## Verification

Confirm that the new resources are applied:

```bash
kubectl get kafka my-kafka -o yaml | grep -A 8 -E "kafka:|zookeeper:"
```

Verify that the cluster is functional by listing the topics:

```bash
kubectl run kafka-debug --rm -it --image=bitnami/kafka:latest --restart=Never -- \
  kafka-topics.sh --bootstrap-server my-kafka-kafka-bootstrap:9092 --list
```

## Next steps

- **[Kafka API reference](../api-reference.md)**: full documentation of `kafka`, `zookeeper` parameters and the presets table
- **[How to create and manage topics](./manage-topics.md)**: configure topics after scaling
