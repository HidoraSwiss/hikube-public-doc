---
title: Réseau
sidebar_position: 0
---

import ServiceCardGrid from '@site/src/components/ServiceCardGrid';

# Réseau

Hikube permet de créer des réseaux privés isolés, les **VPC**, découpés en **sous-réseaux**, pour faire communiquer vos machines virtuelles entre elles sans passer par Internet. Ils se gèrent depuis la [console Hikube](https://console.hikube.cloud), menu **Infrastructure** > **Réseau**.

## Accès rapide

<ServiceCardGrid items={[
  {
    title: "Vue d'ensemble",
    description: "À quoi servent les VPC et les sous-réseaux, et comment ils s'articulent avec les VM.",
    icon: "/img/services/networking.svg",
    href: "./overview",
    tags: ["VPC", "Sous-réseaux"],
  },
  {
    title: "Démarrage rapide",
    description: "Créez un VPC, reliez-y deux VM et vérifiez qu'elles communiquent en privé.",
    icon: "/img/services/networking.svg",
    href: "./quick-start",
  },
  {
    title: "Guides pratiques",
    description: "Gérer les sous-réseaux, relier ou détacher une VM existante.",
    icon: "/img/services/networking.svg",
    href: "./how-to/attach-vm-to-vpc",
  },
]} />
