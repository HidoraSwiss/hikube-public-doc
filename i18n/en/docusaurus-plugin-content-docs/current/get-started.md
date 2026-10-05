---
sidebar_position: 1
title: Get started
slug: /
---

import ServiceCardGrid from '@site/src/components/ServiceCardGrid';

# Get started with Hikube

Hikube is a sovereign cloud platform, hosted in Switzerland, for deploying virtual machines, Kubernetes clusters, databases and storage. All resources are managed from the web console: **[console.hikube.cloud](https://console.hikube.cloud)**.

## Services

<ServiceCardGrid items={[
  {
    title: "Kubernetes",
    description: "Managed Kubernetes clusters with preconfigured plugins and automatic scaling.",
    icon: "/img/services/kubernetes.svg",
    href: "services/kubernetes/overview",
    tags: ["Clusters", "Managed"],
  },
  {
    title: "Virtual machines",
    description: "Linux and Windows VMs with persistent disks and private networking.",
    icon: "/img/services/compute.svg",
    href: "services/compute/overview",
    tags: ["VMs", "Linux", "Windows"],
  },
  {
    title: "GPU",
    description: "NVIDIA GPUs for your VMs and Kubernetes nodes.",
    icon: "/img/services/gpu.svg",
    href: "services/gpu/overview",
    tags: ["GPU", "NVIDIA"],
  },
  {
    title: "Databases",
    description: "PostgreSQL, MariaDB, MongoDB, Redis — managed, with replication.",
    icon: "/img/services/postgresql.svg",
    href: "services/databases/",
    tags: ["SQL", "NoSQL"],
  },
  {
    title: "Messaging",
    description: "RabbitMQ as self-service; Kafka and NATS on request.",
    icon: "/img/services/rabbitmq.svg",
    href: "services/messaging/",
    tags: ["Streaming", "Queues"],
  },
  {
    title: "S3 storage",
    description: "Persistent disks and replicated S3-compatible buckets.",
    icon: "/img/services/s3.svg",
    href: "services/storage/",
    tags: ["Disks", "S3"],
  },
  {
    title: "Terraform",
    description: "Infrastructure as Code via kubeconfig (legacy method, on request).",
    icon: "/img/services/terraform.svg",
    href: "tools/terraform",
    tags: ["IaC", "Legacy"],
  },
]} />

## Next steps

### 1. Understand the key concepts
- **[Hikube concepts](getting-started/concepts.md)**: organization, projects, quotas and services

### 2. Your first deployment
- **[Quick start](getting-started/quick-start.md)**: from your first sign-in to your first Kubernetes cluster

### 3. Explore the services
- **[Virtual machines](services/compute/overview.md)** and **[GPU](services/gpu/overview.md)**
- **[Kubernetes](services/kubernetes/overview.md)**: managed clusters
- **[Databases](services/databases/index.md)**: PostgreSQL, MariaDB, MongoDB, Redis
- **[Storage](services/storage/index.md)**: disks and S3 buckets
- **[Networking](services/networking/overview.md)**: VPCs and subnets

## Support

For any question or assistance:
- Email: support@hidora.io
- Website: [hikube.cloud](https://hikube.cloud)
- LinkedIn: [Hidora](https://www.linkedin.com/company/hidora)

---

*Hikube - Simplify your cloud infrastructure*
