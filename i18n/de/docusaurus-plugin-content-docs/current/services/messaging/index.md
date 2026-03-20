---
title: Messaging-Dienste
sidebar_position: 0
---

import ServiceCardGrid from '@site/src/components/ServiceCardGrid';

# Messaging-Dienste

Hikube bietet verwaltete Messaging-Dienste fur Anwendungsentkopplung, Event-Streaming und asynchrone Kommunikation.

## Vergleich

| Dienst | Protokoll | Modell | Persistenz | Anwendungsfall |
|--------|-----------|--------|------------|----------------|
| Kafka | Binares TCP | Pub/Sub mit Log | Ja (verteiltes Log) | Event-Streaming, Datenpipelines |
| RabbitMQ | AMQP | Warteschlange | Ja (optional) | Task-Queues, RPC, komplexes Routing |
| NATS | Text TCP | Pub/Sub + Request/Reply | Optional (JetStream) | Microservices, IoT, Edge |

## Verfugbare Dienste

<ServiceCardGrid items={[
  {
    title: "Kafka",
    description: "Verteilte Event-Streaming-Plattform fur Echtzeit-Datenpipelines.",
    icon: "/img/services/kafka.svg",
    href: "./kafka/overview",
    tags: ["Streaming", "Pub/Sub"],
  },
  {
    title: "RabbitMQ",
    description: "AMQP-Message-Broker mit flexiblem Routing und persistenten Warteschlangen.",
    icon: "/img/services/rabbitmq.svg",
    href: "./rabbitmq/overview",
    tags: ["AMQP", "Queues"],
  },
  {
    title: "NATS",
    description: "Leichtgewichtiges und performantes Messaging-System fur Cloud-Native-Architekturen.",
    icon: "/img/services/nats.svg",
    href: "./nats/overview",
    tags: ["Cloud-Native", "Leichtgewichtig"],
  },
]} />
