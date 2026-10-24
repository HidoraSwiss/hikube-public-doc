---
title: "Ein Backup oder eine Wiederherstellung abbrechen"
sidebar_position: 6
description: "Brechen Sie auf Hikube ein laufendes Backup oder eine hängende VM-Wiederherstellung ab: was unterbrochen werden kann, was nicht und was nach dem Abbruch bleibt."
---

# Ein Backup oder eine Wiederherstellung abbrechen

Diese Anleitung stoppt in der [Hikube-Konsole](https://console.hikube.cloud) ein laufendes Backup oder eine Wiederherstellung einer VM oder Disk, die nicht zum Abschluss kommt.

## Was abgebrochen werden kann

| Vorgang | Abbrechbar |
|-----------|-----------|
| Noch nicht gestartetes Backup | Ja |
| PostgreSQL-Backup | Solange es auf den Start wartet. Einmal begonnen, lässt es sich nicht unterbrechen: Es wird von selbst beendet oder schlägt fehl. |
| MariaDB-Backup | Ja |
| Backup einer VM oder Disk | Ja, außer in den allerersten Sekunden |
| Wiederherstellung einer VM oder Disk | Ja, außer in den allerersten Sekunden |
| Wiederherstellung von PostgreSQL oder MariaDB | Nein. Sie schlägt nach 30 Minuten von selbst fehl, wenn sie nicht zum Abschluss kommt. |
| Abgeschlossener oder kurz vor dem Abschluss stehender Vorgang | Nein |

## Ein Backup abbrechen

1. Suchen Sie das laufende Backup: Abschnitt **Run status** der Registerkarte **Backups** der Ressource oder **Backups** > **Activity**.
2. Klicken Sie auf **Cancel**.
3. Klicken Sie im Fenster **Cancel the backup of “…”?** auf **Cancel backup** (oder auf **Let it run**, um darauf zu verzichten).

Das Backup erscheint in der Aktivität als **Cancelled** und erzeugt kein Archiv.

## Eine Wiederherstellung einer VM oder Disk abbrechen

1. Klicken Sie im Abschnitt **Restores** der Registerkarte **Backups** oder unter **Backups** > **Activity** auf **Cancel restore**.
2. Bestätigen Sie mit **Cancel restore**.

:::warning Nichts wird rückgängig gemacht
Die laufenden Übertragungen werden gestoppt, aber was die Wiederherstellung bereits getan hat, bleibt bestehen: Die VM kann gestoppt bleiben und ihre Disks unter dem Namen `<disk>-orig-<kennung>` beiseitegelegt, wie nach einem Fehlschlag. Erst eine neue Wiederherstellung stellt die VM wieder her.
:::

## Wenn der Abbruch abgelehnt wird oder unvollständig ist

| Meldung | Bedeutung | Was zu tun ist |
|---------|---------------|-----------|
| **Cannot cancel yet** | Die VM oder die Disk kopiert gerade ihre Konfiguration; noch keine Übertragung hat begonnen. | Klicken Sie einige Sekunden später auf **Retry**. |
| **Cancellation refused** | Der Vorgang kann nicht unterbrochen werden (begonnenes PostgreSQL-Backup, Datenbank-Wiederherstellung, abgeschlossener Vorgang). Die Meldung nennt den Grund. | Warten Sie das Ende des Vorgangs ab. |
| **Cancellation to finish** | Der Vorgang ist gestoppt, aber ein Teil der begonnenen Arbeit konnte nicht beim ersten Versuch angehalten werden. | Klicken Sie auf **Retry**. Andernfalls schließt Hikube die Bereinigung in den folgenden Minuten von selbst ab. |

## Weiterführende Informationen

- [Eine VM oder eine Disk wiederherstellen](./restore-vm-or-disk.md)
- [Konzepte: Abbrechen](../concepts.md#abbrechen)
