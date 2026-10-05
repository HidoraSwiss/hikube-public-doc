---
sidebar_position: 7
title: Fehlerbehebung
---

# Fehlerbehebung — Disks

### „Size exceeds available quota“

**Ursache**: Die angeforderte Größe überschreitet den verbleibenden Speicher des Projekt-Quotas. Die Meldung gibt das verfügbare Maximum an.

**Lösung**:

1. Verringern Sie **Size (GB)** auf einen Wert kleiner oder gleich dem angegebenen Maximum.
2. Geben Sie Speicher frei, indem Sie nicht verwendete Disks oder Ressourcen löschen (auch getrennte Disks verbrauchen das Quota).
3. Lassen Sie bei Bedarf das Speicher-Quota des Projekts erhöhen.

---

### „Minimum size is 20 GB“ oder „Disk size must be at least 50 GB for Windows“

**Ursache**: Die Größe liegt unter dem Minimum.

**Lösung**: Geben Sie mindestens 20 GB ein, bzw. 50 GB für eine Windows-System-Disk.

---

### Die Disk bleibt auf „Downloading“ oder wechselt auf „Error“

**Ursache**: Der Import des Images dauert lange (großes Image) oder ist fehlgeschlagen (URL nicht erreichbar, Datei nicht erkannt).

**Lösung**:

1. Verfolgen Sie den Fortschritt in Prozent auf der Seite der Disk; ein großer Import kann Zeit in Anspruch nehmen.
2. Prüfen Sie bei einem eigenen Image, ob die URL öffentlich über HTTPS erreichbar ist und auf eine gültige ISO- oder QCOW2-Datei verweist:
   ```bash
   curl -I https://example.com/image.qcow2
   ```
3. Wechselt die Disk auf **Error**, löschen Sie sie und erstellen Sie sie mit einer korrigierten URL neu. Besteht das Problem weiterhin, [wenden Sie sich an den Support](mailto:support@hidora.io) mit dem Namen und der Kennung der Disk.

---

### Die Disk erscheint nicht unter „Select an existing volume“

**Ursache**: Die Disk ist bereits an eine VM angebunden, sie ist bereits auf einem anderen Volume ausgewählt oder ihr Typ passt nicht zum Volume.

**Lösung**:

1. Prüfen Sie auf der Seite der Disk das Feld **Attached to**: Zeigt es eine VM an, trennen Sie die Disk zuerst.
2. Für die **System Disk (Boot)** werden nur System-Disks (aus einem Image erstellt) angeboten; für die Daten-Volumes nur Daten-Disks.

---

### Die Disk ist in der VM nicht sichtbar

**Ursache**: Die VM wurde nach der Änderung des Speichers noch nicht neu gestartet, oder die Disk wurde nicht in der VM gespeichert.

**Lösung**:

1. Prüfen Sie auf der Seite der Disk, ob **Attached to** die richtige VM anzeigt und der Status **In Use** ist.
2. Warten Sie, bis der Neustart der VM abgeschlossen ist, und führen Sie dann `lsblk` in der VM erneut aus.

---

### Die neue Größe ist nach einer Größenänderung in der VM nicht sichtbar

**Ursache**: Das Dateisystem wurde nicht erweitert, oder die VM hat die neue Größe des Geräts noch nicht übernommen.

**Lösung**:

1. Prüfen Sie die Größe des Geräts mit `lsblk`. Hat sie sich nicht geändert, starten Sie die VM neu.
2. Erweitern Sie Partition und Dateisystem (siehe [Die Größe einer Disk ändern](./how-to/resize.md)).

---

### Das Löschen der Disk schlägt fehl

**Ursache**: Die Disk ist an eine VM angebunden („The disk cannot be deleted as it is in use.“), oder der Dienst ist vorübergehend nicht verfügbar.

**Lösung**:

1. Trennen Sie die Disk auf der Bearbeitungsseite der VM (Abschnitt **Storage**) und versuchen Sie es dann erneut.
2. Lautet die Meldung „The disk deletion service is temporarily unavailable.“, versuchen Sie es einige Minuten später erneut.

---

### Der Name der Disk wird abgelehnt

**Ursache**: Der Name entspricht nicht den Regeln oder endet mit einem reservierten Suffix („This domain is reserved by Hikube“).

**Lösung**: Verwenden Sie 3 bis 16 Zeichen (Kleinbuchstaben, Ziffern und Bindestriche), beginnen Sie mit einem Buchstaben und enden Sie mit einem Buchstaben oder einer Ziffer.
