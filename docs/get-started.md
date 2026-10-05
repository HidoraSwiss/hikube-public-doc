---
sidebar_position: 1
title: Bien démarrer
slug: /
---

import ServiceCardGrid from '@site/src/components/ServiceCardGrid';

# Commencer avec Hikube

Hikube est une plateforme cloud souveraine, hébergée en Suisse, pour déployer machines virtuelles, clusters Kubernetes, bases de données et stockage. Toutes les ressources se gèrent depuis la console web : **[console.hikube.cloud](https://console.hikube.cloud)**.

## Services

<ServiceCardGrid items={[
  {
    title: "Kubernetes",
    description: "Clusters Kubernetes managés avec plugins préconfigurés et scaling automatique.",
    icon: "/img/services/kubernetes.svg",
    href: "services/kubernetes/overview",
    tags: ["Clusters", "Managé"],
  },
  {
    title: "Machines virtuelles",
    description: "VM Linux et Windows avec disques persistants et réseau privé.",
    icon: "/img/services/compute.svg",
    href: "services/compute/overview",
    tags: ["VMs", "Linux", "Windows"],
  },
  {
    title: "GPU",
    description: "GPU NVIDIA pour vos VM et nœuds Kubernetes.",
    icon: "/img/services/gpu.svg",
    href: "services/gpu/overview",
    tags: ["GPU", "NVIDIA"],
  },
  {
    title: "Bases de données",
    description: "PostgreSQL, MariaDB, MongoDB, Redis — managés avec réplication.",
    icon: "/img/services/postgresql.svg",
    href: "services/databases/",
    tags: ["SQL", "NoSQL"],
  },
  {
    title: "Messagerie",
    description: "RabbitMQ en libre-service ; Kafka et NATS sur demande.",
    icon: "/img/services/rabbitmq.svg",
    href: "services/messaging/",
    tags: ["Streaming", "Queues"],
  },
  {
    title: "Stockage S3",
    description: "Disques persistants et buckets compatibles S3, répliqués.",
    icon: "/img/services/s3.svg",
    href: "services/storage/",
    tags: ["Disques", "S3"],
  },
  {
    title: "Terraform",
    description: "Infrastructure as Code via kubeconfig (méthode legacy, sur demande).",
    icon: "/img/services/terraform.svg",
    href: "tools/terraform",
    tags: ["IaC", "Legacy"],
  },
]} />

## Prochaines étapes

### 1. Comprendre les concepts clés
- **[Concepts Hikube](getting-started/concepts.md)** : organisation, projets, quotas et services

### 2. Votre premier déploiement
- **[Démarrage rapide](getting-started/quick-start.md)** : de la première connexion à votre premier cluster Kubernetes

### 3. Explorer les services
- **[Machines virtuelles](services/compute/overview.md)** et **[GPU](services/gpu/overview.md)**
- **[Kubernetes](services/kubernetes/overview.md)** : clusters managés
- **[Bases de données](services/databases/index.md)** : PostgreSQL, MariaDB, MongoDB, Redis
- **[Stockage](services/storage/index.md)** : disques et buckets S3
- **[Réseau](services/networking/overview.md)** : VPC et sous-réseaux

## Support

Pour toute question ou assistance :
- Email : support@hidora.io
- Site web : [hikube.cloud](https://hikube.cloud)
- LinkedIn : [Hidora](https://www.linkedin.com/company/hidora)

---

*Hikube - Simplifiez votre infrastructure cloud*
