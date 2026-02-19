---
sidebar_position: 2
title: FAQ
---

# Frequently Asked Questions

Find here the answers to the most common questions about using Hikube.

---

## 1. How do I retrieve my kubeconfig?

Once your Kubernetes cluster is deployed, retrieve the kubeconfig with:

```bash
kubectl get secret <cluster-name>-admin-kubeconfig \
  -o go-template='{{ printf "%s\n" (index .data "super-admin.conf" | base64decode) }}' \
  > my-cluster-kubeconfig.yaml

export KUBECONFIG=my-cluster-kubeconfig.yaml
kubectl get nodes
```

See: [Kubernetes - Quick Start](../services/kubernetes/quick-start.md)

---

## 2. How do I retrieve my database credentials?

Credentials are stored in a Kubernetes Secret. The command varies depending on the service:

```bash
# Redis
kubectl get secret redis-<name>-auth -o json | jq -r '.data | to_entries[] | "\(.key): \(.value|@base64d)"'

# PostgreSQL
kubectl get secret pg-<name>-app -o json | jq -r '.data | to_entries[] | "\(.key): \(.value|@base64d)"'

# MySQL
kubectl get secret mysql-<name>-auth -o json | jq -r '.data | to_entries[] | "\(.key): \(.value|@base64d)"'
```

See: [Redis - Quick Start](../services/databases/redis/quick-start.md), [PostgreSQL - Quick Start](../services/databases/postgresql/quick-start.md), [MySQL - Quick Start](../services/databases/mysql/quick-start.md)

---

## 3. How do I expose a service externally?

Two options are available:

**Option 1: External access via LoadBalancer** (recommended for production)

Add `external: true` in your service's YAML manifest. A LoadBalancer with a public IP will be created automatically.

```yaml
spec:
  external: true
```

**Option 2: Port-forward** (recommended for development)

```bash
kubectl port-forward svc/<service-name> <local-port>:<service-port>
```

:::note
It is recommended not to expose databases externally unless you specifically need to.
:::

---

## 4. What is the difference between `resources` and `resourcesPreset`?

- **`resourcesPreset`**: a predefined profile (nano, micro, small, medium, large, xlarge, 2xlarge) that automatically allocates CPU and memory.
- **`resources`**: allows you to **explicitly** define CPU and memory values.

If `resources` is defined, `resourcesPreset` is **ignored**.

| Preset | CPU | Memory |
|--------|-----|--------|
| `nano` | 250m | 128Mi |
| `micro` | 500m | 256Mi |
| `small` | 1 | 512Mi |
| `medium` | 1 | 1Gi |
| `large` | 2 | 2Gi |
| `xlarge` | 4 | 4Gi |
| `2xlarge` | 8 | 8Gi |

See: [Redis - API Reference](../services/databases/redis/api-reference.md)

---

## 5. How do I choose my instanceType for Kubernetes?

The `instanceType` parameter in `nodeGroups` determines the resources for each worker node:

| Instance Type | vCPU | RAM |
|---------------|------|-----|
| `s1.small` | 1 | 2 GB |
| `s1.medium` | 2 | 4 GB |
| `s1.large` | 4 | 8 GB |
| `s1.xlarge` | 8 | 16 GB |
| `s1.2xlarge` | 16 | 32 GB |

Choose based on your workloads:
- **Standard web applications**: `s1.large` (good cost/performance balance)
- **Memory-intensive applications**: `s1.xlarge` or `s1.2xlarge`
- **Development environments**: `s1.small` or `s1.medium`

See: [Kubernetes - API Reference](../services/kubernetes/api-reference.md)

---

## 6. How do I enable S3 backups?

For databases that support it (PostgreSQL, ClickHouse), add the `backup` section in your manifest:

```yaml
spec:
  backup:
    enabled: true
    s3:
      endpoint: "https://s3.example.com"
      bucket: "my-backups"
      accessKey: "ACCESS_KEY"
      secretKey: "SECRET_KEY"
```

See: [PostgreSQL - API Reference](../services/databases/postgresql/api-reference.md)

---

## 7. How do I access Grafana and my dashboards?

If monitoring is enabled on your tenant, Grafana is accessible via a dedicated URL. To find it:

```bash
# Check monitoring Ingresses
kubectl get ingress -n monitoring

# Or check services
kubectl get svc -n monitoring | grep grafana
```

Dashboards are preconfigured for each resource type (Kubernetes, databases, VMs, etc.).

See: [Key Concepts - Observability](../getting-started/concepts.md)

---

## 8. How do I scale my cluster?

### Scaling database replicas

Modify the `replicas` field in your manifest and reapply:

```yaml
spec:
  replicas: 5  # Increase the number of replicas
```

```bash
kubectl apply -f <manifest>.yaml
```

### Scaling Kubernetes nodes

Nodes scale automatically between `minReplicas` and `maxReplicas` based on load. To modify the limits, adjust the `nodeGroup` configuration:

```yaml
spec:
  nodeGroups:
    general:
      minReplicas: 2
      maxReplicas: 10
```

See: [Kubernetes - Quick Start](../services/kubernetes/quick-start.md)

---

## 9. What storageClasses are available?

| StorageClass | Description |
|-------------|-------------|
| `""` (default) | Standard storage, data on a single datacenter |
| `replicated` | Replicated storage across multiple datacenters, high availability |

Use `replicated` for production workloads requiring hardware fault tolerance.

```yaml
spec:
  storageClass: replicated
```

See: [Kubernetes - API Reference](../services/kubernetes/api-reference.md)

---

## 10. How does auto-failover work on databases?

Each managed database service has an auto-failover mechanism:

| Service | Mechanism | How it works |
|---------|-----------|--------------|
| **Redis** | Redis Sentinel | Monitors the master, automatically promotes a replica in case of failure |
| **PostgreSQL** | CloudNativePG | Failure detection and automatic promotion of a standby |
| **MySQL** | MySQL Operator | Semi-synchronous replication with automatic failover |
| **ClickHouse** | ClickHouse Keeper | Distributed consensus for shard and replica coordination |
| **RabbitMQ** | Quorum Queues | Raft replication for message fault tolerance |

Auto-failover is **enabled by default** when `replicas > 1`. No additional configuration is required.

See: [Redis - Overview](../services/databases/redis/overview.md), [PostgreSQL - Overview](../services/databases/postgresql/overview.md)
