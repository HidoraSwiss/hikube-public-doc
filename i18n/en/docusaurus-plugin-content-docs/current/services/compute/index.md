---
title: Compute Resources
sidebar_position: 0
---

import ServiceCardGrid from '@site/src/components/ServiceCardGrid';

# Compute Resources

Hikube lets you deploy virtual machines and GPU resources for your most demanding workloads.

## Available Services

<ServiceCardGrid items={[
  {
    title: "Virtual Machines",
    description: "Deploy KubeVirt VMs with preconfigured instance profiles and persistent disks.",
    icon: "/img/services/compute.svg",
    href: "./overview",
    tags: ["VMs", "KubeVirt"],
  },
  {
    title: "GPU as a Service",
    description: "Accelerate your AI/ML workloads with managed, dedicated NVIDIA GPUs.",
    icon: "/img/services/gpu.svg",
    href: "../gpu/overview",
    tags: ["GPU", "NVIDIA"],
  },
]} />
