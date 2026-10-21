---
title: "How to restart a cluster — PostgreSQL"
sidebar_label: "How to restart a cluster"
sidebar_position: 5
---

# How to restart a cluster

This guide explains how to restart a PostgreSQL cluster from the [Hikube console](https://console.hikube.cloud), for example when an instance no longer behaves normally.

## Prerequisites

- A **PostgreSQL** cluster with the status **Ready** in your project
- The right to edit this cluster

## What happens during the restart

The restart is rolling: the replicas restart first, then the primary.

- Reads keep being served throughout the operation.
- Writes are paused for about forty seconds while the primary restarts.
- Data is kept.

On a cluster with 1 replica, no other instance takes over: the database is unavailable while it restarts.

:::warning
Plan the restart in a maintenance window or outside peak hours, and check that your applications can reconnect and retry a rejected write.
:::

## Steps

### 1. Open the cluster page

1. Open **DB & Messaging** → **PostgreSQL**.
2. In the **PostgreSQL Clusters** list, open the cluster.

### 2. Start the restart

1. Click **Restart**, next to the **Edit** and **Delete** buttons.
2. The "Restart `<name>`?" window recalls the effect of the restart. Confirm with **Restart**.

The "Restart started" message confirms that the request was accepted. The restart continues in the background.

:::note
A cluster that is still being created has nothing to restart yet: the request is refused. Wait until the cluster has the status **Ready**, then start the restart again.
:::

## Verification

The cluster status does not change during a restart: it keeps showing **Ready**. To confirm the restart, check the start time of the primary:

```bash
psql "host=<host> port=5432 dbname=<database> user=<user> sslmode=require" \
  -c "SELECT pg_postmaster_start_time();"
```

The returned time matches the moment of the restart.

## Further reading

- [PostgreSQL concepts](../concepts.md): replication and high availability
- [Scale a cluster's resources](./scale-resources.md)
