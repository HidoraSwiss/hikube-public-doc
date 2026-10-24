---
sidebar_position: 1
title: Home
slug: /
---

import ServiceCardGrid from '@site/src/components/ServiceCardGrid';

# Documentazione Hikube

Hikube è una piattaforma cloud sovrana, ospitata in Svizzera, per distribuire macchine virtuali, cluster Kubernetes, database e storage. Tutte le risorse si gestiscono dalla console web: **[console.hikube.cloud](https://console.hikube.cloud)**.

## Servizi

<ServiceCardGrid items={[
  {
    title: "Kubernetes",
    description: "Cluster Kubernetes gestiti con plugin preconfigurati e scaling automatico.",
    icon: "/img/services/kubernetes.svg",
    href: "services/kubernetes/overview",
    tags: ["Cluster", "Gestito"],
  },
  {
    title: "Macchine virtuali",
    description: "VM Linux e Windows con dischi persistenti e rete privata.",
    icon: "/img/services/compute.svg",
    href: "services/compute/overview",
    tags: ["VM", "Linux", "Windows"],
  },
  {
    title: "GPU",
    description: "GPU NVIDIA per le sue VM e i nodi Kubernetes.",
    icon: "/img/services/gpu.svg",
    href: "services/gpu/overview",
    tags: ["GPU", "NVIDIA"],
  },
  {
    title: "Database",
    description: "PostgreSQL, MariaDB, MongoDB, Redis — gestiti con replica.",
    icon: "/img/services/postgresql.svg",
    href: "services/databases/",
    tags: ["SQL", "NoSQL"],
  },
  {
    title: "Messaggistica",
    description: "RabbitMQ in modalità self-service; Kafka e NATS su richiesta.",
    icon: "/img/services/rabbitmq.svg",
    href: "services/messaging/",
    tags: ["Streaming", "Code"],
  },
  {
    title: "Storage",
    description: "Dischi persistenti e bucket compatibili S3, replicati.",
    icon: "/img/services/s3.svg",
    href: "services/storage/",
    tags: ["Dischi", "S3"],
  },
  {
    title: "Terraform",
    description: "Infrastructure as Code tramite kubeconfig (metodo dismesso, sostituito dall'API pubblica).",
    icon: "/img/services/terraform.svg",
    href: "tools/terraform",
    tags: ["IaC", "Legacy"],
  },
]} />

## Prossimi passi

### 1. Comprendere i concetti chiave
- **[Concetti Hikube](getting-started/concepts.md)**: organizzazione, progetti, quota e servizi

### 2. La prima distribuzione
- **[Avvio rapido](getting-started/quick-start.md)**: dal primo accesso al primo cluster Kubernetes

### 3. Esplorare i servizi
- **[Macchine virtuali](services/compute/overview.md)** e **[GPU](services/gpu/overview.md)**
- **[Kubernetes](services/kubernetes/overview.md)**: cluster gestiti
- **[Database](services/databases/index.md)**: PostgreSQL, MariaDB, MongoDB, Redis
- **[Storage](services/storage/index.md)**: dischi e bucket S3
- **[Rete](services/networking/overview.md)**: VPC e sottoreti

## Supporto

Per qualsiasi domanda o assistenza:
- E-mail: support@hidora.io
- Sito web: [hikube.cloud](https://hikube.cloud)
- LinkedIn: [Hidora](https://www.linkedin.com/company/hidora)

---

*Hikube - Semplifichi la sua infrastruttura cloud*
