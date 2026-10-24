---
title: "How to restart a cluster — MariaDB"
sidebar_label: "How to restart a cluster"
sidebar_position: 5
---

# How to restart a cluster

This guide explains how to restart a MariaDB cluster from the [Hikube console](https://console.hikube.cloud), for example when an instance no longer behaves normally.

## Prerequisites

- A **MariaDB** cluster with the status **Ready** in your project
- The right to edit this cluster

## What happens during the restart

All instances of the cluster restart at once:

- the cluster is unreachable for a few seconds while the instances restart;
- open connections are closed and your applications must reconnect;
- data is kept.

:::warning
Plan the restart in a maintenance window or outside peak hours, and check that your applications can reconnect automatically.
:::

## Steps

### 1. Open the cluster page

1. Open **DB & Messaging** → **MariaDB**.
2. Open the cluster.

### 2. Start the restart

1. Click **Restart**, next to the **Edit** and **Delete** buttons.
2. The "Restart `<name>`?" window recalls the effect of the restart. Confirm with **Restart**.

The "Restart started" message confirms that the request was accepted. The restart continues in the background.

:::note
A cluster that is still being created has nothing to restart yet: the request is refused. Wait a few minutes after the cluster reaches the status **Ready**, while it finishes starting, then start the restart again.
:::

## Verification

The cluster status does not change during a restart: it keeps showing **Ready**. To confirm the restart, check how many seconds the instance has been running:

```bash
mysql -h <host> -P 3306 -u <user> -p -e "SHOW GLOBAL STATUS LIKE 'Uptime';"
```

A low value confirms that the instance has just restarted.

## Further reading

- [MariaDB concepts](../concepts.md): replication and high availability
- [Scale a cluster's resources](./scale-resources.md)
