---
sidebar_position: 7
title: GPU Operator
---

# 🧩 Details zum Feld `addons.gpuOperator`

Das Feld `addons.gpuOperator` definiert die Konfiguration des Add-ons **NVIDIA GPU Operator**, das zur automatischen Verwaltung von **GPUs** in einem Kubernetes-Cluster verwendet wird.
Diese Komponente installiert und pflegt die NVIDIA-Treiber, die Laufzeit-Plugins, das `device plugin` sowie die für den GPU-Betrieb erforderlichen Monitoring-Tools.

```yaml
addons:
  gpuOperator:
    enabled: true
    valuesOverride:
      gpuOperator:
        driver:
          enabled: true
        toolkit:
          enabled: true
        devicePlugin:
          enabled: true
```

---

## `gpuOperator` (Object) — **Erforderlich**

### Beschreibung

Das Feld `gpuOperator` gruppiert die Hauptkonfiguration des NVIDIA GPU Operator Add-ons.
Es ermöglicht die Aktivierung der Komponentenbereitstellung und die Anpassung ihrer Konfiguration.

### Beispiel

```yaml
gpuOperator:
  enabled: true
  valuesOverride:
    gpuOperator:
      driver:
        enabled: true
```

---

## `enabled` (boolean) — **Erforderlich**

### Beschreibung

Gibt an, ob der **GPU Operator** im Cluster aktiviert (`true`) oder deaktiviert (`false`) ist.
Wenn er aktiviert ist, stellt der Operator automatisch die für die Verwaltung der NVIDIA-GPUs erforderlichen Komponenten bereit.

### Beispiel

```yaml
enabled: true
```

---

## `valuesOverride` (Object) — **Erforderlich**

### Beschreibung

Das Feld `valuesOverride` ermöglicht das **Überschreiben der Standardwerte** des GPU Operators.
Es wird verwendet, um das Bereitstellungsverhalten anzupassen (Aktivierung des Treibers, des Toolkits, der Plugins oder Konfiguration der Ressourcen).

### Beispiel

```yaml
valuesOverride:
  gpuOperator:
    driver:
      enabled: true
    toolkit:
      enabled: true
    devicePlugin:
      enabled: true
```

---

## 💡 Best Practices

- Aktivieren Sie `enabled: true` auf Knoten mit GPUs, damit der Operator die NVIDIA-Komponenten automatisch verwaltet.
- Verwenden Sie `valuesOverride`, um die Konfiguration an spezifische Anforderungen anzupassen (z.B. `driver` aktivieren oder deaktivieren, falls bereits manuell installiert).
- Stellen Sie den GPU Operator nur in Umgebungen bereit, in denen GPU-Workloads (KI, ML, wissenschaftliches Rechnen) erforderlich sind.
