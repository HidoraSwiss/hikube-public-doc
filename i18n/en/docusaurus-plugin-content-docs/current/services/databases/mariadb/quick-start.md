---
sidebar_position: 3
title: "Deploy MariaDB in 5 minutes"
sidebar_label: Quick start
description: "Create a MariaDB cluster from the Hikube console, give a user access to an application database and connect to it with a MySQL client."
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# Deploy MariaDB in 5 minutes

This guide walks you through creating your first **MariaDB** cluster from the [Hikube console](https://console.hikube.cloud), up to the first connection with the `mysql` (or `mariadb`) client.

---

## Objectives

By the end of this guide, you will have:

- A **MariaDB** cluster deployed in your Hikube project
- A user with rights on an application database
- A working connection with a MySQL client

---

## Prerequisites

- A **Hikube account** and a **project** with sufficient quotas (CPU, memory, storage)
- The **`mysql`** or **`mariadb`** client installed on your workstation, if you want to test a connection from the Internet

---

## Step 1: Create the cluster

1. Log in to the [Hikube console](https://console.hikube.cloud) and select your project.
2. In the side menu, open **DB & Messaging** → **MariaDB**. The **MariaDB Clusters** page is displayed.
3. Click **Create a cluster**. The **Create a MariaDB cluster** wizard opens.

---

## Step 2: Configure and confirm

The wizard has five steps: **General**, **Configuration**, **Users**, **Summary** and **Finish**.

### General

Enter the **Cluster Name**, for example `demo-mariadb` (3 to 16 characters: lowercase letters, digits and hyphens; starts with a letter, ends with a letter or a digit).

### Configuration

| Field | Recommended value for this guide | Note |
|-------|----------------------------------|----------|
| **MariaDB Version** | `11.8` | Offered versions: 10.6, 10.11, 11.4, 11.8 |
| **Preset** | `s1.small — 1 CPU / 2Gi` | No preset is preselected; cannot be changed after creation |
| **Disk size (GB)** | `10` | Storage capacity per node |
| **Number of replicas** | `1 (Standalone)` | `3` or `5` for high availability; cannot be changed after creation |
| **External access** | Enabled | Required to connect from your workstation |

The banner at the top of the wizard shows the **Estimated Cost** and the impact on the project quotas.

:::note
Only enable **External access** if you need it: it exposes the database on the public Internet.
:::

### Users

Add at least one user:

1. **Username**: for example `app-user` (lowercase letters, digits and hyphens).
2. **Database**: the application database the user's role applies to, for example `myapp` (lowercase letters, digits and hyphens). It is created if it does not exist. The system databases `mysql`, `information_schema`, `performance_schema` and `sys` are refused.
3. **Role**: **Administrator** for this guide, or **Read-only**.
4. Click **Add**.

### Summary

Review the summary (**Version**, **Preset**, **Data volume**, **Replicas**, **External exposure**, **Estimated cost**, **Users to create**), then click **Create cluster**.

---

## Step 3: Check the status

The **Finish** step confirms the creation ("Creation complete!"). Click **Finish** to open the cluster page.

| Status | Meaning |
|--------|---------------|
| **Creating** | The cluster is being provisioned |
| **Ready** | The cluster is operational |
| **Error** | The platform could not apply the cluster's creation or its last change |

**Expected result:** after a few minutes, the status changes to **Ready**. The page shows the **MariaDB Version**, the **Replicas**, the **Allocated Size** and the **Preset**.

---

## Step 4: Retrieve the credentials and grant access to a database

### Credentials

The wizard's **Finish** step displays, under **User Credentials**, the **Password** of each user and the **Internal Connection String** (`<host>:3306`) when external access is enabled.

:::warning
Copy these passwords immediately: they will not be displayed again. If one is lost, generate a new one from the **Users** section (**Actions** → **Change Password**).
:::

The **Connection and network** card of the cluster page shows its addresses in two zones, each with a copy button:

- **Internal**, *From the project's resources only*: the internal host, always filled in, and the port (`3306`). It is reachable from the VMs and Kubernetes clusters of the same project, without external access;
- **External**, *From the Internet*: the public address, when **External Access** is enabled.

### Access to the application database

The `myapp` database entered in the **Users** step has been created, and the user has the chosen role on it: in the **Users** section of the cluster page, the **Databases** column shows `myapp (Administrator)`. To grant access to other databases, open the user's **Actions** menu and choose **Manage Access** (see [Manage users and databases](./how-to/manage-users-databases.md)).

---

## Step 5: Connect and test

From your workstation, use the address in the **External** zone:

```bash
mysql -h <host> -P 3306 -u app-user -p myapp
```

From a VM or a Kubernetes cluster of the project, use the host in the **Internal** zone: `mysql -h <internal-host> -P 3306 -u app-user -p myapp`.

Enter the password, then check the connection:

```sql
SELECT VERSION();
CREATE TABLE test (id INT AUTO_INCREMENT PRIMARY KEY, message VARCHAR(100));
INSERT INTO test (message) VALUES ('Hello Hikube');
SELECT * FROM test;
```

**Expected result:**

```console
+----+--------------+
| id | message      |
+----+--------------+
|  1 | Hello Hikube |
+----+--------------+
```

:::tip
The `mariadb` client accepts the same options: `mariadb -h <host> -P 3306 -u app-user -p myapp`.
:::

---

## Step 6: Quick troubleshooting

### The External zone shows "Disabled" or "Waiting for allocation…"

"Disabled": **External Access** is turned off. Enable it via **Edit** if you need to connect from the Internet; from the project, use the host in the **Internal** zone. "Waiting for allocation…": the public address has not been assigned yet, wait a few moments.

### The internal host does not resolve from a VM

Copy the full name from the **Internal** zone, without shortening it. On Debian 13, the name does not resolve without configuration: see [Reaching a managed service in the project](../../compute/how-to/configure-network.md#reaching-a-managed-service-in-the-project).

### `Access denied for user`

Wrong password, or user without access to the specified database. Check the **Databases** column of the user list and add the access via **Manage Access**.

### The Next button stays disabled

- At the **Configuration** step: the cluster exceeds the project quotas.
- At the **Users** step: add at least one user, with its **Database**.

### The cluster changes to Error

The platform could not apply the cluster's creation or its last change. [Contact support](mailto:support@hidora.io), providing the project and cluster names.

---

## Step 7: Cleanup

1. Open the cluster page (**DB & Messaging** → **MariaDB** → cluster name).
2. Click **Delete cluster**.
3. Enter the exact cluster name in the **Resource name to confirm** field, then click **Permanently delete**.

:::warning
This action deletes the MariaDB cluster and all associated data. It is **irreversible**.
:::

---

## Summary

From the console, you have created:

- A **MariaDB** cluster in your project
- A user and an application database
- External access and a connection with the `mysql` client

<NavigationFooter
  nextSteps={[
    {label: "Manage users and databases", href: "../how-to/manage-users-databases"},
    {label: "FAQ", href: "../faq"},
  ]}
  seeAlso={[
    {label: "All databases", href: "../../"},
  ]}
/>
