---
sidebar_position: 7
title: Troubleshooting
---

# Troubleshooting — MongoDB

### The cluster stays in "Creating" status

**Cause**: the members and their volumes are still being provisioned. It takes longer with sharding, which deploys more components.

**Solution**:

1. Wait a few minutes and refresh the cluster page.
2. If the status has not changed after about fifteen minutes, or changes to **Error** or **Failed**, [contact support](mailto:support@hidora.io), stating the project and the cluster name.

### Unable to get past the wizard's Configuration step

**Cause**: the configuration exceeds the project quotas. With sharding, consumption includes 2 shards, the configuration servers and the Mongos routers.

**Solution**: reduce the preset, the disk size or the number of replicas, disable sharding if you do not need it, or request a quota increase for the project.

### Connection refused or timed out

**Cause**: external access is disabled, the address has not been assigned yet, or a firewall is blocking the port.

**Solution**:

1. In the **Network and Connection** card, check that **External Access** is **Enabled** and that the **Host** field contains an address.
2. Test connectivity:
   ```bash
   mongosh "mongodb://<host>:27017" --eval 'db.runCommand({ ping: 1 })'
   ```
3. Check that no outbound firewall on your network is blocking port `27017`.

### `Authentication failed`

**Cause**: wrong password or password revoked by a rotation, or wrong authentication database.

**Solution**:

1. Specify the `admin` authentication database (`--authenticationDatabase admin` or `?authSource=admin` in the URI).
2. If in doubt about the password, generate a new one via **Actions** → **Change Password**, then update your applications.

### `not authorized on <database> to execute command`

**Cause**: the user has no access to this database, or only **Read-only** access.

**Solution**: via **Actions** → **Manage Access**, add the database concerned with the appropriate **Rights**, then reconnect.

### Error when adding access or a user

**Cause**: no role is defined, or a name does not follow the naming rules.

**Solution**: assign at least one global role or specific access, and use only lowercase letters, digits and hyphens, starting with a letter. See [MongoDB concepts](./concepts.md#naming-rules).

### Disk full

**Cause**: the data volume has reached the **Allocated Size**.

**Solution**: increase the **Disk size (GB)** via **Edit**, within the project's storage quota. See [Change resources](./how-to/scale-resources.md). If needed, delete obsolete data or set TTL indexes on event collections.
