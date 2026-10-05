---
sidebar_position: 7
title: Troubleshooting
---

# Troubleshooting — Redis

### The cluster stays in "Creating" status

**Cause**: the Redis nodes, the Sentinels and their volumes are still being provisioned.

**Solution**:

1. Wait a few minutes and refresh the cluster page.
2. If the status has not changed after about fifteen minutes, or changes to **Error** or **Failed**, [contact support](mailto:support@hidora.io), stating the project and the cluster name.

### The host shows "Waiting for allocation..."

**Cause**: the public network is disabled, or the public IP address has not been assigned yet.

**Solution**:

1. Open **Edit** and check the **External access** option. Enable it if you need to connect from the Internet, then click **Save changes**.
2. Wait a few moments and refresh the cluster page.

### Connection timeout

**Cause**: the address or port used is incorrect, the cluster is not ready, or a firewall is blocking port `6379`.

**Solution**:

1. Check that the **Status** in the **Connection** section is **Ready**.
2. Copy the **Host** with the copy button to avoid typing errors.
3. Check that no outbound firewall on your network is blocking port `6379`.

### Authentication fails (`NOAUTH` or `WRONGPASS`)

**Cause**: the client does not send a password, uses a wrong password, or a password revoked by a rotation.

**Solution**:

1. Check the value passed to the client (`REDISCLI_AUTH`, `-a` option or application configuration).
2. If in doubt, generate a new password from the **Security** section (**Rotate password**) and update your applications. See [Renew the password](./how-to/rotate-password.md).
3. If the **Authentication required** option has been changed, update the clients accordingly.

### Memory saturated (`OOM command not allowed`)

**Cause**: the dataset exceeds the memory allocated by the preset.

**Solution**:

1. Check memory usage:
   ```bash
   redis-cli -h <host> -p 6379 INFO memory
   ```
2. Switch to a larger **Preset** via **Edit**. See [Change resources](./how-to/scale-resources.md).
3. If Redis is used as a cache, set expiration times (`EXPIRE`) on your keys to limit dataset growth.

### Failover does not happen

**Cause**: the cluster has only one replica; no replica can be promoted to master.

**Solution**: the number of replicas cannot be changed after creation. Create a new cluster with at least 2 replicas (3 in production) and migrate your data, or [contact support](mailto:support@hidora.io). See [Configure high availability](./how-to/configure-ha.md).
