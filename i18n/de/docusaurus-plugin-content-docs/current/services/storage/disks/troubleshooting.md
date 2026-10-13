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

### „Minimum size is 20 GB“ oder „This image needs a disk of at least … GB“

**Ursache**: Die Größe liegt unter dem Minimum.

**Lösung**: Geben Sie mindestens 20 GB ein; für eine System-Disk mindestens 28 GB mit Windows Server und 40 GB mit Oracle Linux.

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
2. Eine angebundene Disk wird erst beim nächsten Neustart der VM übernommen: Klicken Sie auf **Restart** (Abschnitt **Actions** der VM-Seite), warten Sie, bis der Neustart abgeschlossen ist, und führen Sie dann `lsblk` in der VM erneut aus.

---

### Die neue Größe ist nach einer Größenänderung in der VM nicht sichtbar

**Ursache**: Das Dateisystem wurde nicht erweitert, oder die VM hat die neue Größe des Geräts noch nicht übernommen.

**Lösung**:

1. Prüfen Sie die Größe des Geräts mit `lsblk`. Hat sie sich nicht geändert, starten Sie die VM neu.
2. Erweitern Sie Partition und Dateisystem (siehe [Die Größe einer Disk ändern](./how-to/resize.md)).

---

### Das Löschen der Disk schlägt fehl

**Ursache**: Eine VM verwendet die Disk noch, oder der Dienst ist vorübergehend nicht verfügbar. Die Konsole zeigt eine dieser Meldungen an:

- „The disk cannot be deleted as it is in use.“ (Seite der Disk) oder eine gleichwertige Meldung in der Liste der Disks: Die Disk ist an eine VM angebunden;
- „This disk was detached, but its VM still uses it until its next restart. Restart the VM, then try again.“: Die Disk wurde getrennt, aber die VM wurde noch nicht neu gestartet und verwendet sie weiterhin;
- „The disk deletion service is temporarily unavailable.“.

**Lösung**:

1. Angebundene Disk: Trennen Sie sie auf der Bearbeitungsseite der VM (Abschnitt **Storage**), klicken Sie auf **Save** und fahren Sie mit Schritt 2 fort.
2. Getrennte Disk: Klicken Sie auf der Seite der VM auf **Restart**, warten Sie, bis sie wieder den Status **Running** hat, dann einige Minuten, und versuchen Sie es erneut.
3. Dienst nicht verfügbar: Versuchen Sie es einige Minuten später erneut.

---

### Der Name der Disk wird abgelehnt

**Ursache**: Der Name entspricht nicht den Regeln oder endet mit einem reservierten Suffix („This domain is reserved by Hikube“).

**Lösung**: Verwenden Sie 3 bis 16 Zeichen (Kleinbuchstaben, Ziffern und Bindestriche), beginnen Sie mit einem Buchstaben und enden Sie mit einem Buchstaben oder einer Ziffer.
