---
title: "How to configure JetStream"
---

# How to configure JetStream

:::info Availability
NATS is not yet available as self-service in the [Hikube console](https://console.hikube.cloud).
To provision an instance or change its configuration, [contact support](mailto:support@hidora.io).
:::

This guide explains how to size **JetStream** on a Hikube NATS cluster, then how to create and use streams from the `nats` CLI. JetStream provides message persistence, streaming and replay with delivery guarantees.

Enabling JetStream, the size of its volume and the advanced server configuration are part of the instance configuration. This option is not offered in the console; contact support.

## Prerequisites

- A **NATS** cluster provisioned on Hikube, its URL (`<nats-url>`) and credentials
- The **nats** CLI installed locally, with a saved context (see the [quick start](../quick-start.md))

## Steps

### 1. Size the JetStream storage

| Parameter | Description |
|-----------|-------------|
| JetStream enabled | Enables or disables persistence on the instance |
| Volume size | Disk space reserved for JetStream data |

Volume sizing depends on your use case:

- **Ephemeral messages** (short TTL, a few hours): 10 to 20 GB
- **Long retention** (days, weeks): 50 to 100 GB
- **Large streams** (events, logs): 100 GB and more

:::tip
Plan for at least 3 replicas in production to benefit from JetStream's Raft consensus. This ensures high availability and stream durability if a node fails.
:::

:::warning
Shrinking the JetStream volume on an existing instance can lead to data loss. Allow a sufficient margin when sizing initially.
:::

### 2. Adjust the server configuration (optional)

The following parameters can be adjusted at the instance level:

| Parameter | Description | Default |
|-----------|-------------|--------|
| `max_payload` | Maximum size of a message | `1MB` |
| `write_deadline` | Maximum time to write a response to the client | `2s` |
| `debug` | Enables debug logs | `false` |
| `trace` | Enables message tracing (very verbose) | `false` |

:::note
`debug` and `trace` are only justified for temporary troubleshooting. These options generate a large volume of logs and can affect performance.
:::

Send the desired size and any parameters to [support](mailto:support@hidora.io), stating the project and the instance name.

### 3. Create a stream

Once JetStream is enabled, create a stream from the CLI:

```bash
nats stream add EVENTS \
  --subjects "events.>" \
  --storage file \
  --retention limits \
  --max-msgs -1 \
  --max-bytes -1 \
  --max-age 72h \
  --replicas 3 \
  --defaults
```

**Expected result:**

```console
Stream EVENTS was created

Information:

  Subjects: events.>
  Replicas: 3
  Storage:  File
  Retention: Limits
  ...
```

### 4. Test the stream

Publish a message:

```bash
nats pub events.test "Hello JetStream"
```

Consume the message:

```bash
nats sub "events.>" --count 1
```

**Expected result:**

```console
[#1] Received on "events.test"
Hello JetStream
```

Check the state of the stream:

```bash
nats stream info EVENTS
```

## Verification

The configuration is correct if:

- `nats account info` reports that JetStream is available
- A stream can be created with the desired number of replicas
- Published messages are persisted and can be consumed
- `nats stream info` shows the right number of replicas and the configured retention policy

## Further reading

- **[Concepts](../concepts.md)**: communication models and JetStream
- **[How to manage NATS users](./manage-users.md)**: cluster access accounts
