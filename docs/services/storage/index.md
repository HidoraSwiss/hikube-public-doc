---
title: Stockage
sidebar_position: 0
---

import ServiceCardGrid from '@site/src/components/ServiceCardGrid';

# Stockage

Hikube offre des solutions de stockage managé, chiffrable et répliqué sur plusieurs datacenters suisses. Les disques et les buckets S3 se gèrent en libre-service depuis la [console Hikube](https://console.hikube.cloud), dans le menu **Infrastructure** de votre projet.

## Types de stockage

| Type | Menu de la console | Usage | Accès |
|------|--------------------|-------|-------|
| Disques (stockage bloc) | **Infrastructure** → **Disques** | Disques système et disques de données des machines virtuelles | Attaché à une VM, monté par le système d'exploitation |
| Stockage objet (S3) | **Infrastructure** → **Buckets S3** | Fichiers, backups, assets statiques, archives | API S3 (HTTPS) |

:::note
Les volumes persistants de vos clusters Kubernetes sont provisionnés à l'intérieur de chaque cluster, via ses StorageClass. Ils ne sont pas gérés depuis le menu **Disques**.
:::

## Caractéristiques

- **Chiffrement** : chiffrement au repos (LUKS) en option pour les disques et les buckets ; accès S3 en HTTPS
- **Réplication** : disques en réplication synchrone ou asynchrone ; buckets répliqués sur 3 datacenters
- **Isolation** : chaque ressource appartient à un projet ; chaque utilisateur S3 a ses propres clés, limitées à son bucket
- **Quotas** : la taille des disques est imputée au quota de stockage du projet

## Services disponibles

<ServiceCardGrid items={[
  {
    title: "Disques",
    description: "Volumes bloc persistants et répliqués pour vos machines virtuelles : disques système et disques de données.",
    icon: "/img/services/disks.svg",
    href: "./disks/overview",
    tags: ["Block Storage", "VM"],
  },
  {
    title: "Buckets S3",
    description: "Stockage objet compatible S3 pour vos fichiers, backups et assets, avec utilisateurs et clés d'accès par bucket.",
    icon: "/img/services/s3.svg",
    href: "./buckets/overview",
    tags: ["Object Storage", "S3"],
  },
]} />
