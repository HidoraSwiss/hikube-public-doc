---
title: Servizi di messaggistica
sidebar_position: 0
---

import ServiceCardGrid from '@site/src/components/ServiceCardGrid';

# Servizi di messaggistica

Hikube fornisce servizi di messaggistica gestiti per il disaccoppiamento delle applicazioni, lo streaming di eventi e la comunicazione asincrona.

## Disponibilità

| Servizio | Disponibilità |
|----------|---------------|
| RabbitMQ | In self-service nella [console Hikube](https://console.hikube.cloud), menu **DB & Messaging** → **RabbitMQ** |
| Kafka | Su richiesta al [supporto](mailto:support@hidora.io) |
| NATS | Su richiesta al [supporto](mailto:support@hidora.io) |

## Confronto

| Servizio | Protocollo | Modello | Persistenza | Casi d'uso |
|----------|------------|---------|-------------|------------|
| RabbitMQ | AMQP | Coda di messaggi | Sì | Task queue, RPC, routing complesso |
| Kafka | TCP binario | Pub/Sub con log | Sì (log distribuito) | Event streaming, pipeline di dati |
| NATS | TCP testuale | Pub/Sub + Request/Reply | Opzionale (JetStream) | Microservizi, IoT, edge |

## Servizi disponibili

<ServiceCardGrid items={[
  {
    title: "RabbitMQ",
    description: "Broker di messaggi AMQP con routing flessibile e code persistenti. Disponibile in self-service nella console.",
    icon: "/img/services/rabbitmq.svg",
    href: "./rabbitmq/overview",
    tags: ["AMQP", "Queues", "Console"],
  },
  {
    title: "Kafka",
    description: "Piattaforma distribuita di streaming di eventi per pipeline di dati in tempo reale. Su richiesta.",
    icon: "/img/services/kafka.svg",
    href: "./kafka/overview",
    tags: ["Streaming", "Pub/Sub"],
  },
  {
    title: "NATS",
    description: "Sistema di messaggistica leggero e performante per le architetture cloud-native. Su richiesta.",
    icon: "/img/services/nats.svg",
    href: "./nats/overview",
    tags: ["Cloud-native", "Leggero"],
  },
]} />
