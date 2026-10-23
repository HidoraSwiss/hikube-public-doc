---
sidebar_position: 3
title: "Deploy MongoDB in 5 minutes"
sidebar_label: Quick start
description: "Create a MongoDB replica set from the Hikube console, give a user access to an application database and connect to it with mongosh."
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
| **Preset** | `s1.small — 1 CPU / 2Gi` | No preset is preselected; cannot be changed after creation |
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
2. **Database**: the application database the user's role applies to, for example `myapp` (lowercase letters, digits and hyphens). It is created if it does not exist. The system databases `admin`, `local` and `config` are refused.
3. **Role**: **Administrator** for this guide, or **Read-only**.
4. Click **Add**.

### Summary

Review the summary (**Version**, **Preset**, **Data volume**, **Replicas**, **External exposure**, **Sharding**, **Users to create**, **Estimated cost**), then click **Create cluster**.

---

## Step 3: Check the status

The **Finish** step confirms the creation ("Creation complete!"). Click **Finish** to open the cluster page.

| Status | Meaning |
|--------|---------|
| **Creating** | The cluster is being provisioned |
| **Ready** | The cluster is operational |
| **Error** | The platform could not apply the cluster's creation or its last change |

**Expected result:** after a few minutes, the status changes to **Ready**. The page shows the **MongoDB Version**, the **Replicas**, the **Allocated Size** and the **Preset**, as well as the **Network and Connection** card: the **Internal** and **External** address zones, and **Sharding**. For a replica set with external access, the **External** zone lists one address per member (**member 1**, **member 2**…), each with a copy button.

---

## Step 4: Retrieve the credentials and grant access to a database

### Credentials

The wizard's **Finish** step displays, under **User Credentials**, each user's **Password** and, when external access is enabled, an **Internal Connection String**: `mongodb://app-user:<password>@<host>` for a sharded cluster, `mongodb://app-user:<password>@<member>:27017/?directConnection=true&authSource=admin` for a replica set.

:::warning
Copy these passwords immediately: they will not be shown again. If they are lost, generate a new one from the **Users** section (**Actions** → **Change Password**).
:::

### Access to the application database

The user has the chosen role on the database entered in the **Users** step: in the **Users** section of the cluster page, the **Databases** column shows `myapp (Administrator)`. To grant access to other databases, open the user's **Actions** menu and choose **Manage Access** (see [Manage users and databases](./how-to/manage-users-databases.md)).

---

## Step 5: Connection and tests

From your workstation, on a replica set, connect directly to one member: copy one of the addresses in the **External** zone, or the **External connection string** of the **Network and Connection** card.

```bash
mongosh "mongodb://<member>:27017/myapp?directConnection=true&authSource=admin" --username app-user
```

On a sharded cluster, use the address in the **External** zone: `mongosh "mongodb://<host>:27017/myapp?authSource=admin" --username app-user`.

From a VM or a Kubernetes cluster of the project, use the host in the **Internal** zone, without external access. On a replica set, add `replicaSet=rs0`, as the console reminds you: the driver then finds the primary by itself.

```bash
mongosh "mongodb://<internal-host>:27017/myapp?replicaSet=rs0&authSource=admin" --username app-user
```

The connection is not encrypted (no TLS): do not add `--tls`.

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

:::note
The member you reach may be a secondary, which does not accept writes: `insertOne` then answers `not primary`. Check with `db.hello().isWritablePrimary`, then reconnect to another member of the list to write. A secondary serves reads with `readPreference=secondaryPreferred`.
:::

---

## Step 6: Quick troubleshooting

### The External zone shows "Disabled" or "Waiting for allocation…"

"Disabled": **External Access** is turned off. Enable it via **Edit** if you need to connect from the Internet; from the project, use the host in the **Internal** zone. "Waiting for allocation…": the public address has not been assigned yet, wait a few moments.

On a replica set with external access, each member receives its own public address: the **External** zone lists them as soon as they are assigned. Connect to one of them with `directConnection=true`, without the `replicaSet` parameter: the members advertise themselves under in-cluster names, which do not resolve from outside.

### The internal host does not resolve from a VM

Copy the full name from the **Internal** zone, without shortening it. On Debian 13, the name does not resolve without configuration: see [Reaching a managed service in the project](../../compute/how-to/configure-network.md#reaching-a-managed-service-in-the-project).

### `Authentication failed`

Check the username, the password and the authentication database (`authSource=admin` or `--authenticationDatabase admin`). If the password has been lost, rotate it from the **Users** section.

### `not authorized on myapp`

The user has no access to the `myapp` database. Add it via **Manage Access**.

### The cluster changes to Error

The platform could not apply the cluster's creation or its last change. [Contact support](mailto:support@hidora.io), stating the project name and the cluster name.

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
