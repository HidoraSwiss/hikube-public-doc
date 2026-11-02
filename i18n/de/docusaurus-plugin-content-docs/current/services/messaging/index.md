---
title: Messaging
sidebar_position: 0
---

import ServiceCardGrid from '@site/src/components/ServiceCardGrid';

# Messaging

Hikube stellt RabbitMQ bereit, einen verwalteten AMQP-Message-Broker für die Entkopplung von Anwendungen und asynchrone Kommunikation: persistente Warteschlangen, RPC und komplexes Routing.

RabbitMQ ist im Self-Service in der [Hikube-Konsole](https://console.hikube.cloud) verfügbar, Menü **DB & Messaging** → **RabbitMQ**.

## Verfügbarer Dienst

<ServiceCardGrid items={[
  {
    title: "RabbitMQ",
    description: "AMQP-Message-Broker mit flexiblem Routing und persistenten Warteschlangen. Im Self-Service in der Konsole verfügbar.",
    icon: "/img/services/rabbitmq.svg",
    href: "./rabbitmq/overview",
    tags: ["AMQP", "Queues", "Konsole"],
  },
]} />
