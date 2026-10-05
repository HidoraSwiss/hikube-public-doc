---
title: Bases de données managées
sidebar_position: 0
---

import ServiceCardGrid from '@site/src/components/ServiceCardGrid';

# Bases de données managées

Hikube propose des bases de données entièrement gérées, que vous créez et administrez depuis la [console Hikube](https://console.hikube.cloud), dans la section **DB & Messaging** du menu latéral de votre projet. Pour chaque cluster, la console vous permet de choisir la version, le gabarit de ressources (preset), le nombre de réplicas et la taille du disque, de gérer les utilisateurs et, selon le moteur, les bases de données.

## Comparatif

| Service | Type | Disponible dans la console | Cas d'usage |
|---------|------|----------------------------|-------------|
| PostgreSQL | Relationnel | Oui | Applications transactionnelles, APIs |
| MariaDB | Relationnel (compatible MySQL) | Oui | CMS, applications web, applications MySQL existantes |
| MongoDB | Document | Oui | Données semi-structurées, catalogues, applications JSON |
| Redis | Clé-valeur en mémoire | Oui | Cache, sessions, files d'attente |
| ClickHouse | Analytique colonnaire | Sur demande | Analytics, logs, OLAP |

:::info
ClickHouse n'est pas encore disponible en libre-service dans la console. Pour en provisionner une instance, [contactez le support](mailto:support@hidora.io).
:::

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
    title: "MariaDB",
    description: "Base de données relationnelle compatible avec les clients et le protocole MySQL.",
    icon: "/img/services/mariadb.svg",
    href: "./mariadb/overview",
    tags: ["Relationnel", "Compatible MySQL"],
  },
  {
    title: "MongoDB",
    description: "Base de données orientée documents, avec réplication et sharding optionnel.",
    icon: "/img/services/mongodb.svg",
    href: "./mongodb/overview",
    tags: ["Document", "NoSQL"],
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
    description: "Base de données analytique colonnaire pour les requêtes OLAP à grande échelle. Disponible sur demande.",
    icon: "/img/services/clickhouse.svg",
    href: "./clickhouse/overview",
    tags: ["Analytique", "Sur demande"],
  },
]} />
