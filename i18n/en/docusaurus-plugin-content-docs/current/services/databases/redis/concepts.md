---
sidebar_position: 2
title: Concepts
---

# Concepts — Redis

## Architecture

Redis on Hikube is a managed service based on the **Spotahome Redis Operator**. Each instance deployed via the `Redis` resource creates a master-replica cluster with **Redis Sentinel** for automatic failover.

```mermaid
graph TB
    subgraph "Hikube Platform"
        subgraph "Tenant namespace"
            CR[Redis CRD]
            SEC[Secret credentials]
        end

        subgraph "Spotahome Operator"
            OP[Controller]
        end

        subgraph "Redis Cluster"
            M[Master - R/W]
            R1[Replica 1 - RO]
            R2[Replica 2 - RO]
        end

        subgraph "Redis Sentinel"
            S1[Sentinel 1]
            S2[Sentinel 2]
            S3[Sentinel 3]
        end

        subgraph "Storage"
            PV1[PV Master]
            PV2[PV Replica 1]
            PV3[PV Replica 2]
        end
    end

    CR --> OP
    OP --> M
    OP --> R1
    OP --> R2
    OP --> S1
    OP --> S2
    OP --> S3
    M -->|replication| R1
    M -->|replication| R2
    S1 -.->|monitoring| M
    S2 -.->|monitoring| M
    S3 -.->|monitoring| M
    M --> PV1
    R1 --> PV2
    R2 --> PV3
    OP --> SEC
```

---

## Terminology

| Term | Description |
|------|-------------|
| **Redis** | Kubernetes resource (`apps.cozystack.io/v1alpha1`) representing a managed Redis cluster. |
| **Master** | Primary instance that accepts reads and writes. |
| **Replica** | Read-only instance, synchronized from the master. |
| **Sentinel** | Monitoring process that detects master failures and orchestrates automatic failover. |
| **Spotahome Redis Operator** | Kubernetes operator that manages the deployment and lifecycle of Redis clusters. |
| **authEnabled** | Enables password authentication (`requirepass`). |
| **resourcesPreset** | Predefined resource profile (nano to 2xlarge). |

---

## High availability with Sentinel

Redis Sentinel ensures high availability by:

1. **Continuously monitoring** the master and replicas
2. **Detecting** master failure by consensus (quorum among Sentinels)
3. **Automatically promoting** a replica to become the new master
4. **Reconfiguring** the other replicas to follow the new master

```mermaid
sequenceDiagram
    participant S1 as Sentinel 1
    participant S2 as Sentinel 2
    participant S3 as Sentinel 3
    participant M as Master
    participant R1 as Replica

    S1->>M: PING
    M--xS1: Timeout (failure)
    S1->>S2: Master down?
    S1->>S3: Master down?
    S2-->>S1: Yes
    S3-->>S1: Yes
    Note over S1,S3: Quorum reached
    S1->>R1: SLAVEOF NO ONE
    Note over R1: Promoted to Master
    S1->>S2: New master: R1
    S1->>S3: New master: R1
```

:::tip
Configure `replicas: 3` minimum to guarantee Sentinel quorum and enable automatic failover.
:::

---

## Persistence

Redis on Hikube supports persistent storage:

| Parameter | Description |
|-----------|-------------|
| `size` | Persistent volume size (e.g., `10Gi`) |
| `storageClass` | `local` (performance) or `replicated` (high availability) |

Redis data is written to disk via native Redis mechanisms (RDB/AOF), ensuring durability even in case of restart.

:::warning
For production, always use `storageClass: replicated` to protect data against node failure.
:::

---

## Authentication

Redis supports optional authentication:

- `authEnabled: true` — a password is generated and stored in the Secret `<instance>-credentials`
- `authEnabled: false` — passwordless access (avoid in production)

---

## Resource presets

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
If the `resources` field (explicit CPU/memory) is set, `resourcesPreset` is ignored.
:::

---

## Limits and quotas

| Parameter | Value |
|-----------|-------|
| Max replicas | Depending on tenant quota |
| Storage size (`size`) | Variable (in Gi) |
| Redis databases | Single database (db 0 by default) |

---

## Further reading

- [Overview](./overview.md): service presentation
- [API Reference](./api-reference.md): all parameters of the Redis resource
