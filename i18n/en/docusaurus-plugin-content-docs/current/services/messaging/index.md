---
title: Messaging
sidebar_position: 0
---

import ServiceCardGrid from '@site/src/components/ServiceCardGrid';

# Messaging

Hikube provides RabbitMQ, a managed AMQP message broker, for application decoupling and asynchronous communication: persistent queues, RPC and complex routing.

RabbitMQ is available as self-service in the [Hikube console](https://console.hikube.cloud), menu **DB & Messaging** → **RabbitMQ**.

## Available service

<ServiceCardGrid items={[
  {
    title: "RabbitMQ",
    description: "AMQP message broker with flexible routing and persistent queues. Available as self-service in the console.",
    icon: "/img/services/rabbitmq.svg",
    href: "./rabbitmq/overview",
    tags: ["AMQP", "Queues", "Console"],
  },
]} />
