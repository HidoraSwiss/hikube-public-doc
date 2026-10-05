---
sidebar_position: 3
title: Gateway API
---

# Gateway API

**Gateway API** is a Kubernetes extension for managing **network ingress** (gateways, routes). It offers a more flexible and extensible model than traditional `Ingress` objects.

The addon installs the **Kubernetes Gateway API CRDs** (experimental channel): `GatewayClass`, `Gateway`, `HTTPRoute`, etc. It also enables Gateway API support in [Cilium](./cilium.md) (with its Envoy proxy) and, if they are checked, in [Cert-Manager](./cert-manager.md) and [Ouroboros](./ouroboros.md).

## In the console

1. At creation, **Addons** step, check **Gateway API** (disabled by default).
2. On an existing cluster: **Edit** > **Extensions & Addons**, check **Gateway API**, then **Save**.

This addon has no Helm override: it can only be enabled or disabled.

The cluster detail page shows **Gateway API** in the **Extensions** section when it is active.

## Usage in the cluster

```bash
# Installed CRDs
kubectl get crds | grep gateway.networking.k8s.io

# Available gateway classes
kubectl get gatewayclass
```

See the [Gateway API documentation](https://gateway-api.sigs.k8s.io) for a description of the resources.

## Best practices

- Test your resources (`HTTPRoute`, `TLSRoute`, etc.) on a staging cluster before migrating from `Ingress`.
- The experimental channel may change from one version to the next: check the compatibility of your manifests during upgrades.
