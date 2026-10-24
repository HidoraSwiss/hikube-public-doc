---
title: "How to manage users and databases — MongoDB"
sidebar_label: "How to manage users and databases"
sidebar_position: 1
---

# How to manage users and databases

This guide explains how to create MongoDB users, grant them access to databases and renew their passwords, from the [Hikube console](https://console.hikube.cloud).

## Prerequisites

- A **MongoDB** cluster in **Ready** status in your project (see the [quick start](../quick-start.md))
- The **`mongosh`** shell to test connections

All operations are performed from the cluster page: **DB & Messaging** → **MongoDB** → cluster name, **Users** section.

:::note
The MongoDB console has no dedicated databases tab: permissions are defined per user, database by database. As always with MongoDB, a database physically appears as soon as you write a first document to it.
:::

## Steps

### 1. Create a user

1. In the **Users** section, click **Create a user**.
2. Enter the **Username**: 3 to 16 characters, lowercase letters, digits and hyphens, starting with a letter and ending with a letter or a digit (for example `report-reader`).
3. Under **Specific Access (Databases)**, click **Add** for each database:
   - **Database name**: for example `analytics` (lowercase letters, digits and hyphens; the system databases `admin`, `local` and `config` are refused);
   - **Rights**: **Administrator (Admin)** or **Read-only**.
4. Click **Create user**.

A MongoDB user must have at least one access: without access, the console displays "Please grant access to at least one database." and the button stays disabled. There is no global role: the user only has access to the databases listed.

The "User created successfully!" screen displays the generated password.

:::warning
Copy this password immediately and keep it safe: it will not be shown again after you leave this screen.
:::

Then click **Done and return to cluster**.

:::tip
Users declared in the cluster creation wizard receive their role on the **Database** entered in the **Users** step.
:::

### 2. Change a user's permissions

1. Open the user's **Actions** menu and choose **Manage Access**.
2. Add access with **Add**, change the **Rights** or remove a line. At least one access must remain.
3. Click **Save**. The "Access updated" message confirms the change.

The username cannot be changed.

:::warning Users created before console v1.3.0
Users declared in the cluster creation wizard before console v1.3.0 received a role on the `admin` system database. In **Manage Access**, this line is shown in error and prevents saving: remove it, add the user's application database if needed, then click **Save**.
:::

### 3. Renew a user's password

1. Open the user's **Actions** menu and choose **Change Password**.
2. In the **Rotate password** window, click **Perform rotation**.
3. Copy the new password, then click **Done**.

:::warning
Rotation immediately revokes the old password. Update your applications right away to avoid an outage.
:::

### 4. Delete a user

Open the user's **Actions** menu, choose **Delete user**, enter their exact name, then click **Permanently delete**.

### 5. Test the connection

```bash
mongosh "mongodb://<host>:27017/analytics?directConnection=true&authSource=admin" --username report-reader
```

On a replica set, `<host>` is the address of one of the members listed in the **External** zone of the **Network and Connection** card.

```javascript
// Must succeed
db.runCommand({ connectionStatus: 1 })
db.events.find().limit(1)

// Must fail for a read-only user
db.events.insertOne({ test: true })
```

## Verification

The **Databases** column of the user list shows, for each user, the accessible databases with the associated role (for example `analytics (Read-only)` or `analytics (Administrator)`).

## Further reading

- [MongoDB concepts](../concepts.md): roles and naming rules
- [Change resources](./scale-resources.md)
