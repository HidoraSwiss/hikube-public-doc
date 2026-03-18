---
title: "How to configure JetStream"
---

# How to configure JetStream

This guide explains how to enable and configure the **JetStream** module on a NATS cluster deployed on Hikube. JetStream provides message persistence, streaming, and the request/reply pattern with delivery guarantees.

## Prerequisites

- **kubectl** configured with your Hikube kubeconfig
- A **NATS** cluster deployed on Hikube (or a manifest ready to deploy)
- (Optional) the **nats** CLI installed locally for testing

## Steps

### 1. Enable JetStream

JetStream is enabled by default (`jetstream.enabled: true`). If you have disabled it or want to configure it explicitly, add the `jetstream` section to the manifest:

```yaml title="nats-jetstream.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: NATS
metadata:
  name: my-nats
spec:
  replicas: 3
  resourcesPreset: small
  external: false

  jetstream:
    enabled: true
    size: 20Gi

  users:
    admin:
      password: SecureAdminPassword
```

**JetStream parameters:**

| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `jetstream.enabled` | `bool` | Enables or disables JetStream | `true` |
| `jetstream.size` | `quantity` | Persistent volume size for JetStream data | `10Gi` |

:::tip
Use a minimum of 3 replicas in production to benefit from JetStream's Raft consensus. This ensures high availability and stream durability in case of a node failure.
:::

### 2. Configure JetStream storage

JetStream volume sizing depends on your use case:

- **Ephemeral messages** (short TTL, a few hours): `10Gi` to `20Gi`
- **Long retention** (days, weeks): `50Gi` to `100Gi`
- **Large streams** (events, logs): `100Gi` and above

```yaml title="nats-jetstream-storage.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: NATS
metadata:
  name: my-nats
spec:
  replicas: 3
  resourcesPreset: medium
  storageClass: replicated

  jetstream:
    enabled: true
    size: 50Gi

  users:
    admin:
      password: SecureAdminPassword
```

:::warning
Reducing `jetstream.size` on an existing cluster can lead to data loss. Always plan for sufficient headroom during initial sizing.
:::

### 3. Advanced configuration via config.merge

The `config.merge` field allows you to adjust low-level NATS parameters:

```yaml title="nats-config-advanced.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: NATS
metadata:
  name: my-nats
spec:
  replicas: 3
  resourcesPreset: medium
  storageClass: replicated

  jetstream:
    enabled: true
    size: 50Gi

  users:
    admin:
      password: SecureAdminPassword

  config:
    merge:
      max_payload: 8MB
      write_deadline: 2s
      debug: false
      trace: false
```

**Common configuration options:**

| Parameter | Description | Default |
|-----------|-------------|---------|
| `max_payload` | Maximum message size | `1MB` |
| `write_deadline` | Maximum delay to write a response to the client | `2s` |
| `debug` | Enables debug logs | `false` |
| `trace` | Enables message tracing (very verbose) | `false` |

:::note
Enable `debug` and `trace` only for temporary troubleshooting. These options generate a high volume of logs and can impact performance.
:::

### 4. Apply and verify

Apply the manifest:

```bash
kubectl apply -f nats-config-advanced.yaml
```

Monitor the rolling update of the pods:

```bash
kubectl get po -w | grep my-nats
```

Wait for all pods to be in `Running` state:

```bash
kubectl get po | grep my-nats
```

**Expected output:**

```console
my-nats-0   1/1     Running   0   2m
my-nats-1   1/1     Running   0   4m
my-nats-2   1/1     Running   0   6m
```

### 5. Test JetStream

Open a port-forward to the NATS service:

```bash
kubectl port-forward svc/my-nats 4222:4222
```

Create a stream with the `nats` CLI:

```bash
nats stream create EVENTS \
  --server nats://admin:SecureAdminPassword@127.0.0.1:4222 \
  --subjects "events.>" \
  --retention limits \
  --max-msgs -1 \
  --max-bytes -1 \
  --max-age 72h \
  --replicas 3
```

**Expected output:**

```console
Stream EVENTS was created

Information:

  Subjects: events.>
  Replicas: 3
  Storage:  File
  Retention: Limits
  ...
```

Publish a message:

```bash
nats pub events.test "Hello JetStream" \
  --server nats://admin:SecureAdminPassword@127.0.0.1:4222
```

Consume the message:

```bash
nats sub "events.>" \
  --server nats://admin:SecureAdminPassword@127.0.0.1:4222 \
  --count 1
```

**Expected output:**

```console
[#1] Received on "events.test"
Hello JetStream
```

Check the stream status:

```bash
nats stream info EVENTS \
  --server nats://admin:SecureAdminPassword@127.0.0.1:4222
```

## Verification

The configuration is successful if:

- All NATS pods are in `Running` state
- A stream can be created with the desired number of replicas
- Published messages are persisted and can be consumed
- The stream info shows the correct number of replicas and the configured retention policy

## Next steps

- **[NATS API reference](../api-reference.md)**: full documentation of `jetstream`, `config`, and `config.merge` parameters
- **[How to manage NATS users](./manage-users.md)**: create and manage cluster access accounts
