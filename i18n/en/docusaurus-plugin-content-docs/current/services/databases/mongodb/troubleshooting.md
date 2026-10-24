---
sidebar_position: 7
title: "Troubleshooting — MongoDB"
sidebar_label: Troubleshooting
description: "Fix common MongoDB issues on Hikube: cluster in error, connection refused, not primary error, Authentication failed, not authorized, full disk."
---

# Troubleshooting — MongoDB

### The cluster stays in "Creating" status

**Cause**: the members and their volumes are still being provisioned. It takes longer with sharding, which deploys more components.

**Solution**:

1. Wait a few minutes and refresh the cluster page.
2. If the status has not changed after about fifteen minutes, [contact support](mailto:support@hidora.io), stating the project and the cluster name.

### The cluster changes to "Error" status

**Cause**: the platform could not apply the cluster's creation or its last change. After a change, the cluster may keep running with its previous configuration.

**Solution**: [contact support](mailto:support@hidora.io), stating the project, the cluster name and the change requested.

### Unable to get past the wizard's Configuration step

**Cause**: the configuration exceeds the project quotas. With sharding, consumption includes 2 shards, the configuration servers and the Mongos routers.

**Solution**: reduce the preset, the disk size or the number of replicas, disable sharding if you do not need it, or request a quota increase for the project.

### Connection refused or timed out

**Cause**: external access is disabled, the address has not been assigned yet, or a firewall is blocking the port.

**Solution**:

1. In the **Network and Connection** card, check that the **External** zone contains an address (one per member for a replica set), and not **Disabled** or "Waiting for allocation…".
2. Test connectivity (on a replica set, with the address of one member):
   ```bash
   mongosh "mongodb://<host>:27017/?directConnection=true" --eval 'db.runCommand({ ping: 1 })'
   ```
3. Check that no outbound firewall on your network is blocking port `27017`.

### `ENOTFOUND`, or write refused with `not primary`

**Cause**: on a replica set, the client received the `replicaSet` parameter and tries to reach the members under their in-cluster names, which do not resolve from outside; or it is connected directly to a secondary, which does not accept writes.

**Solution**:

1. Remove `replicaSet` from the connection string and add `directConnection=true`, as in the **External connection string** of the **Network and Connection** card.
2. To write, connect to the primary member: `db.hello().isWritablePrimary` tells you whether the member you reached is the primary. Otherwise, try another member of the list.

### `Authentication failed`

**Cause**: wrong password or password revoked by a rotation, or wrong authentication database.

**Solution**:

1. Specify the `admin` authentication database (`--authenticationDatabase admin` or `?authSource=admin` in the URI).
2. If in doubt about the password, generate a new one via **Actions** → **Change Password**, then update your applications.

### `not authorized on <database> to execute command`

**Cause**: the user has no access to this database, or only **Read-only** access.

**Solution**: via **Actions** → **Manage Access**, add the database concerned with the appropriate **Rights**, then reconnect.

### Error when adding access or a user

**Cause**: no database access is defined, an access targets a system database (`admin`, `local`, `config`), or a name does not follow the naming rules.

**Solution**: assign at least one access to an application database, and use only lowercase letters, digits and hyphens, starting with a letter and ending with a letter or a digit. See [MongoDB concepts](./concepts.md#naming-rules).

### An `admin` line is shown in error in "Manage Access"

**Cause**: the user was created with the cluster creation wizard before console v1.3.0, which gave it a role on the `admin` system database. A system database can no longer receive access, and updating the user is refused as long as this line is present.

**Solution**: remove the `admin` line, add the user's application database if needed, then click **Save**. The "Access updated" message confirms the change.

### Disk full

**Cause**: the data volume has reached the **Allocated Size**.

**Solution**: increase the **Disk size (GB)** via **Edit**, within the project's storage quota. The size cannot be reduced afterwards. See [Change resources](./how-to/scale-resources.md). If needed, delete obsolete data or set TTL indexes on event collections.
