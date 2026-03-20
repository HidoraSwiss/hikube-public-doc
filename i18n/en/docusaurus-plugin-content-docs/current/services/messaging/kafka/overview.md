---
sidebar_position: 1
title: Overview
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# Kafka on Hikube

Hikube's **Kafka clusters** provide a **distributed, scalable, and highly available data streaming platform**, designed for **real-time event collection, processing, and distribution**.
Thanks to its native integration with **ZooKeeper**, each Kafka cluster on Hikube benefits from **coordinated and resilient broker management**, ensuring the **stability and consistency** of the cluster's metadata.

---

## 🏗️ Architecture and Operation

A Kafka deployment on Hikube relies on two key components:

* **Kafka** handles the **publishing, storage, and delivery** of messages via a *publish / subscribe* model.
  Messages are organized into **topics**, divided into **partitions** distributed across multiple **brokers**.
  This enables **high throughput**, **low latency**, and **horizontal scalability**.

* **ZooKeeper** acts as a **central coordination registry**.
  It manages **broker configuration**, **partition and leader tracking**, as well as **synchronization between nodes**.
  In the event of a broker failure, ZooKeeper automatically elects a new leader to maintain service continuity.

---

## 🚀 Typical Use Cases

### 📡 System Integration and Synchronization

Kafka serves as a **central event bus** between an organization's various applications.
**Examples:**

* Synchronize data between microservices or remote systems
* Connect databases and analytics tools via **Kafka Connect**
* Decouple exchanges between applications for a more robust architecture

---

### ⚙️ Real-time Processing and Analytics

Kafka enables data analysis and transformation **at the moment it is produced**.
**Examples:**

* Real-time fraud detection
* Metric computation or instant alert generation
* Continuous feeding of analytics dashboards (ClickHouse, Elasticsearch, Grafana, etc.)

---

### 🛰️ IoT Data and Log Collection

Kafka simplifies the **massive collection of heterogeneous data** from sensors, applications, or servers.
**Examples:**

* Centralized IoT telemetry for thousands of devices
* Application log aggregation in a monitoring pipeline
* Streaming to multiple destinations simultaneously

---

### 💬 Inter-service Communication

Kafka enables **asynchronous communication** between microservices, improving resilience and reducing dependency between components.
**Examples:**

* Business event management (orders, payments, notifications)
* Distributed queue for complex tasks or workflows
* Integration with specialized workers or consumers

<NavigationFooter
  nextSteps={[
    {label: "Concepts", href: "../concepts"},
    {label: "Quick Start", href: "../quick-start"},
  ]}
  seeAlso={[
    {label: "All messaging services", href: "../../"},
  ]}
/>
