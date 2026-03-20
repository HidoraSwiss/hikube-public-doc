---
title: Bases de données managées
sidebar_position: 0
---

import ServiceCardGrid from '@site/src/components/ServiceCardGrid';

# Bases de données managées

Hikube propose des bases de données entièrement gérées, déployées via `kubectl apply`. Chaque service inclut la réplication, les sauvegardes automatiques et le monitoring intégré.

## Comparatif

| Service | Type | Opérateur | Réplication | Cas d'usage |
|---------|------|-----------|-------------|-------------|
| PostgreSQL | Relationnel | CloudNativePG | Streaming + failover | Applications transactionnelles, APIs |
| MySQL | Relationnel | Oracle Operator | Group Replication | CMS, applications legacy |
| Redis | Clé-valeur | Spotahome | Sentinel | Cache, sessions, files d'attente |
| ClickHouse | Analytique | Altinity | ReplicatedMergeTree | Analytics, logs, OLAP |

## Services disponibles

<ServiceCardGrid items={[
  {
    title: "PostgreSQL",
    description: "Base de données relationnelle open source, hautement extensible avec réplication native.",
    icon: "/img/services/postgresql.svg",
    href: "./postgresql/overview",
    tags: ["Relationnel", "ACID"],
  },
  {
    title: "MySQL",
    description: "Base de données relationnelle populaire, compatible avec l'écosystème MySQL/MariaDB.",
    icon: "/img/services/mysql.svg",
    href: "./mysql/overview",
    tags: ["Relationnel", "ACID"],
  },
  {
    title: "Redis",
    description: "Store clé-valeur en mémoire, idéal pour le cache et les sessions applicatives.",
    icon: "/img/services/redis.svg",
    href: "./redis/overview",
    tags: ["Clé-valeur", "In-memory"],
  },
  {
    title: "ClickHouse",
    description: "Base de données analytique colonnaire pour les requêtes OLAP à grande échelle.",
    icon: "/img/services/clickhouse.svg",
    href: "./clickhouse/overview",
    tags: ["Analytique", "Colonnaire"],
  },
]} />
