---
sidebar_position: 7
title: GPU Operator
---

# 🧩 Details zum Feld `addons.gpuOperator`

Das Feld `addons.gpuOperator` definiert die Konfiguration des Add-ons **NVIDIA GPU Operator**, das zur automatischen Verwaltung von **GPUs** in einem Kubernetes-Cluster verwendet wird.
Diese Komponente installiert und wartet die NVIDIA-Treiber, die Laufzeit-Plugins, das `device plugin` sowie die für den GPU-Betrieb erforderlichen Monitoring-Tools.

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
Es ermöglicht die Aktivierung des Deployments und die Anpassung seiner Konfiguration.

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
Wenn aktiviert, stellt der Operator automatisch die für die Verwaltung von NVIDIA-GPUs erforderlichen Komponenten bereit.

### Beispiel

```yaml
enabled: true
```

---

## `valuesOverride` (Object) — **Erforderlich**

### Beschreibung

Das Feld `valuesOverride` ermöglicht das **Überschreiben der Standardwerte** des GPU Operators.
Es wird verwendet, um das Deployment-Verhalten anzupassen (Aktivierung des Treibers, des Toolkits, der Plugins oder Konfiguration der Ressourcen).

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

- `enabled: true` auf Knoten mit GPUs aktivieren, damit der Operator die NVIDIA-Komponenten automatisch verwaltet.
- `valuesOverride` verwenden, um die Konfiguration an spezifische Bedürfnisse anzupassen (z.B. den `driver` deaktivieren, wenn er bereits manuell installiert ist).
- Den GPU Operator nur in Umgebungen bereitstellen, in denen GPU-Workloads (KI, ML, wissenschaftliches Rechnen) erforderlich sind.
