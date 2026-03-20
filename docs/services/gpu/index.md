---
title: GPU as a Service
sidebar_position: 0
---

import ServiceCardGrid from '@site/src/components/ServiceCardGrid';

# GPU as a Service

Hikube propose l'accès aux accélérateurs **NVIDIA** via GPU Passthrough, permettant l'exécution de workloads nécessitant une accélération matérielle (IA/ML, rendu, HPC).

## Modes d'utilisation

| Mode | Description | Cas d'usage |
|------|-------------|-------------|
| GPU sur Kubernetes | Node group GPU dédié dans un cluster managé | Entraînement ML, inférence, batch processing |
| GPU sur VM | GPU attaché directement à une machine virtuelle | CUDA natif, rendu graphique, HPC legacy |

## Guides de provisionnement

<ServiceCardGrid items={[
  {
    title: "GPU sur Kubernetes",
    description: "Provisionner un node group GPU dans un cluster Kubernetes managé avec le GPU Operator.",
    icon: "/img/services/gpu.svg",
    href: "./how-to/provision-gpu-kubernetes",
    tags: ["Kubernetes", "GPU Operator"],
  },
  {
    title: "GPU sur VM",
    description: "Attacher un GPU NVIDIA à une machine virtuelle KubeVirt via GPU Passthrough.",
    icon: "/img/services/gpu.svg",
    href: "./how-to/provision-gpu-vm",
    tags: ["VM", "Passthrough"],
  },
  {
    title: "Vue d'ensemble",
    description: "Architecture, types de GPU disponibles et modèle de facturation.",
    icon: "/img/services/gpu.svg",
    href: "./overview",
  },
]} />
