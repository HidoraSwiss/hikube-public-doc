---
title: "How to scale a cluster's resources"
sidebar_position: 2
---

# How to scale a cluster's resources

This guide explains how to adjust an existing MariaDB cluster from the [Hikube console](https://console.hikube.cloud): disk size, version and external access.

## Prerequisites

- An existing **MariaDB** cluster in your project
- Sufficient project quotas for the new configuration

## What can be changed

| Parameter | Can be changed after creation |
|-----------|---------------------------|
| **MariaDB Version** | Yes |
| **Disk size (GB)** | Yes |
| **External access** | Yes |
| **Preset** | No, "The resources preset cannot be changed after creation" |
| **Number of replicas** | No, "The mode cannot be changed after creation" |

To change the preset (CPU and memory) or the number of replicas of an existing cluster, [contact support](mailto:support@hidora.io).

## Steps

### 1. Open the edit form

1. Open **DB & Messaging** → **MariaDB**.
2. Open the cluster, then click **Edit** (or use **Actions** → **Edit** in the list).

The **Edit MariaDB cluster** page displays the **Cluster settings** card and the impact on the project quotas.

### 2. Adjust the parameters

- **Disk size (GB)**: enter the new capacity.
- **MariaDB Version**: select the target version (10.6, 10.11, 11.4 or 11.8). The form also offers versions lower than the current one: do not go back to an earlier version, MariaDB does not support downgrades.
- **External access**: enable or disable exposure on the public Internet.

### 3. Save

Click **Save**. The "Cluster updated" message confirms the change. If the new configuration exceeds the project quotas, the button stays disabled.

:::tip
Increase the disk size before it is full. To measure the space used per database:

```sql
SELECT table_schema, ROUND(SUM(data_length + index_length) / 1024 / 1024, 1) AS size_mb
FROM information_schema.tables
GROUP BY table_schema;
```
:::

## Verification

The cluster page shows the new values in the **MariaDB Version** and **Allocated Size** cards, and the **External Access** state in the **Connection and network** card.

## Going further

- [MariaDB concepts](../concepts.md): replication, presets, network access
- [Manage users and databases](./manage-users-databases.md)
