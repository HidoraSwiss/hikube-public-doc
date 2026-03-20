---
sidebar_position: 1
title: Bien démarrer
slug: /
---

import ServiceCardGrid from '@site/src/components/ServiceCardGrid';

# Commencer avec Hikube

Hikube offre une solution cloud moderne qui facilite le déploiement et l'orchestration d'applications conteneurisées ainsi que de machines virtuelles. Tous les services sont déployés via `kubectl apply` avec une API Kubernetes native.

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
    description: "VMs KubeVirt avec profiles d'instances et disques persistants.",
    icon: "/img/services/compute.svg",
    href: "services/compute/overview",
    tags: ["VMs", "KubeVirt"],
  },
  {
    title: "GPU",
    description: "GPU NVIDIA dédiés pour vos workloads IA/ML.",
    icon: "/img/services/gpu.svg",
    href: "services/gpu/overview",
    tags: ["GPU", "NVIDIA"],
  },
  {
    title: "Bases de données",
    description: "PostgreSQL, MySQL, Redis, ClickHouse — entièrement managés avec réplication.",
    icon: "/img/services/postgresql.svg",
    href: "services/databases/",
    tags: ["SQL", "NoSQL"],
  },
  {
    title: "Messagerie",
    description: "Kafka, RabbitMQ, NATS — streaming et files d'attente managés.",
    icon: "/img/services/kafka.svg",
    href: "services/messaging/",
    tags: ["Streaming", "Queues"],
  },
  {
    title: "Stockage S3",
    description: "Buckets S3 compatibles, chiffrés et répliqués.",
    icon: "/img/services/s3.svg",
    href: "services/storage/buckets/overview",
    tags: ["Object Storage", "S3"],
  },
  {
    title: "Terraform",
    description: "Infrastructure as Code avec des templates Terraform prêts à l'emploi.",
    icon: "/img/services/terraform.svg",
    href: "tools/terraform",
    tags: ["IaC", "Terraform"],
  },
]} />

## Prochaines étapes

Pour bien démarrer avec Hikube, nous vous recommandons de suivre ce parcours d'apprentissage :

### 1. Comprendre les concepts clés
Familiarisez-vous avec l'architecture et les concepts fondamentaux d'Hikube :
- **[Concepts Hikube](getting-started/concepts.md)** - Architecture, tenants, ressources et sécurité

### 2. Votre premier déploiement
Suivez notre guide pratique pour déployer votre première application :
- **[Démarrage rapide](getting-started/quick-start.md)** - Déployez une application en 10 minutes

### 3. Maîtriser les APIs
Explorez les APIs de chaque service pour des déploiements avancés :
- **[Bases de données](services/databases/postgresql/overview.md)** - PostgreSQL, MySQL, Redis
- **[Ressources de calcul](services/compute/overview.md)** - Machines virtuelles et GPU
- **[Kubernetes](services/kubernetes/overview.md)** - Clusters managés
- **[Stockage](services/storage/buckets/overview.md)** - Buckets S3 compatibles
- **[Infrastructure as Code](tools/terraform.md)** - Templates Terraform

## Support

Pour toute question ou assistance :
- Email : support@hidora.io
- Site web : [hikube.cloud](https://hikube.cloud)
- LinkedIn : [Hidora](https://www.linkedin.com/company/hidora)

---

*Hikube - Simplifiez votre infrastructure cloud*
