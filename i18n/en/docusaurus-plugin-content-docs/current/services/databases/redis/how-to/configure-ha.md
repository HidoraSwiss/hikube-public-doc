---
title: "How to configure Redis high availability"
sidebar_position: 1
---

# How to configure Redis high availability

This guide explains how to create a highly available Redis cluster from the [Hikube console](https://console.hikube.cloud). The service uses **Redis Sentinel** to provide automatic failover as soon as the cluster has at least 2 replicas. Three sentinels are always deployed, whatever the number of replicas.

## Prerequisites

- A Hikube **project** with sufficient quotas: CPU, memory and storage consumption is multiplied by the number of replicas
- Knowledge of Redis basics (see the [quick start](../quick-start.md))

:::warning
High availability is decided **at creation**: the number of replicas cannot be changed afterwards. To convert an existing cluster, [contact support](mailto:support@hidora.io) or create a new cluster.
:::

## Steps

### 1. Open the wizard

Open **DB & Messaging** → **Redis**, then click **Create a cluster**. Fill in the **Cluster Name** and click **Next**.

### 2. Configure at least 3 replicas

At the **Configuration** step:

| Field | Recommended value in production |
|-------|---------------------------------|
| **Number of replicas** | `3` (or `5` to tolerate two failures) |
| **Preset** | `medium` or higher, depending on the dataset size |
| **Volume size (GB)** | Greater than the expected data volume |
| **Enable authentication** | Enabled |
| **Public network** | Disabled, unless you need access from the Internet |

:::tip
The quorum relies on the three sentinels, not on the number of replicas: 2 replicas are enough for failover, 3 or more let you tolerate more failures.
:::

### 3. Create the cluster

At the **Summary** step, check the **Replicas** line and the estimated cost, then click **Create**. Copy the password displayed at the **Done** step.

### 4. Understanding automatic failover

When the master becomes unavailable:

1. The Sentinels detect the failure and agree by quorum.
2. A replica is promoted to new master.
3. The other replicas are reconfigured to follow it.

With the public network enabled, the address displayed in the **Host** field points to the current master: your clients do not have to change address after a failover, but open connections are dropped and must be re-established.

:::note
Configure your Redis clients with automatic reconnection and retry delays to absorb the switchover.
:::

## Verification

- On the cluster page, **General** section, the **Replicas** field shows the chosen number.
- The **Connection** section shows the **Status** **Ready**.
- From a client, check the role of the node you reached:

```bash
redis-cli -h <host> -p 6379 INFO replication
```

**Expected result:** `role:master` and `connected_slaves` equal to the number of replicas minus one.

## Further reading

- [Redis concepts](../concepts.md): Sentinel, persistence, authentication
- [Change resources](./scale-resources.md)
