---
title: "How to configure external access"
---

# How to configure external access

By default, a RabbitMQ cluster is not exposed on the Internet. The **External access** option exposes the cluster on a public address, so that applications located outside Hikube (or your workstation) can connect to it over AMQP.

## Prerequisites

- A **RabbitMQ cluster** created in your project, or the creation wizard open
- At least one RabbitMQ **user** and their password

## Enable external access at creation

At the **Configuration** step of the **Create a RabbitMQ cluster** wizard, enable **External access**. The **Summary** step then shows **Public** in the **Network** row (instead of **Private**).

## Enable or disable external access on an existing cluster

1. Open the cluster page and click **Edit**.
2. Turn the **External access** switch on or off.
3. Click **Save**.

## Retrieve the public address

From a VM or a Kubernetes cluster of the project, external access is not needed: use the host in the **Internal** zone, which is always shown.

1. Open the cluster page.
2. In the **Connection** section, look at the **External** zone: it shows **Disabled** if external access is turned off, and "Waiting for allocation…" as long as the address has not been assigned.
3. Copy the address in the **External** zone with its copy button.

Your clients then connect to this host, port **5672**:

```text
amqp://<user>:<password>@<host>:5672/<vhost>
```

The AMQP connection is not encrypted: TLS (AMQPS, port 5671) is not offered. The public address also exposes ports 15672 (management interface) and 15692 (Prometheus metrics).

## Security best practices

:::warning
A cluster with external access is reachable from the Internet. Do not share the same user between several applications, and renew its password with **Change Password** if in doubt.
:::

- Disable **External access** if only applications inside your project use the cluster: credentials and messages travel in clear text over the Internet.
- Assign the **Read-only** right to applications that only consume.
- Delete unused users.

## Verification

From an external workstation, test whether the AMQP port is open:

```bash
nc -zv <host> 5672
```

Then run the test script from step 5 of the [quick start](../quick-start.md).

## Further reading

- [Manage vhosts and users](./manage-vhosts-users.md)
- [Change a cluster's configuration](./scale-resources.md)
