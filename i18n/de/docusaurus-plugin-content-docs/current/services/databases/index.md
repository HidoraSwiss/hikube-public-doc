---
title: Verwaltete Datenbanken
sidebar_position: 0
---

import ServiceCardGrid from '@site/src/components/ServiceCardGrid';

# Verwaltete Datenbanken

Hikube bietet vollständig verwaltete Datenbanken, die Sie über die [Hikube-Konsole](https://console.hikube.cloud) im Bereich **DB & Messaging** des Seitenmenüs Ihres Projekts erstellen und verwalten. Für jeden Cluster können Sie in der Konsole die Version, das Ressourcenprofil (Preset), die Anzahl der Replicas und die Disk-Größe wählen, die Benutzer verwalten und, je nach Engine, die Datenbanken.

## Vergleich

| Dienst | Typ | In der Konsole verfügbar | Anwendungsfälle |
|---------|------|----------------------------|-------------|
| PostgreSQL | Relational | Ja | Transaktionale Anwendungen, APIs |
| MariaDB | Relational (MySQL-kompatibel) | Ja | CMS, Webanwendungen, bestehende MySQL-Anwendungen |
| MongoDB | Dokument | Ja | Halbstrukturierte Daten, Kataloge, JSON-Anwendungen |
| Redis | In-Memory-Key-Value | Ja | Cache, Sitzungen, Warteschlangen |
| ClickHouse | Spaltenorientierte Analytik | Auf Anfrage | Analytics, Logs, OLAP |

:::info
ClickHouse ist in der Konsole noch nicht im Self-Service verfügbar. Um eine Instanz bereitzustellen, [wenden Sie sich an den Support](mailto:support@hidora.io).
:::

## Verfügbare Dienste

<ServiceCardGrid items={[
  {
    title: "PostgreSQL",
    description: "Relationale Open-Source-Datenbank, hochgradig erweiterbar, mit nativer Replikation.",
    icon: "/img/services/postgresql.svg",
    href: "./postgresql/overview",
    tags: ["Relational", "ACID"],
  },
  {
    title: "MariaDB",
    description: "Relationale Datenbank, kompatibel mit MySQL-Clients und dem MySQL-Protokoll.",
    icon: "/img/services/mariadb.svg",
    href: "./mariadb/overview",
    tags: ["Relational", "MySQL-kompatibel"],
  },
  {
    title: "MongoDB",
    description: "Dokumentenorientierte Datenbank mit Replikation und optionalem Sharding.",
    icon: "/img/services/mongodb.svg",
    href: "./mongodb/overview",
    tags: ["Dokument", "NoSQL"],
  },
  {
    title: "Redis",
    description: "In-Memory-Key-Value-Store, ideal für Cache und Anwendungssitzungen.",
    icon: "/img/services/redis.svg",
    href: "./redis/overview",
    tags: ["Key-Value", "In-Memory"],
  },
  {
    title: "ClickHouse",
    description: "Spaltenorientierte Analysedatenbank für OLAP-Abfragen in großem Maßstab. Auf Anfrage verfügbar.",
    icon: "/img/services/clickhouse.svg",
    href: "./clickhouse/overview",
    tags: ["Analytik", "Auf Anfrage"],
  },
]} />
