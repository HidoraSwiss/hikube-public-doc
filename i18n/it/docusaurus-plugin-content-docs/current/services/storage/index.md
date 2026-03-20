---
title: Archiviazione
sidebar_position: 0
---

import ServiceCardGrid from '@site/src/components/ServiceCardGrid';

# Archiviazione

Hikube offre soluzioni di archiviazione gestite, crittografate e replicate su piu datacenter svizzeri.

## Tipi di archiviazione

| Tipo | Tecnologia | Caso d'uso | Accesso |
|------|-----------|------------|---------|
| Object storage (S3) | S3 compatibile | File, backup, asset statici | API S3 |
| Block storage | LINSTOR/DRBD | Volumi persistenti Kubernetes | PVC nei vostri cluster |
| Storage locale | NVMe SSD | Workload a bassa latenza | Automatico via StorageClass |

:::note
Il block storage e lo storage locale sono gestiti automaticamente dalla piattaforma tramite le StorageClass Kubernetes.
Solo l'object storage S3 viene fornito come servizio indipendente.
:::

## Caratteristiche

- **Crittografia**: dati crittografati a riposo e in transito
- **Replica**: replica sincrona su 3 datacenter per il block storage
- **Isolamento**: ogni tenant ha le proprie credenziali e spazi di archiviazione
- **Alta disponibilita**: failover automatico in caso di guasto

## Servizi disponibili

<ServiceCardGrid items={[
  {
    title: "Bucket S3",
    description: "Object storage compatibile S3 per file, backup e asset. Provisioning tramite kubectl apply.",
    icon: "/img/services/s3.svg",
    href: "./buckets/overview",
    tags: ["Object Storage", "S3"],
  },
]} />
