---
sidebar_position: 1
title: Cilium
---

# 🧩 Details zum Feld `addons.cilium`

Das Feld `addons.cilium` definiert die Konfiguration des Add-ons **Cilium**, das als **CNI (Container Network Interface)** für den Kubernetes-Cluster verwendet wird.
Cilium verwaltet das Netzwerk, die Sicherheit und die Observability der Pods mithilfe von **BPF (Berkeley Packet Filter)**.
Dieses Feld ermöglicht die Anpassung der Komponentenbereitstellung über spezifische Werte.

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

Das Feld `valuesOverride` ermöglicht das **Überschreiben der Standardwerte**, die bei der Bereitstellung von Cilium verwendet werden.
Es dient zur Anpassung des CNI-Verhaltens, ohne das Haupt-Chart zu ändern.
Diese Werte können die Konfiguration von **Hubble**, der Verschlüsselung, der Netzwerkrichtlinien oder der zugewiesenen Ressourcen umfassen.
Für weitere konfigurierbare Werte: https://docs.cilium.io/en/stable/helm-reference/

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

- Definieren Sie immer `valuesOverride`, um die Kontrolle über die Netzwerkkonfiguration zu behalten.
- Aktivieren Sie **Hubble** (`hubble.enabled: true`), um von der Netzwerk-Sichtbarkeit und der Flussverfolgung zu profitieren.
- Verwenden Sie `encryption.enabled: true`, um den Inter-Pod-Datenverkehr in sensiblen Umgebungen zu verschlüsseln.
- Prüfen Sie die Kompatibilität der Cilium-Version mit der Kubernetes-Cluster-Version.

---
