---
sidebar_position: 1
title: Overview
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# Kafka on Hikube

:::info Availability
Kafka is not yet available as self-service in the [Hikube console](https://console.hikube.cloud).
To provision an instance or change its configuration, [contact support](mailto:support@hidora.io).
:::

Hikube **Kafka clusters** provide a **distributed, scalable and highly available data streaming** platform, designed for the **collection, processing and distribution of real-time events**.
Thanks to its native integration with **ZooKeeper**, every Kafka cluster on Hikube benefits from **coordinated and resilient broker management**, ensuring the **stability and consistency** of the cluster metadata.

---

## Architecture and Operation

A Kafka deployment on Hikube relies on two key components:

* **Kafka** → handles the **publication, storage and distribution** of messages through a *publish / subscribe* model.
  Messages are organized into **topics**, divided into **partitions** spread across several **brokers**.
  This delivers **high throughput**, **low latency** and **horizontal scalability**.

* **ZooKeeper** → acts as a **central coordination registry**.
  It manages the **broker configuration**, **partition and leader tracking**, and **synchronization between nodes**.
  If a broker fails, ZooKeeper automatically elects a new leader to maintain service continuity.

---

## Typical use cases

### System integration and synchronization

Kafka acts as the **central event bus** between an organization's applications.
**Examples:**

* Synchronize data between microservices or remote systems
* Connect databases and analytics tools through **Kafka Connect**
* Decouple exchanges between applications for a more robust architecture

---

### Real-time processing and analytics

Kafka lets you analyze and transform data **at the moment it is produced**.
**Examples:**

* Real-time fraud detection
* Computing metrics or generating instant alerts
* Continuously feeding analytics dashboards (ClickHouse, Elasticsearch, Grafana, etc.)

---

### IoT and log data collection

Kafka simplifies the **massive collection of heterogeneous data** coming from sensors, applications or servers.
**Examples:**

* Centralizing IoT telemetry for thousands of devices
* Aggregating application logs in a monitoring pipeline
* Sending streams to several destinations simultaneously

---

### Inter-service communication

Kafka enables **asynchronous communication** between microservices, improving resilience and reducing dependencies between components.
**Examples:**

* Handling business events (orders, payments, notifications)
* Distributed queue for complex tasks or workflows
* Integration with specialized workers or consumers

<NavigationFooter
  nextSteps={[
    {label: "Concepts", href: "../concepts"},
    {label: "Quick start", href: "../quick-start"},
  ]}
  seeAlso={[
    {label: "All messaging services", href: "../../"},
  ]}
/>
