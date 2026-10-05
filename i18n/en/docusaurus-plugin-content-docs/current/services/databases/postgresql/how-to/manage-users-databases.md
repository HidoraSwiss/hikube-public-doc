---
title: "How to manage users and databases"
sidebar_position: 1
---

# How to manage users and databases

This guide explains how to create databases, enable extensions, create users, manage their rights and renew their passwords on a PostgreSQL cluster, from the [Hikube console](https://console.hikube.cloud).

## Prerequisites

- A **PostgreSQL** cluster in **Ready** status in your project (see the [quick start](../quick-start.md))
- The **`psql`** client to test connections

All operations are performed from the cluster page: **DB & Messaging** → **PostgreSQL** → cluster name. The page has two tabs, **Databases** and **Users**.

## Steps

### 1. Create a database

1. In the **Databases** tab, click **Create**.
2. Enter the **Database name** (lowercase letters, digits and underscores, 63 characters maximum), for example `analytics`.
3. In **PostgreSQL Extensions**, check the extensions to enable at creation.
4. Click **Create**.

The database appears in the list, with its extensions. It also appears in the **Connection and Databases** card, under **Initial Databases**.

:::tip
You can also declare databases when creating the cluster, at the wizard's **Databases** step. The **`postgres`** database is always created automatically.
:::

### 2. Manage a database's extensions

1. In the **Databases** tab, open the database's **Actions** menu.
2. Choose **Manage extensions**.
3. Check or uncheck the extensions, then click **Save**.

The list offered matches the extensions available on the platform, including `pg_stat_statements`, `pgcrypto`, `uuid-ossp`, `pg_trgm`, `hstore`, `citext`, `postgres_fdw`, `pgaudit` and `vector` (pgvector).

### 3. Create a user

1. In the **Users** tab, click **Create a user**.
2. Enter the **Username**: 3 to 16 characters, lowercase letters, digits and underscores, starting with a letter or an underscore (for example `report_reader`).
3. In **Databases**, click **Add access** for each database the user must access:
   - **Database name**: select the database;
   - **Rights**: **Administrator (Admin)** (read and write) or **Read-only**.
4. Click **Create user**.

The "User created successfully!" screen displays the generated password.

:::warning
Copy this password immediately and keep it in a safe place: it will not be displayed again after you leave this screen.
:::

Then click **Done and return to cluster**.

### 4. Change a user's rights

1. In the **Users** tab, open the user's **Actions** menu.
2. Choose **Manage Access**.
3. Add access with **Add**, change the **Rights** or remove a row.
4. Click **Save**.

The username cannot be changed.

### 5. Renew a user's password

1. Open the user's **Actions** menu and choose **Change Password**.
2. In the **Rotate password** window, click **Perform rotation**.
3. Copy the new password displayed, then click **Done**.

:::warning
The rotation immediately revokes the old password. Update your applications right away to avoid an outage.
:::

### 6. Delete a database or a user

- Database: **Actions** menu → **Delete database**.
- User: **Actions** menu → **Delete user**.

Confirm by entering the exact name of the item, then click **Permanently delete**. Deleting a database erases its data.

### 7. Test the connection

```bash
# Read-only user
psql "host=<host> port=5432 dbname=analytics user=report_reader sslmode=require"
```

```sql
-- Must succeed
SELECT current_user, current_database();

-- Must fail for a read-only user
CREATE TABLE test (id int);
```

## Verification

- The **Databases** tab lists your databases and their extensions.
- The **Users** tab lists your users with, for each one, the accessible databases and the associated right (for example `analytics (Read-only)`).

## Going further

- [PostgreSQL concepts](../concepts.md): rights, naming rules
- [Scale resources](./scale-resources.md): preset, disk, external access
