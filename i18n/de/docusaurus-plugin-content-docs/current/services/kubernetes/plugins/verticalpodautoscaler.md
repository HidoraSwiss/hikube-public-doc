---
sidebar_position: 4
title: Pod Auto Scaler
---

# 🧩 Details zum Feld `addons.verticalPodAutoscaler`

Das Feld `addons.verticalPodAutoscaler` definiert die Konfiguration des Add-ons **Vertical Pod Autoscaler (VPA)**, verantwortlich für die automatische Anpassung der CPU- und Speicherressourcen der Pods.
Es analysiert kontinuierlich den tatsächlichen Verbrauch der Workloads und empfiehlt oder wendet Anpassungen an, um die Leistung und Ressourcennutzung zu optimieren.

```yaml
addons:
  verticalPodAutoscaler:
    valuesOverride:
      verticalPodAutoscaler:
        recommender:
          enabled: true
        updater:
          enabled: true
        admissionController:
          enabled: true
```

---

## `verticalPodAutoscaler` (Object) — **Erforderlich**

### Beschreibung

Das Feld `verticalPodAutoscaler` gruppiert die Hauptkonfiguration des VPA-Add-ons.
Es ermöglicht das Deployment und die Anpassung der Vertical Pod Autoscaler-Komponenten zur Automatisierung der Pod-Ressourcenverwaltung.

### Beispiel

```yaml
verticalPodAutoscaler:
  valuesOverride:
    verticalPodAutoscaler:
      recommender:
        enabled: true
```

---

## `valuesOverride` (Object) — **Erforderlich**

### Beschreibung

Das Feld `valuesOverride` ermöglicht das **Überschreiben der Helm-Werte** des Vertical Pod Autoscaler-Deployments.
Es wird verwendet, um die verschiedenen Unterkomponenten zu aktivieren oder deaktivieren:

| Komponente | Beschreibung |
|------------|--------------|
| `recommender` | Analysiert Metriken und empfiehlt optimale Ressourcen für Pods. |
| `updater` | Aktualisiert Pods automatisch, wenn sich die Empfehlungen ändern. |
| `admissionController` | Fängt Erstellungs-/Änderungsanfragen von Pods ab, um Ressourcen im laufenden Betrieb anzupassen. |

### Beispiel

```yaml
valuesOverride:
  verticalPodAutoscaler:
    recommender:
      enabled: true
    updater:
      enabled: true
    admissionController:
      enabled: true
```

---

## 💡 Best Practices

- Immer `recommender` aktivieren, um von automatischen Ressourcenempfehlungen zu profitieren.
- Zunächst `updater.enabled: false` verwenden, um die Empfehlungen zu beobachten, bevor Änderungen angewendet werden.
- Die Konfiguration über `valuesOverride` je nach Lastanforderungen und Umgebungen (Staging, Produktion) anpassen.
