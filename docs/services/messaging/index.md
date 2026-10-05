---
title: Services de messagerie
sidebar_position: 0
---

import ServiceCardGrid from '@site/src/components/ServiceCardGrid';

# Services de messagerie

Hikube fournit des services de messagerie managés pour le découplage d'applications, le streaming d'événements et la communication asynchrone.

## Disponibilité

| Service | Disponibilité |
|---------|---------------|
| RabbitMQ | En libre-service dans la [console Hikube](https://console.hikube.cloud), menu **DB & Messaging** → **RabbitMQ** |
| Kafka | Sur demande auprès du [support](mailto:support@hidora.io) |
| NATS | Sur demande auprès du [support](mailto:support@hidora.io) |

## Comparatif

| Service | Protocole | Modèle | Persistance | Cas d'usage |
|---------|-----------|--------|-------------|-------------|
| RabbitMQ | AMQP | File d'attente | Oui | Task queues, RPC, routing complexe |
| Kafka | TCP binaire | Pub/Sub avec log | Oui (log distribué) | Event streaming, pipelines de données |
| NATS | TCP texte | Pub/Sub + Request/Reply | Optionnel (JetStream) | Microservices, IoT, edge |

## Services disponibles

<ServiceCardGrid items={[
  {
    title: "RabbitMQ",
    description: "Broker de messages AMQP avec routing flexible et files d'attente persistantes. Disponible en libre-service dans la console.",
    icon: "/img/services/rabbitmq.svg",
    href: "./rabbitmq/overview",
    tags: ["AMQP", "Queues", "Console"],
  },
  {
    title: "Kafka",
    description: "Plateforme de streaming d'événements distribuée pour pipelines de données temps réel. Sur demande.",
    icon: "/img/services/kafka.svg",
    href: "./kafka/overview",
    tags: ["Streaming", "Pub/Sub"],
  },
  {
    title: "NATS",
    description: "Système de messagerie léger et performant pour les architectures cloud-native. Sur demande.",
    icon: "/img/services/nats.svg",
    href: "./nats/overview",
    tags: ["Cloud-native", "Léger"],
  },
]} />
