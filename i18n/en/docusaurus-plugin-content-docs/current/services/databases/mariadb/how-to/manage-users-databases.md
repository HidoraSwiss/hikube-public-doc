---
title: "How to manage users and databases"
sidebar_position: 1
---

# How to manage users and databases

This guide explains how to create users, give them access to databases and renew their passwords on a MariaDB cluster, from the [Hikube console](https://console.hikube.cloud).

## Prerequisites

- A **MariaDB** cluster in **Ready** status in your project (see the [quick start](../quick-start.md))
- A **`mysql`** or **`mariadb`** client to test connections

All operations are performed from the cluster page: **DB & Messaging** → **MariaDB** → cluster name, **Users** section.

:::note
The MariaDB console has no tab dedicated to databases: a database is created by granting a user access to its name.
:::

## Steps

### 1. Create a user

1. In the **Users** section, click **Create a user**.
2. Enter the **Username**: lowercase letters, digits and hyphens, starting with a letter (for example `report-reader`).
3. Leave **Global Role (Optional)** set to **No global role**.
4. Under **Specific Access (Databases)**, click **Add** for each database:
   - **Database name**: for example `analytics` (lowercase letters, digits and hyphens; no underscore);
   - **Rights**: **Administrator (Admin)** or **Read-only**.
5. Click **Create user**.

The "Generated password" screen displays the generated password.

:::warning
Copy this password immediately and keep it in a safe place: it will not be displayed again after you leave this screen.
:::

Then click **Done**.

### 2. Create a database

Grant a user access to the name of the new database (step 1 for a new user, step 3 for an existing user). The database is created if it does not exist yet.

### 3. Change a user's rights

1. Open the user's **Actions** menu and choose **Manage Access**.
2. Add access with **Add**, change the **Rights** or remove a row.
3. Click **Save**.

The username cannot be changed.

### 4. Renew a user's password

1. Open the user's **Actions** menu and choose **Change Password**.
2. In the **Rotate password** window, click **Perform rotation**.
3. Copy the new password, then click **Done**.

:::warning
The rotation immediately revokes the old password. Update your applications right away to avoid an outage.
:::

### 5. Delete a user

Open the user's **Actions** menu, choose **Delete user**, enter its exact name, then click **Permanently delete**.

### 6. Test the connection

```bash
mysql -h <host> -P 3306 -u report-reader -p analytics
```

```sql
-- Must succeed
SELECT CURRENT_USER(), DATABASE();
SHOW GRANTS;

-- Must fail for a read-only user
CREATE TABLE test (id INT);
```

## Verification

The user list shows, for each user, its **Role** and the accessible **Databases** with the associated right (for example `analytics (readonly)` or `analytics (admin)`).

## Going further

- [MariaDB concepts](../concepts.md): roles and naming rules
- [Scale resources](./scale-resources.md)
