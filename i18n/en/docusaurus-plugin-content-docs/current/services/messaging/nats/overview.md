---
sidebar_position: 1
title: Overview
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# NATS on Hikube

:::info Availability
NATS is not yet available as self-service in the [Hikube console](https://console.hikube.cloud).
To provision an instance or change its configuration, [contact support](mailto:support@hidora.io).
:::

Hikube **NATS clusters** provide a **modern, ultra-lightweight and high-performance messaging platform**, designed for **real-time communication** between services, applications and connected devices.  
Built for **cloud native and microservices architectures**, NATS combines **simplicity, speed and resilience** in a single system that is easy to operate.

---

## Architecture and operation

NATS uses a **pub/sub** (publish–subscribe) architecture without a complex broker: each message is sent to a **subject** that other applications can **listen** to.

* **Publishers** → publish messages to a subject (`orders.created`, `user.login`, etc.)  
* **Subscribers** → subscribe to these subjects to receive the corresponding messages  
* **Subjects** → define the logical communication channels, hierarchical and dynamic  
* **JetStream** → adds **persistence**, **replay** and **delivery guarantees**

---

## Lightweight and performance

NATS is known for its **exceptional speed** and **minimal footprint**, which makes it an ideal component for distributed architectures.

**Key features:**

* Sub-second startup time  
* Less than **10 MB of memory** consumed per instance  
* Handles **millions of messages per second**  
* Direct communication between services, without a heavy intermediary  
* **Stateless** architecture, easily **horizontally scalable**

> NATS delivers high throughput with an average latency measured in **microseconds**, even under heavy load.

---

## Designed for microservices architectures

Each service can publish or consume events without depending on the rest of the system, promoting **strong decoupling** and **better resilience**.

**Usage examples:**

* Real-time broadcasting of application events  
* Communication between distributed microservices  
* Lightweight requests between services (**request/reply** pattern)  
* Business event handling (order creation, notification, profile update)

---

## Supported protocols

NATS is an **optimized binary** protocol but remains compatible with many environments and standards:

* **NATS Core** → lightweight messaging (pub/sub, request/reply)  
* **NATS JetStream** → persistence, replay and flow control  
* **NATS WebSocket** → direct integration with web applications  
* **NATS MQTT** → support for connected devices (IoT)  
* **NATS gRPC** → interoperability with modern APIs  
* **Clients** available in more than **40 languages**: Go, Python, Node.js, Java, Rust, C#, etc.

---

## Typical use cases

### Real-time communication

NATS excels at the **instant delivery of events** between distributed applications.

**Examples:**

* Live notifications and status updates  
* Application monitoring and metrics collection  
* Data synchronization between microservices

---

### Event streaming and persistence

With **JetStream**, NATS becomes a **durable streaming system**:

* Temporary or persistent message storage  
* Event replay for auditing or incident recovery  
* Flow control so consumers are never overloaded

---

### Security and reliability

Hikube NATS clusters include advanced security mechanisms:

* **TLS/mTLS encryption**  
* **Authentication with NKeys and JWT**  
* **Subject-level access control (subject-level ACL)**  

This ensures **reliable, secure and isolated communication** between services, even in shared environments.

---

### Ease of administration

Thanks to its **minimalist design** and **built-in tools (CLI, dashboards, Prometheus metrics)**, NATS is simple to operate and monitor, even at large scale.

**Examples:**

* Internal event bus for distributed platforms  
* Orchestration of internal automations  
* Centralized, lightweight messaging system for Kubernetes

<NavigationFooter
  nextSteps={[
    {label: "Concepts", href: "../concepts"},
    {label: "Quick start", href: "../quick-start"},
  ]}
  seeAlso={[
    {label: "All messaging services", href: "../../"},
  ]}
/>
