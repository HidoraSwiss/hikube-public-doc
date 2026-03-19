---
sidebar_position: 7
title: Troubleshooting
---

# Troubleshooting — NATS

### Lost messages (no JetStream)

**Cause**: JetStream is not enabled or no stream is configured to capture messages. Without JetStream, NATS operates in fire-and-forget mode: messages are only delivered to subscribers connected at the time of publication.

**Solution**:

1. Verify that JetStream is enabled in your manifest:
   ```yaml title="nats.yaml"
   jetstream:
     enabled: true
     size: 10Gi
   ```
2. Reapply the manifest if necessary:
   ```bash
   kubectl apply -f nats.yaml
   ```
3. Create a stream to capture messages from the desired subjects:
   ```bash
   nats stream add --subjects "orders.>" --storage file --replicas 3 --retention limits orders-stream
   ```
4. Verify the stream is created and capturing messages:
   ```bash
   nats stream info orders-stream
   ```

### Consumer not receiving messages

**Cause**: the consumer is subscribed to a subject that does not match the one used by the producer. Common errors include typos in the subject name, incorrect wildcard usage, or wrong queue group configuration.

**Solution**:

1. Verify the exact subject used by the producer and consumer — subjects are **case-sensitive**
2. Test reception with a diagnostic subscription:
   ```bash
   nats sub ">"
   ```
   This lets you see **all messages** published on the server
3. Check the wildcards used:
   - `orders.*` does **not** match `orders.new.urgent` (use `orders.>` for sub-levels)
4. If using queue groups, verify the consumer is a member of the expected group and that the group name is identical

### JetStream storage full

**Cause**: the JetStream volume has reached its maximum capacity (`jetstream.size`). New messages can no longer be persisted and publications fail.

**Solution**:

1. Check JetStream storage usage:
   ```bash
   nats account info
   ```
2. Identify the largest streams:
   ```bash
   nats stream list
   ```
3. Purge old messages from streams that allow it:
   ```bash
   nats stream purge <stream-name>
   ```
4. Check stream retention policy — use `limits` with `max-age` to automatically delete old messages:
   ```bash
   nats stream edit <stream-name> --max-age 72h
   ```
5. If needed, increase `jetstream.size` in your manifest:
   ```yaml title="nats.yaml"
   jetstream:
     enabled: true
     size: 50Gi
   ```

### Insufficient memory

**Cause**: the NATS server consumes more memory than the allocated limit, often due to a high number of connections, large messages (`max_payload` too high), or in-memory JetStream streams.

**Solution**:

1. Check pod events to confirm an OOMKill:
   ```bash
   kubectl describe pod <nats-pod> | grep -A 5 "Last State"
   ```
2. Increase resources allocated to NATS:
   ```yaml title="nats.yaml"
   replicas: 3
   resources:
     cpu: 1
     memory: 2Gi
   ```
3. Check the `max_payload` value in `config.merge` — reduce it if very large messages are not needed
4. Reapply the manifest:
   ```bash
   kubectl apply -f nats.yaml
   ```

### Connection refused

**Cause**: the client cannot connect to the NATS server. This can be due to pods not running, incorrect credentials, or attempting an external connection without `external: true`.

**Solution**:

1. Verify NATS pods are in `Running` state:
   ```bash
   kubectl get pods -l app.kubernetes.io/component=nats
   ```
2. Check pod logs for errors:
   ```bash
   kubectl logs <nats-pod>
   ```
3. Verify user credentials in the Kubernetes Secret:
   ```bash
   kubectl get tenantsecret <nats-name>-credentials -o jsonpath='{.data}' | base64 -d
   ```
4. If connecting from outside the cluster, make sure `external: true` is configured:
   ```yaml title="nats.yaml"
   external: true
   ```
5. Test connectivity from a pod within the cluster:
   ```bash
   kubectl exec <nats-pod> -- nats-server --help 2>&1 | head -1
   ```
