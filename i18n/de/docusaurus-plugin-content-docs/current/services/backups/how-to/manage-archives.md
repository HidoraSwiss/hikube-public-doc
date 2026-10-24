---
title: "Archive ansehen und löschen"
sidebar_position: 7
description: "Sehen Sie sich die Hikube-Backup-Archive einer Ressource oder des gesamten Projekts an, verstehen Sie, warum ein Archiv nicht wiederherstellbar ist, und löschen Sie Archive."
---

# Archive ansehen und löschen

Diese Anleitung zeigt, wo Sie die Backup-Archive in der [Hikube-Konsole](https://console.hikube.cloud) finden, wie Sie erkennen, ob sie wiederherstellbar sind, und wie Sie sie löschen.

## Archive ansehen

- **Für eine Ressource**: Registerkarte **Backups** der Datenbank, der VM oder der Disk. Die Liste einer Disk enthält auch die Archive der VM, an die sie angebunden ist.
- **Für das gesamte Projekt**: **Backups** > **Archives**. Diese Ansicht listet auch die Archive gelöschter Ressourcen auf (**Application deleted**), aus denen sie neu erstellt werden können.

Für jedes Archiv zeigt die Konsole **Archive**, **Date**, **Duration**, **Status**, **Origin** (den Namen des Zeitplans oder **On demand**) und **Destination** an. Die Spalte **Size** bleibt leer: Die Größe der Archive wird derzeit nicht gemessen.

## Prüfen, ob ein Archiv wiederherstellbar ist

Ein Archiv im Zustand **Ready** wird mit der Schaltfläche **Restore** wiederhergestellt. Wenn das nicht möglich ist, zeigt die Konsole **Cannot be restored:** gefolgt vom Grund an:

| Grund | Was zu tun ist |
|--------|-----------|
| Das Archiv ist nicht bereit | Warten Sie das Ende des Schreibvorgangs ab, oder wählen Sie ein anderes Archiv, falls das Backup fehlgeschlagen ist. |
| Sein Ziel wurde gelöscht | Das Archiv wird nicht wieder wiederherstellbar, auch nicht durch Neuerstellen eines gleichnamigen Ziels. Wählen Sie ein neueres Archiv. |
| Sein Ziel wird gerade gelöscht | Wählen Sie ein anderes Archiv. |
| Das Ziel mit diesem Namen wurde nach dem Backup neu erstellt | Es ist nicht mehr das Ziel, in das das Archiv geschrieben wurde. Wählen Sie ein seitdem erstelltes Archiv. |
| Die Ziele konnten nicht gelesen werden | Versuchen Sie es in einem Moment erneut. |
| Die Daten des Archivs sind nicht mehr gespeichert | VMs und Disks: Das Archiv wurde gelöscht, zum Beispiel am Ende der Aufbewahrung. Wählen Sie ein anderes Archiv. |

## Ein Archiv löschen

1. Klicken Sie in der Zeile des Archivs auf **Delete**.
2. Bestätigen Sie:
   - **PostgreSQL, MariaDB**: Der Eintrag wird entfernt; **das Archiv bleibt in Ihrem Bucket**. Um den Platz freizugeben, leeren Sie den Bucket selbst.
   - **VM, Disk**: **Das gespeicherte Archiv wird zusammen mit dem Eintrag zerstört**. Dies ist unwiderruflich: Geben Sie zur Bestätigung den Namen des Archivs ein.

Um mehrere Archive derselben Ressource zu löschen, wählen Sie sie aus und klicken Sie dann auf **Delete N archives**. Die Konsole verlangt zur Bestätigung die Eingabe der Anzahl ausgewählter Archive.

Eine Löschung wird in zwei Fällen abgelehnt:

- Das Archiv wird gerade von einer Wiederherstellung gelesen: Warten Sie das Ende der Wiederherstellung ab;
- das Archiv liegt auf einem **WORM**-Ziel und seine Sperre läuft noch: Die Konsole zeigt **"…" is locked** mit dem Enddatum der Sperre an. Bis dahin bleibt es wiederherstellbar. Eine Sammellöschung lässt diese Archive aus.

## Automatische Aufbewahrung

Sie müssen die Archive nicht von Hand löschen: Jedes wird am Ende seiner Aufbewahrung automatisch gelöscht, zusammen mit der entsprechenden Ausführungszeile. Das letzte wiederherstellbare Archiv einer Ressource wird immer aufbewahrt, auch wenn es seine Aufbewahrung überschritten hat. Siehe [Konzepte: Aufbewahrung](../concepts.md#aufbewahrung).

## Weiterführende Informationen

- [Ein Ziel erstellen und verwalten](./create-destination.md)
- [Eine Datenbank wiederherstellen](./restore-database.md)
- [Eine VM oder eine Disk wiederherstellen](./restore-vm-or-disk.md)
