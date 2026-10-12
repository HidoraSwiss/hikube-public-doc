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
| **PostgreSQL Version** | Ja, nur auf eine höhere Version |
| **Preset** | Ja |
| **Disk size (GB)** | Ja, nur Vergrößerung |
| **External access** | Ja |
| **Number of replicas** | Nein, „The mode cannot be changed after creation“. Das Formular zeigt den aktuellen Wert an (1, 2 oder 3) |

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
- **Disk size (GB)**: Geben Sie die neue Kapazität ein, mindestens die aktuelle Größe. Ein kleinerer Wert zeigt „The disk size cannot be reduced: N GB minimum.“ an und wird nicht gespeichert.
- **PostgreSQL Version**: Wählen Sie die Zielversion aus. Das Formular bietet nur die aktuelle Version und höhere Versionen an. Ein Major-Upgrade (zum Beispiel 17 → 18) erfolgt in-place: Die Instanz wird während der Datenmigration angehalten.
- **External access**: Aktivieren oder deaktivieren Sie die Verfügbarkeit im öffentlichen Internet.

Wenn Sie das Preset oder die Version ändern, erscheint die Warnung „The cluster instances will restart“; bei einer Versionsänderung weist sie darauf hin, dass eine aktualisierte Version nicht mehr herabgestuft werden kann.

### 3. Speichern

Klicken Sie auf **Save**. Die Meldung „Cluster updated“ bestätigt die Übernahme. Überschreitet die neue Konfiguration die Quotas des Projekts, bleibt die Schaltfläche inaktiv.

:::warning
Eine Änderung des Presets oder der Version führt beim Speichern zum Neustart der Instanzen. Bei einem Cluster mit 1 Replica ist die Datenbank während des Neustarts nicht verfügbar, bei einem Major-Upgrade während der gesamten Migration; planen Sie den Vorgang außerhalb der Spitzenlastzeiten.
:::

:::note
Die API wendet dieselben Regeln an: Eine niedrigere Version als die aktuelle wird mit dem Code `80203` abgelehnt, eine kleinere Disk-Größe als die aktuelle mit dem Code `80204`.
:::

:::tip
Vergrößern Sie die Disk, bevor sie voll ist. Überwachen Sie den belegten Speicherplatz mit `SELECT pg_size_pretty(pg_database_size(current_database()));`.
:::

## Überprüfung

Die Seite des Clusters zeigt die neuen Werte in den Karten **PostgreSQL Version**, **Allocated Size** und **External Access** an, und der Status kehrt zu **Ready** zurück, sobald die Aktualisierung angewendet wurde.

## Weiterführende Informationen

- [PostgreSQL-Konzepte](../concepts.md): Replikation, Presets, Netzwerkzugriff
- [Benutzer und Datenbanken verwalten](./manage-users-databases.md)
