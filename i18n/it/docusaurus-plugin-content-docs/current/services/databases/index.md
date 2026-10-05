---
title: Database gestiti
sidebar_position: 0
---

import ServiceCardGrid from '@site/src/components/ServiceCardGrid';

# Database gestiti

Hikube offre database completamente gestiti, che lei crea e amministra dalla [console Hikube](https://console.hikube.cloud), nella sezione **DB & Messaging** del menu laterale del suo progetto. Per ogni cluster, la console le permette di scegliere la versione, il profilo di risorse (preset), il numero di repliche e la dimensione del disco, di gestire gli utenti e, a seconda del motore, i database.

## Confronto

| Servizio | Tipo | Disponibile nella console | Casi d'uso |
|----------|------|---------------------------|------------|
| PostgreSQL | Relazionale | Sì | Applicazioni transazionali, API |
| MariaDB | Relazionale (compatibile MySQL) | Sì | CMS, applicazioni web, applicazioni MySQL esistenti |
| MongoDB | Documentale | Sì | Dati semi-strutturati, cataloghi, applicazioni JSON |
| Redis | Chiave-valore in memoria | Sì | Cache, sessioni, code |
| ClickHouse | Analitico colonnare | Su richiesta | Analytics, log, OLAP |

:::info
ClickHouse non è ancora disponibile in modalità self-service nella console. Per effettuare il provisioning di un'istanza, [contatti il supporto](mailto:support@hidora.io).
:::

## Servizi disponibili

<ServiceCardGrid items={[
  {
    title: "PostgreSQL",
    description: "Database relazionale open source, altamente estensibile, con replica nativa.",
    icon: "/img/services/postgresql.svg",
    href: "./postgresql/overview",
    tags: ["Relazionale", "ACID"],
  },
  {
    title: "MariaDB",
    description: "Database relazionale compatibile con i client e il protocollo MySQL.",
    icon: "/img/services/mariadb.svg",
    href: "./mariadb/overview",
    tags: ["Relazionale", "Compatibile MySQL"],
  },
  {
    title: "MongoDB",
    description: "Database orientato ai documenti, con replica e sharding opzionale.",
    icon: "/img/services/mongodb.svg",
    href: "./mongodb/overview",
    tags: ["Documentale", "NoSQL"],
  },
  {
    title: "Redis",
    description: "Store chiave-valore in memoria, ideale per la cache e le sessioni applicative.",
    icon: "/img/services/redis.svg",
    href: "./redis/overview",
    tags: ["Chiave-valore", "In-memory"],
  },
  {
    title: "ClickHouse",
    description: "Database analitico colonnare per query OLAP su larga scala. Disponibile su richiesta.",
    icon: "/img/services/clickhouse.svg",
    href: "./clickhouse/overview",
    tags: ["Analitico", "Su richiesta"],
  },
]} />
