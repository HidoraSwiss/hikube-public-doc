---
title: Kubernetes gestito
sidebar_position: 0
---

import ServiceCardGrid from '@site/src/components/ServiceCardGrid';

# Kubernetes gestito

Hikube fornisce cluster Kubernetes completamente gestiti, con addon preconfigurati e un'integrazione nativa con l'ecosistema cloud. I cluster si creano e si gestiscono dalla [console Hikube](https://console.hikube.cloud), menu **Infrastructure** > **Kubernetes**.

## Accesso rapido

<ServiceCardGrid items={[
  {
    title: "Panoramica",
    description: "Architettura, funzionalità e posizionamento del servizio Kubernetes gestito.",
    icon: "/img/services/kubernetes.svg",
    href: "./overview",
  },
  {
    title: "Avvio rapido",
    description: "Crei il suo primo cluster Kubernetes dalla console in pochi minuti.",
    icon: "/img/services/kubernetes.svg",
    href: "./quick-start",
  },
  {
    title: "Plugin",
    description: "Cilium, CoreDNS, Ingress NGINX, Cert-Manager, Flux CD, Velero e altro.",
    icon: "/img/services/kubernetes.svg",
    href: "./plugins/cilium",
  },
]} />
