---
title: "How to manage users"
---

# How to manage NATS users

This guide explains how to create and manage users for a NATS cluster on Hikube declaratively via Kubernetes manifests.

## Prerequisites

- **kubectl** configured with your Hikube kubeconfig
- A **NATS** cluster deployed on Hikube (or a manifest ready to deploy)
- (Optional) the **nats** CLI installed locally to test connections

## Steps

### 1. Add users

Users are declared in the `users` section of the manifest. Each user is identified by a name and has a password.

```yaml title="nats-users.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: NATS
metadata:
  name: my-nats
spec:
  replicas: 3
  resourcesPreset: small

  jetstream:
    enabled: true
    size: 10Gi

  users:
    admin:
      password: SecureAdminPassword
    appuser:
      password: AppUserPassword456
    monitoring:
      password: MonitoringPassword789
```

**User parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `users[name].password` | `string` | Password associated with the user |

:::tip
Create separate users per application for granular access control. Use an **admin** account for administration, **application** accounts per service, and a dedicated **monitoring** account for supervision.
:::

### 2. Apply the changes

```bash
kubectl apply -f nats-users.yaml
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

### 3. Test the connection with the nats CLI

Open a port-forward to the NATS service:

```bash
kubectl port-forward svc/my-nats 4222:4222
```

Test the connection with each user:

**Connection with the admin user:**

```bash
nats pub test "Hello from admin" \
  --server nats://admin:SecureAdminPassword@127.0.0.1:4222
```

**Expected output:**

```console
Published 16 bytes to "test"
```

**Connection with the appuser user:**

```bash
nats pub app.events "Hello from appuser" \
  --server nats://appuser:AppUserPassword456@127.0.0.1:4222
```

**Expected output:**

```console
Published 18 bytes to "app.events"
```

**Test with an incorrect password:**

```bash
nats pub test "This should fail" \
  --server nats://admin:wrongpassword@127.0.0.1:4222
```

**Expected output:**

```console
nats: error: Authorization Violation
```

:::warning
If `external: true` is enabled, the NATS cluster is accessible from outside the Kubernetes cluster. Ensure that all users have strong passwords.
:::

### 4. Check active connections

You can check active connections on the NATS cluster:

```bash
nats server report connections \
  --server nats://admin:SecureAdminPassword@127.0.0.1:4222
```

**Expected output:**

```console
╭──────────────────────────────────────────────────────────╮
│                   Connection Report                       │
├──────────┬──────────┬──────────┬──────────┬──────────────┤
│ Server   │ Conns    │ In Msgs  │ Out Msgs │ In Bytes     │
├──────────┼──────────┼──────────┼──────────┼──────────────┤
│ my-nats-0│ 2        │ 5        │ 3        │ 128B         │
│ my-nats-1│ 1        │ 2        │ 1        │ 64B          │
│ my-nats-2│ 0        │ 0        │ 0        │ 0B           │
╰──────────┴──────────┴──────────┴──────────┴──────────────╯
```

To see connection details per user:

```bash
nats server report connz \
  --server nats://admin:SecureAdminPassword@127.0.0.1:4222
```

## Verification

The configuration is successful if:

- All NATS pods are in `Running` state after the update
- Each user can connect with their password
- An incorrect password is rejected (`Authorization Violation`)
- Active connections are visible in the server report

## Next steps

- **[NATS API reference](../api-reference.md)**: full documentation of `users` parameters
- **[How to configure JetStream](./configure-jetstream.md)**: enable message persistence and streaming
