---
sidebar_position: 2
title: "Concepts — RabbitMQ"
sidebar_label: Concepts
description: "Understand RabbitMQ on Hikube: architecture, deployment modes, exchanges and routing, quorum queues, vhosts, user permissions and the limits of the service."
---

# Concepts — RabbitMQ

## Architecture

RabbitMQ on Hikube is a managed messaging service based on the **AMQP** protocol. Each cluster created from the [Hikube console](https://console.hikube.cloud) belongs to a **project** and consumes that project's quotas (CPU, memory, storage).

```mermaid
graph TB
    subgraph "Hikube project"
        subgraph "RabbitMQ cluster"
            N1[Node 1]
            N2[Node 2]
            N3[Node 3]
        end

        subgraph "Virtual Hosts"
            VH1[vhost: production]
            VH2[vhost: staging]
        end

        subgraph "AMQP components"
            EX[Exchange]
            Q1[Queue 1]
            Q2[Queue 2]
            B[Bindings]
        end

        subgraph "Storage"
            PV1[Node 1 volume]
            PV2[Node 2 volume]
            PV3[Node 3 volume]
        end
    end

    N1 <-->|Raft| N2
    N2 <-->|Raft| N3
    N1 --> PV1
    N2 --> PV2
    N3 --> PV3
    VH1 --> EX
    VH2 --> EX
    EX -->|routing| B
    B --> Q1
    B --> Q2
```

---

## Terminology

| Term | Description |
|-------|-------------|
| **RabbitMQ Cluster** | Managed RabbitMQ instance, created and managed from the console (menu **DB & Messaging** → **RabbitMQ**). |
| **AMQP** | Advanced Message Queuing Protocol, the standard messaging protocol supported by RabbitMQ. |
| **Exchange** | Entry point for messages. Routes messages to queues through bindings. |
| **Queue** | Queue that stores messages until a consumer processes them. |
| **Binding** | Routing rule between an exchange and a queue (based on a routing key). |
| **Quorum Queue** | Queue type that uses the **Raft** protocol to replicate messages across several nodes. |
| **Virtual Host (vhost)** | Logical namespace that isolates exchanges, queues and permissions within the same cluster. |
| **Consumer** | Application that reads and processes the messages of a queue. |
| **Preset** | Predefined CPU/memory resource profile, chosen when the cluster is created. |
| **Replicas** | Number of RabbitMQ nodes in the cluster. Determines the deployment mode. |

---

## Deployment modes

The **Number of replicas** field of the wizard offers three values:

| Value | Label in the console | Mode |
|--------|-------------------------|------|
| 1 | **1 (Standalone)** | A single node. The data volume is replicated at the platform storage level. |
| 3 | **3 (Max High Availability)** | 3-node cluster. Message replication is handled by RabbitMQ (quorum queues). |
| 5 | **5 (Ultra High Availability)** | 5-node cluster, tolerating the loss of two nodes. |

:::warning Mode set at creation
The mode (standalone or cluster) and the number of replicas cannot be changed after creation: the console displays "The mode cannot be changed after creation". To change mode, create a new cluster.
:::

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

Exchanges, queues and bindings are created by your applications, with an AMQP client connected to the relevant vhost. The console manages the cluster, the vhosts and the users, not the AMQP objects themselves.

---

## Quorum queues and high availability

Quorum queues use the **Raft** protocol to replicate messages:

1. A node is elected **leader** for each queue
2. Messages are replicated to the **followers** before confirmation
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
Choose **3 (Max High Availability)** or **5 (Ultra High Availability)** replicas to guarantee the Raft quorum, and declare your critical queues as quorum queues (argument `x-queue-type: quorum` on the client side).
:::

---

## Virtual hosts

**Vhosts** isolate resources within the same cluster:

- Each vhost has its own exchanges, queues and permissions
- A user can have a different right on each vhost
- Useful to separate environments (production, staging) or applications on the same cluster

The creation wizard requires at least one vhost. More vhosts can be added later from the cluster page (**Add a VHost** button).

---

## Users and rights

Each RabbitMQ user receives a **password generated by the platform**, displayed **only once** at creation (or after a rotation). Their rights are defined **per vhost**:

| Right in the console | Effect |
|-----------------------|-------|
| **Administrator** | Read, write and configure on the vhost |
| **Read-only** | Read-only on the vhost |
| **No access** | The user has no access to the vhost |

A user can only have one right per vhost. Rights can be changed at any time with the **Manage Access** action.

---

## Resource presets

The **Preset** sets the CPU and memory resources of each node. Presets are the [virtual machine](../../compute/overview.md) sizes of the `u1`, `s1` and `m1` series: a preset has the same resources as the VM of the same name. The list displayed by the wizard is authoritative:

| Preset | CPU | Memory |
|--------|-----|---------|
| `u1.medium` | 1 | 4Gi |
| `u1.large` | 2 | 8Gi |
| `u1.xlarge` | 4 | 16Gi |
| `u1.2xlarge` | 8 | 32Gi |
| `u1.4xlarge` | 16 | 64Gi |
| `u1.8xlarge` | 32 | 128Gi |
| `s1.small` | 1 | 2Gi |
| `s1.medium` | 2 | 4Gi |
| `s1.large` | 4 | 8Gi |
| `s1.xlarge` | 8 | 16Gi |
| `s1.2xlarge` | 16 | 32Gi |
| `s1.4xlarge` | 32 | 64Gi |
| `m1.large` | 2 | 16Gi |
| `m1.xlarge` | 4 | 32Gi |
| `m1.2xlarge` | 8 | 64Gi |
| `m1.4xlarge` | 16 | 128Gi |
| `m1.8xlarge` | 32 | 256Gi |

The preset **cannot be changed after creation**.

The wizard does not preselect any preset: choose one to continue. Each option shows its resources, for example “u1.medium — 1 CPU / 4Gi”. If the list cannot be loaded, the wizard displays “The preset list could not be loaded. Try again later or contact support.”

A cluster created with a former preset (`nano`, `micro`, `small`, `medium`, `large`, `xlarge` or `2xlarge`) keeps it and runs as before: the **Edit** form shows it as is and saves it unchanged. Since the preset cannot be changed after creation, [contact support](mailto:support@hidora.io) for this change. If a cluster's resources were set outside its preset, the form says so with the mention “(override)”.

---

## Limits

| Parameter | Value |
|-----------|--------|
| Cluster name | 3 to 16 characters: lowercase letters, digits and hyphens; starts with a letter, ends with a letter or a digit |
| Available versions | 4.2, 4.1, 4.0, 3.13; upgrade only after creation |
| Replicas | 1, 3 or 5 (set at creation) |
| Vhost name | Lowercase letters, digits and hyphens; starts with a letter, ends with a letter or a digit |
| Username | 3 to 16 characters: lowercase letters, digits and hyphens; starts with a letter, ends with a letter or a digit. Some names, such as `admin` or `root`, are reserved |
| Disk size | 1 to 4096 GB per node, within the project's storage quota; increase only |
| External access | Can be enabled at creation or later |
| AMQP port | 5672, without TLS |

---

## Further reading

- [Overview](./overview.md): service presentation
- [Quick start](./quick-start.md): create your first cluster
- [Manage vhosts and users](./how-to/manage-vhosts-users.md)
