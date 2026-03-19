---
sidebar_position: 3
title: GatewayAPI
---

# 🧩 Détails du champ `addons.gatewayAPI`

Le champ `addons.gatewayAPI` définit la configuration de l’add-on **Gateway API**, une extension moderne de Kubernetes pour la gestion des **entrées réseau** (ingress, routes, gateways).
Elle remplace progressivement les objets `Ingress` traditionnels en offrant un modèle plus flexible et extensible.

```yaml
addons:
  gatewayAPI:
    enabled: true
```

---

## `enabled` (boolean) — **Obligatoire**

### Description

Indique si le module **Gateway API** est activé (`true`) ou désactivé (`false`).
Lorsqu’il est activé, les **Custom Resource Definitions (CRDs)** associées à Gateway API (telles que `GatewayClass`, `Gateway`, `HTTPRoute`, etc.) sont installées et disponibles dans le cluster.

### Exemple

```yaml
enabled: true
```

---

## 💡 Buone pratiche

- Activer `enabled: true` pour utiliser la nouvelle API réseau standardisée par la CNCF.
- Tester la compatibilité des ressources (`HTTPRoute`, `TCPRoute`, `ReferencePolicy`, etc.) avant de migrer depuis `Ingress`.

---
