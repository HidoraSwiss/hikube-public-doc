---
title: "How to change a cluster's resources"
sidebar_position: 2
---

# How to change a cluster's resources

This guide explains how to adjust an existing MongoDB cluster from the [Hikube console](https://console.hikube.cloud): disk size, version and external access.

## Prerequisites

- An existing **MongoDB** cluster in your project
- Sufficient project quotas for the new configuration

## What can be changed

| Parameter | Can be changed after creation |
|-----------|-------------------------------|
| **MongoDB Version** | Yes |
| **Disk size (GB)** | Yes |
| **External access** | Yes |
| **Preset** | No, "The resources preset cannot be changed after creation" |
| **Number of replicas** | No, "The mode cannot be changed after creation" |
| **Sharding** | No, the option is not in the edit form |

To change the preset, the number of replicas or the topology of an existing cluster, [contact support](mailto:support@hidora.io).

## Steps

### 1. Open the edit form

1. Open **DB & Messaging** → **MongoDB**.
2. Open the cluster, then click **Edit** (or use **Actions** → **Edit** in the list).

The **Edit MongoDB cluster** page shows the **Cluster settings** card and the impact on the project quotas.

### 2. Adjust the settings

- **Disk size (GB)**: enter the new capacity.
- **MongoDB Version**: select the target version (6.0, 7.0 or 8.0).
- **External access**: enable or disable exposure on the public Internet.

:::tip
MongoDB only supports major version upgrades from one version to the next (6.0 → 7.0 → 8.0). The form offers all versions, including a version jump or a lower version: do not skip a version and do not go back.
:::

### 3. Save

Click **Save**. The "Cluster updated" message confirms the change. If the new configuration exceeds the project quotas, the button stays disabled.

## Verification

The cluster page shows the new values in the **MongoDB Version** and **Allocated Size** cards. From `mongosh`, check the space used:

```javascript
db.stats({ scale: 1024 * 1024 })
```

## Further reading

- [MongoDB concepts](../concepts.md): replication, presets, network access
- [Configure sharding](./configure-sharding.md)
