---
title: GPU as a Service
sidebar_position: 0
---

import ServiceCardGrid from '@site/src/components/ServiceCardGrid';

# GPU as a Service

Hikube donne accès à des accélérateurs **NVIDIA** en passthrough, pour les workloads qui demandent une accélération matérielle (IA/ML, rendu, HPC).

La console n'a pas de page GPU dédiée : le GPU se choisit **au moment où vous créez la ressource qui l'utilise**, dans la [console Hikube](https://console.hikube.cloud).

## Modes d'utilisation

| Mode | Où choisir le GPU | Cas d'usage |
|------|-------------------|-------------|
| GPU sur VM | **Instances VM** > **Créer une Instance**, étape **Configuration**, section **Accélération Matérielle (GPU)** | CUDA natif, environnements interactifs, rendu |
| GPU sur Kubernetes | **Kubernetes** > **Créer un cluster**, étape **Nœuds**, section **GPU** d'un groupe de nœuds | Entraînement et inférence conteneurisés, batch |

## Guides

<ServiceCardGrid items={[
  {
    title: "GPU sur VM",
    description: "Créer une VM avec un ou plusieurs GPU NVIDIA depuis l'assistant de la console.",
    icon: "/img/services/gpu.svg",
    href: "./how-to/provision-gpu-vm",
    tags: ["VM", "Passthrough"],
  },
  {
    title: "GPU sur Kubernetes",
    description: "Ajouter un groupe de nœuds GPU à un cluster Kubernetes managé, avec le GPU Operator.",
    icon: "/img/services/gpu.svg",
    href: "./how-to/provision-gpu-kubernetes",
    tags: ["Kubernetes", "GPU Operator"],
  },
  {
    title: "Vue d'ensemble",
    description: "Modèles de GPU proposés, disponibilité et choix entre VM et Kubernetes.",
    icon: "/img/services/gpu.svg",
    href: "./overview",
  },
]} />
