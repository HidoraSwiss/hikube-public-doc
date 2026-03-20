---
title: Verwaltete Datenbanken
sidebar_position: 0
---

import ServiceCardGrid from '@site/src/components/ServiceCardGrid';

# Verwaltete Datenbanken

Hikube bietet vollstandig verwaltete Datenbanken, die uber `kubectl apply` bereitgestellt werden. Jeder Dienst umfasst Replikation, automatische Backups und integriertes Monitoring.

## Vergleich

| Dienst | Typ | Operator | Replikation | Anwendungsfall |
|--------|-----|----------|-------------|----------------|
| PostgreSQL | Relational | CloudNativePG | Streaming + Failover | Transaktionale Apps, APIs |
| MySQL | Relational | Oracle Operator | Group Replication | CMS, Legacy-Anwendungen |
| Redis | Key-Value | Spotahome | Sentinel | Cache, Sessions, Warteschlangen |
| ClickHouse | Analytisch | Altinity | ReplicatedMergeTree | Analytics, Logs, OLAP |

## Verfugbare Dienste

<ServiceCardGrid items={[
  {
    title: "PostgreSQL",
    description: "Open-Source relationale Datenbank, hochgradig erweiterbar mit nativer Replikation.",
    icon: "/img/services/postgresql.svg",
    href: "./postgresql/overview",
    tags: ["Relational", "ACID"],
  },
  {
    title: "MySQL",
    description: "Beliebte relationale Datenbank, kompatibel mit dem MySQL/MariaDB-Okosystem.",
    icon: "/img/services/mysql.svg",
    href: "./mysql/overview",
    tags: ["Relational", "ACID"],
  },
  {
    title: "Redis",
    description: "In-Memory Key-Value Store, ideal fur Caching und Anwendungssitzungen.",
    icon: "/img/services/redis.svg",
    href: "./redis/overview",
    tags: ["Key-Value", "In-Memory"],
  },
  {
    title: "ClickHouse",
    description: "Spaltenorientierte analytische Datenbank fur OLAP-Abfragen im grossen Massstab.",
    icon: "/img/services/clickhouse.svg",
    href: "./clickhouse/overview",
    tags: ["Analytisch", "Spaltenorientiert"],
  },
]} />
