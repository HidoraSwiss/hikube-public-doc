---
title: Managed Kubernetes
sidebar_position: 0
---

import ServiceCardGrid from '@site/src/components/ServiceCardGrid';

# Managed Kubernetes

Hikube provides fully managed Kubernetes clusters, with preconfigured addons and native integration with the cloud ecosystem. Clusters are created and managed from the [Hikube console](https://console.hikube.cloud), menu **Infrastructure** > **Kubernetes**.

## Quick access

<ServiceCardGrid items={[
  {
    title: "Overview",
    description: "Architecture, features and positioning of the managed Kubernetes service.",
    icon: "/img/services/kubernetes.svg",
    href: "./overview",
  },
  {
    title: "Quick start",
    description: "Create your first Kubernetes cluster from the console in a few minutes.",
    icon: "/img/services/kubernetes.svg",
    href: "./quick-start",
  },
  {
    title: "Plugins",
    description: "Cilium, CoreDNS, Ingress NGINX, Cert-Manager, Flux CD, Velero and more.",
    icon: "/img/services/kubernetes.svg",
    href: "./plugins/cilium",
  },
]} />
