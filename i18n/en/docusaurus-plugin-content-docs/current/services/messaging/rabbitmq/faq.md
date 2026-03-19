---
sidebar_position: 6
title: FAQ
---

# FAQ — RabbitMQ

### What is the difference between quorum queues and classic queues?

RabbitMQ offers two main types of queues:

- **Quorum queues**: based on the **Raft** consensus protocol, data is replicated across multiple cluster nodes. They guarantee message **durability** and **high availability**. Recommended for production.
- **Classic queues**: stored on a single node, faster for writes but **without replication**. If the node fails, messages are lost.

:::tip
With 3 or more replicas (`replicas: 3`), RabbitMQ uses quorum queues by default, ensuring message durability in case of a node failure.
:::

### What are virtual hosts (vhosts) used for?

**Virtual hosts** (vhosts) provide **logical isolation** within a single RabbitMQ cluster:

- Each vhost has its own exchanges, queues, and bindings
- Permissions are managed **per vhost**, allowing access control per application
- A user can have different roles depending on the vhost (admin on one, readonly on another)

Configuration example with multiple vhosts:

```yaml title="rabbitmq.yaml"
vhosts:
  production:
    roles:
      admin: ["admin"]
      readonly: ["monitoring"]
  staging:
    roles:
      admin: ["admin", "dev"]
```

### How do exchanges work in RabbitMQ?

An **exchange** receives messages from producers and routes them to queues according to **binding** rules:

| **Type**    | **Behavior**                                                                   |
| ----------- | ------------------------------------------------------------------------------ |
| `direct`    | Routes the message to the queue whose **routing key** matches exactly          |
| `fanout`    | Broadcasts the message to **all bound queues**, without filtering              |
| `topic`     | Routes based on a routing key **pattern** (e.g., `orders.*`, `logs.#`)        |
| `headers`   | Routes based on message **headers** rather than the routing key                |

The producer publishes to an exchange, never directly to a queue.

### What protocols are supported?

RabbitMQ on Hikube supports the following protocols:

| **Protocol**         | **Port** | **Usage**                             |
| -------------------- | -------- | ------------------------------------- |
| AMQP                 | 5672     | Main messaging protocol               |
| Management HTTP API  | 15672    | Web interface and management API      |

### What is the difference between `resourcesPreset` and `resources`?

The `resourcesPreset` field applies a predefined CPU/memory configuration, while `resources` allows you to specify explicit values. If `resources` is defined, `resourcesPreset` is **ignored**.

| **Preset** | **CPU** | **Memory** |
| ---------- | ------- | ---------- |
| `nano`     | 100m    | 128Mi      |
| `micro`    | 250m    | 256Mi      |
| `small`    | 500m    | 512Mi      |
| `medium`   | 500m    | 1Gi        |
| `large`    | 1       | 2Gi        |
| `xlarge`   | 2       | 4Gi        |
| `2xlarge`  | 4       | 8Gi        |

Example with explicit resources:

```yaml title="rabbitmq.yaml"
replicas: 3
resources:
  cpu: 2000m
  memory: 4Gi
size: 20Gi
```

### How to access the management interface?

The RabbitMQ management interface is accessible on port **15672**. Two options:

**Option 1 — Port-forward (local access)**:

```bash
kubectl port-forward svc/<rabbitmq-name> 15672:15672
```

Then open `http://localhost:15672` in your browser.

**Option 2 — External access**:

Enable `external: true` in your manifest to expose the service via a LoadBalancer:

```yaml title="rabbitmq.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: RabbitMQ
metadata:
  name: rabbitmq
spec:
  external: true
  replicas: 3
  resourcesPreset: small
  size: 10Gi
```

:::warning
External access exposes AMQP (5672) and Management (15672) ports on the Internet. Make sure to use strong passwords for all users.
:::
