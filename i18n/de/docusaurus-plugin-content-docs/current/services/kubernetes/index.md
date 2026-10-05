---
title: Verwaltetes Kubernetes
sidebar_position: 0
---

import ServiceCardGrid from '@site/src/components/ServiceCardGrid';

# Verwaltetes Kubernetes

Hikube stellt vollständig verwaltete Kubernetes-Cluster mit vorkonfigurierten Addons und nativer Integration in das Cloud-Ökosystem bereit. Die Cluster werden über die [Hikube-Konsole](https://console.hikube.cloud) im Menü **Infrastructure** > **Kubernetes** erstellt und gesteuert.

## Schnellzugriff

<ServiceCardGrid items={[
  {
    title: "Überblick",
    description: "Architektur, Funktionen und Positionierung des verwalteten Kubernetes-Services.",
    icon: "/img/services/kubernetes.svg",
    href: "./overview",
  },
  {
    title: "Schnellstart",
    description: "Erstellen Sie Ihren ersten Kubernetes-Cluster in wenigen Minuten über die Konsole.",
    icon: "/img/services/kubernetes.svg",
    href: "./quick-start",
  },
  {
    title: "Plugins",
    description: "Cilium, CoreDNS, Ingress NGINX, Cert-Manager, Flux CD, Velero und mehr.",
    icon: "/img/services/kubernetes.svg",
    href: "./plugins/cilium",
  },
]} />
