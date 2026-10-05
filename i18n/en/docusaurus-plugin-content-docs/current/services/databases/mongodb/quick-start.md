---
sidebar_position: 3
title: Quick start
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# Deploy MongoDB in 5 minutes

This guide walks you through creating your first **MongoDB** cluster from the [Hikube console](https://console.hikube.cloud), up to the first connection with `mongosh`.

---

## Objectives

By the end of this guide, you will have:

- A **MongoDB** cluster (replica set) deployed in your Hikube project
- A user with permissions on an application database
- A working connection with `mongosh`

---

## Prerequisites

- A **Hikube account** and a **project** with sufficient quotas (CPU, memory, storage)
- The **`mongosh`** shell installed on your workstation, if you want to test a connection from the Internet

---

## Step 1: Create the cluster

1. Sign in to the [Hikube console](https://console.hikube.cloud) and select your project.
2. In the side menu, open **DB & Messaging** → **MongoDB**. The **MongoDB Clusters** page is displayed.
3. Click **Create a cluster**. The **Create a MongoDB cluster** wizard opens.

---

## Step 2: Configure and confirm

The wizard has five steps: **General**, **Configuration**, **Users**, **Summary** and **Finish**.

### General

Enter the **Cluster Name**, for example `demo-mongo` (3 to 16 characters: lowercase letters, digits and hyphens; starts with a letter, ends with a letter or a digit).

### Configuration

| Field | Recommended value for this guide | Note |
|-------|----------------------------------|------|
| **MongoDB Version** | `8.0` | Offered versions: 6.0, 7.0, 8.0 |
| **Preset** | `Small (1 CPU, 512Mi)` | Cannot be changed after creation |
| **Disk size (GB)** | `10` | Storage capacity per node |
| **Number of replicas** | `3 (Max High Availability)` | `1` for a simple test; cannot be changed after creation |
| **External access** | Enabled | Required to connect from your workstation |
| **Sharding (Distributed Topology)** | Disabled | See [Configure sharding](./how-to/configure-sharding.md) |

The banner at the top of the wizard shows the **Estimated cost** and the impact on the project quotas.

:::note
Only enable **External access** if you need it: it exposes the database on the public Internet.
:::

### Users

Add at least one user:

1. **Username**: for example `app-user` (lowercase letters, digits and hyphens).
2. **Role**: **Administrator** or **Read-only**.
3. Click **Add**.

### Summary

Review the summary (**Version**, **Preset**, **Data volume**, **Replicas**, **External exposure**, **Sharding**, **Users to create**, **Estimated cost**), then click **Create cluster**.

---

## Step 3: Check the status

The **Finish** step confirms the creation ("Creation complete!"). Click **Finish** to open the cluster page.

| Status | Meaning |
|--------|---------|
| **Creating** | The cluster is being provisioned |
| **Ready** / **Running** | The cluster is operational |
| **Error** / **Failed** | Provisioning failed |

**Expected result:** after a few minutes, the status changes to **Ready**. The page shows the **MongoDB Version**, the **Replicas**, the **Allocated Size** and the **Preset**, as well as the **Network and Connection** card (**Host**, **External Access**, **Sharding**).

---

## Step 4: Retrieve the credentials and grant access to a database

### Credentials

The wizard's **Finish** step displays, under **User Credentials**, each user's **Password** and, when external access is enabled, an **Internal Connection String** of the form `mongodb://app-user:<password>@<host>`.

:::warning
Copy these passwords immediately: they will not be shown again. If they are lost, generate a new one from the **Users** section (**Actions** → **Change Password**).
:::

### Access to an application database

The role chosen in the wizard applies to the `admin` database. To grant access to an application database:

1. In the **Users** section, open the **Actions** menu of `app-user` and choose **Manage Access**.
2. Under **Specific Access (Databases)**, click **Add**.
3. Enter the **Database name**, for example `myapp` (lowercase letters, digits and hyphens), and choose the **Rights** **Administrator (Admin)**.
4. Click **Save**.

---

## Step 5: Connection and tests

```bash
mongosh "mongodb://<host>:27017/myapp" --username app-user --authenticationDatabase admin
```

Enter the password, then check the connection:

```javascript
db.runCommand({ ping: 1 })
db.test.insertOne({ message: "Hello Hikube" })
db.test.find()
```

**Expected result:**

```console
{ ok: 1 }
[ { _id: ObjectId('...'), message: 'Hello Hikube' } ]
```

---

## Step 6: Quick troubleshooting

### The Host field shows "Not defined"

**External Access** is disabled, or the public address has not been assigned yet. Enable it via **Edit** if needed, then wait a few moments.

### `Authentication failed`

Check the username, the password and the authentication database (`--authenticationDatabase admin`). If the password has been lost, rotate it from the **Users** section.

### `not authorized on myapp`

The user has no access to the `myapp` database. Add it via **Manage Access**.

### The cluster stays in Error

[Contact support](mailto:support@hidora.io), stating the project name and the cluster name.

---

## Step 7: Cleanup

1. Open the cluster page (**DB & Messaging** → **MongoDB** → cluster name).
2. Click **Delete cluster**.
3. Enter the exact cluster name in the **Resource name to confirm** field, then click **Permanently delete**.

:::warning
This action deletes the MongoDB cluster and all associated data. It is **irreversible**.
:::

---

## Summary

From the console, you have created:

- A replicated **MongoDB** cluster in your project
- A user and their permissions on an application database
- External access and a `mongosh` connection

<NavigationFooter
  nextSteps={[
    {label: "Manage users and databases", href: "../how-to/manage-users-databases"},
    {label: "FAQ", href: "../faq"},
  ]}
  seeAlso={[
    {label: "All databases", href: "../../"},
  ]}
/>
