---
title: "Eine Disk an eine VM anbinden"
---

# Eine Disk an eine VM anbinden

Diese Anleitung erklärt, wie Sie in der [Hikube-Konsole](https://console.hikube.cloud) eine bestehende Disk an eine virtuelle Maschine anbinden, sie im System nutzbar machen und sie anschließend wieder trennen.

## Voraussetzungen

- Eine **Disk** im Status **Ready** (nicht angebunden) in Ihrem Projekt (siehe [Schnellstart](../quick-start.md))
- Eine **VM** im selben Projekt

## Prinzip

Die Anbindung wird **auf VM-Seite** im Abschnitt **Storage** konfiguriert:

- bei der Erstellung einer VM (Schritt **Storage** des Assistenten);
- oder bei einer bestehenden VM (Seite der VM → **Edit** → Abschnitt **Storage**).

Jedes Volume der VM kann **New** sein (die Konsole erstellt die Disk) oder **Existing** (Sie wählen eine bereits erstellte Disk). Das erste Volume ist die **System Disk (Boot)**; die folgenden sind Daten-Volumes.

| Volume | Im Modus **Existing** angebotene Disks |
|--------|----------------------------------------|
| **System Disk (Boot)** | Nicht angebundene System-Disks (aus einem Image erstellt) |
| **Storage Volume #N** | Nicht angebundene Daten-Disks |

## Eine Disk an eine bestehende VM anbinden

1. Öffnen Sie **Infrastructure** → **VM Instances**, dann die Seite der VM, und klicken Sie auf **Edit**.
2. Klicken Sie im Abschnitt **Storage** auf **Add a disk**.
3. Wählen Sie beim neuen Volume **Existing**.
4. Suchen und wählen Sie unter **Select an existing volume** die Disk. Die Liste zeigt ihren Namen und ihre Größe an.
5. Klicken Sie auf **Save**.

:::warning Neustart
Eine Änderung des Speichers startet die VM neu. Die Konsole weist darauf hin: „The instance type or storage was modified. The instance will reboot, which may take several minutes.“
:::

## Eine Disk bei der Erstellung einer VM anbinden

Klicken Sie im Schritt **Storage** des VM-Erstellungsassistenten auf **Add a disk**, wählen Sie **Existing** und dann die Disk unter **Select an existing volume**. Um die VM von einer im Voraus erstellten System-Disk zu starten, wählen Sie **Existing** bei der **System Disk (Boot)**.

## Die Disk in der VM nutzbar machen (Linux)

Verbinden Sie sich per SSH mit der VM und identifizieren Sie die Disk:

```bash
lsblk
```

Für eine **leere Disk** erstellen Sie ein Dateisystem und hängen es ein:

```bash
# Achtung: mkfs löscht den Inhalt der Disk
sudo mkfs.ext4 /dev/vdb
sudo mkdir -p /mnt/data
sudo mount /dev/vdb /mnt/data

# Automatisches Einhängen beim Start
UUID=$(sudo blkid -s UUID -o value /dev/vdb)
echo "UUID=$UUID /mnt/data ext4 defaults,nofail 0 2" | sudo tee -a /etc/fstab
```

Bei einer **bereits formatierten** Disk (zum Beispiel von einer anderen VM getrennt) führen Sie `mkfs` nicht aus: Hängen Sie sie direkt ein.

:::tip
Verwenden Sie in `/etc/fstab` die UUID statt des Gerätenamens (`/dev/vdb`): Die Reihenfolge der Geräte kann sich ändern, wenn Sie Disks hinzufügen oder entfernen.
:::

## Eine Disk trennen

1. Hängen Sie die Disk in der VM aus und entfernen Sie ihre Zeile aus `/etc/fstab`.
2. Öffnen Sie die Seite der VM → **Edit** → Abschnitt **Storage**.
3. Klicken Sie auf das Löschsymbol des Volumes (**Remove disk**) und bestätigen Sie dann durch Eingabe des Namens der Disk.
4. Klicken Sie auf **Save**. Die VM wird neu gestartet.

Die Disk wird **getrennt**, nicht gelöscht: Sie bleibt unter **Infrastructure** → **Disks** mit dem Status **Ready** und kann an eine andere VM angebunden werden. Um sie endgültig zu löschen, verwenden Sie die Aktion **Delete** auf der Seite der Disk.

:::note
Auch das Löschen einer VM trennt ihre Disks, ohne sie zu löschen. Denken Sie daran, nicht mehr benötigte Disks zu löschen: Sie verbrauchen weiterhin das Speicher-Quota des Projekts.
:::

## Überprüfung

- Die Seite der Disk zeigt den Namen der VM unter **Attached to** (Link zur VM) und den Status **In Use** an.
- In der VM listet `lsblk` die Disk auf und `df -h` zeigt den Einhängepunkt an.

## Weiterführende Informationen

- [Die Größe einer Disk ändern](./resize.md)
- [System-Disk aus einem Image erstellen](./create-from-image.md)
- [Virtuelle Maschinen](../../../compute/overview.md)
