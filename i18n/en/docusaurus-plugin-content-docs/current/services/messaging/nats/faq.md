---
sidebar_position: 6
title: FAQ
---

# FAQ — NATS

### Should I enable JetStream?

**JetStream** adds **persistence**, **streaming**, and **replay** capabilities to NATS. Without JetStream, NATS operates in **pure pub/sub** (fire-and-forget) mode: messages are only delivered to subscribers connected at the time of publication.

JetStream is enabled by default (`jetstream.enabled: true`). Only disable it if you need purely ephemeral messaging without persistence:

```yaml title="nats.yaml"
jetstream:
  enabled: true
  size: 10Gi
```

:::tip
In production, always keep JetStream enabled to benefit from message persistence, event replay capability, and durable consumer groups.
:::

### What is the difference between pub/sub and queue groups?

NATS offers two consumption models:

- **Classic pub/sub**: each subscriber receives **all messages** published on the subject. Suitable for broadcasting (notifications, logs).
- **Queue groups**: subscribers in the same group **share messages** (load balancing). Each message is delivered to **only one subscriber** in the group. Suitable for distributed processing.

Multiple queue groups can subscribe to the same subject — each group receives a copy of every message, but only one member per group processes it.

### How do wildcards work in subjects?

NATS uses a hierarchical subject system separated by dots (`.`). Two wildcards are available:

| **Wildcard** | **Description**                         | **Example**                                                       |
| ------------ | --------------------------------------- | ----------------------------------------------------------------- |
| `*`          | Matches **a single token**              | `orders.*` matches `orders.new` but not `orders.new.urgent`       |
| `>`          | Matches **one or more tokens**          | `orders.>` matches `orders.new`, `orders.new.urgent`, etc.        |

Examples:
- `logs.*`: receives `logs.info`, `logs.error`, but not `logs.app.error`
- `logs.>`: receives `logs.info`, `logs.error`, `logs.app.error`, etc.

### What is the difference between `resourcesPreset` and `resources`?

The `resourcesPreset` field applies a predefined CPU/memory configuration, while `resources` allows you to specify explicit values. If `resources` is defined, `resourcesPreset` is **ignored**.

| **Preset** | **CPU** | **Memory** |
| ---------- | ------- | ---------- |
| `nano`     | 250m    | 128Mi      |
| `micro`    | 500m    | 256Mi      |
| `small`    | 1       | 512Mi      |
| `medium`   | 1       | 1Gi        |
| `large`    | 2       | 2Gi        |
| `xlarge`   | 4       | 4Gi        |
| `2xlarge`  | 8       | 8Gi        |

Example with explicit resources:

```yaml title="nats.yaml"
replicas: 3
resources:
  cpu: 2000m
  memory: 2Gi
```

### Does NATS persist messages?

By default, NATS operates in **fire-and-forget** mode: messages are only delivered to subscribers connected at the time of publication. **No persistence** occurs without additional configuration.

To persist messages, two conditions must be met:

1. **JetStream must be enabled** (`jetstream.enabled: true`)
2. **A stream must be created** to capture messages from the relevant subjects

Without a configured stream, even with JetStream enabled, messages published on a subject without an associated stream are not persisted.

### How to configure NATS with advanced settings?

The `config.merge` field allows you to add or override NATS configuration parameters:

```yaml title="nats.yaml"
config:
  merge:
    max_payload: 8MB
    write_deadline: 2s
    debug: false
    trace: false
```

Common parameters:

| **Parameter**      | **Description**                                          | **Default** |
| ------------------ | -------------------------------------------------------- | ----------- |
| `max_payload`      | Maximum message size                                     | 1MB         |
| `write_deadline`   | Write timeout to a client                                | 2s          |
| `debug`            | Enable debug logging                                     | false       |
| `trace`            | Enable message tracing (very verbose)                    | false       |

:::warning
Enabling `debug` and `trace` in production generates a considerable volume of logs. Use them only for temporary diagnostics.
:::
