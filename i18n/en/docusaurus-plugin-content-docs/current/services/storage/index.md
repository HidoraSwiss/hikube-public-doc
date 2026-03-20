---
title: Storage
sidebar_position: 0
---

import ServiceCardGrid from '@site/src/components/ServiceCardGrid';

# Storage

Hikube offers managed storage solutions, encrypted and replicated across multiple Swiss datacenters.

## Storage Types

| Type | Technology | Use Case | Access |
|------|-----------|----------|--------|
| Object storage (S3) | S3 compatible | Files, backups, static assets | S3 API |
| Block storage | LINSTOR/DRBD | Kubernetes persistent volumes | PVC in your clusters |
| Local storage | NVMe SSD | Low-latency workloads | Automatic via StorageClass |

:::note
Block and local storage are managed automatically by the platform via Kubernetes StorageClasses.
Only S3 object storage is provisioned as a standalone service.
:::

## Features

- **Encryption**: data encrypted at rest and in transit
- **Replication**: synchronous replication across 3 datacenters for block storage
- **Isolation**: each tenant has its own credentials and storage spaces
- **High availability**: automatic failover in case of failure

## Available Services

<ServiceCardGrid items={[
  {
    title: "S3 Buckets",
    description: "S3-compatible object storage for your files, backups and assets. Provisioned via kubectl apply.",
    icon: "/img/services/s3.svg",
    href: "./buckets/overview",
    tags: ["Object Storage", "S3"],
  },
]} />
