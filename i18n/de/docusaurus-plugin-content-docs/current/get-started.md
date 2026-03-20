---
sidebar_position: 1
title: Erste Schritte
slug: /
---

import ServiceCardGrid from '@site/src/components/ServiceCardGrid';

# Erste Schritte mit Hikube

Hikube bietet eine moderne Cloud-Losung, die die Bereitstellung und Orchestrierung von containerisierten Anwendungen sowie virtuellen Maschinen vereinfacht. Alle Dienste werden uber `kubectl apply` mit einer nativen Kubernetes-API bereitgestellt.

## Dienste

<ServiceCardGrid items={[
  {
    title: "Kubernetes",
    description: "Verwaltete Kubernetes-Cluster mit vorkonfigurierten Plugins und Auto-Scaling.",
    icon: "/img/services/kubernetes.svg",
    href: "services/kubernetes/overview",
    tags: ["Cluster", "Verwaltet"],
  },
  {
    title: "Virtuelle Maschinen",
    description: "KubeVirt-VMs mit Instanzprofilen und persistenten Festplatten.",
    icon: "/img/services/compute.svg",
    href: "services/compute/overview",
    tags: ["VMs", "KubeVirt"],
  },
  {
    title: "GPU",
    description: "Dedizierte NVIDIA-GPUs fur Ihre KI/ML-Workloads.",
    icon: "/img/services/gpu.svg",
    href: "services/gpu/overview",
    tags: ["GPU", "NVIDIA"],
  },
  {
    title: "Datenbanken",
    description: "PostgreSQL, MySQL, Redis, ClickHouse — vollstandig verwaltet mit Replikation.",
    icon: "/img/services/postgresql.svg",
    href: "services/databases/",
    tags: ["SQL", "NoSQL"],
  },
  {
    title: "Messaging",
    description: "Kafka, RabbitMQ, NATS — verwaltetes Streaming und Warteschlangen.",
    icon: "/img/services/kafka.svg",
    href: "services/messaging/",
    tags: ["Streaming", "Queues"],
  },
  {
    title: "S3-Speicher",
    description: "S3-kompatible Buckets, verschlusselt und repliziert.",
    icon: "/img/services/s3.svg",
    href: "services/storage/buckets/overview",
    tags: ["Objektspeicher", "S3"],
  },
  {
    title: "Terraform",
    description: "Infrastructure as Code mit einsatzbereiten Terraform-Templates.",
    icon: "/img/services/terraform.svg",
    href: "tools/terraform",
    tags: ["IaC", "Terraform"],
  },
]} />

## Nachste Schritte

Fur den Einstieg in Hikube empfehlen wir folgenden Lernpfad:

### 1. Grundlegende Konzepte verstehen
Machen Sie sich mit der Architektur und den grundlegenden Konzepten von Hikube vertraut:
- **[Hikube-Konzepte](getting-started/concepts.md)** - Architektur, Tenants, Ressourcen und Sicherheit

### 2. Ihre erste Bereitstellung
Folgen Sie unserem praktischen Leitfaden, um Ihre erste Anwendung bereitzustellen:
- **[Schnellstart](getting-started/quick-start.md)** - Stellen Sie eine Anwendung in 10 Minuten bereit

### 3. Die APIs beherrschen
Erkunden Sie die APIs der einzelnen Dienste fur erweiterte Bereitstellungen:
- **[Datenbanken](services/databases/postgresql/overview.md)** - PostgreSQL, MySQL, Redis
- **[Rechenressourcen](services/compute/overview.md)** - Virtuelle Maschinen und GPU
- **[Kubernetes](services/kubernetes/overview.md)** - Verwaltete Cluster
- **[Speicher](services/storage/buckets/overview.md)** - S3-kompatible Buckets
- **[Infrastructure as Code](tools/terraform.md)** - Terraform-Templates

## Support

Bei Fragen oder fur Unterstutzung:
- E-Mail: support@hidora.io
- Website: [hikube.cloud](https://hikube.cloud)
- LinkedIn: [Hidora](https://www.linkedin.com/company/hidora)

---

*Hikube - Vereinfachen Sie Ihre Cloud-Infrastruktur*
