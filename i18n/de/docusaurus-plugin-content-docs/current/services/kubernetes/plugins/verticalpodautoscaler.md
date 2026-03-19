---
sidebar_position: 4
title: Pod Auto Scaler
---

# 🧩 Details zum Feld `addons.verticalPodAutoscaler`

Das Feld `addons.verticalPodAutoscaler` definiert die Konfiguration des Add-ons **Vertical Pod Autoscaler (VPA)**, das für die automatische Anpassung der CPU- und Speicherressourcen der Pods verantwortlich ist.
Es analysiert kontinuierlich den tatsächlichen Ressourcenverbrauch der Workloads und empfiehlt oder wendet Anpassungen an, um die Leistung und Ressourcennutzung zu optimieren.

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
Es ermöglicht die Bereitstellung und Anpassung der Komponenten des Vertical Pod Autoscalers, um die Ressourcenverwaltung der Pods zu automatisieren.

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

Das Feld `valuesOverride` ermöglicht das **Überschreiben der Helm-Werte** der Bereitstellung des Vertical Pod Autoscalers.
Es wird verwendet, um die verschiedenen Unterkomponenten zu aktivieren oder zu deaktivieren:

| Komponente | Beschreibung |
|------------|--------------|
| `recommender` | Analysiert die Metriken und empfiehlt optimale Ressourcen für die Pods. |
| `updater` | Aktualisiert automatisch die Pods, wenn sich die Empfehlungen ändern. |
| `admissionController` | Fängt Erstellungs-/Änderungsanfragen von Pods ab, um die Ressourcen dynamisch anzupassen. |

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

- Aktivieren Sie immer `recommender`, um von automatischen Ressourcenempfehlungen zu profitieren.
- Verwenden Sie zunächst `updater.enabled: false`, um die Empfehlungen zu beobachten, bevor Sie die Änderungen anwenden.
- Passen Sie die Konfiguration über `valuesOverride` je nach Last- und Umgebungsanforderungen an (Staging, Produktion).
