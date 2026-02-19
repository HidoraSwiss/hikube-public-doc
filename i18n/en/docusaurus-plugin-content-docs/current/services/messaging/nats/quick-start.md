---
sidebar_position: 2
title: Quick Start
---

# Deploy NATS in 5 minutes

This guide walks you step by step through deploying your first **NATS cluster** on Hikube, from the YAML manifest to initial messaging tests.

---

## Objectives

By the end of this guide, you will have:

- A **NATS cluster** deployed and running on Hikube
- A **high availability** configuration with multiple replicas
- **JetStream** enabled for persistent message storage
- A **user** configured to connect to your cluster

---

## Prerequisites

Before you begin, make sure you have:

- **kubectl** configured with your Hikube kubeconfig
- **Admin rights** on your tenant
- A dedicated **namespace** to host your NATS cluster
- The **NATS CLI** (`nats`) installed on your workstation (optional, for testing)

---

## Step 1: Create the NATS manifest

Create a `nats.yaml` file with the following configuration:

```yaml title="nats.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: NATS
metadata:
  name: example
spec:
  external: false

  replicas: 3
  resourcesPreset: small
  storageClass: replicated

  jetstream:
    enabled: true
    size: 10Gi

  users:
    user1:
      password: mypassword

  config:
    merge:
      max_payload: 16MB
      write_deadline: 2s
      debug: false
      trace: false
```

:::tip
If `resources` is defined, the `resourcesPreset` value is ignored. See the [API Reference](./api-reference.md) for the full list of available options.
:::

---

## Step 2: Deploy the NATS cluster

Apply the manifest and verify that the deployment starts:

```bash
# Apply the manifest
kubectl apply -f nats.yaml
```

Check the cluster status (may take 1-2 minutes):

```bash
kubectl get nats
```

**Expected output:**

```console
NAME      READY   AGE     VERSION
example   True    2m      0.10.0
```

---

## Step 3: Pod verification

Verify that all pods are in `Running` state:

```bash
kubectl get pods | grep nats
```

**Expected output:**

```console
nats-example-0    1/1     Running   0   2m
nats-example-1    1/1     Running   0   2m
nats-example-2    1/1     Running   0   2m
```

With `replicas: 3`, you get **3 NATS pods** forming a high-availability cluster with Raft consensus for JetStream.

| Prefix | Role | Count |
|--------|------|-------|
| `nats-example-*` | **NATS Server** (messaging + JetStream) | 3 |

---

## Step 4: Retrieve credentials

NATS user passwords are stored in a Kubernetes Secret:

```bash
kubectl get secret nats-example-credentials -o json | jq -r '.data | to_entries[] | "\(.key): \(.value|@base64d)"'
```

**Expected output:**

```console
user1: mypassword
```

---

## Step 5: Connection and testing

### Port-forward the NATS service

```bash
kubectl port-forward svc/nats-example 4222:4222 &
```

### Publish and consume test

```bash
# Create a JetStream stream
nats -s nats://user1:mypassword@localhost:4222 stream add EVENTS \
  --subjects "events.*" --storage file --replicas 3 --retention limits \
  --max-msgs -1 --max-bytes -1 --max-age 24h --discard old

# Publish a message
nats -s nats://user1:mypassword@localhost:4222 pub events.test "Hello Hikube!"

# Consume the message
nats -s nats://user1:mypassword@localhost:4222 stream view EVENTS
```

**Expected output:**

```console
[1] Subject: events.test Received: 2025-01-15T10:30:00Z
  Hello Hikube!
```

:::note
If you don't have the NATS CLI, you can install it from [nats-io/natscli](https://github.com/nats-io/natscli).
:::

---

## Step 6: Quick troubleshooting

### Pods in CrashLoopBackOff

```bash
# Check the logs of the failing pod
kubectl logs nats-example-0

# Check the pod events
kubectl describe pod nats-example-0
```

**Common causes:** insufficient memory (`resources.memory` too low), JetStream volume full (`jetstream.size` too low).

### NATS not accessible

```bash
# Check that the services exist
kubectl get svc | grep nats

# Check the NATS service
kubectl describe svc nats-example
```

**Common causes:** port-forward not active, wrong port (4222 for clients), incorrect credentials.

### JetStream not working

```bash
# Check JetStream status in the logs
kubectl logs nats-example-0 | grep -i jetstream

# Check the JetStream report
nats -s nats://user1:mypassword@localhost:4222 server report jetstream
```

**Common causes:** `jetstream.enabled: false` in the manifest, insufficient JetStream storage space, not enough replicas for the requested replication factor.

### General diagnostic commands

```bash
# Recent events in the namespace
kubectl get events --sort-by=.metadata.creationTimestamp

# Detailed NATS cluster status
kubectl describe nats example
```

---

## Step 7: Cleanup

To delete the test resources:

```bash
kubectl delete -f nats.yaml
```

:::warning
This action deletes the NATS cluster and all associated data. This operation is **irreversible**.
:::

---

## Summary

You have deployed:

- A NATS cluster with **3 replicas** in high availability
- **JetStream** enabled for message persistence
- An **authenticated user** to connect to the cluster
- Persistent storage for data durability

---

## Next steps

- **[API Reference](./api-reference.md)**: Full configuration of all NATS options
- **[Overview](./overview.md)**: Detailed architecture and NATS use cases on Hikube
