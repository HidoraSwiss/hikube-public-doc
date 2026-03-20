---
title: Servizi di messaggistica
sidebar_position: 0
---

import ServiceCardGrid from '@site/src/components/ServiceCardGrid';

# Servizi di messaggistica

Hikube fornisce servizi di messaggistica gestiti per il disaccoppiamento delle applicazioni, lo streaming di eventi e la comunicazione asincrona.

## Confronto

| Servizio | Protocollo | Modello | Persistenza | Caso d'uso |
|----------|------------|---------|-------------|------------|
| Kafka | TCP binario | Pub/Sub con log | Si (log distribuito) | Event streaming, pipeline dati |
| RabbitMQ | AMQP | Coda | Si (opzionale) | Task queue, RPC, routing complesso |
| NATS | TCP testo | Pub/Sub + Request/Reply | Opzionale (JetStream) | Microservizi, IoT, edge |

## Servizi disponibili

<ServiceCardGrid items={[
  {
    title: "Kafka",
    description: "Piattaforma distribuita di event streaming per pipeline dati in tempo reale.",
    icon: "/img/services/kafka.svg",
    href: "./kafka/overview",
    tags: ["Streaming", "Pub/Sub"],
  },
  {
    title: "RabbitMQ",
    description: "Broker di messaggi AMQP con routing flessibile e code persistenti.",
    icon: "/img/services/rabbitmq.svg",
    href: "./rabbitmq/overview",
    tags: ["AMQP", "Code"],
  },
  {
    title: "NATS",
    description: "Sistema di messaggistica leggero e performante per architetture cloud-native.",
    icon: "/img/services/nats.svg",
    href: "./nats/overview",
    tags: ["Cloud-native", "Leggero"],
  },
]} />
