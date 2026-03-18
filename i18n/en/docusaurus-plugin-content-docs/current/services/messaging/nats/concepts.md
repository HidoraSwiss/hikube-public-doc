---
sidebar_position: 2
title: Concepts
---

# Concepts — NATS

## Architecture

NATS on Hikube is a managed messaging service, ultra-lightweight and high-performance. Each instance deployed via the `NATS` resource creates a cluster of servers with optional **JetStream** support for message persistence.

```mermaid
graph TB
    subgraph "Hikube Platform"
        subgraph "Tenant namespace"
            CR[NATS CRD]
            SEC[Secret credentials]
        end

        subgraph "NATS Cluster"
            N1[NATS Server 1]
            N2[NATS Server 2]
            N3[NATS Server 3]
        end

        subgraph "JetStream"
            JS[Stream Storage]
            PV[Persistent Volume]
        end

        subgraph "Clients"
            PUB[Publisher]
            SUB[Subscriber]
            REQ[Request/Reply]
        end
    end

    CR --> N1
    CR --> N2
    CR --> N3
    N1 <-->|cluster routing| N2
    N2 <-->|cluster routing| N3
    N1 --> JS
    JS --> PV
    PUB --> N1
    N2 --> SUB
    REQ --> N3
    CR --> SEC
```

---

## Terminology

| Term | Description |
|------|-------------|
| **NATS** | Kubernetes resource (`apps.cozystack.io/v1alpha1`) representing a managed NATS cluster. |
| **Subject** | Message routing address (e.g., `orders.created`). Supports wildcards (`*`, `>`). |
| **Publish/Subscribe** | Communication model where publishers send messages to a subject and subscribers receive them. |
| **JetStream** | NATS persistence extension — durable message storage with replay, acknowledgment, and consumers. |
| **Stream** | Persistent collection of messages in JetStream, with configurable retention policy. |
| **Consumer** | Durable subscription in JetStream with position (offset) tracking and acknowledgment. |
| **Request/Reply** | Synchronous communication model — a client sends a request and waits for a response. |
| **resourcesPreset** | Predefined resource profile (nano to 2xlarge). |

---

## Communication models

NATS supports three communication models:

### Publish/Subscribe

The simplest model — a publisher sends a message, all subscribers receive a copy:

```mermaid
graph LR
    PUB[Publisher] -->|"orders.created"| NATS[NATS Server]
    NATS --> SUB1[Subscriber 1]
    NATS --> SUB2[Subscriber 2]
    NATS --> SUB3[Subscriber 3]
```

### Queue Groups

Subscribers in the same queue group share messages (load balancing):

```mermaid
graph LR
    PUB[Publisher] -->|"orders.created"| NATS[NATS Server]
    NATS -->|"message 1"| S1[Worker 1<br/>queue: processors]
    NATS -->|"message 2"| S2[Worker 2<br/>queue: processors]
    NATS -->|"message 3"| S3[Worker 3<br/>queue: processors]
```

### Request/Reply

Synchronous communication with an expected response:

```mermaid
sequenceDiagram
    participant Client
    participant NATS
    participant Service

    Client->>NATS: Request (orders.get)
    NATS->>Service: Forward request
    Service-->>NATS: Reply (order data)
    NATS-->>Client: Forward reply
```

---

## JetStream

JetStream adds **persistence** to NATS:

- Messages are stored on disk in **streams**
- **Consumers** track their position and can replay messages
- Supports **at-least-once** and **exactly-once** delivery
- Configurable retention by duration, message count, or size

:::tip
Enable JetStream only if you need persistence. For ephemeral pub/sub, core NATS is lighter (< 10 MB of RAM per instance).
:::

---

## User management

NATS users are declared in the manifest with a password. Credentials are stored in the Secret `<instance>-credentials`.

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
| Minimum memory footprint | < 10 MB per instance (without JetStream) |
| JetStream storage size | Variable (in Gi) |
| Typical latency | < 1 ms (same datacenter) |

---

## Further reading

- [Overview](./overview.md): service presentation
- [API Reference](./api-reference.md): all parameters of the NATS resource
