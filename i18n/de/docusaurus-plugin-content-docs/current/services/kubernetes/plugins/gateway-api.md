---
sidebar_position: 3
title: GatewayAPI
---

# 🧩 Details zum Feld `addons.gatewayAPI`

Das Feld `addons.gatewayAPI` definiert die Konfiguration des Add-ons **Gateway API**, einer modernen Kubernetes-Erweiterung für die Verwaltung von **Netzwerk-Eingängen** (Ingress, Routes, Gateways).
Sie ersetzt schrittweise die traditionellen `Ingress`-Objekte durch ein flexibleres und erweiterbares Modell.

```yaml
addons:
  gatewayAPI:
    enabled: true
```

---

## `enabled` (boolean) — **Erforderlich**

### Beschreibung

Gibt an, ob das Modul **Gateway API** aktiviert (`true`) oder deaktiviert (`false`) ist.
Wenn es aktiviert ist, werden die zugehörigen **Custom Resource Definitions (CRDs)** der Gateway API (wie `GatewayClass`, `Gateway`, `HTTPRoute` usw.) installiert und im Cluster verfügbar gemacht.

### Beispiel

```yaml
enabled: true
```

---

## 💡 Best Practices

- Aktivieren Sie `enabled: true`, um die neue, von der CNCF standardisierte Netzwerk-API zu nutzen.
- Testen Sie die Kompatibilität der Ressourcen (`HTTPRoute`, `TCPRoute`, `ReferencePolicy` usw.) vor der Migration von `Ingress`.

---
