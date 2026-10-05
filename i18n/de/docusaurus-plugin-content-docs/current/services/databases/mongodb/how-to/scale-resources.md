---
title: "Die Ressourcen eines Clusters ändern"
sidebar_position: 2
---

# Die Ressourcen eines Clusters ändern

Diese Anleitung erklärt, wie Sie einen bestehenden MongoDB-Cluster über die [Hikube-Konsole](https://console.hikube.cloud) anpassen: Disk-Größe, Version und externer Zugriff.

## Voraussetzungen

- Ein bestehender **MongoDB**-Cluster in Ihrem Projekt
- Ausreichende Projekt-Quotas für die neue Konfiguration

## Was geändert werden kann

| Parameter | Nach der Erstellung änderbar |
|-----------|---------------------------|
| **MongoDB Version** | Ja |
| **Disk size (GB)** | Ja |
| **External access** | Ja |
| **Preset** | Nein, „The resources preset cannot be changed after creation“ |
| **Number of replicas** | Nein, „The mode cannot be changed after creation“ |
| **Sharding** | Nein, die Option ist im Änderungsformular nicht enthalten |

Um das Preset, die Anzahl der Replicas oder die Topologie eines bestehenden Clusters zu ändern, [wenden Sie sich an den Support](mailto:support@hidora.io).

## Schritte

### 1. Das Änderungsformular öffnen

1. Öffnen Sie **DB & Messaging** → **MongoDB**.
2. Öffnen Sie den Cluster und klicken Sie dann auf **Edit** (oder verwenden Sie **Actions** → **Edit** in der Liste).

Die Seite **Edit MongoDB cluster** zeigt die Karte **Cluster settings** und die Auswirkung auf die Quotas des Projekts an.

### 2. Die Parameter anpassen

- **Disk size (GB)**: Geben Sie die neue Kapazität ein.
- **MongoDB Version**: Wählen Sie die Zielversion (6.0, 7.0 oder 8.0).
- **External access**: Aktivieren oder deaktivieren Sie die Erreichbarkeit im öffentlichen Internet.

:::tip
MongoDB unterstützt Major-Upgrades nur von einer Version zur nächsten (6.0 → 7.0 → 8.0). Das Formular bietet alle Versionen an, auch einen Versionssprung oder eine niedrigere Version: Überspringen Sie keine Version und kehren Sie nicht zu einer älteren zurück.
:::

### 3. Speichern

Klicken Sie auf **Save**. Die Meldung „Cluster updated“ bestätigt die Übernahme. Überschreitet die neue Konfiguration die Quotas des Projekts, bleibt die Schaltfläche inaktiv.

## Überprüfung

Die Seite des Clusters zeigt die neuen Werte in den Karten **MongoDB Version** und **Allocated Size** an. Prüfen Sie in `mongosh` den belegten Speicherplatz:

```javascript
db.stats({ scale: 1024 * 1024 })
```

## Weiterführende Informationen

- [MongoDB-Konzepte](../concepts.md): Replikation, Presets, Netzwerkzugriff
- [Sharding konfigurieren](./configure-sharding.md)
