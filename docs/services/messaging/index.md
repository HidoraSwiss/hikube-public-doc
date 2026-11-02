---
title: Messagerie
sidebar_position: 0
---

import ServiceCardGrid from '@site/src/components/ServiceCardGrid';

# Messagerie

Hikube fournit RabbitMQ, un broker de messages AMQP managé, pour le découplage d'applications et la communication asynchrone : files d'attente persistantes, RPC et routing complexe.

RabbitMQ est disponible en libre-service dans la [console Hikube](https://console.hikube.cloud), menu **DB & Messaging** → **RabbitMQ**.

## Service disponible

<ServiceCardGrid items={[
  {
    title: "RabbitMQ",
    description: "Broker de messages AMQP avec routing flexible et files d'attente persistantes. Disponible en libre-service dans la console.",
    icon: "/img/services/rabbitmq.svg",
    href: "./rabbitmq/overview",
    tags: ["AMQP", "Queues", "Console"],
  },
]} />
