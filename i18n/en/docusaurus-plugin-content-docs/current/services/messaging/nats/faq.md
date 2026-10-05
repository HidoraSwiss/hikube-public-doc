---
sidebar_position: 6
title: FAQ
---

# FAQ — NATS

:::info Availability
NATS is not yet available as self-service in the [Hikube console](https://console.hikube.cloud).
To provision an instance or change its configuration, [contact support](mailto:support@hidora.io).
:::

### How do I get a NATS cluster?

Send your request to [support](mailto:support@hidora.io) with the instance parameters (replicas, preset, JetStream, users, external access). The [quick start](./quick-start.md) lists the information to prepare.

### Should I enable JetStream?

**JetStream** adds **persistence**, **streaming** and message **replay** to NATS. Without JetStream, NATS runs in **pure pub/sub** mode (fire-and-forget): messages are only delivered to subscribers connected at the time of publication.

:::tip
In production, keep JetStream enabled to benefit from message persistence, the ability to replay events, and durable consumers.
:::

Enabling JetStream and the size of its volume are part of the instance configuration. This option is not offered in the console; contact support.

### What is the difference between pub/sub and queue groups?

NATS offers two consumption models:

- **Classic pub/sub**: each subscriber receives **all messages** published on the subject. Suited to broadcasting (notifications, logs).
- **Queue groups**: subscribers in the same group **share the messages** (load balancing). Each message is delivered to **a single subscriber** in the group. Suited to distributed processing.

Several queue groups can subscribe to the same subject — each group receives a copy of every message, but only one member per group processes it.

### How do wildcards work in subjects?

NATS uses a system of hierarchical subjects separated by dots (`.`). Two wildcards are available:

| **Wildcard** | **Description**                        | **Example**                                                     |
| ------------ | -------------------------------------- | --------------------------------------------------------------- |
| `*`          | Matches **a single token**             | `orders.*` matches `orders.new` but not `orders.new.urgent`     |
| `>`          | Matches **one or more tokens**         | `orders.>` matches `orders.new`, `orders.new.urgent`, etc.      |

Examples:
- `logs.*`: receives `logs.info`, `logs.error`, but not `logs.app.error`
- `logs.>`: receives `logs.info`, `logs.error`, `logs.app.error`, etc.

### Which resource presets are available?

| **Preset** | **CPU** | **Memory**  |
| ---------- | ------- | ----------- |
| `nano`     | 250m    | 128Mi       |
| `micro`    | 500m    | 256Mi       |
| `small`    | 1       | 512Mi       |
| `medium`   | 1       | 1Gi         |
| `large`    | 2       | 2Gi         |
| `xlarge`   | 4       | 4Gi         |
| `2xlarge`  | 8       | 8Gi         |

Explicit CPU/memory values can also be requested; they then replace the preset. This option is not offered in the console; contact support.

### Does NATS persist messages?

By default, NATS runs in **fire-and-forget** mode: messages are only delivered to subscribers connected at the time of publication. **No persistence** takes place without additional configuration.

To persist messages, two conditions must be met:

1. **JetStream must be enabled** on the instance
2. **A stream must be created** (for example with `nats stream add`) to capture the messages of the relevant subjects

Even with JetStream enabled, messages published on a subject with no associated stream are not persisted.

### Can the NATS server configuration be adjusted?

Some server parameters can be adjusted at the instance level:

| **Parameter**      | **Description**                                          | **Default** |
| ------------------ | -------------------------------------------------------- | ----------- |
| `max_payload`      | Maximum size of a message                                | 1MB         |
| `write_deadline`   | Write timeout towards a client                           | 2s          |
| `debug`            | Enables debug logs                                       | false       |
| `trace`            | Enables message tracing (very verbose)                   | false       |

This option is not offered in the console; contact support.

:::warning
Enabling `debug` and `trace` in production generates a considerable volume of logs. Only request them for temporary diagnostics.
:::
