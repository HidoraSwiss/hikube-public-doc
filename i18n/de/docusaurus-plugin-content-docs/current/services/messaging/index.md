---
title: Messaging-Dienste
sidebar_position: 0
---

import ServiceCardGrid from '@site/src/components/ServiceCardGrid';

# Messaging-Dienste

Hikube stellt verwaltete Messaging-Dienste für die Entkopplung von Anwendungen, Event-Streaming und asynchrone Kommunikation bereit.

## Verfügbarkeit

| Dienst | Verfügbarkeit |
|---------|---------------|
| RabbitMQ | Im Self-Service in der [Hikube-Konsole](https://console.hikube.cloud), Menü **DB & Messaging** → **RabbitMQ** |
| Kafka | Auf Anfrage beim [Support](mailto:support@hidora.io) |
| NATS | Auf Anfrage beim [Support](mailto:support@hidora.io) |

## Vergleich

| Dienst | Protokoll | Modell | Persistenz | Anwendungsfälle |
|---------|-----------|--------|-------------|-------------|
| RabbitMQ | AMQP | Warteschlange | Ja | Task-Queues, RPC, komplexes Routing |
| Kafka | Binäres TCP | Pub/Sub mit Log | Ja (verteiltes Log) | Event-Streaming, Datenpipelines |
| NATS | Text-TCP | Pub/Sub + Request/Reply | Optional (JetStream) | Microservices, IoT, Edge |

## Verfügbare Dienste

<ServiceCardGrid items={[
  {
    title: "RabbitMQ",
    description: "AMQP-Message-Broker mit flexiblem Routing und persistenten Warteschlangen. Im Self-Service in der Konsole verfügbar.",
    icon: "/img/services/rabbitmq.svg",
    href: "./rabbitmq/overview",
    tags: ["AMQP", "Queues", "Konsole"],
  },
  {
    title: "Kafka",
    description: "Verteilte Event-Streaming-Plattform für Echtzeit-Datenpipelines. Auf Anfrage.",
    icon: "/img/services/kafka.svg",
    href: "./kafka/overview",
    tags: ["Streaming", "Pub/Sub"],
  },
  {
    title: "NATS",
    description: "Leichtgewichtiges und leistungsstarkes Messaging-System für Cloud-native-Architekturen. Auf Anfrage.",
    icon: "/img/services/nats.svg",
    href: "./nats/overview",
    tags: ["Cloud-native", "Leichtgewichtig"],
  },
]} />
