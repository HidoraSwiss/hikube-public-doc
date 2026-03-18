---
title: "How to configure Redis high availability"
---

# How to configure Redis high availability

This guide explains how to deploy a highly available Redis cluster on Hikube. The service relies on the **Spotahome Redis Operator** which uses **Redis Sentinel** to ensure automatic failover when 3 or more replicas are configured.

## Prerequisites

- `kubectl` configured to interact with the Hikube API
- Knowledge of Redis basics (see the [quick start](../quick-start.md))
- A production environment requiring high availability

## Steps

### 1. Configure the manifest with 3+ replicas

To enable high availability, configure at least 3 replicas. Redis Sentinel is automatically deployed by the Spotahome operator to orchestrate leader election and failover:

```yaml title="redis-ha.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Redis
metadata:
  name: my-redis-ha
spec:
  replicas: 3
  resourcesPreset: medium
  size: 5Gi
  storageClass: replicated
  authEnabled: true
```

:::note
The `storageClass: replicated` ensures that persistent volumes are replicated at the storage level, protecting data against physical node loss.
:::

### 2. Apply the configuration

```bash
kubectl apply -f redis-ha.yaml
```

### 3. Verify the Redis cluster

Wait for all pods to be ready:

```bash
# Verifier l'etat des pods Redis
kubectl get pods -l app.kubernetes.io/instance=my-redis-ha -w
```

**Expected output:**

```console
NAME                READY   STATUS    RESTARTS   AGE
my-redis-ha-0       1/1     Running   0          3m
my-redis-ha-1       1/1     Running   0          2m
my-redis-ha-2       1/1     Running   0          1m
```

Also verify the Redis Sentinel status:

```bash
# Verifier les pods Sentinel
kubectl get pods -l app.kubernetes.io/component=sentinel,app.kubernetes.io/instance=my-redis-ha
```

### 4. Understanding automatic failover

With 3 replicas, Redis Sentinel provides the following functions:

- **Failure detection**: Sentinel continuously monitors the master node and replicas
- **Automatic election**: if the master goes down, Sentinel elects a new master from the available replicas
- **Reconfiguration**: the remaining replicas are automatically reconfigured to replicate from the new master

:::tip
Failover is fully automatic. No manual intervention is required. The switchover time is typically a few seconds.
:::

### 5. Retrieve the password

With `authEnabled: true`, a password is automatically generated and stored in a Kubernetes Secret:

```bash
# Recuperer le nom du secret
kubectl get secrets | grep my-redis-ha

# Extraire le mot de passe
kubectl get secret my-redis-ha -o jsonpath='{.data.password}' | base64 -d
```

:::warning
Always enable `authEnabled: true` in production. Without authentication, any application with access to the cluster network can read and write to Redis.
:::

## Verification

Verify that the HA cluster is working correctly:

```bash
# Verifier la ressource Redis
kubectl get redis my-redis-ha

# Verifier que tous les pods sont Running
kubectl get pods -l app.kubernetes.io/instance=my-redis-ha

# Verifier les services exposes
kubectl get svc -l app.kubernetes.io/instance=my-redis-ha
```

**Expected output:**

```console
NAME                     TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)     AGE
my-redis-ha              ClusterIP   10.96.xxx.xxx   <none>        6379/TCP    5m
my-redis-ha-sentinel     ClusterIP   10.96.xxx.xxx   <none>        26379/TCP   5m
```

## Going further

- [API Reference](../api-reference.md) -- `replicas`, `authEnabled` and `storageClass` parameters
- [How to vertically scale Redis](./scale-resources.md) -- Adjust CPU and memory resources
