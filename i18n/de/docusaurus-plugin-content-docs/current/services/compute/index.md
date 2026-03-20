---
title: Rechenressourcen
sidebar_position: 0
---

import ServiceCardGrid from '@site/src/components/ServiceCardGrid';

# Rechenressourcen

Hikube ermoglicht die Bereitstellung von virtuellen Maschinen und GPU-Ressourcen fur Ihre anspruchsvollsten Workloads.

## Verfugbare Dienste

<ServiceCardGrid items={[
  {
    title: "Virtuelle Maschinen",
    description: "Stellen Sie KubeVirt-VMs mit vorkonfigurierten Instanzprofilen und persistenten Festplatten bereit.",
    icon: "/img/services/compute.svg",
    href: "./overview",
    tags: ["VMs", "KubeVirt"],
  },
  {
    title: "GPU as a Service",
    description: "Beschleunigen Sie Ihre KI/ML-Workloads mit verwalteten, dedizierten NVIDIA-GPUs.",
    icon: "/img/services/gpu.svg",
    href: "../gpu/overview",
    tags: ["GPU", "NVIDIA"],
  },
]} />
