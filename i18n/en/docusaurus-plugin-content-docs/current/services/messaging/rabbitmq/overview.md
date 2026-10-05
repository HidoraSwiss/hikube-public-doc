---
sidebar_position: 1
title: Overview
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# RabbitMQ on Hikube

Hikube **RabbitMQ clusters** provide a **reliable, managed messaging infrastructure**, designed for **asynchronous communication between services and applications**.
Based on the **AMQP (Advanced Message Queuing Protocol)** protocol, RabbitMQ ensures **safe and ordered message delivery**, suited both to **microservices** architectures and to complex business integration systems.

You create and manage your clusters as self-service from the [Hikube console](https://console.hikube.cloud), in the **DB & Messaging** → **RabbitMQ** menu of your project.

---

## What the console lets you do

- **Create a cluster** with a guided wizard: RabbitMQ version, resource preset, disk size, number of replicas and external access;
- **Define the virtual hosts (vhosts)** and **users** at creation time, then manage them from the cluster page;
- **Assign rights per vhost** to each user (**Administrator** or **Read-only**);
- **Generate a new password** for a user;
- **Edit** the version, disk size and external access of an existing cluster;
- **Delete** a cluster, a vhost or a user.

---

## Architecture and operation

A RabbitMQ deployment relies on a few fundamental concepts:

* **Producers**: send messages to RabbitMQ through **exchanges**, which determine how messages are routed to **queues**.
* **Exchanges**: apply routing logic (direct, fanout, topic or headers) to distribute messages according to routing keys.
* **Queues**: store messages until they are consumed by **consumers**.
* **Consumers**: retrieve and process messages, ensuring an **asynchronous, reliable and decoupled** workflow.

A cluster can run in **standalone mode** (1 replica) or in **cluster mode** (3 or 5 replicas). In cluster mode, **quorum queues** (based on the Raft protocol) replicate messages between nodes to keep the service running if a node fails. The details are covered in the [concepts](./concepts.md).

---

## Typical use cases

### Inter-service communication

RabbitMQ is often used as an **internal message bus** between applications or microservices.
It lets you **decouple processing**, reduce perceived latency and improve **overall resilience**.

**Examples:**

* Processing queue for long-running tasks (emails, reports, notifications)
* Business event system (orders, payments, inventories)
* Reliable communication between distributed microservices

---

### Asynchronous flow management

RabbitMQ simplifies setting up **asynchronous workflows** in which each component works independently of the others.

**Examples:**

* Orchestration of background jobs
* Parallel processing of data batches
* Coordination of CI/CD pipelines or internal automations

---

### Application integration and system interconnection

RabbitMQ acts as a **communication bridge** between heterogeneous applications, languages or environments.

**Examples:**

* Integration between legacy applications and modern microservices
* Connection between internal systems and external platforms via AMQP
* Centralization of business event messages on a single bus

---

### Reliability and persistence

RabbitMQ ensures **message durability** through on-disk persistence and the handling of **acknowledgements** (ACK/NACK).
Combined with quorum queues on a cluster of 3 or more replicas, these mechanisms prevent message loss if a node fails.

**Examples:**

* Transactional queue for critical processing
* Guaranteed processing of financial or logistics messages
* Data transfer between services with automatic recovery after an error

<NavigationFooter
  nextSteps={[
    {label: "Concepts", href: "../concepts"},
    {label: "Quick start", href: "../quick-start"},
  ]}
  seeAlso={[
    {label: "All messaging services", href: "../../"},
  ]}
/>
