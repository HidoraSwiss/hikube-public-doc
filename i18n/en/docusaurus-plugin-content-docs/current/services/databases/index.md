---
title: Managed Databases
sidebar_position: 0
---

import ServiceCardGrid from '@site/src/components/ServiceCardGrid';

# Managed Databases

Hikube offers fully managed databases deployed via `kubectl apply`. Each service includes replication, automatic backups, and built-in monitoring.

## Comparison

| Service | Type | Operator | Replication | Use Case |
|---------|------|----------|-------------|----------|
| PostgreSQL | Relational | CloudNativePG | Streaming + failover | Transactional apps, APIs |
| MySQL | Relational | Oracle Operator | Group Replication | CMS, legacy applications |
| Redis | Key-value | Spotahome | Sentinel | Cache, sessions, queues |
| ClickHouse | Analytical | Altinity | ReplicatedMergeTree | Analytics, logs, OLAP |

## Available Services

<ServiceCardGrid items={[
  {
    title: "PostgreSQL",
    description: "Open source relational database, highly extensible with native replication.",
    icon: "/img/services/postgresql.svg",
    href: "./postgresql/overview",
    tags: ["Relational", "ACID"],
  },
  {
    title: "MySQL",
    description: "Popular relational database, compatible with the MySQL/MariaDB ecosystem.",
    icon: "/img/services/mysql.svg",
    href: "./mysql/overview",
    tags: ["Relational", "ACID"],
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
    description: "Columnar analytical database for large-scale OLAP queries.",
    icon: "/img/services/clickhouse.svg",
    href: "./clickhouse/overview",
    tags: ["Analytical", "Columnar"],
  },
]} />
