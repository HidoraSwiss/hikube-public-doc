---
title: GPU as a Service
sidebar_position: 0
---

import ServiceCardGrid from '@site/src/components/ServiceCardGrid';

# GPU as a Service

Hikube offre l'accesso ad acceleratori **NVIDIA** in passthrough, per i carichi di lavoro che richiedono accelerazione hardware (IA/ML, rendering, HPC).

La console non dispone di una pagina GPU dedicata: la GPU si sceglie **al momento della creazione della risorsa che la utilizza**, nella [console Hikube](https://console.hikube.cloud).

## Modalità di utilizzo

| Modalità | Dove scegliere la GPU | Casi d'uso |
|------|-------------------|-------------|
| GPU su VM | **VM Instances** > **Create an Instance**, passaggio **Configuration**, sezione **Hardware Acceleration (GPU)** | CUDA nativo, ambienti interattivi, rendering |
| GPU su Kubernetes | **Kubernetes** > **Create cluster**, passaggio **Nodes**, sezione **GPU** di un gruppo di nodi | Addestramento e inferenza containerizzati, batch |

## Guide

<ServiceCardGrid items={[
  {
    title: "GPU su VM",
    description: "Creare una VM con una o più GPU NVIDIA dalla procedura guidata della console.",
    icon: "/img/services/gpu.svg",
    href: "./how-to/provision-gpu-vm",
    tags: ["VM", "Passthrough"],
  },
  {
    title: "GPU su Kubernetes",
    description: "Aggiungere un gruppo di nodi GPU a un cluster Kubernetes gestito, con il GPU Operator.",
    icon: "/img/services/gpu.svg",
    href: "./how-to/provision-gpu-kubernetes",
    tags: ["Kubernetes", "GPU Operator"],
  },
  {
    title: "Panoramica",
    description: "Modelli di GPU offerti, disponibilità e scelta tra VM e Kubernetes.",
    icon: "/img/services/gpu.svg",
    href: "./overview",
  },
]} />
