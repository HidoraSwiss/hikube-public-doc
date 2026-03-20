---
sidebar_position: 9
title: Velero
---

# 🧩 Details zum Feld `addons.velero`

Das Feld `addons.velero` definiert die Konfiguration des Add-ons **Velero**, das für die **Sicherung und Wiederherstellung** von Kubernetes-Ressourcen sowie persistenten Volumes verwendet wird.
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
Es ermöglicht die Aktivierung von Velero und die Definition seiner Bereitstellungsparameter.

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
Wenn es aktiviert ist, stellt Velero seine Komponenten (Server, Controller und CRDs) bereit, die die Verwaltung von Sicherungen und Wiederherstellungen ermöglichen.

### Beispiel

```yaml
enabled: true
```

---

## `valuesOverride` (Object) — **Erforderlich**

### Beschreibung

Das Feld `valuesOverride` ermöglicht das **Überschreiben der Werte** der Velero-Bereitstellung.
Es dient zur Definition der Speicherparameter, der automatischen Zeitpläne, der Cloud-Anbieter oder der Sicherheits- und Ressourcenoptionen.

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

- Aktivieren Sie `enabled: true`, um die regelmäßige Sicherung kritischer Cluster-Ressourcen sicherzustellen.
- Verwenden Sie `valuesOverride`, um die Konfiguration an den Cloud-Anbieter oder den gewählten Speicher anzupassen (AWS, GCP, Azure usw.).
- Konfigurieren Sie automatische **schedules** (Zeitpläne) für wiederkehrende Sicherungen.
- Überprüfen Sie regelmäßig die Integrität der Sicherungen und die Wiederherstellungsmöglichkeit.
- Beschränken Sie den Zugriff auf Speicherschlüssel, um die Sicherungsdaten zu schützen.

---
