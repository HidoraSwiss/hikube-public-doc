---
title: Risorse di calcolo
sidebar_position: 0
---

import ServiceCardGrid from '@site/src/components/ServiceCardGrid';

# Risorse di calcolo

Hikube consente di distribuire macchine virtuali e risorse GPU per i vostri workload piu esigenti.

## Servizi disponibili

<ServiceCardGrid items={[
  {
    title: "Macchine virtuali",
    description: "Distribuite VM KubeVirt con profili di istanza preconfigurati e dischi persistenti.",
    icon: "/img/services/compute.svg",
    href: "./overview",
    tags: ["VM", "KubeVirt"],
  },
  {
    title: "GPU as a Service",
    description: "Accelerate i vostri workload AI/ML con GPU NVIDIA gestite e dedicate.",
    icon: "/img/services/gpu.svg",
    href: "../gpu/overview",
    tags: ["GPU", "NVIDIA"],
  },
]} />
