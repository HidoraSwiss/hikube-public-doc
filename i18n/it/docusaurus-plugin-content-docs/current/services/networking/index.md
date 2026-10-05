---
title: Rete
sidebar_position: 0
---

import ServiceCardGrid from '@site/src/components/ServiceCardGrid';

# Rete

Hikube consente di creare reti private isolate, i **VPC**, suddivise in **sottoreti**, per far comunicare le sue macchine virtuali tra loro senza passare da Internet. Si gestiscono dalla [console Hikube](https://console.hikube.cloud), menu **Infrastructure** > **Networking**.

## Accesso rapido

<ServiceCardGrid items={[
  {
    title: "Panoramica",
    description: "A cosa servono i VPC e le sottoreti, e come si combinano con le VM.",
    icon: "/img/services/networking.svg",
    href: "./overview",
    tags: ["VPC", "Sottoreti"],
  },
  {
    title: "Avvio rapido",
    description: "Crei un VPC, vi colleghi due VM e verifichi che comunichino in privato.",
    icon: "/img/services/networking.svg",
    href: "./quick-start",
  },
  {
    title: "Guide pratiche",
    description: "Gestire le sottoreti, collegare o scollegare una VM esistente.",
    icon: "/img/services/networking.svg",
    href: "./how-to/attach-vm-to-vpc",
  },
]} />
