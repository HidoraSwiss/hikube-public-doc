---
sidebar_position: 9
title: Velero
---

# 🧩 Details zum Feld `addons.velero`

Das Feld `addons.velero` definiert die Konfiguration des Add-ons **Velero**, das für die **Sicherung und Wiederherstellung** von Kubernetes-Ressourcen und persistenten Volumes verwendet wird.
Velero gewährleistet die Resilienz des Clusters bei Datenverlust oder Migration zwischen Umgebungen.

```yaml
addons:
  velero:
    enabled: true
    valuesOverride:
      velero:
        configuration:
          backupStorageLocation:
            name: default
            provider: aws
            bucket: velero-backups
            config:
              region: eu-west-3
        schedules:
          daily:
            schedule: "0 2 * * *"
            template:
              ttl: 240h
```

---

## `velero` (Object) — **Erforderlich**

### Beschreibung

Das Feld `velero` gruppiert die Hauptkonfiguration des Sicherungs- und Wiederherstellungssystems des Kubernetes-Clusters.
Es ermöglicht die Aktivierung von Velero und die Definition seiner Deployment-Parameter.

### Beispiel

```yaml
velero:
  enabled: true
  valuesOverride:
    velero:
      configuration:
        backupStorageLocation:
          provider: aws
```

---

## `enabled` (boolean) — **Erforderlich**

### Beschreibung

Gibt an, ob **Velero** aktiviert (`true`) oder deaktiviert (`false`) ist.
Wenn aktiviert, stellt Velero seine Komponenten (Server, Controller und CRDs) bereit, die die Verwaltung von Sicherungen und Wiederherstellungen ermöglichen.

### Beispiel

```yaml
enabled: true
```

---

## `valuesOverride` (Object) — **Erforderlich**

### Beschreibung

Das Feld `valuesOverride` ermöglicht das **Überschreiben der Werte** des Velero-Deployments.
Es dient zur Definition der Speicherparameter, automatischen Zeitpläne, Cloud-Anbieter oder auch der Sicherheits- und Ressourcenoptionen.

### Beispiel

```yaml
valuesOverride:
  velero:
    configuration:
      backupStorageLocation:
        provider: aws
        bucket: velero-backups
        config:
          region: eu-west-3
    schedules:
      daily:
        schedule: "0 2 * * *"
        template:
          ttl: 240h
```

---

## 💡 Best Practices

- `enabled: true` aktivieren, um die regelmäßige Sicherung kritischer Cluster-Ressourcen sicherzustellen.
- `valuesOverride` verwenden, um die Konfiguration an den gewählten Cloud-Anbieter oder Speicher anzupassen (AWS, GCP, Azure, MinIO usw.).
- Automatische **Zeitpläne** (Schedules) für wiederkehrende Sicherungen konfigurieren.
- Die Integrität der Sicherungen und die Wiederherstellungsmöglichkeit regelmäßig überprüfen.
- Den Zugriff auf Speicherschlüssel einschränken, um die Sicherungsdaten zu schützen.

---
