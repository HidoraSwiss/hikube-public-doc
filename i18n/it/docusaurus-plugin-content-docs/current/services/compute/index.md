---
title: Risorse di calcolo
sidebar_position: 0
---

import ServiceCardGrid from '@site/src/components/ServiceCardGrid';

# Risorse di calcolo

Hikube consente di distribuire macchine virtuali per i suoi carichi di lavoro più esigenti. Le istanze si creano e si gestiscono dalla [console Hikube](https://console.hikube.cloud), menu **Infrastructure** > **VM Instances**.

## Servizi disponibili

<ServiceCardGrid items={[
  {
    title: "Macchine virtuali",
    description: "Distribuisca VM Linux o Windows con formati di istanza preconfigurati, dischi replicati e, in opzione, GPU NVIDIA.",
    icon: "/img/services/compute.svg",
    href: "./overview",
    tags: ["VMs", "Console"],
  },
  {
    title: "Avvio rapido",
    description: "Crei la sua prima VM dalla console e si connetta in SSH.",
    icon: "/img/services/compute.svg",
    href: "./quick-start",
  },
]} />
