---
sidebar_position: 1
title: Overview
---


# RabbitMQ on Hikube

Hikube's **RabbitMQ clusters** provide a **reliable, distributed, and highly available messaging infrastructure**, designed for **asynchronous communication between services and applications**.
Based on the **AMQP (Advanced Message Queuing Protocol)**, RabbitMQ guarantees **safe and ordered message delivery**, suitable for both **microservices** architectures and complex business integration systems.

---

## Architecture and Operation

A RabbitMQ deployment on Hikube relies on several fundamental concepts:

* **Producers** send messages to RabbitMQ via **exchanges**, which determine how messages are routed to **queues**.
* **Exchanges** apply routing logic (direct, fanout, topic, or headers) to distribute messages according to routing keys.
* **Queues** store messages until they are consumed by **consumers**.
* **Consumers** retrieve and process messages, ensuring an **asynchronous, reliable, and decoupled** workflow.

RabbitMQ clusters on Hikube are configured in **high availability (HA) mode**, with **message queue replication** across multiple nodes to ensure service continuity in the event of a failure.

> RabbitMQ clusters on Hikube use the **quorum queues** feature to provide behavior similar to distributed consensus (based on Raft), guaranteeing **integrity and fault tolerance**.

---

## Typical Use Cases

### Inter-service Communication

RabbitMQ is often used as an **internal message bus** between applications or microservices.
It helps **decouple processing**, reduce perceived latency, and improve **overall resilience**.

**Examples:**

* Processing queue for long-running tasks (emails, reports, notifications)
* Business event system (orders, payments, inventories)
* Reliable communication between distributed microservices

---

### Asynchronous Workflow Management

RabbitMQ simplifies the implementation of **asynchronous workflows** where each component works independently of the others.

**Examples:**

* Background job orchestration
* Parallel batch data processing
* CI/CD pipeline or internal automation coordination

---

### Application Integration and System Interconnection

RabbitMQ acts as a **universal communication bridge** between applications, languages, or heterogeneous environments.

**Examples:**

* Integration between legacy applications and modern microservices
* Connection between internal systems and external platforms via AMQP or MQTT
* Centralizing business event messages in a single bus

---

### Reliability and Persistence

RabbitMQ ensures **message durability** through disk persistence and **acknowledgment** management (ACK/NACK).
This guarantees that no message is lost, even in the event of a temporary node or network failure.

**Examples:**

* Transactional queue for critical processing
* Guaranteed processing of financial or logistics messages
* Data transfer between services with automatic error recovery
