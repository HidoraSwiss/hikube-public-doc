---
title: "Eine PostgreSQL- oder MariaDB-Datenbank wiederherstellen"
sidebar_position: 3
description: "Stellen Sie ein Hikube-PostgreSQL- oder -MariaDB-Archiv auf der ursprünglichen Datenbank oder auf einer anderen Datenbank des Projekts wieder her, mit den Vorsichtsmaßnahmen vorher und den Prüfungen danach."
---

# Eine PostgreSQL- oder MariaDB-Datenbank wiederherstellen

Diese Anleitung stellt ein Datenbankarchiv in der [Hikube-Konsole](https://console.hikube.cloud) wieder her, entweder auf der ursprünglichen Datenbank oder auf einer anderen Datenbank des Projekts. Um eine PostgreSQL-Datenbank auf einen bestimmten Zeitpunkt zurückzusetzen, siehe [Zu einem bestimmten Zeitpunkt wiederherstellen](./restore-point-in-time.md).

## Voraussetzungen

- Ein Archiv der Datenbank im Zustand **Ready**, das wiederherstellbar ist (siehe [Archive verwalten](./manage-archives.md)).
- Für eine Wiederherstellung in eine andere Datenbank: eine **bestehende** Datenbank desselben Typs im Projekt. Bei PostgreSQL muss sie dieselbe **Hauptversion** haben wie die gesicherte Datenbank.

## Bevor Sie beginnen

:::warning Eine Wiederherstellung überschreibt die Daten
Eine Wiederherstellung auf der ursprünglichen Datenbank ersetzt ihren aktuellen Inhalt. Dies ist unwiderruflich. Um einige Daten zurückzuholen, ohne die laufende Datenbank anzutasten, stellen Sie besser in eine eigens dafür erstellte leere Datenbank wieder her.
:::

- **Prüfen Sie die Zeitpläne der Datenbank** (PostgreSQL). Ein Backup auf Abruf wird während einer Wiederherstellung abgelehnt, ein **geplantes** Backup kann jedoch währenddessen ausgelöst werden und sie fehlschlagen lassen. Wenn die nächste Ausführung (**Next**) eines Zeitplans der Datenbank in die nächsten 30 Minuten fällt, warten Sie ihr Ende ab, bevor Sie eine Wiederherstellung an Ort und Stelle starten.
- **Eine Wiederherstellung gleichzeitig**: Eine zweite Wiederherstellung derselben Datenbank wird abgelehnt, solange die erste nicht abgeschlossen ist.

## Wiederherstellen

1. Öffnen Sie die Datenbank (**PostgreSQL** oder **MariaDB**) und dann ihre Registerkarte **Backups**. Sie können auch von **Backups** > **Archives** ausgehen, das die Archive des gesamten Projekts auflistet.
2. Klicken Sie in der Zeile des Archivs auf **Restore**.
3. Wählen Sie das **Restore target**:
   - **In place**: überschreibt den aktuellen Inhalt der Datenbank;
   - **Another application**: Wählen Sie eine bestehende Datenbank des Projekts, deren aktueller Inhalt überschrieben wird.
4. Nur PostgreSQL: Wählen Sie den wiederherzustellenden Stand unter **Restore up to** (standardmäßig der Stand des Backups; siehe [Zu einem bestimmten Zeitpunkt wiederherstellen](./restore-point-in-time.md)).
5. Geben Sie zur Bestätigung den verlangten Namen ein und klicken Sie dann auf die Wiederherstellungsschaltfläche.

Die Konsole zeigt **Restore of "…" started.** an. Die Wiederherstellung erscheint im Abschnitt **Restores** der Registerkarte **Backups** und unter **Backups** > **Activity**.

### Was mit der Zieldatenbank geschieht

| Typ | Wirkung der Wiederherstellung |
|------|--------------------------|
| **PostgreSQL** | Die Zieldatenbank wird vollständig aus dem Archiv neu aufgebaut. Ihre bisherigen Daten verschwinden. |
| **MariaDB** | Der Export des Archivs wird in der Zieldatenbank eingespielt: Jede darin enthaltene Tabelle ersetzt die gleichnamige Tabelle; Tabellen und Datenbanken, die er nicht enthält, bleiben erhalten. |

### Die ursprüngliche Datenbank existiert nicht mehr

Wenn die gesicherte Datenbank gelöscht wurde, zeigt die Konsole **“…” no longer exists: pick another application.** an. Erstellen Sie eine Datenbank desselben Typs (und bei PostgreSQL derselben Hauptversion) und stellen Sie das Archiv darauf wieder her.

Wenn nach dem Backup eine neue Datenbank unter demselben Namen erstellt wurde, wird sie wie eine andere Datenbank behandelt: Die Wiederherstellung wird nach Bestätigung angenommen.

## Die Wiederherstellung verfolgen

Die Wiederherstellung durchläuft **Pending**, **In progress** und dann **Succeeded** oder **Failed**. Eine Datenbank-Wiederherstellung, die nicht zum Abschluss kommt, schlägt nach 30 Minuten von selbst fehl; vorher kann sie nicht abgebrochen werden.

Wenn eine PostgreSQL-Wiederherstellung fehlgeschlagen ist, kann die Datenbank nicht verfügbar bleiben. Ein Backup auf Abruf wird dann abgelehnt, solange die Datenbank nicht wieder bereit ist: Starten Sie eine neue Wiederherstellung, das stellt ihren Betrieb wieder her.

## Überprüfung

- Die Wiederherstellung ist im Abschnitt **Restores** im Zustand **Succeeded**.
- Verbinden Sie sich mit der Datenbank und kontrollieren Sie Ihre Daten, zum Beispiel:

  ```sql
  -- PostgreSQL
  SELECT count(*) FROM ma_table;
  ```

  ```sql
  -- MariaDB
  SELECT COUNT(*) FROM ma_table;
  ```

- Starten Sie nach einer PostgreSQL-Wiederherstellung an Ort und Stelle ein Backup auf Abruf: Die vor der Wiederherstellung erstellten Archive gehören zum alten Zweig des Verlaufs der Datenbank (siehe [Konzepte](../concepts.md#zweige-des-verlaufs)). Dieses erste Backup kann fehlschlagen; starten Sie es einmal erneut (siehe [Fehlerbehebung](../troubleshooting.md#das-erste-backup-einer-postgresql-datenbank-schlägt-fehl)).

## Weiterführende Informationen

- [Zu einem bestimmten Zeitpunkt wiederherstellen](./restore-point-in-time.md)
- [Fehlerbehebung: Eine Wiederherstellung wird abgelehnt](../troubleshooting.md#eine-wiederherstellung-wird-abgelehnt)
