---
title: "How to manage users and databases"
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
2. Enter the **Username**: lowercase letters, digits and hyphens, starting with a letter (for example `report-reader`).
3. Define at least one role:
   - **Global Role (Optional)**: leave **No global role** to restrict the user to specific databases;
   - **Specific Access (Databases)**: click **Add**, enter the **Database name** (for example `analytics`) and choose the **Rights** **Administrator (Admin)** or **Read-only**.
4. Click **Create user**.

If no role is defined, the console displays "Please assign at least one role (global or specific) to the user." and the button stays disabled.

The "Generated password" screen displays the generated password.

:::warning
Copy this password immediately and keep it safe: it will not be shown again after you leave this screen.
:::

Then click **Done**.

### 2. Change a user's permissions

1. Open the user's **Actions** menu and choose **Manage Access**.
2. Add access with **Add**, change the **Rights** or remove a line. At least one role must remain.
3. Click **Save**.

The username cannot be changed.

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
mongosh "mongodb://<host>:27017/analytics" --username report-reader --authenticationDatabase admin
```

```javascript
// Must succeed
db.runCommand({ connectionStatus: 1 })
db.events.find().limit(1)

// Must fail for a read-only user
db.events.insertOne({ test: true })
```

## Verification

The user list shows, for each user, their **Role** and the accessible **Databases** with the associated right (for example `analytics (Read-only)`).

## Further reading

- [MongoDB concepts](../concepts.md): roles and naming rules
- [Change resources](./scale-resources.md)
