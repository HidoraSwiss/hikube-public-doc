---
title: Database gestiti
sidebar_position: 0
---

import ServiceCardGrid from '@site/src/components/ServiceCardGrid';

# Database gestiti

Hikube offre database completamente gestiti, distribuiti tramite `kubectl apply`. Ogni servizio include replica, backup automatici e monitoraggio integrato.

## Confronto

| Servizio | Tipo | Operatore | Replica | Caso d'uso |
|----------|------|-----------|---------|------------|
| PostgreSQL | Relazionale | CloudNativePG | Streaming + failover | App transazionali, API |
| MySQL | Relazionale | Oracle Operator | Group Replication | CMS, applicazioni legacy |
| Redis | Chiave-valore | Spotahome | Sentinel | Cache, sessioni, code |
| ClickHouse | Analitico | Altinity | ReplicatedMergeTree | Analytics, log, OLAP |

## Servizi disponibili

<ServiceCardGrid items={[
  {
    title: "PostgreSQL",
    description: "Database relazionale open source, altamente estensibile con replica nativa.",
    icon: "/img/services/postgresql.svg",
    href: "./postgresql/overview",
    tags: ["Relazionale", "ACID"],
  },
  {
    title: "MySQL",
    description: "Database relazionale popolare, compatibile con l'ecosistema MySQL/MariaDB.",
    icon: "/img/services/mysql.svg",
    href: "./mysql/overview",
    tags: ["Relazionale", "ACID"],
  },
  {
    title: "Redis",
    description: "Store chiave-valore in memoria, ideale per cache e sessioni applicative.",
    icon: "/img/services/redis.svg",
    href: "./redis/overview",
    tags: ["Chiave-valore", "In-memory"],
  },
  {
    title: "ClickHouse",
    description: "Database analitico colonnare per query OLAP su larga scala.",
    icon: "/img/services/clickhouse.svg",
    href: "./clickhouse/overview",
    tags: ["Analitico", "Colonnare"],
  },
]} />
