---
title: Services de messagerie
sidebar_position: 0
---

import ServiceCardGrid from '@site/src/components/ServiceCardGrid';

# Services de messagerie

Hikube fournit des services de messagerie managés pour le découplage d'applications, le streaming d'événements et la communication asynchrone.

## Comparatif

| Service | Protocole | Modèle | Persistance | Cas d'usage |
|---------|-----------|--------|-------------|-------------|
| Kafka | TCP binaire | Pub/Sub avec log | Oui (log distribué) | Event streaming, pipelines de données |
| RabbitMQ | AMQP | File d'attente | Oui (optionnel) | Task queues, RPC, routing complexe |
| NATS | TCP texte | Pub/Sub + Request/Reply | Optionnel (JetStream) | Microservices, IoT, edge |

## Services disponibles

<ServiceCardGrid items={[
  {
    title: "Kafka",
    description: "Plateforme de streaming d'événements distribuée pour pipelines de données temps réel.",
    icon: "/img/services/kafka.svg",
    href: "./kafka/overview",
    tags: ["Streaming", "Pub/Sub"],
  },
  {
    title: "RabbitMQ",
    description: "Broker de messages AMQP avec routing flexible et files d'attente persistantes.",
    icon: "/img/services/rabbitmq.svg",
    href: "./rabbitmq/overview",
    tags: ["AMQP", "Queues"],
  },
  {
    title: "NATS",
    description: "Système de messagerie léger et performant pour les architectures cloud-native.",
    icon: "/img/services/nats.svg",
    href: "./nats/overview",
    tags: ["Cloud-native", "Léger"],
  },
]} />
