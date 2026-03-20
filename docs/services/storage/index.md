---
title: Stockage
sidebar_position: 0
---

import ServiceCardGrid from '@site/src/components/ServiceCardGrid';

# Stockage

Hikube offre des solutions de stockage managé, chiffré et répliqué sur plusieurs datacenters suisses.

## Types de stockage

| Type | Technologie | Usage | Accès |
|------|-------------|-------|-------|
| Stockage objet (S3) | MinIO | Fichiers, backups, assets statiques | API S3 compatible |
| Stockage bloc | LINSTOR/DRBD | Volumes persistants Kubernetes | PVC dans vos clusters |
| Stockage local | NVMe SSD | Workloads à faible latence | Automatique via StorageClass |

:::note
Le stockage bloc et local est géré automatiquement par la plateforme via les StorageClass Kubernetes.
Seul le stockage objet S3 est provisionné comme un service indépendant.
:::

## Caractéristiques

- **Chiffrement** : données chiffrées au repos et en transit
- **Réplication** : réplication synchrone sur 3 datacenters pour le stockage bloc
- **Isolation** : chaque tenant dispose de ses propres credentials et espaces de stockage
- **Haute disponibilité** : basculement automatique en cas de défaillance

## Services disponibles

<ServiceCardGrid items={[
  {
    title: "Buckets S3",
    description: "Stockage objet compatible S3 pour vos fichiers, backups et assets. Provisionné via kubectl apply.",
    icon: "/img/services/s3.svg",
    href: "./buckets/overview",
    tags: ["Object Storage", "S3", "MinIO"],
  },
]} />
