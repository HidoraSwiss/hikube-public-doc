---
title: "Die Ressourcen eines Clusters ändern — MariaDB"
sidebar_label: "Die Ressourcen eines Clusters ändern"
sidebar_position: 2
---

# Die Ressourcen eines Clusters ändern

Diese Anleitung erklärt, wie Sie einen bestehenden MariaDB-Cluster in der [Hikube-Konsole](https://console.hikube.cloud) anpassen: Disk-Größe, Version und externer Zugriff.

## Voraussetzungen

- Ein bestehender **MariaDB**-Cluster in Ihrem Projekt
- Ausreichende Projekt-Quotas für die neue Konfiguration

## Was geändert werden kann

| Parameter | Nach der Erstellung änderbar |
|-----------|---------------------------|
| **MariaDB Version** | Ja, nur auf eine höhere Version |
| **Disk size (GB)** | Ja, nur Vergrößerung |
| **External access** | Ja |
| **Preset** | Nein, „The resources preset cannot be changed after creation“ |
| **Number of replicas** | Nein, „The mode cannot be changed after creation“ |

Um das Preset (CPU und Arbeitsspeicher) oder die Anzahl der Replicas eines bestehenden Clusters zu ändern, [wenden Sie sich an den Support](mailto:support@hidora.io).

## Schritte

### 1. Das Änderungsformular öffnen

1. Öffnen Sie **DB & Messaging** → **MariaDB**.
2. Öffnen Sie den Cluster und klicken Sie dann auf **Edit** (oder verwenden Sie in der Liste **Actions** → **Edit**).

Die Seite **Edit MariaDB cluster** zeigt die Karte **Cluster settings** und die Auswirkung auf die Quotas des Projekts an.

### 2. Die Parameter anpassen

- **Disk size (GB)**: Geben Sie die neue Kapazität ein, mindestens die aktuelle Größe. Ein kleinerer Wert zeigt „The disk size cannot be reduced: N GB minimum.“ an und wird nicht gespeichert.
- **MariaDB Version**: Wählen Sie die Zielversion aus. Das Formular bietet nur die aktuelle Version und höhere Versionen an: MariaDB unterstützt kein Downgrade.
- **External access**: Aktivieren oder deaktivieren Sie die Verfügbarkeit im öffentlichen Internet.

Wenn Sie die Version ändern, erscheint die Warnung „The cluster instances will restart“: Die Änderung startet die Instanzen des Clusters beim Speichern neu, und eine aktualisierte Version kann nicht mehr herabgestuft werden. Planen Sie sie außerhalb von Spitzenlastzeiten.

### 3. Speichern

Klicken Sie auf **Save**. Die Meldung „Cluster updated“ bestätigt die Übernahme. Überschreitet die neue Konfiguration die Quotas des Projekts, bleibt die Schaltfläche inaktiv.

:::note
Die API wendet dieselben Regeln an: Eine niedrigere Version als die aktuelle wird mit dem Code `110203` abgelehnt, eine kleinere Disk-Größe als die aktuelle mit dem Code `110204`.
:::

:::tip
Vergrößern Sie die Disk, bevor sie voll ist. So messen Sie den belegten Speicherplatz pro Datenbank:

```sql
SELECT table_schema, ROUND(SUM(data_length + index_length) / 1024 / 1024, 1) AS size_mb
FROM information_schema.tables
GROUP BY table_schema;
```
:::

## Überprüfung

Die Seite des Clusters zeigt die neuen Werte in den Karten **MariaDB Version** und **Allocated Size** an, und den Status des **External Access** in der Karte **Connection and network**.

## Weiterführende Informationen

- [MariaDB-Konzepte](../concepts.md): Replikation, Presets, Netzwerkzugriff
- [Benutzer und Datenbanken verwalten](./manage-users-databases.md)
