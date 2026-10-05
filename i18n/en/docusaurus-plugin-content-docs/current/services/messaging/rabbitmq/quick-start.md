---
sidebar_position: 3
title: Quick start
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# Create a RabbitMQ cluster in 5 minutes

This guide walks you through creating your first **RabbitMQ cluster** from the [Hikube console](https://console.hikube.cloud), up to sending a first message.

---

## Objectives

By the end of this guide, you will have:

- A working **RabbitMQ cluster** in your project
- A **vhost** and a **user** with their rights
- The **password** of this user and the **connection address** of the cluster
- A first message published with an AMQP client

---

## Prerequisites

- A **Hikube account** and a **project** (see the [Hikube quick start](../../../getting-started/quick-start.md))
- Enough project quota for the cluster (CPU, memory and storage)
- **Python 3** with the `pika` module installed, for the test in step 5 (`pip install pika`)

---

## Step 1: Open the creation wizard

1. Log in to the [Hikube console](https://console.hikube.cloud) and select your project.
2. In the side menu, open **DB & Messaging** → **RabbitMQ**. The **RabbitMQ Clusters** page is displayed.
3. Click **Create a cluster**. The **Create a RabbitMQ cluster** wizard opens.

---

## Step 2: Configure and create the cluster

The wizard has five steps. A banner shows the estimated cost and, at the **Configuration** step, the project's quota consumption.

### General

Enter the **Cluster Name** (a name is suggested by default). It must be 3 to 16 characters long: lowercase letters, digits and hyphens, start with a letter and end with a letter or a digit. Example: `rabbit-demo`.

### Configuration

| Field | Recommended value for this guide | Note |
|-------|--------------------------------|----------|
| **RabbitMQ Version** | 4.2 | Available versions: 4.2, 4.1, 4.0, 3.13 |
| **Preset** | Small | Cannot be changed after creation |
| **Disk size (GB)** | 10 | Capacity per node |
| **Number of replicas** | 3 (Max High Availability) | 1 (Standalone), 3 or 5; cannot be changed after creation |
| **External access** | Enabled | Exposes the cluster on the Internet; needed for the test from your workstation |

:::note
If the project's storage quota is exceeded, the console displays "Storage quota exceeded for this project" and the **Next** button stays disabled. Reduce the size or the number of replicas, or have the project quota increased.
:::

### VHosts

Enter a **VHost Name** (for example `demo`) then click **Add**. At least one vhost is required to move on to the next step.

### Users

1. In **Add a new user**, enter the **Username** (for example `app-user`; lowercase letters, digits and hyphens).
2. In **VHost access**, choose **Administrator** for the `demo` vhost.
3. Click **Add user**.

At least one user is required to continue.

### Summary

Review the summary (name, version, preset, replicas, size, **Public** or **Private** network, estimated cost, number of vhosts and users to create), then click **Create cluster**.

### Done: copy the password

At the end of the deployment, the **Done** screen displays **Creation complete!** and, for each user created, their **Password**.

:::warning Password displayed only once
Copy the password immediately and keep it in a password manager. It will not be displayed again once you leave this screen. If it is lost, generate a new one with the **Change Password** action (see [Manage vhosts and users](./how-to/manage-vhosts-users.md)).
:::

Then click **Finish** to return to the cluster list.

---

## Step 3: Check the cluster status

1. In the **RabbitMQ Clusters** list, the cluster appears with the status **Creating**, then **Ready** once it is operational.
2. Click the cluster to open its detail page:
   - **General Information**: **Version**, **Replicas**, **Volume Size**;
   - **VHosts** and **Users**: the items created by the wizard;
   - **Connection**: **Host**, **Status** and **External Access** (**Enabled** or **Disabled**).

---

## Step 4: Retrieve the credentials

To connect, you need:

| Information | Where to find it |
|-------------|---------------|
| **Username** | **Users** section of the cluster page |
| **Password** | Copied from the wizard's **Done** screen (step 2) |
| **VHost** | **VHosts** section of the cluster page |
| **Host** | **Host** field of the **Connection** section |
| **Port** | 5672 (AMQP) |

As long as the address has not been assigned, the **Host** field displays "Not available / Creating". Once the address is assigned, copy it with the copy button.

:::note
The **Host** field is filled in when **External Access** is enabled. Without external access, the cluster remains reachable from the project's VMs through an internal address, which the console does not display: [contact support](mailto:support@hidora.io) to get it.
:::

When the host is already known, the wizard's **Done** screen also displays a connection string of the form:

```text
amqp://app-user:<password>@<host>:5672
```

---

## Step 5: Connect and test

Create the following script, replacing the host and password with your values:

```python title="test_rabbitmq.py"
import pika

credentials = pika.PlainCredentials('app-user', '<password>')
parameters = pika.ConnectionParameters(
    host='<host>',
    port=5672,
    virtual_host='demo',
    credentials=credentials,
)

connection = pika.BlockingConnection(parameters)
channel = connection.channel()

# Declare a quorum queue (replicated across the cluster nodes)
channel.queue_declare(queue='test', durable=True, arguments={'x-queue-type': 'quorum'})

# Send a message
channel.basic_publish(exchange='', routing_key='test', body='Hello Hikube!')
print("Message sent successfully")

# Read the message
method, properties, body = channel.basic_get(queue='test', auto_ack=True)
print(f"Message received: {body.decode()}")

connection.close()
```

```bash
python test_rabbitmq.py
```

**Expected result:**

```console
Message sent successfully
Message received: Hello Hikube!
```

---

## Step 6: Quick troubleshooting

| Symptom | Common causes | Action |
|----------|-------------------|--------|
| The cluster stays **Creating** | Provisioning in progress | Wait a few minutes; if the status does not change, see [troubleshooting](./troubleshooting.md) |
| **Error** status | Provisioning failed | [Contact support](mailto:support@hidora.io), giving the name and identifier of the cluster |
| `ACCESS_REFUSED` on connection | Wrong password, or user without rights on the vhost | Check the vhost in **Manage Access**; regenerate the password if needed |
| Unable to connect (timeout) | External access disabled, wrong host or port | Check **External Access** and **Host** in the **Connection** section; the AMQP port is 5672 |
| `NOT_FOUND - no vhost` | Wrong vhost name in the client | Use exactly the name displayed in the **VHosts** section |

---

## Step 7: Cleanup

1. Open the cluster detail page and click **Delete** (or, from the list, open the cluster's action menu and choose **Delete cluster**).
2. In the confirmation window, enter the exact name of the cluster in **Resource name to confirm**.
3. Click **Permanently delete**.

:::warning
This action is irreversible: the cluster, its vhosts, its users and all stored messages are permanently deleted.
:::

---

## Summary

From the console, you have created:

- A highly available RabbitMQ cluster with **3 nodes**
- A **vhost** and an **administrator user** for this vhost
- A working **AMQP connection** from your workstation

<NavigationFooter
  nextSteps={[
    {label: "Manage vhosts and users", href: "../how-to/manage-vhosts-users"},
    {label: "FAQ", href: "../faq"},
  ]}
  seeAlso={[
    {label: "All messaging services", href: "../../"},
  ]}
/>
