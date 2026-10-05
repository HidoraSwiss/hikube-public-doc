---
title: "How to manage users"
---

# How to manage NATS users

:::info Availability
NATS is not yet available as self-service in the [Hikube console](https://console.hikube.cloud).
To provision an instance or change its configuration, [contact support](mailto:support@hidora.io).
:::

This guide explains how to organize the users of a NATS cluster on Hikube and how to check their access from the `nats` CLI.

Users (name and password) are part of the instance configuration. Creating or deleting users, or renewing their passwords, is requested from support. This option is not offered in the console; contact support.

## Prerequisites

- A **NATS** cluster provisioned on Hikube and its URL (`<nats-url>`)
- The **nats** CLI installed locally

## Steps

### 1. Define the accounts you need

Create separate users per purpose for fine-grained access control, for example:

| User | Purpose |
|-------------|-------|
| `admin` | Administration (stream creation, server reports) |
| `appuser` | Application account, one per service |
| `monitoring` | Monitoring |

### 2. Request the creation of the users

Send the list of users to [support](mailto:support@hidora.io), stating the project and the instance name. Support sends you the passwords; store them in a password manager.

### 3. Test the connection with the nats CLI

Save one context per user, then test publishing:

```bash
nats context save hikube-admin --server <nats-url> --user admin --password <admin-password>
nats --context hikube-admin pub test "Hello from admin"
```

**Expected result:**

```console
Published 16 bytes to "test"
```

**Testing an incorrect password:**

```bash
nats pub test "This should fail" --server <nats-url> --user admin --password wrongpassword
```

**Expected result:**

```console
nats: error: Authorization Violation
```

:::warning
If external access is enabled on the instance, the NATS cluster is reachable from the Internet. Make sure every user has a strong password.
:::

### 4. Check active connections

With an account that has sufficient rights, view the active connections:

```bash
nats --context hikube-admin server report connections
```

:::note
The `nats server …` reports require access to the NATS server's system account. If the command is refused, ask support for the connection status.
:::

## Verification

The configuration is correct if:

- Each user can connect with their password
- An incorrect password is rejected (`Authorization Violation`)

## Further reading

- **[Concepts](../concepts.md)**: user management and JetStream
- **[How to configure JetStream](./configure-jetstream.md)**: enable message persistence and streaming
