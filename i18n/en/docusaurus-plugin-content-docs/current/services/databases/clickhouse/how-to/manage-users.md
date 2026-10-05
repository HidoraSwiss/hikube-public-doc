---
title: "How to manage ClickHouse users and profiles"
sidebar_position: 1
---

# How to manage ClickHouse users and profiles

:::info Availability
ClickHouse is not yet available as self-service in the [Hikube console](https://console.hikube.cloud).
To provision an instance or change its configuration, [contact support](mailto:support@hidora.io).
:::

This guide presents the user management options for a Hikube ClickHouse instance and how to check their permissions.

## Available options

The users of a ClickHouse instance are defined by the platform, on request to support. For each user, specify:

| Option | Description |
|--------|-------------|
| Username | Login identifier |
| Access | **Full** (read and write) or **read-only** (`SELECT` queries only) |

Retention of the query logs (`system.query_log`, `system.query_thread_log`) and the size of their dedicated storage are also set on request.

:::tip
Create a read-only user for analytics and reporting tools (Grafana, Metabase, etc.). This limits the risk of accidental data changes.
:::

## Steps

### 1. Request the creation or modification of a user

[Contact support](mailto:support@hidora.io) with the project, the instance name, the username and the desired access level.

### 2. Connect with clickhouse-client

```bash
clickhouse-client --host <host> --port 9000 --user analyst --password
```

### 3. Check the permissions

Once connected with a read-only user, check that writes are blocked:

```sql
-- This query must succeed (read allowed)
SELECT count() FROM system.tables;

-- This query must fail (write forbidden)
CREATE TABLE test_write (id UInt32) ENGINE = Memory;
```

The read-only user receives an error such as:

```console
Code: 164. DB::Exception: analyst: Not enough privileges.
```

## Verification

```sql
SHOW GRANTS;
```

## Further reading

- [ClickHouse concepts](../concepts.md)
- [Troubleshooting](../troubleshooting.md)
