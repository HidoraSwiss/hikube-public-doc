---
title: Kubernetes managé
sidebar_position: 0
---

import ServiceCardGrid from '@site/src/components/ServiceCardGrid';

# Kubernetes managé

Hikube fournit des clusters Kubernetes entièrement managés, avec des addons préconfigurés et une intégration native à l'écosystème cloud. Les clusters se créent et se pilotent depuis la [console Hikube](https://console.hikube.cloud), menu **Infrastructure** > **Kubernetes**.

## Accès rapide

<ServiceCardGrid items={[
  {
    title: "Vue d'ensemble",
    description: "Architecture, fonctionnalités et positionnement du service Kubernetes managé.",
    icon: "/img/services/kubernetes.svg",
    href: "./overview",
  },
  {
    title: "Démarrage rapide",
    description: "Créez votre premier cluster Kubernetes depuis la console en quelques minutes.",
    icon: "/img/services/kubernetes.svg",
    href: "./quick-start",
  },
  {
    title: "Plugins",
    description: "Cilium, CoreDNS, Ingress NGINX, Cert-Manager, Flux CD, Velero et plus.",
    icon: "/img/services/kubernetes.svg",
    href: "./plugins/cilium",
  },
]} />
