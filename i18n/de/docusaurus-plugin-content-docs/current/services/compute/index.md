---
title: Rechenressourcen
sidebar_position: 0
---

import ServiceCardGrid from '@site/src/components/ServiceCardGrid';

# Rechenressourcen

Mit Hikube stellen Sie virtuelle Maschinen für Ihre anspruchsvollsten Workloads bereit. Die Instanzen werden in der [Hikube-Konsole](https://console.hikube.cloud) im Menü **Infrastructure** > **VM Instances** erstellt und verwaltet.

## Verfügbare Dienste

<ServiceCardGrid items={[
  {
    title: "Virtuelle Maschinen",
    description: "Stellen Sie Linux- oder Windows-VMs mit vorkonfigurierten Instanztypen, replizierten Disks und optional NVIDIA-GPUs bereit.",
    icon: "/img/services/compute.svg",
    href: "./overview",
    tags: ["VMs", "Konsole"],
  },
  {
    title: "Schnellstart",
    description: "Erstellen Sie Ihre erste VM in der Konsole und verbinden Sie sich per SSH.",
    icon: "/img/services/compute.svg",
    href: "./quick-start",
  },
]} />
