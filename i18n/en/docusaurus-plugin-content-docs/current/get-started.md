---
sidebar_position: 1
title: Getting started
slug: /
---

import ServiceCardGrid from '@site/src/components/ServiceCardGrid';

# Get Started with Hikube

Hikube offers a modern cloud solution that simplifies the deployment and orchestration of containerized applications as well as virtual machines. All services are deployed via `kubectl apply` with a native Kubernetes API.

## Services

<ServiceCardGrid items={[
  {
    title: "Kubernetes",
    description: "Managed Kubernetes clusters with preconfigured plugins and auto-scaling.",
    icon: "/img/services/kubernetes.svg",
    href: "services/kubernetes/overview",
    tags: ["Clusters", "Managed"],
  },
  {
    title: "Virtual Machines",
    description: "KubeVirt VMs with instance profiles and persistent disks.",
    icon: "/img/services/compute.svg",
    href: "services/compute/overview",
    tags: ["VMs", "KubeVirt"],
  },
  {
    title: "GPU",
    description: "Dedicated NVIDIA GPUs for your AI/ML workloads.",
    icon: "/img/services/gpu.svg",
    href: "services/gpu/overview",
    tags: ["GPU", "NVIDIA"],
  },
  {
    title: "Databases",
    description: "PostgreSQL, MySQL, Redis, ClickHouse — fully managed with replication.",
    icon: "/img/services/postgresql.svg",
    href: "services/databases/",
    tags: ["SQL", "NoSQL"],
  },
  {
    title: "Messaging",
    description: "Kafka, RabbitMQ, NATS — managed streaming and queues.",
    icon: "/img/services/kafka.svg",
    href: "services/messaging/",
    tags: ["Streaming", "Queues"],
  },
  {
    title: "S3 Storage",
    description: "S3-compatible buckets, encrypted and replicated.",
    icon: "/img/services/s3.svg",
    href: "services/storage/buckets/overview",
    tags: ["Object Storage", "S3"],
  },
  {
    title: "Terraform",
    description: "Infrastructure as Code with ready-to-use Terraform templates.",
    icon: "/img/services/terraform.svg",
    href: "tools/terraform",
    tags: ["IaC", "Terraform"],
  },
]} />

## Next Steps

To get started with Hikube, we recommend following this learning path:

### 1. Understand Key Concepts
Familiarize yourself with Hikube's architecture and fundamental concepts:
- **[Hikube Concepts](getting-started/concepts.md)** - Architecture, tenants, resources and security

### 2. Your First Deployment
Follow our practical guide to deploy your first application:
- **[Quick Start](getting-started/quick-start.md)** - Deploy an application in 10 minutes

### 3. Master the APIs
Explore the APIs for each service for advanced deployments:
- **[Databases](services/databases/postgresql/overview.md)** - PostgreSQL, MySQL, Redis
- **[Compute Resources](services/compute/overview.md)** - Virtual machines and GPU
- **[Kubernetes](services/kubernetes/overview.md)** - Managed clusters
- **[Storage](services/storage/buckets/overview.md)** - S3-compatible buckets
- **[Infrastructure as Code](tools/terraform.md)** - Terraform templates

## Support

For any questions or assistance:
- Email: support@hidora.io
- Website: [hikube.cloud](https://hikube.cloud)
- LinkedIn: [Hidora](https://www.linkedin.com/company/hidora)

---

*Hikube - Simplify your cloud infrastructure*
