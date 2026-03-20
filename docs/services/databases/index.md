---
title: Bases de donnees managees
sidebar_position: 0
---

import ServiceCardGrid from '@site/src/components/ServiceCardGrid';

# Bases de donnees managees

Hikube propose des bases de donnees entierement gerees, deployees via `kubectl apply`. Chaque service inclut la replication, les sauvegardes automatiques et le monitoring integre.

## Comparatif

| Service | Type | Operateur | Replication | Cas d'usage |
|---------|------|-----------|-------------|-------------|
| PostgreSQL | Relationnel | CloudNativePG | Streaming + failover | Applications transactionnelles, APIs |
| MySQL | Relationnel | Oracle Operator | Group Replication | CMS, applications legacy |
| Redis | Cle-valeur | Spotahome | Sentinel | Cache, sessions, files d'attente |
| ClickHouse | Analytique | Altinity | ReplicatedMergeTree | Analytics, logs, OLAP |

## Services disponibles

<ServiceCardGrid items={[
  {
    title: "PostgreSQL",
    description: "Base de donnees relationnelle open source, hautement extensible avec replication native.",
    icon: "/img/services/postgresql.svg",
    href: "./postgresql/overview",
    tags: ["Relationnel", "ACID"],
  },
  {
    title: "MySQL",
    description: "Base de donnees relationnelle populaire, compatible avec l'ecosysteme MySQL/MariaDB.",
    icon: "/img/services/mysql.svg",
    href: "./mysql/overview",
    tags: ["Relationnel", "ACID"],
  },
  {
    title: "Redis",
    description: "Store cle-valeur en memoire, ideal pour le cache et les sessions applicatives.",
    icon: "/img/services/redis.svg",
    href: "./redis/overview",
    tags: ["Cle-valeur", "In-memory"],
  },
  {
    title: "ClickHouse",
    description: "Base de donnees analytique colonnaire pour les requetes OLAP a grande echelle.",
    icon: "/img/services/clickhouse.svg",
    href: "./clickhouse/overview",
    tags: ["Analytique", "Colonnaire"],
  },
]} />
