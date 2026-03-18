---
sidebar_position: 2
title: Concepts
---

# Concepts — RabbitMQ

## Architecture

RabbitMQ on Hikube is a managed messaging service based on the **AMQP** protocol. Each instance deployed via the `RabbitMQ` resource creates a high-availability cluster with **quorum queues** (Raft protocol) for message replication.

```mermaid
graph TB
    subgraph "Hikube Platform"
        subgraph "Tenant namespace"
            CR[RabbitMQ CRD]
            SEC[Secret credentials]
        end

        subgraph "RabbitMQ Cluster"
            N1[Node 1 - Leader]
            N2[Node 2 - Follower]
            N3[Node 3 - Follower]
        end

        subgraph "AMQP Components"
            EX[Exchange]
            Q1[Queue 1]
            Q2[Queue 2]
            B[Bindings]
        end

        subgraph "Storage"
            PV1[PV Node 1]
            PV2[PV Node 2]
            PV3[PV Node 3]
        end

        subgraph "Virtual Hosts"
            VH1[vhost: production]
            VH2[vhost: staging]
        end
    end

    CR --> N1
    CR --> N2
    CR --> N3
    N1 <-->|Raft| N2
    N2 <-->|Raft| N3
    N1 --> PV1
    N2 --> PV2
    N3 --> PV3
    EX -->|routing| B
    B --> Q1
    B --> Q2
    VH1 --> EX
    VH2 --> EX
    CR --> SEC
```

---

## Terminology

| Term | Description |
|------|-------------|
| **RabbitMQ** | Kubernetes resource (`apps.cozystack.io/v1alpha1`) representing a managed RabbitMQ cluster. |
| **AMQP** | Advanced Message Queuing Protocol — standard messaging protocol supported by RabbitMQ. |
| **Exchange** | Message entry point. Routes messages to queues via bindings. |
| **Queue** | Message buffer that stores messages until a consumer processes them. |
| **Binding** | Routing rule between an exchange and a queue (based on a routing key). |
| **Quorum Queue** | Queue type using the **Raft** protocol to replicate messages across multiple nodes. |
| **Virtual Host (vhost)** | Logical namespace that isolates exchanges, queues, and permissions within the same cluster. |
| **Consumer** | Application that reads and processes messages from a queue. |
| **resourcesPreset** | Predefined resource profile (nano to 2xlarge). |

---

## Message routing

RabbitMQ uses a flexible routing model based on exchanges and bindings:

```mermaid
graph LR
    P[Producer] -->|publish| EX[Exchange]

    subgraph "Routing"
        EX -->|binding key: order.*| Q1[Queue: orders]
        EX -->|binding key: payment.*| Q2[Queue: payments]
        EX -->|binding key: #| Q3[Queue: audit-log]
    end

    Q1 --> C1[Consumer 1]
    Q2 --> C2[Consumer 2]
    Q3 --> C3[Consumer 3]
```

### Exchange types

| Type | Routing |
|------|---------|
| **direct** | Exact routing key |
| **topic** | Pattern matching with wildcards (`*`, `#`) |
| **fanout** | Broadcast to all bound queues |
| **headers** | Routing based on message headers |

---

## Quorum queues and high availability

Quorum queues use the **Raft** protocol to replicate messages:

1. A node is elected **leader** for each queue
2. Messages are replicated to **followers** before confirmation
3. If the leader fails, a follower is automatically promoted

```mermaid
sequenceDiagram
    participant P as Producer
    participant L as Leader (Node 1)
    participant F1 as Follower (Node 2)
    participant F2 as Follower (Node 3)

    P->>L: Publish message
    L->>F1: Replicate (Raft)
    L->>F2: Replicate (Raft)
    F1-->>L: ACK
    F2-->>L: ACK
    Note over L: Quorum reached (2/3)
    L-->>P: Confirm
```

:::tip
Configure `replicas: 3` minimum to guarantee Raft quorum and high availability of quorum queues.
:::

---

## Virtual Hosts

**Vhosts** isolate resources within the same cluster:

- Each vhost has its own exchanges, queues, and permissions
- Users can have different roles per vhost: `admin` or `readonly`
- Useful for separating environments (production, staging) on the same cluster

---

## User management

Users are declared in the manifest with:

- **Password** for authentication
- **Roles per vhost**: `admin` (read/write/configure), `readonly` (read-only)

Credentials are stored in the Secret `<instance>-credentials`.

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

---

## Limits and quotas

| Parameter | Value |
|-----------|-------|
| Max replicas | Depending on tenant quota |
| Storage size (`size`) | Variable (in Gi) |
| Vhosts per cluster | Unlimited (depending on resources) |
| Supported protocols | AMQP 0-9-1, AMQP 1.0, MQTT, STOMP |

---

## Further reading

- [Overview](./overview.md): service presentation
- [API Reference](./api-reference.md): all parameters of the RabbitMQ resource
