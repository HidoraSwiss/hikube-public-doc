---
title: "How to scale a cluster's resources"
sidebar_position: 2
---

# How to scale a cluster's resources

This guide explains how to adjust an existing PostgreSQL cluster from the [Hikube console](https://console.hikube.cloud): instance preset (CPU and memory), disk size, version and external access.

## Prerequisites

- An existing **PostgreSQL** cluster in your project
- Sufficient project quotas for the new configuration

## What can be changed

| Parameter | Can be changed after creation |
|-----------|---------------------------|
| **PostgreSQL Version** | Yes |
| **Preset** | Yes |
| **Disk size (GB)** | Yes |
| **External access** | Yes |
| **Number of replicas** | No, "The mode cannot be changed after creation" |

To change the number of replicas of an existing cluster, [contact support](mailto:support@hidora.io).

## Available presets

| Preset | CPU | Memory |
|--------|-----|---------|
| `nano` | 250m | 128Mi |
| `micro` | 500m | 256Mi |
| `small` | 1 | 512Mi |
| `medium` | 1 | 1Gi |
| `large` | 2 | 2Gi |
| `xlarge` | 4 | 4Gi |
| `2xlarge` | 8 | 8Gi |

The list displayed in the form is authoritative. Resources apply to each node of the cluster.

## Steps

### 1. Open the edit form

1. Open **DB & Messaging** → **PostgreSQL**.
2. In the **PostgreSQL Clusters** list, open the cluster's **Actions** menu and choose **Edit**, or open the cluster page and click **Edit**.

The **Edit PostgreSQL cluster** page displays the **Cluster settings** card and the configuration's impact on the project quotas.

### 2. Adjust the parameters

- **Preset**: select a higher preset to increase the CPU and memory of each node.
- **Disk size (GB)**: enter the new capacity.
- **PostgreSQL Version**: select the target version. The form offers all versions, but only an upgrade is possible: a lower version is rejected by the platform, the cluster stays on its current version and the configuration remains in a failed state until you select a higher or equal version again. A major version upgrade (for example 17 → 18) is done in place: the instance is stopped during the data migration.
- **External access**: enable or disable exposure on the public Internet.

### 3. Save

Click **Save**. The "Cluster updated" message confirms the change. If the new configuration exceeds the project quotas, the button stays disabled.

:::warning
Changing the preset or the version restarts the instances. On a 1-replica cluster, the database is unavailable during the restart, and throughout the migration during a major version upgrade; schedule the operation outside peak hours.
:::

:::tip
Increase the disk size before it is full. Monitor the space used with `SELECT pg_size_pretty(pg_database_size(current_database()));`.
:::

## Verification

The cluster page shows the new values in the **PostgreSQL Version**, **Allocated Size** and **External Access** cards, and the status returns to **Ready** once the update is applied.

## Going further

- [PostgreSQL concepts](../concepts.md): replication, presets, network access
- [Manage users and databases](./manage-users-databases.md)
