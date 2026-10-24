---
title: Sauvegardes
sidebar_position: 0
description: "Sauvegardez vos bases PostgreSQL et MariaDB, vos machines virtuelles et vos disques Hikube vers un bucket de votre projet, puis restaurez-les depuis la console."
---

import ServiceCardGrid from '@site/src/components/ServiceCardGrid';

# Sauvegardes

Le service de sauvegarde d'Hikube protège vos **bases PostgreSQL**, vos **bases MariaDB**, vos **machines virtuelles** et vos **disques**. Les sauvegardes s'écrivent dans un bucket de votre projet, à la demande ou selon une programmation, et se restaurent depuis la [console Hikube](https://console.hikube.cloud), menu **Infrastructure** > **Sauvegardes**.

## Accès rapide

<ServiceCardGrid items={[
  {
    title: "Vue d'ensemble",
    description: "Ce que le service sauvegarde, où vont les archives et comment se déroule une restauration.",
    icon: "/img/services/backups.svg",
    href: "./overview",
    tags: ["PostgreSQL", "MariaDB", "VM", "Disques"],
  },
  {
    title: "Démarrage rapide",
    description: "Créez une destination, programmez une sauvegarde et restaurez une archive.",
    icon: "/img/services/backups.svg",
    href: "./quick-start",
  },
  {
    title: "Guides pratiques",
    description: "Destinations, programmations, restauration à un instant précis, annulation.",
    icon: "/img/services/backups.svg",
    href: "./how-to/create-destination",
  },
]} />
