---
sidebar_position: 3
title: Quick start
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# Getting started with ClickHouse

:::info Availability
ClickHouse is not yet available as self-service in the [Hikube console](https://console.hikube.cloud).
To provision an instance or change its configuration, [contact support](mailto:support@hidora.io).
:::

This guide describes the information to prepare when requesting a **ClickHouse** instance, then how to get started with `clickhouse-client` once the instance is delivered.

---

## Objectives

By the end of this guide, you will have:

- A complete provisioning request, with the topology suited to your needs
- A working connection with `clickhouse-client`
- A first analytical table

---

## Prerequisites

- A **Hikube account** and a **project** with sufficient quotas
- The **`clickhouse-client`** client installed on your workstation

---

## Step 1: Define the topology

Choose the number of **shards** and **replicas** according to your usage (see [Overview](./overview.md)):

| Usage | Shards | Replicas per shard |
|-------|--------|--------------------|
| POC, development | 1 | 1 |
| Production, moderate volume | 1 | 2 |
| Production, large volumes | 2 or more | 2 |

A replicated configuration relies on **ClickHouse Keeper** (3 instances recommended) for coordination.

---

## Step 2: Request the instance

[Contact support](mailto:support@hidora.io) with the following information:

| Information | Example |
|-------------|---------|
| Project | `analytics` |
| Instance name | `events-ch` |
| Shards / replicas per shard | `1` / `2` |
| Preset per replica | `large` (2 CPU, 2Gi) |
| Storage size per replica | `50 GB` |
| Users and rights | `app` (full access), `analyst` (read-only) |
| Access from the Internet | Yes / No |
| Backups | Yes / No, with the desired retention |

---

## Step 3: Check the delivery

Support confirms that the instance is available and sends you the connection details: address, ports and credentials.

---

## Step 4: Retrieve the credentials

Store the passwords you received in a password manager. To change them, contact support.

---

## Step 5: Connection and tests

ClickHouse exposes the native protocol (port `9000` by default) and the HTTP interface (port `8123` by default).

```bash
clickhouse-client \
  --host <host> \
  --port 9000 \
  --user app \
  --password \
  --query "SHOW DATABASES;"
```

**Expected result:**

```console
INFORMATION_SCHEMA
default
information_schema
system
```

Then create a first table:

```sql
CREATE TABLE default.events
(
    ts DateTime,
    user_id UInt64,
    action String
)
ENGINE = MergeTree
ORDER BY (ts, user_id);

INSERT INTO default.events VALUES (now(), 1, 'login');
SELECT action, count() FROM default.events GROUP BY action;
```

---

## Step 6: Quick troubleshooting

### Unable to connect

Check the address and port: `9000` for the native protocol (`clickhouse-client`), `8123` for HTTP. If the instance is not exposed on the Internet, connect from a resource in the same project.

### Authentication refused

Check the user and password you received. To reset a password, contact support.

### Slow queries

Check that the `ORDER BY` of your tables matches your most frequent filters. See [Troubleshooting](./troubleshooting.md).

---

## Step 7: Cleanup

To delete a ClickHouse instance, [contact support](mailto:support@hidora.io) with the project and the instance name.

:::warning
Deleting an instance erases all associated data. It is **irreversible**.
:::

---

<NavigationFooter
  nextSteps={[
    {label: "Concepts", href: "../concepts"},
    {label: "FAQ", href: "../faq"},
  ]}
  seeAlso={[
    {label: "All databases", href: "../../"},
  ]}
/>
