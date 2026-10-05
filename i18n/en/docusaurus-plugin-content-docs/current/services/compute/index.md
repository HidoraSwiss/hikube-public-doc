---
title: Compute resources
sidebar_position: 0
---

import ServiceCardGrid from '@site/src/components/ServiceCardGrid';

# Compute resources

Hikube lets you deploy virtual machines for your most demanding workloads. Instances are created and managed from the [Hikube console](https://console.hikube.cloud), menu **Infrastructure** > **VM Instances**.

## Available services

<ServiceCardGrid items={[
  {
    title: "Virtual machines",
    description: "Deploy Linux or Windows VMs with preconfigured instance types, replicated disks and, optionally, NVIDIA GPUs.",
    icon: "/img/services/compute.svg",
    href: "./overview",
    tags: ["VMs", "Console"],
  },
  {
    title: "Quick start",
    description: "Create your first VM from the console and connect over SSH.",
    icon: "/img/services/compute.svg",
    href: "./quick-start",
  },
]} />
