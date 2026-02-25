---
sidebar_position: 1
title: Overview
---

# NATS on Hikube

Hikube's **NATS clusters** provide a **modern, ultra-lightweight and high-performance messaging platform**, designed for **real-time communication** between services, applications and connected devices.
Built for **cloud-native and microservices architectures**, NATS combines **simplicity, speed and resilience** in a single, easy-to-operate system.

---

## Architecture and How It Works

NATS uses a **pub/sub** (publish–subscribe) architecture without a complex broker: each message is sent to a **subject** that other applications can **listen to**.

* **Publishers** → publish messages to a subject (`orders.created`, `user.login`, etc.)
* **Subscribers** → subscribe to these subjects to receive the corresponding messages
* **Subjects** → define logical communication channels, hierarchical and dynamic
* **JetStream** → adds **persistence**, **replay** and **delivery guarantees**

---

## Lightweight and Performant

NATS is known for its **exceptional speed** and **minimal footprint**, making it an ideal component for distributed architectures.

**Key characteristics:**

* Startup time under one second
* Less than **10 MB of memory** consumed per instance
* Handles **millions of messages per second**
* Direct communication between services, without a heavy intermediary
* **Stateless** architecture, easily **horizontally scalable**

> NATS delivers high throughput with average latency measured in **microseconds**, even under heavy load.

---

## Designed for Microservices Architectures

Each service can publish or consume events without depending on the rest of the system, promoting **strong decoupling** and **better resilience**.

**Usage examples:**

* Real-time application event broadcasting
* Communication between distributed microservices
* Lightweight requests between services (**request/reply** pattern)
* Business event handling (order creation, notification, profile update)

---

## Supported Protocols

NATS is an **optimized binary protocol** but remains compatible with many environments and standards:

* **NATS Core** → lightweight messaging (pub/sub, request/reply)
* **NATS JetStream** → persistence, replay and flow control
* **NATS WebSocket** → direct integration with web applications
* **NATS MQTT** → IoT device support
* **NATS gRPC** → interoperability with modern APIs
* **Clients** available in over **40 languages**: Go, Python, Node.js, Java, Rust, C#, etc.

---

## Typical Use Cases

### Real-time Communication

NATS excels at **instant event transmission** between distributed applications.

**Examples:**

* Real-time notifications and status updates
* Application monitoring and metrics collection
* Data synchronization between microservices

---

### Event Streaming and Persistence

With **JetStream**, NATS becomes a **durable streaming system**:

* Temporary or persistent message storage
* Event replay for auditing or disaster recovery
* Flow control to never overload consumers

---

### Security and Reliability

Hikube NATS clusters include advanced security mechanisms:

* **TLS/mTLS encryption**
* **NKeys and JWT authentication**
* **Subject-level access control (ACL)**

This ensures **reliable, secure and isolated communication** between services, even in multi-tenant environments.

---

### Simple Administration

Thanks to its **minimalist design** and **built-in tools (CLI, dashboards, Prometheus metrics)**, NATS is easy to operate and monitor, even at scale.

**Examples:**

* Internal event bus for distributed platforms
* Internal automation orchestration
* Centralized, lightweight messaging system for Kubernetes
