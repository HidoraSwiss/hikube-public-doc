---
sidebar_position: 1
title: Startseite
slug: /
---

import ServiceCardGrid from '@site/src/components/ServiceCardGrid';

# Hikube-Dokumentation

Hikube ist eine souveräne Cloud-Plattform mit Hosting in der Schweiz, auf der Sie virtuelle Maschinen, Kubernetes-Cluster, Datenbanken und Speicher bereitstellen. Alle Ressourcen verwalten Sie über die Webkonsole: **[console.hikube.cloud](https://console.hikube.cloud)**.

## Services

<ServiceCardGrid items={[
  {
    title: "Kubernetes",
    description: "Verwaltete Kubernetes-Cluster mit vorkonfigurierten Plugins und automatischer Skalierung.",
    icon: "/img/services/kubernetes.svg",
    href: "services/kubernetes/overview",
    tags: ["Cluster", "Verwaltet"],
  },
  {
    title: "Virtuelle Maschinen",
    description: "Linux- und Windows-VMs mit persistenten Disks und privatem Netzwerk.",
    icon: "/img/services/compute.svg",
    href: "services/compute/overview",
    tags: ["VMs", "Linux", "Windows"],
  },
  {
    title: "GPU",
    description: "NVIDIA-GPUs für Ihre VMs und Kubernetes-Nodes.",
    icon: "/img/services/gpu.svg",
    href: "services/gpu/overview",
    tags: ["GPU", "NVIDIA"],
  },
  {
    title: "Datenbanken",
    description: "PostgreSQL, MariaDB, MongoDB, Redis — verwaltet und repliziert.",
    icon: "/img/services/postgresql.svg",
    href: "services/databases/",
    tags: ["SQL", "NoSQL"],
  },
  {
    title: "Messaging",
    description: "RabbitMQ als Self-Service; Kafka und NATS auf Anfrage.",
    icon: "/img/services/rabbitmq.svg",
    href: "services/messaging/",
    tags: ["Streaming", "Queues"],
  },
  {
    title: "Speicher",
    description: "Persistente Disks und S3-kompatible Buckets, repliziert.",
    icon: "/img/services/s3.svg",
    href: "services/storage/",
    tags: ["Disks", "S3"],
  },
  {
    title: "Terraform",
    description: "Infrastructure as Code über eine kubeconfig (Legacy-Methode, auf Anfrage).",
    icon: "/img/services/terraform.svg",
    href: "tools/terraform",
    tags: ["IaC", "Legacy"],
  },
]} />

## Nächste Schritte

### 1. Die Schlüsselkonzepte verstehen
- **[Hikube-Konzepte](getting-started/concepts.md)**: Organisation, Projekte, Quotas und Services

### 2. Ihre erste Bereitstellung
- **[Schnellstart](getting-started/quick-start.md)**: von der ersten Anmeldung bis zu Ihrem ersten Kubernetes-Cluster

### 3. Die Services erkunden
- **[Virtuelle Maschinen](services/compute/overview.md)** und **[GPU](services/gpu/overview.md)**
- **[Kubernetes](services/kubernetes/overview.md)**: verwaltete Cluster
- **[Datenbanken](services/databases/index.md)**: PostgreSQL, MariaDB, MongoDB, Redis
- **[Speicher](services/storage/index.md)**: Disks und S3-Buckets
- **[Netzwerk](services/networking/overview.md)**: VPC und Subnetze

## Support

Bei Fragen oder für Unterstützung:
- E-Mail: support@hidora.io
- Website: [hikube.cloud](https://hikube.cloud)
- LinkedIn: [Hidora](https://www.linkedin.com/company/hidora)

---

*Hikube - Vereinfachen Sie Ihre Cloud-Infrastruktur*
