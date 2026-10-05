---
title: GPU as a Service
sidebar_position: 0
---

import ServiceCardGrid from '@site/src/components/ServiceCardGrid';

# GPU as a Service

Hikube provides access to **NVIDIA** accelerators in passthrough mode, for workloads that require hardware acceleration (AI/ML, rendering, HPC).

The console has no dedicated GPU page: you choose the GPU **when you create the resource that uses it**, in the [Hikube console](https://console.hikube.cloud).

## Usage modes

| Mode | Where to choose the GPU | Use cases |
|------|-------------------------|-----------|
| GPU on VM | **VM Instances** > **Create an Instance**, **Configuration** step, **Hardware Acceleration (GPU)** section | Native CUDA, interactive environments, rendering |
| GPU on Kubernetes | **Kubernetes** > **Create cluster**, **Nodes** step, **GPU** section of a node group | Containerized training and inference, batch |

## Guides

<ServiceCardGrid items={[
  {
    title: "GPU on VM",
    description: "Create a VM with one or more NVIDIA GPUs from the console wizard.",
    icon: "/img/services/gpu.svg",
    href: "./how-to/provision-gpu-vm",
    tags: ["VM", "Passthrough"],
  },
  {
    title: "GPU on Kubernetes",
    description: "Add a GPU node group to a managed Kubernetes cluster, with the GPU Operator.",
    icon: "/img/services/gpu.svg",
    href: "./how-to/provision-gpu-kubernetes",
    tags: ["Kubernetes", "GPU Operator"],
  },
  {
    title: "Overview",
    description: "Available GPU models, availability, and choosing between VM and Kubernetes.",
    icon: "/img/services/gpu.svg",
    href: "./overview",
  },
]} />
