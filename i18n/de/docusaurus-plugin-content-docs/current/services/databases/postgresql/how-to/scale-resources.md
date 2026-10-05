---
title: "Die Ressourcen eines Clusters ändern"
sidebar_position: 2
---

# Die Ressourcen eines Clusters ändern

Diese Anleitung erklärt, wie Sie einen bestehenden PostgreSQL-Cluster in der [Hikube-Konsole](https://console.hikube.cloud) anpassen: Instanz-Preset (CPU und Arbeitsspeicher), Disk-Größe, Version und externer Zugriff.

## Voraussetzungen

- Ein bestehender **PostgreSQL**-Cluster in Ihrem Projekt
- Ausreichende Projekt-Quotas für die neue Konfiguration

## Was geändert werden kann

| Parameter | Nach der Erstellung änderbar |
|-----------|---------------------------|
| **PostgreSQL Version** | Ja |
| **Preset** | Ja |
| **Disk size (GB)** | Ja |
| **External access** | Ja |
| **Number of replicas** | Nein, „The mode cannot be changed after creation“ |

Um die Anzahl der Replicas eines bestehenden Clusters zu ändern, [wenden Sie sich an den Support](mailto:support@hidora.io).

## Verfügbare Presets

| Preset | CPU | Arbeitsspeicher |
|--------|-----|---------|
| `nano` | 250m | 128Mi |
| `micro` | 500m | 256Mi |
| `small` | 1 | 512Mi |
| `medium` | 1 | 1Gi |
| `large` | 2 | 2Gi |
| `xlarge` | 4 | 4Gi |
| `2xlarge` | 8 | 8Gi |

Maßgeblich ist die im Formular angezeigte Liste. Die Ressourcen gelten für jeden Knoten des Clusters.

## Schritte

### 1. Das Änderungsformular öffnen

1. Öffnen Sie **DB & Messaging** → **PostgreSQL**.
2. Öffnen Sie in der Liste **PostgreSQL Clusters** das Menü **Actions** des Clusters und wählen Sie **Edit**, oder öffnen Sie die Seite des Clusters und klicken Sie auf **Edit**.

Die Seite **Edit PostgreSQL cluster** zeigt die Karte **Cluster settings** und die Auswirkung der Konfiguration auf die Quotas des Projekts an.

### 2. Die Parameter anpassen

- **Preset**: Wählen Sie ein größeres Preset, um CPU und Arbeitsspeicher jedes Knotens zu erhöhen.
- **Disk size (GB)**: Geben Sie die neue Kapazität ein.
- **PostgreSQL Version**: Wählen Sie die Zielversion aus. Das Formular bietet alle Versionen an, es ist jedoch nur ein Versions-Upgrade möglich: Eine niedrigere Version wird von der Plattform abgelehnt, der Cluster bleibt auf seiner aktuellen Version, und die Konfiguration bleibt fehlerhaft, bis Sie wieder eine höhere oder gleiche Version auswählen. Ein Major-Upgrade (zum Beispiel 17 → 18) erfolgt in-place: Die Instanz wird während der Datenmigration angehalten.
- **External access**: Aktivieren oder deaktivieren Sie die Verfügbarkeit im öffentlichen Internet.

### 3. Speichern

Klicken Sie auf **Save**. Die Meldung „Cluster updated“ bestätigt die Übernahme. Überschreitet die neue Konfiguration die Quotas des Projekts, bleibt die Schaltfläche inaktiv.

:::warning
Eine Änderung des Presets oder der Version führt zum Neustart der Instanzen. Bei einem Cluster mit 1 Replica ist die Datenbank während des Neustarts nicht verfügbar, bei einem Major-Upgrade während der gesamten Migration; planen Sie den Vorgang außerhalb der Spitzenlastzeiten.
:::

:::tip
Vergrößern Sie die Disk, bevor sie voll ist. Überwachen Sie den belegten Speicherplatz mit `SELECT pg_size_pretty(pg_database_size(current_database()));`.
:::

## Überprüfung

Die Seite des Clusters zeigt die neuen Werte in den Karten **PostgreSQL Version**, **Allocated Size** und **External Access** an, und der Status kehrt zu **Ready** zurück, sobald die Aktualisierung angewendet wurde.

## Weiterführende Informationen

- [PostgreSQL-Konzepte](../concepts.md): Replikation, Presets, Netzwerkzugriff
- [Benutzer und Datenbanken verwalten](./manage-users-databases.md)
