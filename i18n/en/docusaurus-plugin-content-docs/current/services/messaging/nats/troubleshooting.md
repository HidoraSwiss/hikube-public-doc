---
sidebar_position: 7
title: Troubleshooting
---

# Troubleshooting — NATS

:::info Availability
NATS is not yet available as self-service in the [Hikube console](https://console.hikube.cloud).
To provision an instance or change its configuration, [contact support](mailto:support@hidora.io).
:::

The diagnostics below are run from the `nats` CLI (see the [quick start](./quick-start.md) to save a connection context). When an action is needed on the platform side (resources, storage, restart, server logs), [contact support](mailto:support@hidora.io), stating the project and the instance name.

### Lost messages (no JetStream)

**Cause**: JetStream is not enabled or no stream is configured to capture the messages. Without JetStream, NATS runs in fire-and-forget mode: messages are only delivered to subscribers connected at the time of publication.

**Solution**:

1. Check that JetStream is available for your account:
   ```bash
   nats account info
   ```
   If JetStream is not enabled on the instance, contact support.
2. Create a stream to capture the messages of the subjects you need:
   ```bash
   nats stream add --subjects "orders.>" --storage file --replicas 3 --retention limits orders-stream
   ```
3. Check that the stream has been created and is capturing messages:
   ```bash
   nats stream info orders-stream
   ```

### Consumer does not receive messages

**Cause**: the consumer is subscribed to a subject that does not match the one used by the producer. Common mistakes include a typo in the subject name, misuse of wildcards, or an incorrect queue group configuration.

**Solution**:

1. Check the exact subject used by the producer and the consumer — subjects are **case-sensitive**.
2. Test reception with a diagnostic subscription:
   ```bash
   nats sub ">"
   ```
   This shows **all messages** your user is allowed to receive.
3. Check the wildcards used: `orders.*` does **not** match `orders.new.urgent` (use `orders.>` for sub-levels).
4. If you use queue groups, check that the consumer is a member of the expected group and that the group name is identical.

### JetStream storage full

**Cause**: the JetStream volume has reached its maximum capacity. New messages can no longer be persisted and publications fail.

**Solution**:

1. Check JetStream storage usage:
   ```bash
   nats account info
   ```
2. Identify the largest streams:
   ```bash
   nats stream list
   ```
3. Purge old messages from the streams that allow it:
   ```bash
   nats stream purge <stream-name>
   ```
4. Adjust the stream retention policy — use `limits` with `max-age` to delete old messages automatically:
   ```bash
   nats stream edit <stream-name> --max-age 72h
   ```
5. If needed, request an increase of the JetStream volume. This option is not offered in the console; contact support.

### Insufficient memory

**Cause**: the NATS server consumes more memory than the allocated limit, often because of a high number of connections, large messages (high `max_payload`), or in-memory JetStream streams.

**Solution**:

1. Prefer `file` storage over `memory` for large streams.
2. Reduce the size of published messages if very large messages are not needed.
3. If the problem persists, request a larger preset or an adjustment of `max_payload`. This option is not offered in the console; contact support.

### Connection refused

**Cause**: wrong URL or port, wrong credentials, or a connection attempt from outside the platform without external access enabled.

**Solution**:

1. Check that you are using the URL and credentials provided by support.
2. Test the connection:
   ```bash
   nats server check connection --server <nats-url> --user <user> --password <password>
   ```
3. An `Authorization Violation` error indicates incorrect credentials; ask support to check or renew the password.
4. If you are connecting from outside the platform, check with support that external access is enabled on the instance.
