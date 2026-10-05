---
title: Speicher
sidebar_position: 0
---

import ServiceCardGrid from '@site/src/components/ServiceCardGrid';

# Speicher

Hikube bietet verwaltete Speicherlösungen, verschlüsselbar und über mehrere Schweizer Rechenzentren repliziert. Disks und S3-Buckets verwalten Sie im Self-Service in der [Hikube-Konsole](https://console.hikube.cloud), im Menü **Infrastructure** Ihres Projekts.

## Speichertypen

| Typ | Menü der Konsole | Verwendung | Zugriff |
|------|--------------------|-------|-------|
| Disks (Blockspeicher) | **Infrastructure** → **Disks** | System-Disks und Daten-Disks der virtuellen Maschinen | An eine VM angebunden, vom Betriebssystem eingehängt |
| Objektspeicher (S3) | **Infrastructure** → **S3 Buckets** | Dateien, Backups, statische Assets, Archive | S3-API (HTTPS) |

:::note
Die persistenten Volumes Ihrer Kubernetes-Cluster werden innerhalb jedes Clusters über dessen StorageClasses bereitgestellt. Sie werden nicht über das Menü **Disks** verwaltet.
:::

## Merkmale

- **Verschlüsselung**: optionale Verschlüsselung im Ruhezustand (LUKS) für Disks und Buckets; S3-Zugriff über HTTPS
- **Replikation**: Disks mit synchroner oder asynchroner Replikation; Buckets über 3 Rechenzentren repliziert
- **Isolation**: Jede Ressource gehört zu einem Projekt; jeder S3-Benutzer hat eigene Schlüssel, die auf seinen Bucket beschränkt sind
- **Quotas**: Die Größe der Disks wird auf das Speicher-Quota des Projekts angerechnet

## Verfügbare Dienste

<ServiceCardGrid items={[
  {
    title: "Disks",
    description: "Persistente und replizierte Block-Volumes für Ihre virtuellen Maschinen: System-Disks und Daten-Disks.",
    icon: "/img/services/disks.svg",
    href: "./disks/overview",
    tags: ["Block Storage", "VM"],
  },
  {
    title: "S3-Buckets",
    description: "S3-kompatibler Objektspeicher für Ihre Dateien, Backups und Assets, mit Benutzern und Zugriffsschlüsseln pro Bucket.",
    icon: "/img/services/s3.svg",
    href: "./buckets/overview",
    tags: ["Object Storage", "S3"],
  },
]} />
