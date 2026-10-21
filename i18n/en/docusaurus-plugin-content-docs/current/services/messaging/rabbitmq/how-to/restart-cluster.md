---
title: "How to restart a cluster — RabbitMQ"
sidebar_label: "How to restart a cluster"
---

# How to restart a RabbitMQ cluster

This guide explains how to restart a RabbitMQ cluster from the [Hikube console](https://console.hikube.cloud), for example when a node no longer behaves normally.

## Prerequisites

- A **RabbitMQ cluster** with the status **Ready** in your project
- The right to edit this cluster

## What happens during the restart

All instances of the cluster restart at once:

- the cluster is unreachable for a few seconds while the nodes restart;
- open AMQP connections are closed and your clients must reconnect;
- data is kept: vhosts, users, durable queues and their persistent messages. As with any RabbitMQ restart, non-durable queues and non-persistent messages do not survive.

The address in the **Host** field does not change.

:::warning
Plan the restart in a maintenance window or outside peak hours, and check that your producers and consumers can reconnect automatically.
:::

## Steps

### 1. Open the cluster page

In the **DB & Messaging** → **RabbitMQ** menu, click the cluster.

### 2. Start the restart

1. Click **Restart**, next to the **Edit** and **Delete** buttons.
2. The "Restart `<name>`?" window recalls the effect of the restart. Confirm with **Restart**.

The "Restart started" message confirms that the request was accepted. The restart continues in the background.

:::note
A cluster that is still being created has nothing to restart yet: the request is refused. Wait a few minutes after the cluster reaches the status **Ready**, while it finishes starting, then start the restart again.
:::

## Verification

The cluster status does not change during a restart: it keeps showing **Ready**. Check in your application logs that their connections have been re-established and that message consumption has resumed.

## Further reading

- [Concepts](../concepts.md): quorum queues and high availability
- [Change a cluster's configuration](./scale-resources.md)
