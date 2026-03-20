---
title: GPU as a Service
sidebar_position: 0
---

import ServiceCardGrid from '@site/src/components/ServiceCardGrid';

# GPU as a Service

Hikube provides access to **NVIDIA** accelerators via GPU Passthrough, enabling hardware-accelerated workloads (AI/ML, rendering, HPC).

## Usage Modes

| Mode | Description | Use Case |
|------|-------------|----------|
| GPU on Kubernetes | Dedicated GPU node group in a managed cluster | ML training, inference, batch processing |
| GPU on VM | GPU attached directly to a virtual machine | Native CUDA, graphics rendering, legacy HPC |

## Provisioning Guides

<ServiceCardGrid items={[
  {
    title: "GPU on Kubernetes",
    description: "Provision a GPU node group in a managed Kubernetes cluster with the GPU Operator.",
    icon: "/img/services/gpu.svg",
    href: "./how-to/provision-gpu-kubernetes",
    tags: ["Kubernetes", "GPU Operator"],
  },
  {
    title: "GPU on VM",
    description: "Attach an NVIDIA GPU to a KubeVirt virtual machine via GPU Passthrough.",
    icon: "/img/services/gpu.svg",
    href: "./how-to/provision-gpu-vm",
    tags: ["VM", "Passthrough"],
  },
  {
    title: "Overview",
    description: "Architecture, available GPU types, and billing model.",
    icon: "/img/services/gpu.svg",
    href: "./overview",
  },
]} />
