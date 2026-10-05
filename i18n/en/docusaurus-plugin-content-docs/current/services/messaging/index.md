---
title: Messaging services
sidebar_position: 0
---

import ServiceCardGrid from '@site/src/components/ServiceCardGrid';

# Messaging services

Hikube provides managed messaging services for application decoupling, event streaming and asynchronous communication.

## Availability

| Service | Availability |
|---------|---------------|
| RabbitMQ | Self-service in the [Hikube console](https://console.hikube.cloud), menu **DB & Messaging** → **RabbitMQ** |
| Kafka | On request from [support](mailto:support@hidora.io) |
| NATS | On request from [support](mailto:support@hidora.io) |

## Comparison

| Service | Protocol | Model | Persistence | Use cases |
|---------|-----------|--------|-------------|-------------|
| RabbitMQ | AMQP | Queue | Yes | Task queues, RPC, complex routing |
| Kafka | Binary TCP | Pub/Sub with log | Yes (distributed log) | Event streaming, data pipelines |
| NATS | Text TCP | Pub/Sub + Request/Reply | Optional (JetStream) | Microservices, IoT, edge |

## Available services

<ServiceCardGrid items={[
  {
    title: "RabbitMQ",
    description: "AMQP message broker with flexible routing and persistent queues. Available as self-service in the console.",
    icon: "/img/services/rabbitmq.svg",
    href: "./rabbitmq/overview",
    tags: ["AMQP", "Queues", "Console"],
  },
  {
    title: "Kafka",
    description: "Distributed event streaming platform for real-time data pipelines. On request.",
    icon: "/img/services/kafka.svg",
    href: "./kafka/overview",
    tags: ["Streaming", "Pub/Sub"],
  },
  {
    title: "NATS",
    description: "Lightweight, high-performance messaging system for cloud-native architectures. On request.",
    icon: "/img/services/nats.svg",
    href: "./nats/overview",
    tags: ["Cloud-native", "Lightweight"],
  },
]} />
