---
sidebar_position: 3
title: Gateway API
---

# Gateway API

**Gateway API** ist eine Kubernetes-Erweiterung zur Verwaltung des **eingehenden Netzwerkverkehrs** (Gateways, Routen). Sie bietet ein flexibleres und erweiterbareres Modell als die klassischen `Ingress`-Objekte.

Das Addon installiert die **CRDs der Kubernetes Gateway API** (experimenteller Kanal): `GatewayClass`, `Gateway`, `HTTPRoute` usw. Außerdem aktiviert es die Unterstützung der Gateway API in [Cilium](./cilium.md) (mit seinem Envoy-Proxy) sowie, sofern ausgewählt, in [Cert-Manager](./cert-manager.md) und [Ouroboros](./ouroboros.md).

## In der Konsole

1. Wählen Sie bei der Erstellung im Schritt **Addons** **Gateway API** aus (standardmäßig deaktiviert).
2. Auf einem bestehenden Cluster: **Edit** > **Extensions & Addons**, **Gateway API** aktivieren, dann **Save**.

Dieses Addon hat kein Helm-Override: Es wird ausschließlich aktiviert oder deaktiviert.

Die Detailseite des Clusters zeigt **Gateway API** im Abschnitt **Extensions** an, wenn es aktiv ist.

## Nutzung im Cluster

```bash
# Installierte CRDs
kubectl get crds | grep gateway.networking.k8s.io

# Verfügbare Gateway-Klassen
kubectl get gatewayclass
```

Eine Beschreibung der Ressourcen finden Sie in der [Gateway-API-Dokumentation](https://gateway-api.sigs.k8s.io).

## Best Practices

- Testen Sie Ihre Ressourcen (`HTTPRoute`, `TLSRoute` usw.) auf einem Testcluster, bevor Sie von `Ingress` migrieren.
- Der experimentelle Kanal kann sich von Version zu Version ändern: Prüfen Sie bei Updates die Kompatibilität Ihrer Manifeste.
