---
title: "How to change a Redis cluster's resources"
sidebar_position: 2
---

# How to change a Redis cluster's resources

This guide explains how to adjust an existing Redis cluster from the [Hikube console](https://console.hikube.cloud): preset (CPU and memory), volume size, version, external access and authentication.

## Prerequisites

- An existing **Redis** cluster in your project
- Sufficient project quotas for the new configuration

## What can be changed

| Parameter | Can be changed after creation |
|-----------|-------------------------------|
| **Redis Version** | Yes |
| **Preset** | Yes |
| **Volume Size (GB)** | Yes |
| **External access** | Yes |
| **Authentication required** | Yes |
| **Number of replicas** | No, "The mode cannot be changed after creation" |

To change the number of replicas, [contact support](mailto:support@hidora.io).

## Steps

### 1. Open the edit form

1. Open **DB & Messaging** → **Redis**.
2. Open the cluster, then click **Edit** (or use **Actions** → **Edit** in the list).

The **Edit cluster** page shows the **Cluster settings** card and the impact on the project quotas.

### 2. Adjust the settings

- **Preset**: choose a larger preset if memory is saturated. The preset's memory caps the volume of data Redis can keep in memory.
- **Volume Size (GB)**: "Storage capacity allocated to each node in the cluster".
- **Redis Version**: `8 (Latest)` or `7`.
- **External access**: "Allow access to the cluster from outside the private network".
- **Authentication required**: "Enable password protection".

### 3. Save

Click **Save changes**. The "Changes saved" message confirms the change.

:::warning
Disabling authentication on a cluster exposed on the public network makes your data accessible to anyone who knows the address. Keep authentication enabled.
:::

## Verification

- The cluster page, **General** section, shows the new **Version** and the new **Size**.
- From a client, check the available memory:

```bash
redis-cli -h <host> -p 6379 INFO memory | grep -E 'used_memory_human|maxmemory_human'
```

## Further reading

- [Configure high availability](./configure-ha.md)
- [Renew the password](./rotate-password.md)
