---
title: GPU as a Service
sidebar_position: 0
---

import ServiceCardGrid from '@site/src/components/ServiceCardGrid';

# GPU as a Service

Hikube bietet Zugang zu **NVIDIA**-Beschleunigern im Passthrough für Workloads, die Hardwarebeschleunigung benötigen (KI/ML, Rendering, HPC).

Die Konsole hat keine eigene GPU-Seite: Die GPU wird **bei der Erstellung der Ressource gewählt, die sie nutzt**, in der [Hikube-Konsole](https://console.hikube.cloud).

## Nutzungsarten

| Modus | Wo die GPU gewählt wird | Anwendungsfall |
|------|-------------------|-------------|
| GPU auf VM | **VM Instances** > **Create an Instance**, Schritt **Configuration**, Abschnitt **Hardware Acceleration (GPU)** | Natives CUDA, interaktive Umgebungen, Rendering |
| GPU auf Kubernetes | **Kubernetes** > **Create cluster**, Schritt **Nodes**, Abschnitt **GPU** einer Node-Gruppe | Containerisiertes Training und Inferenz, Batch |

## Anleitungen

<ServiceCardGrid items={[
  {
    title: "GPU auf VM",
    description: "Eine VM mit einer oder mehreren NVIDIA-GPUs über den Assistenten der Konsole erstellen.",
    icon: "/img/services/gpu.svg",
    href: "./how-to/provision-gpu-vm",
    tags: ["VM", "Passthrough"],
  },
  {
    title: "GPU auf Kubernetes",
    description: "Einem verwalteten Kubernetes-Cluster eine GPU-Node-Gruppe mit dem GPU Operator hinzufügen.",
    icon: "/img/services/gpu.svg",
    href: "./how-to/provision-gpu-kubernetes",
    tags: ["Kubernetes", "GPU Operator"],
  },
  {
    title: "Übersicht",
    description: "Angebotene GPU-Modelle, Verfügbarkeit und Wahl zwischen VM und Kubernetes.",
    icon: "/img/services/gpu.svg",
    href: "./overview",
  },
]} />
