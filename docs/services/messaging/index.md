---
title: Services de messagerie
sidebar_position: 0
---

import ServiceCardGrid from '@site/src/components/ServiceCardGrid';

# Services de messagerie

Hikube fournit des services de messagerie manages pour le decouplage d'applications, le streaming d'evenements et la communication asynchrone.

## Comparatif

| Service | Protocole | Modele | Persistance | Cas d'usage |
|---------|-----------|--------|-------------|-------------|
| Kafka | TCP binaire | Pub/Sub avec log | Oui (log distribue) | Event streaming, pipelines de donnees |
| RabbitMQ | AMQP | File d'attente | Oui (optionnel) | Task queues, RPC, routing complexe |
| NATS | TCP texte | Pub/Sub + Request/Reply | Optionnel (JetStream) | Microservices, IoT, edge |

## Services disponibles

<ServiceCardGrid items={[
  {
    title: "Kafka",
    description: "Plateforme de streaming d'evenements distribuee pour pipelines de donnees temps reel.",
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
    description: "Systeme de messagerie leger et performant pour les architectures cloud-native.",
    icon: "/img/services/nats.svg",
    href: "./nats/overview",
    tags: ["Cloud-native", "Leger"],
  },
]} />
