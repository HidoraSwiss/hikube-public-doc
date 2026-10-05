---
title: Networking
sidebar_position: 0
---

import ServiceCardGrid from '@site/src/components/ServiceCardGrid';

# Networking

Hikube lets you create isolated private networks, **VPCs**, divided into **subnets**, so that your virtual machines can communicate with each other without going through the Internet. They are managed from the [Hikube console](https://console.hikube.cloud), **Infrastructure** > **Networking** menu.

## Quick access

<ServiceCardGrid items={[
  {
    title: "Overview",
    description: "What VPCs and subnets are for, and how they fit with VMs.",
    icon: "/img/services/networking.svg",
    href: "./overview",
    tags: ["VPC", "Subnets"],
  },
  {
    title: "Quick start",
    description: "Create a VPC, connect two VMs to it and check that they communicate privately.",
    icon: "/img/services/networking.svg",
    href: "./quick-start",
  },
  {
    title: "How-to guides",
    description: "Manage subnets, connect or detach an existing VM.",
    icon: "/img/services/networking.svg",
    href: "./how-to/attach-vm-to-vpc",
  },
]} />
