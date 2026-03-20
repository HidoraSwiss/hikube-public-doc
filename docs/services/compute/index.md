---
title: Ressources de calcul
sidebar_position: 0
---

import ServiceCardGrid from '@site/src/components/ServiceCardGrid';

# Ressources de calcul

Hikube permet de deployer des machines virtuelles et des ressources GPU pour vos workloads les plus exigeants.

## Services disponibles

<ServiceCardGrid items={[
  {
    title: "Machines virtuelles",
    description: "Deployez des VMs KubeVirt avec des profiles d'instances preconfigures et des disques persistants.",
    icon: "/img/services/compute.svg",
    href: "./overview",
    tags: ["VMs", "KubeVirt"],
  },
  {
    title: "GPU as a Service",
    description: "Accelerez vos workloads IA/ML avec des GPU NVIDIA manages et dedies.",
    icon: "/img/services/gpu.svg",
    href: "../gpu/overview",
    tags: ["GPU", "NVIDIA"],
  },
]} />
