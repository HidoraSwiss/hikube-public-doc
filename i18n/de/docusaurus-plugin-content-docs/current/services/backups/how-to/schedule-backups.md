---
title: "Backups planen und auf Abruf sichern"
sidebar_position: 2
description: "Planen Sie das wiederkehrende Backup einer Hikube-Datenbank, -VM oder -Disk, starten Sie ein Backup auf Abruf und finden Sie ungeschützte Ressourcen."
---

# Backups planen und auf Abruf sichern

Diese Anleitung plant das wiederkehrende Backup einer Ressource in der [Hikube-Konsole](https://console.hikube.cloud), startet ein sofortiges Backup und zeigt, wie Sie Ressourcen finden, die nicht geschützt sind.

## Voraussetzungen

- Ein Ziel im Zustand **Ready** im Projekt (siehe [Ein Ziel erstellen](./create-destination.md)).
- Eine PostgreSQL- oder MariaDB-Datenbank, eine VM oder eine Disk.

## Ein Backup planen

1. Öffnen Sie die Ressource (zum Beispiel **PostgreSQL** > Ihre Datenbank oder **VM Instances** > Ihre VM) und dann ihre Registerkarte **Backups**.
2. Klicken Sie in der Karte **Schedule** auf **Schedule**.
3. Im Fenster **Schedule a backup**:
   - **Plan name**: Kleinbuchstaben, Ziffern und Bindestriche, höchstens 40 Zeichen;
   - **Destination**: ein Ziel im Zustand **Ready**;
   - die Uhrzeit, auf eine der beiden unten beschriebenen Arten.
4. Klicken Sie auf **Schedule**.

### Uhrzeit per Voreinstellung

Wählen Sie in der Registerkarte **Preset** eine **Frequency**:

| Frequency | Felder |
|-----------|--------|
| **Hourly** | **Minute** |
| **Daily** | **Hour**, **Minute** |
| **Weekly** | **Day**, **Hour**, **Minute** |

Die Uhrzeit wird in **lokaler Zeit** eingegeben und beim Speichern in UTC umgerechnet. Die Konsole zeigt den resultierenden Ausdruck gefolgt von **(UTC)** sowie die **Next run** an.

### Uhrzeit als Cron-Ausdruck

Geben Sie in der Registerkarte **Cron expression** einen Ausdruck mit fünf Feldern ein (Minute, Stunde, Tag des Monats, Monat, Wochentag), der **in UTC ausgewertet** wird:

| Ausdruck | Bedeutung |
|------------|---------------|
| `0 1 * * *` | Täglich um 01:00 UTC |
| `30 2 * * 0` | Jeden Sonntag um 02:30 UTC |
| `0 3 1 * *` | Am 1. jedes Monats um 03:00 UTC |
| `@daily` | Täglich um 00:00 UTC |

Abgelehnt werden: ein Ausdruck, der mehr als einmal pro Stunde auslöst (zum Beispiel `*/30 * * * *`), Intervalle `@every` und Zeitzonen-Präfixe `CRON_TZ=` oder `TZ=`.

:::note Zeitumstellung
Eine Uhrzeit ist in UTC fest: Sie verschiebt sich bei jeder Zeitumstellung in lokaler Zeit um eine Stunde. Ein Backup, das im Winter in Zürich für 02:00 geplant ist, wird im Sommer um 03:00 ausgeführt.
:::

## Einen Zeitplan ändern oder löschen

- **Edit**: Nur die Uhrzeit lässt sich ändern. Name, Ressource und Ziel werden bei der Erstellung festgelegt; um das Ziel zu wechseln, löschen Sie den Zeitplan und erstellen Sie einen neuen.
- **Delete**: Die künftigen Ausführungen werden beendet, und die bereits erstellten Archive bleiben erhalten. Der Ausführungsverlauf dieses Zeitplans verschwindet mit ihm.

Eine Ressource kann mehrere Zeitpläne haben, zum Beispiel einen täglichen und einen monatlichen.

:::warning PostgreSQL: nur ein Ziel
Alle Zeitpläne und Backups derselben PostgreSQL-Datenbank müssen **dasselbe** Ziel verwenden. Ein zweites Ziel wird abgelehnt. Siehe [Konzepte](../concepts.md#postgresql-nur-ein-ziel).
:::

## Jetzt sichern

1. Wählen Sie in der Registerkarte **Backups** der Ressource, Abschnitt **On-demand backup**, die **Destination**, falls mehrere bereit sind.
2. Klicken Sie auf **Back up now**.

Das Backup erscheint in **Run status**. Bei einer VM oder einer Disk zeigt die Konsole den Prozentsatz der übertragenen Daten an.

Ein Backup auf Abruf wird während einer Wiederherstellung derselben Ressource abgelehnt.

## Die Disks einer VM sichern

Das Archiv einer VM enthält alle ihre Disks: Es genügt, die VM zu planen. In der Registerkarte **Backups** einer angebundenen Disk zeigt die Konsole dann **Backed up with another resource** an. Ein eigener Zeitplan für die Disk bleibt möglich (**Schedule a backup of this resource**), ein solches Archiv lässt sich jedoch nicht auf der Disk wiederherstellen, solange sie existiert: siehe [Eine VM oder eine Disk wiederherstellen](./restore-vm-or-disk.md).

## Ungeschützte Ressourcen finden

Öffnen Sie **Backups** > **Protection**. Jede abgedeckte Ressource des Projekts erscheint dort mit ihrem Zustand:

| Zustand | Bedeutung |
|------|---------------|
| **Scheduled** | Mindestens ein gültiger Zeitplan. |
| **Covered** | Kein eigener Zeitplan, aber in den Archiven einer anderen Ressource enthalten (Disk einer geplanten VM). |
| **Schedule failing** | Alle ihre Zeitpläne sind im Fehlerzustand. |
| **Unprotected** | Kein Zeitplan. |

Die Schaltfläche **Schedule** dieser Seite öffnet direkt das Planungsfenster. Das Widget **Backup status** im Dashboard fasst die ungeschützten Anwendungen, die zuletzt fehlgeschlagenen Ausführungen und die nicht verfügbaren Ziele zusammen.

## Überprüfung

- Die Karte **Schedule** zeigt die Uhrzeit sowie die nächste (**Next**) und die letzte (**Last**) Ausführung an.
- **Backups** > **Activity** listet jede Ausführung mit ihrem Status und ihrer Dauer auf.

## Weiterführende Informationen

- [Archive verwalten](./manage-archives.md)
- [Ein Backup oder eine Wiederherstellung abbrechen](./cancel-backup-or-restore.md)
