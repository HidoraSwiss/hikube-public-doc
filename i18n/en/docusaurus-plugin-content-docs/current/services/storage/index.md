---
title: Storage
sidebar_position: 0
---

import ServiceCardGrid from '@site/src/components/ServiceCardGrid';

# Storage

Hikube provides managed storage solutions that can be encrypted and are replicated across several Swiss datacenters. Disks and S3 buckets are managed self-service from the [Hikube console](https://console.hikube.cloud), in the **Infrastructure** menu of your project.

## Storage types

| Type | Console menu | Usage | Access |
|------|--------------|-------|--------|
| Disks (block storage) | **Infrastructure** → **Disks** | System disks and data disks for virtual machines | Attached to a VM, mounted by the operating system |
| Object storage (S3) | **Infrastructure** → **S3 Buckets** | Files, backups, static assets, archives | S3 API (HTTPS) |

:::note
The persistent volumes of your Kubernetes clusters are provisioned inside each cluster, through its StorageClasses. They are not managed from the **Disks** menu.
:::

## Features

- **Encryption**: optional encryption at rest (LUKS) for disks and buckets; S3 access over HTTPS
- **Replication**: disks with synchronous or asynchronous replication; buckets replicated across 3 datacenters
- **Isolation**: each resource belongs to a project; each S3 user has their own keys, limited to their bucket
- **Quotas**: disk size is charged against the project's storage quota

## Available services

<ServiceCardGrid items={[
  {
    title: "Disks",
    description: "Persistent, replicated block volumes for your virtual machines: system disks and data disks.",
    icon: "/img/services/disks.svg",
    href: "./disks/overview",
    tags: ["Block Storage", "VM"],
  },
  {
    title: "S3 Buckets",
    description: "S3-compatible object storage for your files, backups and assets, with users and access keys per bucket.",
    icon: "/img/services/s3.svg",
    href: "./buckets/overview",
    tags: ["Object Storage", "S3"],
  },
]} />
