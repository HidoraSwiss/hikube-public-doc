---
title: Ressources de calcul
sidebar_position: 0
---

import ServiceCardGrid from '@site/src/components/ServiceCardGrid';

# Ressources de calcul

Hikube permet de déployer des machines virtuelles pour vos workloads les plus exigeants. Les instances se créent et se pilotent depuis la [console Hikube](https://console.hikube.cloud), menu **Infrastructure** > **Instances VM**.

## Services disponibles

<ServiceCardGrid items={[
  {
    title: "Machines virtuelles",
    description: "Déployez des VM Linux ou Windows avec des gabarits d'instance préconfigurés, des disques répliqués et, en option, des GPU NVIDIA.",
    icon: "/img/services/compute.svg",
    href: "./overview",
    tags: ["VMs", "Console"],
  },
  {
    title: "Démarrage rapide",
    description: "Créez votre première VM depuis la console et connectez-vous en SSH.",
    icon: "/img/services/compute.svg",
    href: "./quick-start",
  },
]} />
