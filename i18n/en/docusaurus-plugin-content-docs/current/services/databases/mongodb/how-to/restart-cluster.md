---
title: "How to restart a cluster — MongoDB"
sidebar_label: "How to restart a cluster"
sidebar_position: 4
---

# How to restart a cluster

This guide explains how to restart a MongoDB cluster from the [Hikube console](https://console.hikube.cloud), for example when a member no longer behaves normally.

## Prerequisites

- A **MongoDB** cluster with the status **Ready** in your project
- The right to edit this cluster

## What happens during the restart

All pods of the cluster are recreated at once:

- the cluster is unreachable for a few seconds while the members restart;
- open connections are closed and your applications must reconnect;
- data is kept.

On a sharded cluster, the `mongos` routers are not restarted.

:::warning
Plan the restart in a maintenance window or outside peak hours, and check that your applications can reconnect automatically.
:::

## Steps

### 1. Open the cluster page

1. Open **DB & Messaging** → **MongoDB**.
2. Open the cluster.

### 2. Start the restart

1. Click **Restart**, next to the **Edit** and **Delete** buttons.
2. The "Restart `<name>`?" window recalls the effect of the restart. Confirm with **Restart**.

The "Restart started" message confirms that the request was accepted. The restart continues in the background.

:::note
A cluster that is still being created has nothing to restart yet: the request is refused. Wait until the cluster has the status **Ready**, then start the restart again.
:::

## Verification

The cluster status does not change during a restart: it keeps showing **Ready**. To confirm the restart, check how many seconds the member has been running:

```bash
mongosh "mongodb://<host>:27017/admin?directConnection=true&authSource=admin" --username <user> \
  --eval "db.serverStatus().uptime"
```

A low value confirms that the member has just restarted.

## Further reading

- [MongoDB concepts](../concepts.md): replication, high availability and sharding
- [Change a cluster's resources](./scale-resources.md)
