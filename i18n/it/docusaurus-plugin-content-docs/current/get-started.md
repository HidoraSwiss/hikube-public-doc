---
sidebar_position: 1
title: Per iniziare
slug: /
---

import ServiceCardGrid from '@site/src/components/ServiceCardGrid';

# Iniziare con Hikube

Hikube offre una soluzione cloud moderna che semplifica il deployment e l'orchestrazione di applicazioni containerizzate e macchine virtuali. Tutti i servizi vengono distribuiti tramite `kubectl apply` con un'API Kubernetes nativa.

## Servizi

<ServiceCardGrid items={[
  {
    title: "Kubernetes",
    description: "Cluster Kubernetes gestiti con plugin preconfigurati e auto-scaling.",
    icon: "/img/services/kubernetes.svg",
    href: "services/kubernetes/overview",
    tags: ["Cluster", "Gestito"],
  },
  {
    title: "Macchine virtuali",
    description: "VM KubeVirt con profili di istanza e dischi persistenti.",
    icon: "/img/services/compute.svg",
    href: "services/compute/overview",
    tags: ["VM", "KubeVirt"],
  },
  {
    title: "GPU",
    description: "GPU NVIDIA dedicate per i vostri workload AI/ML.",
    icon: "/img/services/gpu.svg",
    href: "services/gpu/overview",
    tags: ["GPU", "NVIDIA"],
  },
  {
    title: "Database",
    description: "PostgreSQL, MySQL, Redis, ClickHouse — completamente gestiti con replica.",
    icon: "/img/services/postgresql.svg",
    href: "services/databases/",
    tags: ["SQL", "NoSQL"],
  },
  {
    title: "Messaggistica",
    description: "Kafka, RabbitMQ, NATS — streaming e code gestiti.",
    icon: "/img/services/kafka.svg",
    href: "services/messaging/",
    tags: ["Streaming", "Code"],
  },
  {
    title: "Storage S3",
    description: "Bucket S3 compatibili, crittografati e replicati.",
    icon: "/img/services/s3.svg",
    href: "services/storage/buckets/overview",
    tags: ["Object Storage", "S3"],
  },
  {
    title: "Terraform",
    description: "Infrastructure as Code con template Terraform pronti all'uso.",
    icon: "/img/services/terraform.svg",
    href: "tools/terraform",
    tags: ["IaC", "Terraform"],
  },
]} />

## Prossimi passi

Per iniziare con Hikube, consigliamo di seguire questo percorso di apprendimento:

### 1. Comprendere i concetti chiave
Familiarizzatevi con l'architettura e i concetti fondamentali di Hikube:
- **[Concetti Hikube](getting-started/concepts.md)** - Architettura, tenant, risorse e sicurezza

### 2. Il vostro primo deployment
Seguite la nostra guida pratica per distribuire la vostra prima applicazione:
- **[Avvio rapido](getting-started/quick-start.md)** - Distribuite un'applicazione in 10 minuti

### 3. Padroneggiare le API
Esplorate le API di ogni servizio per deployment avanzati:
- **[Database](services/databases/postgresql/overview.md)** - PostgreSQL, MySQL, Redis
- **[Risorse di calcolo](services/compute/overview.md)** - Macchine virtuali e GPU
- **[Kubernetes](services/kubernetes/overview.md)** - Cluster gestiti
- **[Storage](services/storage/buckets/overview.md)** - Bucket S3 compatibili
- **[Infrastructure as Code](tools/terraform.md)** - Template Terraform

## Supporto

Per qualsiasi domanda o assistenza:
- Email: support@hidora.io
- Sito web: [hikube.cloud](https://hikube.cloud)
- LinkedIn: [Hidora](https://www.linkedin.com/company/hidora)

---

*Hikube - Semplificate la vostra infrastruttura cloud*
