---
sidebar_position: 6
title: FAQ
---

# FAQ — Redis

### How does Redis Sentinel work on Hikube?

Redis on Hikube is deployed via the **Spotahome Redis Operator**, which sets up a **Redis Sentinel** architecture for high availability:

- **Redis Sentinel** monitors Redis instances and performs **automatic failover** when the primary fails.
- A **quorum** is required to decide on failover: you need at least **3 replicas** to guarantee a working quorum (majority of 2 out of 3).
- Clients should connect via the **Sentinel service** to benefit from automatic failover.

```yaml title="redis.yaml"
spec:
  replicas: 3    # Minimum recommended for Sentinel quorum
```

:::tip
In production, always use at least 3 replicas to ensure proper Sentinel quorum operation.
:::

### What is the difference between `resourcesPreset` and `resources`?

The `resourcesPreset` field lets you choose a predetermined resource profile for each Redis replica. If the `resources` field (explicit CPU/memory) is defined, `resourcesPreset` is **completely ignored**.

| **Preset** | **CPU** | **Memory** |
|------------|---------|------------|
| `nano`     | 250m    | 128Mi      |
| `micro`    | 500m    | 256Mi      |
| `small`    | 1       | 512Mi      |
| `medium`   | 1       | 1Gi        |
| `large`    | 2       | 2Gi        |
| `xlarge`   | 4       | 4Gi        |
| `2xlarge`  | 8       | 8Gi        |

```yaml title="redis.yaml"
spec:
  # Using a preset
  resourcesPreset: small

  # OR explicit configuration (the preset is then ignored)
  resources:
    cpu: 1000m
    memory: 1Gi
```

### Does Redis persist data?

Yes. Redis on Hikube uses **RDB/AOF persistence** combined with persistent volumes (PVC). Data is written to disk and survives pod restarts.

The `storageClass` choice affects durability:

- **`local`**: data persisted on the physical node. Fast but vulnerable to node failure.
- **`replicated`**: data replicated across multiple nodes. Slower but resilient to failures.

```yaml title="redis.yaml"
spec:
  size: 2Gi
  storageClass: replicated    # Recommended for production
```

### What is the `authEnabled` parameter for?

When `authEnabled` is set to `true` (default value), a password is **automatically generated** and stored in a Kubernetes Secret. This password is required for any connection to Redis.

```yaml title="redis.yaml"
spec:
  authEnabled: true    # Default value
```

:::warning
Always enable `authEnabled: true` in production. Disabling authentication exposes your data to any pod that can access the Redis service.
:::

### How to scale Redis?

To increase the number of Redis replicas, modify the `replicas` field in your manifest and apply the change:

```yaml title="redis.yaml"
spec:
  replicas: 5    # Increase the number of replicas
```

```bash
kubectl apply -f redis.yaml
```

Redis Sentinel **automatically reconfigures** the cluster to integrate the new replicas. No manual intervention is required.

### How to connect to Redis from a pod?

1. Get the password from the Secret (if `authEnabled: true`):
   ```bash
   kubectl get secret redis-<name>-auth -o jsonpath='{.data.password}' | base64 -d
   ```

2. Connect via the **Sentinel** service (recommended for automatic failover):
   ```bash
   # Sentinel service
   redis-cli -h rfs-redis-<name> -p 26379 SENTINEL get-master-addr-by-name mymaster
   ```

3. Or connect directly to the Redis service:
   ```bash
   # Direct service
   redis-cli -h rfr-redis-<name> -p 6379 -a <password>
   ```

:::tip
Prefer connecting via the Sentinel service (`rfs-redis-<name>`) so your applications automatically follow the primary during failover.
:::
