---
title: Messaging Services
sidebar_position: 0
---

import ServiceCardGrid from '@site/src/components/ServiceCardGrid';

# Messaging Services

Hikube provides managed messaging services for application decoupling, event streaming, and asynchronous communication.

## Comparison

| Service | Protocol | Model | Persistence | Use Case |
|---------|----------|-------|-------------|----------|
| Kafka | Binary TCP | Pub/Sub with log | Yes (distributed log) | Event streaming, data pipelines |
| RabbitMQ | AMQP | Queue-based | Yes (optional) | Task queues, RPC, complex routing |
| NATS | Text TCP | Pub/Sub + Request/Reply | Optional (JetStream) | Microservices, IoT, edge |

## Available Services

<ServiceCardGrid items={[
  {
    title: "Kafka",
    description: "Distributed event streaming platform for real-time data pipelines.",
    icon: "/img/services/kafka.svg",
    href: "./kafka/overview",
    tags: ["Streaming", "Pub/Sub"],
  },
  {
    title: "RabbitMQ",
    description: "AMQP message broker with flexible routing and persistent queues.",
    icon: "/img/services/rabbitmq.svg",
    href: "./rabbitmq/overview",
    tags: ["AMQP", "Queues"],
  },
  {
    title: "NATS",
    description: "Lightweight and performant messaging system for cloud-native architectures.",
    icon: "/img/services/nats.svg",
    href: "./nats/overview",
    tags: ["Cloud-native", "Lightweight"],
  },
]} />
