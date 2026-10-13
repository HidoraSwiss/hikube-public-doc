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
| **Redis Version** | Yes, to a higher version only |
| **Preset** | Yes |
| **Volume Size (GB)** | Yes, upwards only |
| **External access** | Yes |
| **Authentication required** | Yes |
| **Number of replicas** | No, "The mode cannot be changed after creation" |

To change the number of replicas, [contact support](mailto:support@hidora.io).

## Steps

### 1. Open the edit form

1. Open **DB & Messaging** → **Redis**.
2. Open the cluster, then click **Edit** (or use **Actions** → **Edit** in the list).

The **Edit cluster** page shows the **Cluster settings** card and the impact on the project quotas, which also counts the three sentinels at the size of the preset.

### 2. Adjust the settings

- **Preset**: choose a larger preset if memory is saturated. The preset's memory caps the volume of data Redis can keep in memory. A cluster created with a former preset (`small`, `medium`…) keeps it as long as you do not choose another one.
- **Volume Size (GB)**: "Storage capacity allocated to each node in the cluster". Enter a size at least equal to the current size.
- **Redis Version**: `8 (Latest)` or `7`. The form offers both versions, but only the current version or a higher one is accepted: on a cluster running `8`, do not choose `7`.
- **External access**: "Allow access to the cluster from outside the private network".
- **Authentication required**: "Enable password protection".

### 3. Save

Click **Save changes**. The "Changes saved" message confirms the change.

A lower version or a reduced volume size is refused: the console displays "An error occurred while updating the cluster.", followed by the reason returned by the API (codes `120203` for the version, `120204` for the volume).

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
