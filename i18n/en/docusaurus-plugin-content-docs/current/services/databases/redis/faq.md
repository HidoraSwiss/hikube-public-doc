---
sidebar_position: 6
title: FAQ
---

# FAQ — Redis

### How does Redis Sentinel work on Hikube?

Redis on Hikube is deployed with a **Redis Sentinel** architecture for high availability:

- **Redis Sentinel** monitors the Redis instances and performs an **automatic switchover** (failover) if the master fails.
- A **quorum** of sentinels decides on the failover. Three sentinels are always deployed, whatever the number of Redis replicas: switchover works from **2 replicas**.
- The address in the **Host** field follows the master: after a switchover, it automatically points to the new master, with no change of address.

:::tip
In production, choose at least 3 replicas at creation: this number cannot be changed afterwards.
:::

### Which presets are available?

The **Preset** sets the CPU and memory of each node. The list displayed by the wizard is authoritative; for reference:

| **Preset** | **CPU** | **Memory** |
|------------|---------|------------|
| `nano`     | 250m    | 128Mi      |
| `micro`    | 500m    | 256Mi      |
| `small`    | 1       | 512Mi      |
| `medium`   | 1       | 1Gi        |
| `large`    | 2       | 2Gi        |
| `xlarge`   | 4       | 4Gi        |
| `2xlarge`  | 8       | 8Gi        |

It can be changed after creation from **Edit**.

### Does Redis persist data?

Yes. Each node has a persistent volume (**Volume size (GB)**) to which Redis writes its data through its native mechanisms. The data survives restarts.

### What is the "Enable authentication" option for?

When enabled (the default), it protects the cluster with an automatically generated password, displayed only once at creation together with the `default` user. This password is required for every connection.

:::warning
Always keep authentication enabled, especially if the public network is enabled.
:::

### I lost the password. How can I recover it?

It cannot be read back. Generate a new one from the **Security** section of the cluster page (**Rotate password**). See [Renew the password](./how-to/rotate-password.md).

### How do I scale Redis?

- **Vertically**: change the **Preset** and the **Volume size (GB)** via **Edit**. See [Change resources](./how-to/scale-resources.md).
- **Horizontally**: the number of replicas is set at creation. To change it, [contact support](mailto:support@hidora.io).

### How do I connect to Redis?

With the public network enabled, use the address in the **Host** field (**Connection** section of the cluster page) on port `6379`:

```bash
REDISCLI_AUTH='<password>' redis-cli -h <host> -p 6379 ping
```

Without the public network, the instance remains reachable from the project's VMs and Kubernetes clusters through an internal address, which the console does not display. [Contact support](mailto:support@hidora.io) to obtain it.

### Can I create several Redis users (ACL)?

No, the console does not offer Redis user management: access relies on a cluster-wide password.
