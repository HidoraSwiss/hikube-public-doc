---
sidebar_position: 6
title: FAQ
---

# FAQ — RabbitMQ

### What is the difference between quorum queues and classic queues?

RabbitMQ offers two main types of queues:

- **Quorum queues**: based on the **Raft** protocol, data is replicated across several nodes of the cluster. They guarantee message **durability** and **high availability**. Recommended for production.
- **Classic queues**: stored on a single node, without replication between nodes. If that node fails, the messages are no longer available.

The queue type is chosen by the application when the queue is declared (argument `x-queue-type: quorum`).

:::tip
To benefit from quorum queue replication, create the cluster with **3 (Max High Availability)** or **5 (Ultra High Availability)** replicas.
:::

### What are virtual hosts (vhosts) for?

**Virtual hosts** (vhosts) provide **logical isolation** within the same RabbitMQ cluster:

- Each vhost has its own exchanges, queues and bindings
- Rights are managed **per vhost**, which lets you control access per application
- A user can have different rights depending on the vhost (**Administrator** on one, **Read-only** on another)

Vhosts are created in the creation wizard (**VHosts** step) or later with **Add a VHost** on the cluster page. See [Manage vhosts and users](./how-to/manage-vhosts-users.md).

### How do exchanges work in RabbitMQ?

An **exchange** receives messages from producers and routes them to queues according to **binding** rules:

| **Type**    | **Behavior**                                                                  |
| ----------- | ----------------------------------------------------------------------------- |
| `direct`    | Routes the message to the queue whose **routing key** matches exactly         |
| `fanout`    | Broadcasts the message to **all bound queues**, without filtering             |
| `topic`     | Routes according to a routing key **pattern** (e.g. `orders.*`, `logs.#`)     |
| `headers`   | Routes according to the message **headers** rather than the routing key       |

The producer publishes to an exchange, never directly to a queue. Exchanges and bindings are declared by your applications.

### Which port should I connect to?

AMQP clients connect on port **5672**, at the address displayed in the **Host** field of the cluster's **Connection** section (when **External Access** is enabled).

### Can the number of replicas or the preset be changed after creation?

No. The **Number of replicas** (and therefore the standalone or cluster mode) and the **Preset** are set at creation. The version, the disk size and external access remain editable. See [Change a cluster's configuration](./how-to/scale-resources.md).

### I have lost a user's password. How do I recover it?

The password is displayed only once and cannot be read again. Generate a new one with the user's **Change Password** action, then update your applications: the old password is revoked immediately.

### What rights do "Administrator" and "Read-only" grant?

- **Administrator**: read, write and configure on the vhost (declare exchanges and queues, publish, consume).
- **Read-only**: read-only on the vhost.

A user without access to a vhost cannot connect to it.

### How do I access the RabbitMQ management interface?

The Hikube console does not provide access to the RabbitMQ web management interface. With **External Access**, port 15672 of this interface is reachable at the cluster address, over unencrypted HTTP, but users created from the console do not have the RabbitMQ administration tag that it requires: they cannot log in to it. Vhosts and users are managed from the console; exchanges and queues, from your applications. For a specific need, [contact support](mailto:support@hidora.io).

### How is the cost of a cluster estimated?

The creation wizard displays a monthly and hourly **Estimated Cost**, calculated from the preset, the number of replicas, the disk size and external access. Actual billing is calculated per hour of use.
