---
title: "Eine VM oder eine Disk wiederherstellen"
sidebar_position: 5
description: "Stellen Sie eine virtuelle Hikube-Maschine und alle ihre Disks aus einem Archiv wieder her, entscheiden Sie über die ersetzten Disks und erstellen Sie eine gelöschte VM oder Disk neu."
---

# Eine VM oder eine Disk wiederherstellen

Diese Anleitung stellt eine virtuelle Maschine oder eine gelöschte Disk in der [Hikube-Konsole](https://console.hikube.cloud) aus einem Archiv wieder her.

## Voraussetzungen

- Ein wiederherstellbares Archiv der VM oder der Disk im Zustand **Ready** (siehe [Archive verwalten](./manage-archives.md)).

## Was Sie wissen sollten

- **Eine VM oder eine Disk wird auf sich selbst wiederhergestellt**, niemals auf einer anderen Ressource.
- **Das Archiv einer VM enthält alle ihre Disks**, und die Wiederherstellung schreibt sie alle neu. Es ist nicht möglich, nur eine davon wiederherzustellen.
- **Eine einzeln gesicherte Disk wird nicht auf sich selbst wiederhergestellt, solange sie existiert.** Um eine angebundene Disk auf einen früheren Stand zurückzusetzen, stellen Sie ein Archiv der VM wieder her, an die sie angebunden ist. Das Archiv einer Disk dient dazu, sie **neu zu erstellen**, falls sie gelöscht wurde.
- Die VM wird während der Wiederherstellung gestoppt: Planen Sie eine Dienstunterbrechung ein.

## Eine VM wiederherstellen

1. Öffnen Sie **VM Instances**, die VM und dann ihre Registerkarte **Backups**. Sie können auch von **Backups** > **Archives** ausgehen.
2. Klicken Sie in der Zeile des Archivs auf **Restore**.
3. Entscheiden Sie unter **This machine's current disks**, was mit den aktuellen Disks geschieht:

   | Auswahl | Wirkung |
   |-------|-------|
   | **Discard them** (Standard) | Jede Disk erhält den Inhalt des Archivs zurück; ihr bisheriger Inhalt wird gelöscht, sobald die Wiederherstellung erfolgreich war. |
   | **Keep them** | Jede Disk erhält den Inhalt des Archivs zurück; ihr bisheriger Inhalt wird zu einer eigenen Disk namens `<disk>-orig-<kennung>`, getrennt, und wird abgerechnet, bis Sie sie löschen. |

4. Geben Sie zur Bestätigung den Namen der VM ein und klicken Sie dann auf **Restore**.

:::tip Wann die alten Disks behalten
Wählen Sie **Keep them**, wenn Sie nicht sicher sind, dass es das richtige Archiv ist: Sie können eine alte Disk an eine VM anbinden, um Dateien daraus zurückzuholen. Denken Sie daran, sie anschließend unter **Disks** zu löschen.
:::

## Eine gelöschte VM oder Disk neu erstellen

Wenn die VM oder die Disk gelöscht wurde, weist die Konsole darauf hin (**“…” was deleted: it will be recreated from this archive.**). Die Wiederherstellung erstellt die Ressource unter ihrem ursprünglichen Namen neu.

Bei einer gelöschten VM, von der Disks erhalten geblieben sind, betrifft die Auswahl **The disks that outlived this machine**.

Wenn eine **neue** VM oder Disk inzwischen denselben Namen trägt und nach dem Backup erstellt wurde, wird die Wiederherstellung abgelehnt: Sie würde die Daten einer anderen Ressource ersetzen. Löschen Sie zuerst diese Ressource und stellen Sie dann wieder her. Dasselbe gilt, wenn eine der im Archiv einer VM enthaltenen Disks seit dem Backup gelöscht und neu erstellt wurde.

## Die Wiederherstellung verfolgen

- Der Abschnitt **Restores** der Registerkarte **Backups** zeigt den Status, den Prozentsatz der übertragenen Daten und das Schicksal der ursprünglichen Disks an (**Original disks deleted if the restore succeeds**, **Original disks kept**…).
- Bevor sie zu **Succeeded** wechselt, prüft die Wiederherstellung, dass jede Disk des Archivs tatsächlich neu geschrieben wurde; während dieser wenigen Sekunden bleibt sie **In progress**.
- Eine Wiederherstellung, die fehlschlägt oder die Sie abbrechen, **löscht nichts**, auch nicht mit **Discard them**: Die alten Disks werden unter dem Namen `<disk>-orig-<kennung>` behalten, und die Meldung weist darauf hin (**Original disks kept: the restore did not succeed**). Ein erneuter Start der Wiederherstellung kann erfolgreich sein.
- Eine VM-Wiederherstellung hält nicht von selbst an, wenn sie hängen bleibt: Sie können sie abbrechen (siehe [Ein Backup oder eine Wiederherstellung abbrechen](./cancel-backup-or-restore.md)).

## Überprüfung

- Die Wiederherstellung ist **Succeeded**.
- Starten Sie die VM, falls sie gestoppt ist, verbinden Sie sich und kontrollieren Sie Ihre Daten.
- Mit **Keep them** erscheinen die Disks `<disk>-orig-<kennung>` unter **Disks**, nicht angebunden.

## Weiterführende Informationen

- [Konzepte: Wiederherstellungen](../concepts.md#wiederherstellungen)
- [Eine Disk an eine VM anbinden](../../storage/disks/how-to/attach-to-vm.md)
