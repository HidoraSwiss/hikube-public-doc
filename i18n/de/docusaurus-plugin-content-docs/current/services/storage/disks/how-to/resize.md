---
title: "Die Größe einer Disk ändern"
---

# Die Größe einer Disk ändern

Diese Anleitung erklärt, wie Sie eine Disk in der [Hikube-Konsole](https://console.hikube.cloud) vergrößern und anschließend ihr Dateisystem in der VM erweitern.

## Voraussetzungen

- Eine **Disk** in Ihrem Projekt
- Ein ausreichendes Speicher-Quota für die neue Größe

:::warning Keine Verkleinerung
Eine Verkleinerung wird nicht unterstützt. Die neue Größe muss größer oder gleich der aktuellen Größe und mindestens 20 GB sein.
:::

## Schritte

### 1. Die Bearbeitung der Disk öffnen

1. Öffnen Sie **Infrastructure** → **Disks**.
2. Öffnen Sie das Aktionsmenü der Disk und wählen Sie **Edit**, oder öffnen Sie die Seite der Disk und klicken Sie auf **Edit**.

Die Seite **Edit disk** zeigt die **CURRENT SIZE** und den Zustand der Verschlüsselung an.

### 2. Die neue Größe eingeben

1. Geben Sie unter **New Size (GB)** die gewünschte Größe ein.
2. Prüfen Sie die Anzeige **Estimated project usage**. Überschreitet die Größe das Quota, zeigt die Konsole „The size exceeds the project quota“ an und die Schaltfläche bleibt inaktiv.
3. Klicken Sie auf **Save changes**.

Die Konsole bestätigt: „The disk was successfully resized to N GB.“

### 3. Das Dateisystem in der VM erweitern

Die Größenänderung vergrößert das Blockgerät im laufenden Betrieb, ohne die VM neu zu starten; Partition und Dateisystem müssen anschließend in der VM erweitert werden, ebenfalls ohne Neustart. Verbinden Sie sich per SSH und prüfen Sie die neue Größe des Geräts:

```bash
lsblk
```

Ist die neue Größe nach einigen Minuten immer noch nicht sichtbar, starten Sie die VM in der Konsole neu.

**Formatierte Disk ohne Partition** (zum Beispiel `/dev/vdb`, direkt eingehängt):

```bash
# ext4
sudo resize2fs /dev/vdb

# XFS (Einhängepunkt angeben)
sudo xfs_growfs /mnt/data
```

**Partitionierte Disk** (zum Beispiel die System-Disk `/dev/vda`, Partition 1):

```bash
# Die Partition vergrößern (Paket cloud-guest-utils oder cloud-utils-growpart)
sudo growpart /dev/vda 1

# Dann das Dateisystem erweitern
sudo resize2fs /dev/vda1      # ext4
sudo xfs_growfs /             # XFS
```

:::tip
Viele Cloud-Images erweitern die Root-Partition beim Start automatisch (cloud-init). Wenn Sie `growpart` nicht selbst ausführen möchten, genügt bei einer System-Disk oft ein Neustart.
:::

## Überprüfung

- Die Seite der Disk zeigt die neue **Capacity** an.
- In der VM zeigt `df -h` die neue Größe des Dateisystems an.

## Weiterführende Informationen

- [Eine Disk an eine VM anbinden](./attach-to-vm.md)
- [FAQ](../faq.md)
