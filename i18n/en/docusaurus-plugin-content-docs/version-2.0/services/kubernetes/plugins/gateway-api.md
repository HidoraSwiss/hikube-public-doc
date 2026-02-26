---

sidebar_position: 3
title: GatewayAPI
-----------------

# 🧩 Details of the `addons.gatewayAPI` Field

The `addons.gatewayAPI` field defines the configuration of the **Gateway API** add-on, a modern Kubernetes extension for managing **network ingress** (ingress, routes, gateways).
It is progressively replacing traditional `Ingress` objects by offering a more flexible and extensible model.

```yaml
addons:
  gatewayAPI:
    enabled: true
```

---

## `enabled` (boolean) — **Required**

### Description

Indicates whether the **Gateway API** module is enabled (`true`) or disabled (`false`).
When enabled, the associated **Custom Resource Definitions (CRDs)** (such as `GatewayClass`, `Gateway`, `HTTPRoute`, etc.) are installed and available in the cluster.

### Example

```yaml
enabled: true
```

---

## 💡 Best Practices

* Enable `enabled: true` to use the new CNCF-standardized network API.
* Test the compatibility of resources (`HTTPRoute`, `TCPRoute`, `ReferencePolicy`, etc.) before migrating from `Ingress`.

---
