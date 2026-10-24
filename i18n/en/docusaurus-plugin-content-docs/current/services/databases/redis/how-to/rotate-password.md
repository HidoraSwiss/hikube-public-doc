---
title: "How to renew the Redis password"
sidebar_position: 3
---

# How to renew the Redis password

This guide explains how to generate a new password for a Redis cluster from the [Hikube console](https://console.hikube.cloud), for example after losing the initial password or as part of a periodic rotation.

## Prerequisites

- A **Redis** cluster with authentication enabled. On a cluster without authentication, the rotation is refused: first enable **Authentication required** from **Edit** (see [Change the resources](./scale-resources.md)).
- The list of applications that use this cluster, so you can update them right after the restart

:::warning
The new password only applies after a [cluster restart](./restart-cluster.md). Until then, the Redis servers still accept the old password and refuse the new one. The restart briefly interrupts the cluster (about a minute): plan the rotation in a maintenance window.
:::

## Steps

### 1. Open the Security section

Open **DB & Messaging** → **Redis**, then the cluster concerned. The **Security** section lets you generate a new global password for this cluster.

### 2. Start the rotation

1. Click **Rotate password**.
2. In the **Rotate password** window, confirm with **Perform rotation**.

### 3. Copy the new password

The **Generated password** window displays the new password. Copy it into your password manager: it will not be shown again after the window is closed.

The window reminds you: "The new password is accepted only after the cluster restarts; until then, the servers still accept the previous one."

### 4. Restart the cluster

1. In the same window, click **Restart now**, then confirm with **Restart**.
2. To restart later, click **Done**: the cluster page shows the **Restart required** banner until the restart, with a **Restart now** button.

The cluster is unreachable for about a minute. See [Restart a cluster](./restart-cluster.md).

### 5. Update your applications

Once the cluster has restarted, replace the old password in your applications' configuration (environment variables, Kubernetes secrets in your clusters, configuration files), then restart them if they do not reload their configuration on the fly. Before the cluster restarts, the new password is still refused.

## Verification

```bash
REDISCLI_AUTH='<new password>' redis-cli -h <host> -p 6379 ping
# PONG
```

If the command answers `WRONGPASS`, the cluster has not restarted yet: check whether the **Restart required** banner is shown on the cluster page.

## Further reading

- [Restart a cluster](./restart-cluster.md)
- [Redis concepts](../concepts.md): authentication
- [Redis troubleshooting](../troubleshooting.md)
