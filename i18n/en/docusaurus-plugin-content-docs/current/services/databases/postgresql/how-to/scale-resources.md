---
title: "How to scale a cluster's resources — PostgreSQL"
sidebar_label: "How to scale a cluster's resources"
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
| **PostgreSQL Version** | Yes, to a higher version only |
| **Preset** | Yes |
| **Disk size (GB)** | Yes, upwards only |
| **External access** | Yes |
| **Number of replicas** | No, "The mode cannot be changed after creation". The form shows the current value (1, 2 or 3) |

To change the number of replicas of an existing cluster, [contact support](mailto:support@hidora.io).

## Available presets

| Preset | CPU | Memory |
|--------|-----|---------|
| `u1.medium` | 1 | 4Gi |
| `u1.large` | 2 | 8Gi |
| `u1.xlarge` | 4 | 16Gi |
| `u1.2xlarge` | 8 | 32Gi |
| `u1.4xlarge` | 16 | 64Gi |
| `u1.8xlarge` | 32 | 128Gi |
| `s1.small` | 1 | 2Gi |
| `s1.medium` | 2 | 4Gi |
| `s1.large` | 4 | 8Gi |
| `s1.xlarge` | 8 | 16Gi |
| `s1.2xlarge` | 16 | 32Gi |
| `s1.4xlarge` | 32 | 64Gi |
| `m1.large` | 2 | 16Gi |
| `m1.xlarge` | 4 | 32Gi |
| `m1.2xlarge` | 8 | 64Gi |
| `m1.4xlarge` | 16 | 128Gi |
| `m1.8xlarge` | 32 | 256Gi |

Presets are the [virtual machine](../../../compute/overview.md) sizes of the `u1`, `s1` and `m1` series. The list displayed in the form is authoritative. Resources apply to each node of the cluster.

A cluster created with a former preset (`small`, `medium`…) keeps it: the form shows it as is and saves it unchanged as long as you do not choose another one. If the cluster's resources were set outside its preset, the form says so with the mention “(override)”.

## Steps

### 1. Open the edit form

1. Open **DB & Messaging** → **PostgreSQL**.
2. In the **PostgreSQL Clusters** list, open the cluster's **Actions** menu and choose **Edit**, or open the cluster page and click **Edit**.

The **Edit PostgreSQL cluster** page displays the **Cluster settings** card and the configuration's impact on the project quotas.

### 2. Adjust the parameters

- **Preset**: select a higher preset to increase the CPU and memory of each node.
- **Disk size (GB)**: enter the new capacity, at least equal to the current size. A lower value displays "The disk size cannot be reduced: N GB minimum." and is not saved.
- **PostgreSQL Version**: select the target version. The form only offers the current version and the higher versions. A major version upgrade (for example 17 → 18) is done in place: the instance is stopped during the data migration.
- **External access**: enable or disable exposure on the public Internet.

When you change the preset or the version, the warning "The cluster instances will restart" is displayed; for a version change, it reminds you that an upgraded version cannot be downgraded.

### 3. Save

Click **Save**. The "Cluster updated" message confirms the change. If the new configuration exceeds the project quotas, the button stays disabled.

:::warning
Changing the preset or the version restarts the instances as soon as you save. On a 1-replica cluster, the database is unavailable during the restart, and throughout the migration during a major version upgrade; schedule the operation outside peak hours.
:::

:::note
The API applies the same rules: a version lower than the current one is refused with code `80203`, a disk size smaller than the current one with code `80204`.
:::

:::tip
Increase the disk size before it is full. Monitor the space used with `SELECT pg_size_pretty(pg_database_size(current_database()));`.
:::

## Verification

The cluster page shows the new values in the **PostgreSQL Version**, **Allocated Size** and **External Access** cards, and the status returns to **Ready** once the update is applied.

## Going further

- [PostgreSQL concepts](../concepts.md): replication, presets, network access
- [Manage users and databases](./manage-users-databases.md)
