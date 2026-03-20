---
title: GPU as a Service
sidebar_position: 0
---

import ServiceCardGrid from '@site/src/components/ServiceCardGrid';

# GPU as a Service

Hikube bietet Zugang zu **NVIDIA**-Beschleunigern uber GPU Passthrough fur hardwarebeschleunigte Workloads (KI/ML, Rendering, HPC).

## Nutzungsmodi

| Modus | Beschreibung | Anwendungsfall |
|-------|-------------|----------------|
| GPU auf Kubernetes | Dedizierte GPU-Nodegroup in einem verwalteten Cluster | ML-Training, Inferenz, Batch-Verarbeitung |
| GPU auf VM | GPU direkt an eine virtuelle Maschine angeschlossen | Natives CUDA, Grafikrendering, Legacy-HPC |

## Bereitstellungsanleitungen

<ServiceCardGrid items={[
  {
    title: "GPU auf Kubernetes",
    description: "Bereitstellung einer GPU-Nodegroup in einem verwalteten Kubernetes-Cluster mit dem GPU Operator.",
    icon: "/img/services/gpu.svg",
    href: "./how-to/provision-gpu-kubernetes",
    tags: ["Kubernetes", "GPU Operator"],
  },
  {
    title: "GPU auf VM",
    description: "NVIDIA-GPU uber GPU Passthrough an eine KubeVirt-VM anschliessen.",
    icon: "/img/services/gpu.svg",
    href: "./how-to/provision-gpu-vm",
    tags: ["VM", "Passthrough"],
  },
  {
    title: "Ubersicht",
    description: "Architektur, verfugbare GPU-Typen und Abrechnungsmodell.",
    icon: "/img/services/gpu.svg",
    href: "./overview",
  },
]} />
