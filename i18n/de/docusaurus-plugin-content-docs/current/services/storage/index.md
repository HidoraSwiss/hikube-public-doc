---
title: Speicher
sidebar_position: 0
---

import ServiceCardGrid from '@site/src/components/ServiceCardGrid';

# Speicher

Hikube bietet verwaltete Speicherlosungen, verschlusselt und uber mehrere Schweizer Rechenzentren repliziert.

## Speichertypen

| Typ | Technologie | Anwendungsfall | Zugriff |
|-----|-------------|----------------|---------|
| Objektspeicher (S3) | MinIO | Dateien, Backups, statische Assets | S3-kompatible API |
| Blockspeicher | LINSTOR/DRBD | Kubernetes Persistent Volumes | PVC in Ihren Clustern |
| Lokaler Speicher | NVMe SSD | Workloads mit niedriger Latenz | Automatisch uber StorageClass |

:::note
Block- und lokaler Speicher werden automatisch von der Plattform uber Kubernetes StorageClasses verwaltet.
Nur S3-Objektspeicher wird als eigenstandiger Dienst bereitgestellt.
:::

## Merkmale

- **Verschlusselung**: Daten im Ruhezustand und bei der Ubertragung verschlusselt
- **Replikation**: synchrone Replikation uber 3 Rechenzentren fur Blockspeicher
- **Isolation**: jeder Tenant hat eigene Zugangsdaten und Speicherbereiche
- **Hohe Verfugbarkeit**: automatisches Failover bei Ausfall

## Verfugbare Dienste

<ServiceCardGrid items={[
  {
    title: "S3 Buckets",
    description: "S3-kompatibler Objektspeicher fur Ihre Dateien, Backups und Assets. Bereitstellung uber kubectl apply.",
    icon: "/img/services/s3.svg",
    href: "./buckets/overview",
    tags: ["Objektspeicher", "S3", "MinIO"],
  },
]} />
