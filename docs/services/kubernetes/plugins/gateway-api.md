---
sidebar_position: 3
title: Gateway API
---

# Gateway API

**Gateway API** est une extension de Kubernetes pour la gestion des **entrées réseau** (gateways, routes). Elle offre un modèle plus flexible et extensible que les objets `Ingress` traditionnels.

L'addon installe les **CRDs Kubernetes Gateway API** (canal experimental) : `GatewayClass`, `Gateway`, `HTTPRoute`, etc. Il active aussi la prise en charge de Gateway API dans [Cilium](./cilium.md) (avec son proxy Envoy) et, s'ils sont cochés, dans [Cert-Manager](./cert-manager.md) et [Ouroboros](./ouroboros.md).

## Dans la console

1. À la création, étape **Addons**, cochez **Gateway API** (désactivé par défaut).
2. Sur un cluster existant : **Modifier** > **Extensions & Addons**, cochez **Gateway API**, puis **Enregistrer**.

Cet addon n'a pas de surcharge Helm : il s'active ou se désactive uniquement.

La page de détail du cluster affiche **Gateway API** dans la section **Extensions** lorsqu'il est actif.

## Utilisation dans le cluster

```bash
# CRDs installées
kubectl get crds | grep gateway.networking.k8s.io

# Classes de gateway disponibles
kubectl get gatewayclass
```

Consultez la [documentation Gateway API](https://gateway-api.sigs.k8s.io) pour la description des ressources.

## Bonnes pratiques

- Testez vos ressources (`HTTPRoute`, `TLSRoute`, etc.) sur un cluster de recette avant de migrer depuis `Ingress`.
- Le canal experimental peut évoluer d'une version à l'autre : vérifiez la compatibilité de vos manifestes lors des mises à jour.
