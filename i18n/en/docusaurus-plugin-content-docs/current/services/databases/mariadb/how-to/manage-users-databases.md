---
title: "How to manage users and databases — MariaDB"
sidebar_label: "How to manage users and databases"
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
2. Enter the **Username**: 3 to 16 characters, lowercase letters, digits and hyphens, starting with a letter and ending with a letter or a digit (for example `report-reader`).
3. Under **Specific Access (Databases)**, click **Add** for each database:
   - **Database name**: for example `analytics` (lowercase letters, digits and hyphens; no underscore; the system databases `mysql`, `information_schema`, `performance_schema` and `sys` are refused);
   - **Rights**: **Administrator (Admin)** or **Read-only**.
4. Click **Create user**.

There is no global role: the user only has access to the databases listed. Without any access, the console shows "No access configured: the user has no rights on any database."; the user can be created this way and receive access later.

The "User created successfully!" screen displays the generated password.

:::warning
Copy this password immediately and keep it in a safe place: it will not be displayed again after you leave this screen.
:::

Then click **Done and return to cluster**.

:::tip
Users declared in the cluster creation wizard receive their role on the **Database** entered in the **Users** step.
:::

### 2. Create a database

Grant a user access to the name of the new database (step 1 for a new user, step 3 for an existing user). The database is created if it does not exist yet.

### 3. Change a user's rights

1. Open the user's **Actions** menu and choose **Manage Access**.
2. Add access with **Add**, change the **Rights** or remove a row.
3. Click **Save**. The "Access updated" message confirms the change.

The username cannot be changed.

:::warning Users created before console v1.3.0
Users declared in the cluster creation wizard before console v1.3.0 received a role on the `mysql` system database. In **Manage Access**, this line is shown in error and prevents saving: remove it, add the user's application database if needed, then click **Save**.
:::

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

The **Databases** column of the user list shows, for each user, the accessible databases with the associated role (for example `analytics (Read-only)` or `analytics (Administrator)`), or **None**.

## Going further

- [MariaDB concepts](../concepts.md): roles and naming rules
- [Scale resources](./scale-resources.md)
