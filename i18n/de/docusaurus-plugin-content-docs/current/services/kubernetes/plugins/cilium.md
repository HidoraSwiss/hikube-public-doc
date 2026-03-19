---
sidebar_position: 1
title: Cilium
---

# 🧩 Details zum Feld `addons.cilium`

Das Feld `addons.cilium` definiert die Konfiguration des Add-ons **Cilium**, das als **CNI (Container Network Interface)** für den Kubernetes-Cluster verwendet wird.
Cilium verwaltet das Netzwerk, die Sicherheit und die Observability der Pods mithilfe von **BPF (Berkeley Packet Filter)**.
Dieses Feld ermöglicht die Anpassung des Deployments über spezifische Werte.

```yaml
addons:
  cilium:
    valuesOverride:
      cilium:
        hubble:
          enabled: true
        encryption:
          enabled: true
```

---

## `cilium` (Object) — **Erforderlich**

### Beschreibung

Das Feld `cilium` stellt die Hauptkonfiguration des Netzwerk-Add-ons dar.
Es gruppiert die für die Installation und Anpassung von Cilium im Cluster erforderlichen Parameter.

### Beispiel

```yaml
cilium:
  valuesOverride:
    cilium:
      hubble:
        enabled: true
```

---

## `valuesOverride` (Object) — **Erforderlich**

### Beschreibung

Das Feld `valuesOverride` ermöglicht das **Überschreiben der Standardwerte**, die beim Deployment von Cilium verwendet werden.
Es dient zur Anpassung des CNI-Verhaltens, ohne das Haupt-Chart zu ändern.
Diese Werte können die Konfiguration von **Hubble**, der Verschlüsselung, der Netzwerkrichtlinien oder der zugewiesenen Ressourcen umfassen.
Weitere definierbare Werte: https://docs.cilium.io/en/stable/helm-reference/

### Beispiel

```yaml
valuesOverride:
  cilium:
    hubble:
      enabled: true
    encryption:
      enabled: true
```

---

## 💡 Best Practices

- Immer `valuesOverride` definieren, um die Kontrolle über die Netzwerkkonfiguration zu behalten.
- **Hubble** (`hubble.enabled: true`) aktivieren, um von der Netzwerksichtbarkeit und Flussverfolgung zu profitieren.
- `encryption.enabled: true` verwenden, um den Inter-Pod-Traffic in sensiblen Umgebungen zu verschlüsseln.
- Die Kompatibilität der Cilium-Version mit der Kubernetes-Cluster-Version überprüfen.

---
