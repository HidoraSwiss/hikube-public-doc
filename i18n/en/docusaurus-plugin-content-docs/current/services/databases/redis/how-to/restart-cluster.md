---
title: "How to restart a Redis cluster"
sidebar_position: 4
---

# How to restart a Redis cluster

This guide explains how to restart a Redis cluster from the [Hikube console](https://console.hikube.cloud), in particular to apply an authentication change or a new password.

## When to restart

Some changes are saved immediately but only reach the running Redis servers after the cluster restarts:

- enabling or disabling **Authentication required** on an existing cluster;
- [rotating the password](./rotate-password.md).

Until then, the servers keep their previous configuration. After authentication is enabled, connections without a password still work; after a rotation, the servers still accept the old password and refuse the new one.

While a restart is pending, the cluster page shows the **Restart required** banner, with a **Restart now** button.

## Prerequisites

- A **Redis** cluster with the status **Ready** in your project
- The right to edit this cluster

## What happens during the restart

All instances of the cluster restart at once, sentinels included:

- the cluster is unreachable for about a minute;
- open connections are closed and your applications must reconnect;
- data is kept.

:::warning
Plan the restart in a maintenance window or outside peak hours, and check that your applications can reconnect automatically.
:::

## Steps

### 1. Open the cluster page

1. Open **DB & Messaging** → **Redis**.
2. Open the cluster.

### 2. Start the restart

1. Click **Restart**, next to the **Edit** and **Delete** buttons. If the **Restart required** banner is shown, its **Restart now** button does the same.
2. The "Restart `<name>`?" window recalls the effect of the restart. Confirm with **Restart**.

The "Restart started" message confirms that the request was accepted. The restart continues in the background.

The console also offers the restart at the right time:

- after you save an authentication change from **Edit**: confirm with **Restart**, or click **Later** to postpone it; the **Restart required** banner then stays on the cluster page;
- in the window that shows the new password after a rotation, with the **Restart now** button.

:::note
A cluster that is still being created has nothing to restart yet: the request is refused. Wait a few minutes after the cluster reaches the status **Ready**, while it finishes starting, then start the restart again.
:::

## Verification

The cluster status does not change during a restart: it keeps showing **Ready**. The **Restart required** banner disappears once the restart has been taken into account. Then check that the instance has just restarted:

```bash
REDISCLI_AUTH='<password>' redis-cli -h <host> -p 6379 INFO server | grep uptime_in_seconds
```

After an authentication or password change, also check that the new configuration applies:

```bash
# Authentication enabled: a connection without a password is refused
redis-cli -h <host> -p 6379 ping
# NOAUTH Authentication required.

# New password accepted
REDISCLI_AUTH='<new password>' redis-cli -h <host> -p 6379 ping
# PONG
```

## Further reading

- [Renew the password](./rotate-password.md)
- [Change a Redis cluster's resources](./scale-resources.md)
- [Redis troubleshooting](../troubleshooting.md)
