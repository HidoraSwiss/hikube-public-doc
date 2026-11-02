---
title: Messaggistica
sidebar_position: 0
---

import ServiceCardGrid from '@site/src/components/ServiceCardGrid';

# Messaggistica

Hikube fornisce RabbitMQ, un broker di messaggi AMQP gestito, per il disaccoppiamento delle applicazioni e la comunicazione asincrona: code persistenti, RPC e routing complesso.

RabbitMQ è disponibile in self-service nella [console Hikube](https://console.hikube.cloud), menu **DB & Messaging** → **RabbitMQ**.

## Servizio disponibile

<ServiceCardGrid items={[
  {
    title: "RabbitMQ",
    description: "Broker di messaggi AMQP con routing flessibile e code persistenti. Disponibile in self-service nella console.",
    icon: "/img/services/rabbitmq.svg",
    href: "./rabbitmq/overview",
    tags: ["AMQP", "Queues", "Console"],
  },
]} />
