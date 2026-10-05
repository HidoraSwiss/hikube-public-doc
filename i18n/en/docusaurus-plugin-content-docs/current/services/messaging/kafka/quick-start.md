---
sidebar_position: 3
title: Quick start
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# Getting started with Kafka

:::info Availability
Kafka is not yet available as self-service in the [Hikube console](https://console.hikube.cloud).
To provision an instance or change its configuration, [contact support](mailto:support@hidora.io).
:::

This guide explains how to get a **Kafka cluster** on Hikube and run your first publish and consume tests with the Kafka client tools.

---

## Objectives

By the end of this guide, you will have:

- A **Kafka cluster** provisioned in your Hikube project
- A **topic** ready to receive messages
- Published and consumed a first message from your workstation or your application

---

## Prerequisites

- A **Hikube account** and a **project** (see the [Hikube quick start](../../../getting-started/quick-start.md))
- A Kafka client installed: the Kafka scripts (`kafka-console-producer.sh`, `kafka-console-consumer.sh`) or **kcat** (formerly `kafkacat`)

---

## Step 1: Prepare your request

Gather the parameters of the desired instance:

| Parameter | Description | Example |
|-----------|-------------|---------|
| Project | Hikube project in which to create the instance | `demo01` |
| Name | Name of the Kafka instance | `events` |
| Brokers | Number of Kafka brokers | `3` |
| Broker preset | CPU/memory profile (see [Concepts](./concepts.md#resource-presets)) | `small` |
| Broker storage | Volume size per broker | `10 GB` |
| ZooKeeper | Number of instances (odd), preset and storage size | `3`, `small`, `5 GB` |
| Topics | Name, partitions, replicas and options (`retention.ms`, `cleanup.policy`…) | `my-topic`, 3 partitions, 3 replicas |
| External access | Whether to expose the cluster outside the platform | No |

---

## Step 2: Request the instance

Send these parameters to support at [support@hidora.io](mailto:support@hidora.io), or through the **Contact support** button in the console profile menu.

Support then sends you the connection details:

- the address of the **bootstrap servers** (written `<bootstrap-servers>` in the rest of this guide);
- where applicable, the credentials and security settings to use on the client side.

:::note
Inside the project, the brokers listen on port `9092` (unencrypted) and `9093` (TLS). With external access, the public address uses port `9094`, TLS-encrypted by default: your clients must then trust the cluster's certificate authority, which support sends you (for example `-X security.protocol=SSL -X ssl.ca.location=ca.crt` with kcat). No client authentication is configured by default. Always use the address and port provided by support.
:::

---

## Step 3: Publish a message

With the Kafka scripts:

```bash
echo "Hello Hikube!" | kafka-console-producer.sh \
  --bootstrap-server <bootstrap-servers> \
  --topic my-topic
```

Or with kcat:

```bash
echo "Hello Hikube!" | kcat -b <bootstrap-servers> -t my-topic -P
```

---

## Step 4: Consume the message

With the Kafka scripts:

```bash
kafka-console-consumer.sh \
  --bootstrap-server <bootstrap-servers> \
  --topic my-topic \
  --from-beginning \
  --max-messages 1
```

Or with kcat:

```bash
kcat -b <bootstrap-servers> -t my-topic -C -o beginning -e
```

**Expected result:**

```console
Hello Hikube!
```

:::note
Install kcat with `apt install kcat` (Debian/Ubuntu) or `brew install kcat` (macOS).
:::

---

## Step 5: Quick troubleshooting

### Unable to connect

Check the cluster metadata from your client:

```bash
kcat -b <bootstrap-servers> -L
```

**Common causes:** wrong address or port, external access not enabled while you connect from outside the platform, missing client security settings.

### Topic not found

List the visible topics:

```bash
kafka-topics.sh --bootstrap-server <bootstrap-servers> --list
```

**Common causes:** typo in the topic name, topic not declared in the instance configuration.

### Cluster-side issue

If the cluster seems unavailable (brokers unreachable, ZooKeeper quorum errors), [contact support](mailto:support@hidora.io) with the project and instance names.

---

## Step 6: Cleanup

To delete the instance, send the request to [support](mailto:support@hidora.io) with the project and the instance name.

:::warning
Deleting a Kafka cluster erases all associated data. This operation is **irreversible**.
:::

---

## Next steps

- **[Concepts](./concepts.md)**: topics, partitions, ZooKeeper and presets
- **[How to create and manage topics](./how-to/manage-topics.md)**: topic configuration options

<NavigationFooter
  nextSteps={[
    {label: "FAQ", href: "../faq"},
    {label: "Concepts", href: "../concepts"},
  ]}
  seeAlso={[
    {label: "All messaging services", href: "../../"},
  ]}
/>
