---
sidebar_position: 3
title: GatewayAPI
---

# 🧩 Details zum Feld `addons.gatewayAPI`

Das Feld `addons.gatewayAPI` definiert die Konfiguration des Add-ons **Gateway API**, einer modernen Kubernetes-Erweiterung für die Verwaltung von **Netzwerk-Eingängen** (Ingress, Routes, Gateways).
Sie ersetzt schrittweise die traditionellen `Ingress`-Objekte und bietet ein flexibleres und erweiterbareres Modell.

```yaml
addons:
  gatewayAPI:
    enabled: true
```

---

## `enabled` (boolean) — **Erforderlich**

### Beschreibung

Gibt an, ob das **Gateway API**-Modul aktiviert (`true`) oder deaktiviert (`false`) ist.
Wenn aktiviert, werden die zugehörigen **Custom Resource Definitions (CRDs)** der Gateway API (wie `GatewayClass`, `Gateway`, `HTTPRoute` usw.) installiert und im Cluster verfügbar gemacht.

### Beispiel

```yaml
enabled: true
```

---

## 💡 Best Practices

- `enabled: true` aktivieren, um die neue, von der CNCF standardisierte Netzwerk-API zu nutzen.
- Die Kompatibilität der Ressourcen (`HTTPRoute`, `TCPRoute`, `ReferencePolicy` usw.) vor der Migration von `Ingress` testen.

---
