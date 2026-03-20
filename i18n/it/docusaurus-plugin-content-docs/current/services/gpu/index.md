---
title: GPU as a Service
sidebar_position: 0
---

import ServiceCardGrid from '@site/src/components/ServiceCardGrid';

# GPU as a Service

Hikube offre accesso agli acceleratori **NVIDIA** tramite GPU Passthrough, per workload che richiedono accelerazione hardware (AI/ML, rendering, HPC).

## Modalita di utilizzo

| Modalita | Descrizione | Caso d'uso |
|----------|-------------|------------|
| GPU su Kubernetes | Node group GPU dedicato in un cluster gestito | Training ML, inferenza, batch processing |
| GPU su VM | GPU collegata direttamente a una macchina virtuale | CUDA nativo, rendering grafico, HPC legacy |

## Guide di provisioning

<ServiceCardGrid items={[
  {
    title: "GPU su Kubernetes",
    description: "Provisioning di un node group GPU in un cluster Kubernetes gestito con il GPU Operator.",
    icon: "/img/services/gpu.svg",
    href: "./how-to/provision-gpu-kubernetes",
    tags: ["Kubernetes", "GPU Operator"],
  },
  {
    title: "GPU su VM",
    description: "Collegare una GPU NVIDIA a una VM KubeVirt tramite GPU Passthrough.",
    icon: "/img/services/gpu.svg",
    href: "./how-to/provision-gpu-vm",
    tags: ["VM", "Passthrough"],
  },
  {
    title: "Panoramica",
    description: "Architettura, tipi di GPU disponibili e modello di fatturazione.",
    icon: "/img/services/gpu.svg",
    href: "./overview",
  },
]} />
