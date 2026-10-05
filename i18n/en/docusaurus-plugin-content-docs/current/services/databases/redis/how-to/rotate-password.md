---
title: "How to renew the Redis password"
sidebar_position: 3
---

# How to renew the Redis password

This guide explains how to generate a new password for a Redis cluster from the [Hikube console](https://console.hikube.cloud), for example after losing the initial password or as part of a periodic rotation.

## Prerequisites

- A **Redis** cluster with authentication enabled
- The list of applications that use this cluster, so you can update them right after the rotation

:::warning
Rotation immediately revokes the current password. Applications still using it lose access until they are updated.
:::

## Steps

### 1. Open the Security section

Open **DB & Messaging** → **Redis**, then the cluster concerned. The **Security** section reads: "Generate a new global password for this cluster. This action will revoke the current password."

### 2. Start the rotation

1. Click **Rotate password**.
2. In the **Rotate password** window, confirm with **Perform rotation**.

### 3. Copy the new password

The **Generated password** window displays the new password. Copy it into your password manager: it will not be shown again after the window is closed. Click **Done**.

### 4. Update your applications

Replace the old password in your applications' configuration (environment variables, Kubernetes secrets in your clusters, configuration files), then restart them if they do not reload their configuration on the fly.

## Verification

```bash
REDISCLI_AUTH='<new password>' redis-cli -h <host> -p 6379 ping
# PONG
```

## Further reading

- [Redis concepts](../concepts.md): authentication
- [Redis troubleshooting](../troubleshooting.md)
