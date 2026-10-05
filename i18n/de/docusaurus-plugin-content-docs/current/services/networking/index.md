---
title: Netzwerk
sidebar_position: 0
---

import ServiceCardGrid from '@site/src/components/ServiceCardGrid';

# Netzwerk

Mit Hikube erstellen Sie isolierte private Netzwerke, die **VPCs**, unterteilt in **Subnetze**, damit Ihre virtuellen Maschinen miteinander kommunizieren, ohne über das Internet zu gehen. Sie werden in der [Hikube-Konsole](https://console.hikube.cloud) im Menü **Infrastructure** > **Networking** verwaltet.

## Schnellzugriff

<ServiceCardGrid items={[
  {
    title: "Übersicht",
    description: "Wozu VPCs und Subnetze dienen und wie sie mit den VMs zusammenspielen.",
    icon: "/img/services/networking.svg",
    href: "./overview",
    tags: ["VPC", "Subnetze"],
  },
  {
    title: "Schnellstart",
    description: "Erstellen Sie ein VPC, verbinden Sie zwei VMs damit und prüfen Sie, dass sie privat kommunizieren.",
    icon: "/img/services/networking.svg",
    href: "./quick-start",
  },
  {
    title: "Praktische Anleitungen",
    description: "Subnetze verwalten, eine bestehende VM verbinden oder trennen.",
    icon: "/img/services/networking.svg",
    href: "./how-to/attach-vm-to-vpc",
  },
]} />
