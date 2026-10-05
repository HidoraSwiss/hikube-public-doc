---
title: Managed databases
sidebar_position: 0
---

import ServiceCardGrid from '@site/src/components/ServiceCardGrid';

# Managed databases

Hikube offers fully managed databases, which you create and manage from the [Hikube console](https://console.hikube.cloud), in the **DB & Messaging** section of your project's side menu. For each cluster, the console lets you choose the version, the resource template (preset), the number of replicas and the disk size, manage users and, depending on the engine, databases.

## Comparison

| Service | Type | Available in the console | Use cases |
|---------|------|--------------------------|-----------|
| PostgreSQL | Relational | Yes | Transactional applications, APIs |
| MariaDB | Relational (MySQL-compatible) | Yes | CMS, web applications, existing MySQL applications |
| MongoDB | Document | Yes | Semi-structured data, catalogs, JSON applications |
| Redis | In-memory key-value | Yes | Cache, sessions, queues |
| ClickHouse | Columnar analytics | On request | Analytics, logs, OLAP |

:::info
ClickHouse is not yet available as self-service in the console. To provision an instance, [contact support](mailto:support@hidora.io).
:::

## Available services

<ServiceCardGrid items={[
  {
    title: "PostgreSQL",
    description: "Open source relational database, highly extensible with native replication.",
    icon: "/img/services/postgresql.svg",
    href: "./postgresql/overview",
    tags: ["Relational", "ACID"],
  },
  {
    title: "MariaDB",
    description: "Relational database compatible with MySQL clients and protocol.",
    icon: "/img/services/mariadb.svg",
    href: "./mariadb/overview",
    tags: ["Relational", "MySQL-compatible"],
  },
  {
    title: "MongoDB",
    description: "Document-oriented database, with replication and optional sharding.",
    icon: "/img/services/mongodb.svg",
    href: "./mongodb/overview",
    tags: ["Document", "NoSQL"],
  },
  {
    title: "Redis",
    description: "In-memory key-value store, ideal for caching and application sessions.",
    icon: "/img/services/redis.svg",
    href: "./redis/overview",
    tags: ["Key-value", "In-memory"],
  },
  {
    title: "ClickHouse",
    description: "Columnar analytical database for large-scale OLAP queries. Available on request.",
    icon: "/img/services/clickhouse.svg",
    href: "./clickhouse/overview",
    tags: ["Analytics", "On request"],
  },
]} />
