---
sidebar_position: 7
title: Troubleshooting
---

# Troubleshooting — RabbitMQ

### The cluster stays "Creating" or switches to "Error"

**Cause**: provisioning is in progress, or it has failed (for example due to a lack of available resources).

**Solution**:

1. Wait a few minutes: the detail page and the list refresh automatically.
2. If the status stays **Creating** for an abnormally long time or switches to **Error** / **Failed**, [contact support](mailto:support@hidora.io), giving the project name, the cluster name and its identifier (displayed under the cluster name, with a copy button).

### "Storage quota exceeded for this project" in the wizard

**Cause**: the disk size multiplied by the number of replicas exceeds the remaining storage of the project quota.

**Solution**:

1. Reduce the **Disk size (GB)** or the **Number of replicas**.
2. If needed, free up storage in the project or have the project quota increased.

### "A cluster with this name already exists"

**Cause**: a RabbitMQ cluster in the project already has this name.

**Solution**: go back to the **General** step and choose another **Cluster Name**.

### The "Host" field displays "Not available / Creating"

**Cause**: the public address has not been assigned yet, or **External Access** is disabled.

**Solution**:

1. In the **Connection** section, check that **External Access** shows **Enabled**. If not, enable it (see [Configure external access](./how-to/configure-external-access.md)).
2. If external access is enabled, wait and then reload the page.

### AMQP connection refused (`ACCESS_REFUSED`)

**Cause**: incorrect credentials, or the user has no right on the requested vhost.

**Solution**:

1. In the **Users** table (**VHosts** column), check that the user has a right on the vhost used by the client.
2. If needed, add the access with **Manage Access**.
3. If the password has been lost or is in doubt, generate a new one with **Change Password** and update the client.
4. Check that the client specifies the right vhost (exact name, case-sensitive).

### Unable to connect (timeout, connection refused)

**Cause**: external access disabled, wrong address or wrong port, or network filtering on the client side.

**Solution**:

1. Check the **Host** and the state of **External Access** in the **Connection** section.
2. Use port **5672**.
3. Test whether the port is open from the client machine:
   ```bash
   nc -zv <host> 5672
   ```
4. Check that your local network or firewall allows outgoing connections to this port.

### Publishing blocked (flow control, memory or disk alarm)

**Cause**: RabbitMQ blocks publishing when it reaches its memory threshold (high watermark) or when disk space is insufficient, to protect the broker. Clients then receive a `connection.blocked` notification.

**Solution**:

1. On the application side, check that consumers keep up with producers and purge the queues that accumulate unconsumed messages.
2. Increase the **Disk size (GB)** from **Edit** if the alarm concerns the disk (see [Change a cluster's configuration](./how-to/scale-resources.md)).
3. The preset (memory) cannot be changed after creation: create a cluster with a larger preset, or [contact support](mailto:support@hidora.io).

### Unrouted messages

**Cause**: the producer publishes to an exchange without a matching binding (wrong exchange type, incorrect routing key, missing binding). The message is then dropped.

**Solution**:

1. Check the exchange name and the routing key in the producer code.
2. Check that the consumer declares the binding between the queue and the exchange.
3. Publish with the `mandatory` flag to be notified of unrouted messages, or declare an *alternate exchange* to capture them.

### Deleting the cluster fails

**Cause**: a conflict prevents deletion ("Cannot delete this cluster (conflict).") or the service is temporarily unavailable.

**Solution**: try again a few minutes later. If the error persists, [contact support](mailto:support@hidora.io).
