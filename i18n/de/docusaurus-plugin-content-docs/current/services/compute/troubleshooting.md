---
sidebar_position: 7
title: Fehlerbehebung
---

# Fehlerbehebung — Virtuelle Maschinen

### Die Schaltfläche Next bleibt im Assistenten ausgegraut

**Ursache**: Die VM würde ein Quota des Projekts überschreiten (CPU, Memory oder Storage). Das Banner des Assistenten zeigt **Quota exceeded** und die Einzelheiten pro Ressource an.

**Lösung**:

1. Wählen Sie einen kleineren Instanztyp oder verringern Sie die Größe der Disks.
2. Geben Sie Ressourcen frei: Löschen Sie nicht verwendete VMs oder Disks (getrennte Disks zählen zum Speicher-Quota).
3. Lassen Sie die Quotas des Projekts erhöhen.

Wenn die Konsole meldet, dass die Quotas des Projekts nicht verfügbar sind, bleibt die Erstellung blockiert, solange sie nicht gelesen werden können: Versuchen Sie es später erneut oder wenden Sie sich an den [Support](mailto:support@hidora.io).

---

### Fehler bei der Erstellung: Name bereits verwendet oder Disk-Größe abgelehnt

**Ursache und Lösung**:

| Meldung | Lösung |
|---------|----------|
| **An instance with this name already exists.** | Wählen Sie einen anderen Namen. |
| **Min. 20 GB required** / **Min. 50 GB required** | Erhöhen Sie **Size (GB)**: mindestens 20 GB, 50 GB für Windows. |
| Meldung mit einer Mindestgröße für Oracle Linux | Die System-Disk für Oracle Linux benötigt mindestens 40 GB. |
| **A system image is required for a new disk** | Wählen Sie eine Karte unter **Operating System**. |
| **Invalid format. Expected: `<algorithm> <base64-key> [comment]`** | Fügen Sie den vollständigen **öffentlichen** Schlüssel (Datei `.pub`) in einer einzigen Zeile ein. |

---

### Die VM bleibt im Status Error oder Failed

**Ursache**: Die VM konnte nicht eingeplant oder gestartet werden (Ressourcen nicht verfügbar, Disk mit Fehler, GPU nicht verfügbar…). Wenn die Plattform einen Grund zurückgibt, wird er beim Überfahren des Status-Badges mit der Maus angezeigt.

**Lösung**:

1. Öffnen Sie die Detailseite und prüfen Sie den Abschnitt **Storage & Disks**: Die Disks müssen vorhanden sein.
2. Wenn die VM GPUs hat, siehe [GPU beim Start nicht verfügbar](#gpu-beim-start-nicht-verfügbar).
3. Versuchen Sie **Stop** und dann **Start** im Abschnitt **Actions**.
4. Wenn der Status bestehen bleibt, wenden Sie sich an den [Support](mailto:support@hidora.io) und geben Sie den Namen der VM und ihre Kennung an (unter dem Titel der Detailseite angezeigt, mit einer Kopierschaltfläche).

---

### SSH-Timeout

**Ursache**: Keine öffentliche IP, Port 22 nicht erlaubt oder SSH-Dienst in der VM noch nicht gestartet.

**Lösung**:

1. Auf der Detailseite, Abschnitt **Network & Security**: **Public IP** muss auf **Active** stehen und Port **22** muss unter **Firewall & Ports** aufgeführt sein.
2. Andernfalls klicken Sie auf **Edit**, aktivieren **Public IPv4 Address**, haken **SSH (22)** unter **Allowed Ports** an und klicken dann auf **Save**.
3. Warten Sie direkt nach der Erstellung ein bis zwei Minuten, bis das Betriebssystem vollständig gestartet ist.
4. Testen Sie im ausführlichen Modus:
   ```bash
   ssh -v ubuntu@<public-ip>
   ```

---

### Permission denied (publickey)

**Ursache**: Falscher Benutzer, falscher Schlüssel oder Schlüssel nach dem ersten Start hinzugefügt, ohne die User Data neu zu laden.

**Lösung**:

1. Verwenden Sie den Benutzer, der im Block **SSH Connection** (oder unter **System Image** > **User**) angegeben ist.
2. Prüfen Sie, dass der öffentliche Schlüssel, der zu Ihrem privaten Schlüssel gehört, unter **Advanced Configuration** > **SSH Keys** aufgeführt ist.
3. Wenn Sie den Schlüssel gerade über **Edit** hinzugefügt haben, wählen Sie im Dialog **SSH keys changed** die Option **Reload user-data** oder starten Sie **Reload UserData** im Abschnitt **Actions** und anschließend **Restart**: Der Schlüssel wird erst beim Neustart installiert.

---

### Die hinzugefügte Disk erscheint nicht in der VM

**Ursache**: Die VM wurde nach dem Hinzufügen noch nicht neu gestartet oder die Disk ist nicht formatiert.

**Lösung**:

1. Nach **Save** zeigt die Konsole **Restart required** an: Warten Sie, bis die VM wieder den Status **Running** hat.
2. Prüfen Sie die Disk im Abschnitt **Storage & Disks** der Detailseite.
3. Listen Sie in der VM die Geräte auf: Eine neue Disk erscheint ohne Partition und ohne Einhängepunkt.
   ```bash
   lsblk
   ```
4. Formatieren und mounten Sie sie: siehe [Eine zusätzliche Disk anbinden](./how-to/attach-extra-disk.md).

---

### GPU beim Start nicht verfügbar

**Ursache**: Eine GPU wird freigegeben, wenn die VM gestoppt wird, und kann in der Zwischenzeit einem anderen Workload zugewiesen werden.

**Lösung**: Wenn die GPU beim Start nicht mehr verfügbar ist, öffnet die Konsole den Dialog **Select an alternative GPU**. Wählen Sie ein Modell unter **Available GPU** und klicken Sie auf **Update and Start**. Zeigt der Dialog **No GPUs are currently available.** an, versuchen Sie es später erneut oder wenden Sie sich an den [Support](mailto:support@hidora.io). Siehe [GPU-Fehlerbehebung](../gpu/troubleshooting.md).

---

### DNS .local funktioniert in der VM nicht

**Ursache**: `systemd-resolved` behandelt `.local`-Domains als mDNS.

**Lösung**: siehe [DNS .local in VMs auflösen](./how-to/fix-dns-local.md).

---

### Die VM reagiert überhaupt nicht mehr (weder SSH noch RDP)

**Ursache**: Betriebssystem blockiert, Netzwerk in der VM falsch konfiguriert, zu restriktive interne Firewall.

**Lösung**:

1. Starten Sie **Restart** im Abschnitt **Actions** der Detailseite.
2. Wenn eine kürzliche Änderung an cloud-init die Ursache ist, korrigieren Sie das Skript unter **Edit** > **Advanced Configuration** und starten Sie dann **Reload UserData** und **Restart**.
3. Ein Zugriff über serielle Konsole oder VNC wird in der Konsole nicht angeboten; wenden Sie sich für eine Low-Level-Diagnose an den [Support](mailto:support@hidora.io).
