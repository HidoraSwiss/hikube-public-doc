---
title: "How to manage vhosts and users"
---

# How to manage vhosts and users

This guide explains how to add and delete virtual hosts (vhosts), create RabbitMQ users, manage their rights per vhost and renew their password from the [Hikube console](https://console.hikube.cloud).

## Prerequisites

- A **RabbitMQ cluster** created in your project (see the [quick start](../quick-start.md))
- Access to the cluster detail page: menu **DB & Messaging** → **RabbitMQ**, then click the cluster

## Add a vhost

1. On the cluster page, in the **VHosts** section, click **Add a VHost**.
2. In the **Create a VHost** window, enter the **VHost Name** (letters, digits, `_`, `.` and `-`, for example `production`).
3. Click **Create**. The message "VHost created" confirms the operation and the vhost appears in the list.

## Delete a vhost

1. In the **VHosts** section, open the vhost's action menu.
2. Choose **Delete VHost**.
3. Enter the exact name of the vhost to confirm, then click **Permanently delete**.

:::warning
Deleting a vhost deletes its exchanges, queues and messages. The default vhost `/`, if present, cannot be deleted.
:::

## Create a user

1. In the **Users** section, click **Create a user**.
2. Enter the **Username** (letters, digits, `_`, `.` and `-`).
3. In **Specific Access (VHosts)**, click **Add** for each vhost the user must access, then choose:
   - the **VHost name** from the list;
   - the **Rights**: **Administrator (Admin)** or **Read-only**.
4. Click **Create user**.

The console displays the password generated for the user.

:::warning Password displayed only once
Copy the password immediately: it will not be displayed again once you leave this screen. Then click **Done**.
:::

:::tip
Create one user per application, with the **Read-only** right for applications that only consume messages. This limits the impact of leaked credentials.
:::

## Change a user's rights

1. In the **Users** section, open the user's action menu and choose **Manage Access**.
2. The **Edit user** page lists their access per vhost. The **Username** cannot be changed.
3. Add an access with **Add**, change the **Rights** on a vhost, or remove an access with the delete icon on the row.
4. Click **Save**.

The user's password is not changed by this operation.

## Renew a user's password

1. In the user's action menu, choose **Change Password**.
2. The **Rotate password** window asks for confirmation. Click **Perform rotation**.
3. Copy the new password displayed, then click **Done**.

:::warning
The old password is revoked immediately. Update the applications that use this account without delay, otherwise their connections will be refused.
:::

## Delete a user

1. In the user's action menu, choose **Delete user**.
2. Enter the exact name of the user to confirm, then click **Permanently delete**.

Their rights on all vhosts are removed at the same time.

## Verification

- The **VHosts** section lists all the vhosts of the cluster.
- The **VHosts** column of the **Users** table shows, for each user, their vhosts and the associated right.
- A connection test with an AMQP client (see step 5 of the [quick start](../quick-start.md)) confirms that the user can access the expected vhost.

## Further reading

- [Concepts](../concepts.md): vhosts, users and rights
- [Change a cluster's configuration](./scale-resources.md)
- [Configure external access](./configure-external-access.md)
