---
title: "Eine zusätzliche Disk anbinden"
---

# Eine zusätzliche Disk anbinden

Die Trennung der Anwendungsdaten von der System-Disk erleichtert Backups, Migrationen und Größenänderungen. Diese Anleitung erklärt, wie Sie einer VM in der Konsole eine Daten-Disk hinzufügen und sie anschließend im Betriebssystem formatieren und einhängen.

## Voraussetzungen

- Ein Hikube-Konto und ein Projekt mit verfügbarem **Storage**-Quota
- Eine bestehende **VM-Instanz**
- Ein **SSH**-Zugang zur VM

## Schritte

### 1. Die Bearbeitung der VM öffnen

1. Öffnen Sie **Infrastructure** > **VM Instances** und klicken Sie auf den Namen der VM.
2. Klicken Sie auf **Edit**.

### 2. Die Disk hinzufügen

Klicken Sie im Abschnitt **Storage** auf **Add a disk**. Ein Block **Storage Volume #1** erscheint. Zwei Optionen:

**Neue Disk** (Registerkarte **New**):

1. **Volume Name**: Behalten Sie den vorgeschlagenen Namen bei oder geben Sie Ihren eigenen ein (Kleinbuchstaben, Ziffern und Bindestriche).
2. **Size (GB)**: mindestens 20 GB, zum Beispiel `50`.
3. **Replication Type**: **Asynchronous Replication** (Recommended) oder **Synchronous Replication**.
4. **Disk Encryption**: Aktivieren Sie diese Option, um die Daten im Ruhezustand zu verschlüsseln.

**Bestehende Disk** (Registerkarte **Existing**): Wählen Sie unter **Select an existing volume** eine Daten-Disk des Projekts, die an keine VM angebunden ist. Disks lassen sich auch unabhängig im Menü **Disks** erstellen (siehe [Disks](../../storage/disks/quick-start.md)).

Um ein versehentlich hinzugefügtes Volume vor dem Speichern zu entfernen, klicken Sie auf **Remove disk** (Papierkorbsymbol): Es wurde noch nichts erstellt.

Die Disks, die die VM bereits besitzt, werden schreibgeschützt angezeigt: Die Auswahl **New** / **Existing** gibt es nur bei hinzugefügten Volumes.

### 3. Speichern

Prüfen Sie die Quota-Übersicht oben auf der Seite und klicken Sie dann auf **Save**.

Die Konsole zeigt **Restart required** an: Die neue Disk wird erst beim nächsten Neustart der VM übernommen. Klicken Sie im Abschnitt **Actions** der Detailseite auf **Restart** und warten Sie, bis die VM wieder den Status **Running** hat. Die Disk erscheint im Abschnitt **Storage & Disks** der Detailseite.

:::note Bei der Erstellung hinzugefügte Disk
Sie können Disks auch direkt bei der Erstellung der VM hinzufügen, mit **Add a disk** im Schritt **Storage** des Assistenten. Sie erhalten dann den Namen der VM mit einem Suffix (`ma-vm-2`, `ma-vm-3`…).
:::

### 4. Die Disk in der VM formatieren und einhängen

Verbinden Sie sich mit dem Befehl aus dem Block **SSH Connection** mit der VM:

```bash
ssh -i ~/.ssh/hikube-vm ubuntu@<public-ip>
```

Identifizieren Sie die neue Disk:

```bash
lsblk
```

**Erwartetes Ergebnis:**

```
NAME    MAJ:MIN RM  SIZE RO TYPE MOUNTPOINTS
vda     252:0    0   20G  0 disk
├─vda1  252:1    0 19.9G  0 part /
└─vda15 252:15   0  106M  0 part /boot/efi
vdb     252:16   0   50G  0 disk
```

Die neue Disk erscheint als `vdb`, ohne Partition und ohne Einhängepunkt.

Formatieren Sie sie mit ext4:

```bash
sudo mkfs.ext4 /dev/vdb
```

Hängen Sie sie ein:

```bash
sudo mkdir -p /mnt/data
sudo mount /dev/vdb /mnt/data
```

Machen Sie die Einhängung dauerhaft, indem Sie die UUID des Dateisystems verwenden, die stabiler ist als der Gerätename:

```bash
UUID=$(sudo blkid -s UUID -o value /dev/vdb)
echo "UUID=$UUID /mnt/data ext4 defaults,nofail 0 2" | sudo tee -a /etc/fstab
```

## Überprüfung

```bash
df -h /mnt/data
```

**Erwartetes Ergebnis:**

```
Filesystem      Size  Used Avail Use% Mounted on
/dev/vdb         49G   24K   47G   1% /mnt/data
```

Testen Sie das Schreiben:

```bash
sudo touch /mnt/data/test.txt && echo "OK"
```

## Eine Disk trennen

Hängen Sie die Disk zuerst im Betriebssystem aus und entfernen Sie ihre Zeile aus `/etc/fstab`. Klicken Sie dann unter **Edit** > **Storage** am Volume auf **Detach disk**, bestätigen Sie im Dialog **Detach `<name>`?** mit **Detach** und klicken Sie auf **Save**.

Die Disk wird nicht gelöscht: Ihre Daten bleiben erhalten, und sie bleibt im Menü **Disks** verfügbar, von wo aus Sie sie an eine andere VM anbinden können. Das Trennen wird erst beim nächsten Neustart der VM wirksam: Bis dahin bleibt die Disk für das System sichtbar. Die Konsole zeigt **Restart required** an; klicken Sie auf **Restart**, um es anzuwenden. Die System-Disk lässt sich nicht trennen: Sie hat unter **Edit** keine Aktion.

Um die getrennte Disk anschließend zu löschen, starten Sie zuerst die VM neu: Solange die VM sie noch verwendet, lehnt die Konsole das Löschen ab („This disk was detached, but its VM still uses it until its next restart. Restart the VM, then try again.“).

## Weiterführende Informationen

- [Disks: Übersicht](../../storage/disks/overview.md)
- [Eine bestehende Disk an eine VM anbinden](../../storage/disks/how-to/attach-to-vm.md)
- [Die Größe einer Disk ändern](../../storage/disks/how-to/resize.md)
- [VM-Schnellstart](../quick-start.md)
