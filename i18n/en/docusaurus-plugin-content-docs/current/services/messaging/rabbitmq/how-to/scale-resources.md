---
title: "How to change a cluster's configuration"
---

# How to change a RabbitMQ cluster's configuration

This guide explains which parameters of a RabbitMQ cluster can be changed after its creation from the [Hikube console](https://console.hikube.cloud), and how to proceed.

## Prerequisites

- A **RabbitMQ cluster** created in your project
- Enough project quota if you increase the disk size

## Editable parameters

| Parameter | Editable after creation | Note |
|-----------|---------------------------|----------|
| **RabbitMQ Version** | Yes | Current version and higher versions among 4.2, 4.1, 4.0, 3.13 |
| **Disk size (GB)** | Yes | Capacity per node, upwards only, within the project's storage quota |
| **External access** | Yes | See [Configure external access](./configure-external-access.md) |
| **Preset** | No | "The resources preset cannot be changed after creation" |
| **Number of replicas** | No | "The mode cannot be changed after creation" |

## Steps

### 1. Open the edit form

1. In the **DB & Messaging** → **RabbitMQ** menu, click the cluster.
2. Click **Edit**. You can also open the cluster's action menu in the list and choose **Edit**.

The **Edit RabbitMQ cluster** page displays the **Cluster settings** card. The **Preset** and **Number of replicas** fields are greyed out.

### 2. Adjust the parameters

- **RabbitMQ Version**: select the target version. The form only offers the current version and the higher versions.
- **Disk size (GB)**: enter the new capacity per node. The size can only increase: a lower value displays "The disk size cannot be reduced: N GB minimum." and is not saved.
- **External access**: turn the switch on or off.

:::warning Version change
When you change the version, the warning "The cluster instances will restart" is displayed: an upgraded version cannot be downgraded. Changing the version recreates the RabbitMQ nodes one by one: with a single replica, the cluster is unavailable during the restart (about one to two minutes) and clients must reconnect. The addresses in the **Internal** and **External** zones do not change. Test the version change on a non-production cluster before applying it to a production cluster, and check that your clients are compatible with the target version.
:::

### 3. Save

Click **Save**. The message "Cluster updated" confirms that the parameters have been applied and the console returns to the detail page.

If the project quota does not allow the new configuration, the **Save** button stays disabled.

:::note
The API applies the same rules: a version lower than the current one is refused with code `140203`, a disk size smaller than the current one with code `140204`.
:::

## Change the preset or the number of replicas

The preset and the number of replicas are set at creation. Two options:

- **Create a new cluster** with the desired configuration, recreate the vhosts and users, then switch your applications over;
- **Contact support**: these options are not offered in the console; [contact support](mailto:support@hidora.io).

## Verification

On the cluster detail page, the **General Information** section shows the updated **Version** and **Volume Size**, and the **Connection** section shows the state of **External Access**.

## Further reading

- [Concepts](../concepts.md): deployment modes and presets
- [Manage vhosts and users](./manage-vhosts-users.md)
