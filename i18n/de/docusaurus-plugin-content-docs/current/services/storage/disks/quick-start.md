---
sidebar_position: 3
title: Schnellstart
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# Ihre erste Disk erstellen und verwenden

Diese Anleitung begleitet Sie bei der Erstellung einer **Daten-Disk** in der [Hikube-Konsole](https://console.hikube.cloud), ihrer Anbindung an eine virtuelle Maschine sowie ihrer Formatierung und Einhängung im System.

---

## Ziele

Am Ende dieser Anleitung verfügen Sie über:

- eine **Daten-Disk** von 20 GB in Ihrem Projekt
- diese Disk, **angebunden** an eine bestehende VM
- ein in der VM **eingehängtes** und nutzbares Dateisystem

---

## Voraussetzungen

- Ein **Hikube-Konto** und ein **Projekt** (siehe [Hikube-Schnellstart](../../../getting-started/quick-start.md))
- Eine **Linux-VM** in diesem Projekt, per SSH erreichbar (siehe [Schnellstart für virtuelle Maschinen](../../compute/quick-start.md))
- Ein verfügbares Speicher-Quota von mindestens 20 GB

---

## Schritt 1: Den Erstellungsassistenten öffnen

1. Melden Sie sich bei der [Hikube-Konsole](https://console.hikube.cloud) an und wählen Sie Ihr Projekt aus.
2. Öffnen Sie im Seitenmenü **Infrastructure** → **Disks**. Die Seite **Storage Disks** wird angezeigt.
3. Klicken Sie auf **Create a disk**.

---

## Schritt 2: Die Disk konfigurieren und erstellen

Der Assistent **Create a disk** umfasst vier Schritte.

1. **General**: Geben Sie den **Disk Name** ein (standardmäßig wird ein Name vorgeschlagen). Regeln: Kleinbuchstaben, Ziffern und Bindestriche; beginnt mit einem Buchstaben und endet mit einem Buchstaben oder einer Ziffer; höchstens 16 Zeichen. Beispiel: `data01`.
2. **Source**: Wählen Sie **Empty Disk**.
3. **Configuration** (Size and Security):
   - **Size (GB)**: `20` (mindestens 20 GB). Die Anzeige **Estimated project usage** zeigt die Auswirkung auf das Quota des Projekts;
   - **Replication Type**: Belassen Sie **Asynchronous Replication** (Recommended);
   - **Disk Encryption**: Lassen Sie diese Option für diese Anleitung deaktiviert.
4. **Summary**: Prüfen Sie Name, Größe, Verschlüsselung, Replikation und Quelle sowie die oben im Assistenten angezeigten **Estimated Cost** und klicken Sie dann auf **Create disk**.

Die Konsole zeigt „Disk created“ an und kehrt zur Liste der Disks zurück.

---

## Schritt 3: Den Zustand der Disk prüfen

In der Liste **Storage Disks** erscheint die Disk mit dem Status **Creating** und dann **Ready**.

Klicken Sie auf die Disk (oder Aktionsmenü → **Preview**), um ihre Detailseite zu öffnen:

- **Configuration**: **Capacity**, **Encryption**, **Replication**;
- **Source**: Ursprungs-Image (**N/A** für eine leere Disk) und **Attached to** (vorerst **Not attached**).

---

## Schritt 4: Die Disk an die VM anbinden

1. Öffnen Sie **Infrastructure** → **VM Instances**, dann die Seite Ihrer VM, und klicken Sie auf **Edit**.
2. Klicken Sie im Abschnitt **Storage** auf **Add a disk**.
3. Wählen Sie beim neuen Volume **Existing** und dann `data01` unter **Select an existing volume**.
4. Klicken Sie auf **Save**.

:::warning Neustart der VM
Die Änderung des Speichers startet die VM neu („The instance type or storage was modified. The instance will reboot“). Planen Sie den Vorgang entsprechend.
:::

Nach Abschluss des Vorgangs wechselt die Disk in den Status **In Use** und ihre Seite zeigt den Namen der VM unter **Attached to** an.

---

## Schritt 5: Die Disk in der VM formatieren und einhängen

Verbinden Sie sich per SSH mit der VM und identifizieren Sie dann die neue Disk:

```bash
lsblk
```

Die neue Disk erscheint ohne Partition und ohne Einhängepunkt, mit einer Größe von 20 GB (zum Beispiel `vdb`). Passen Sie den Gerätenamen in den folgenden Befehlen an.

```bash
# Ein Dateisystem erstellen (löscht den Inhalt der Disk)
sudo mkfs.ext4 /dev/vdb

# Die Disk einhängen
sudo mkdir -p /mnt/data
sudo mount /dev/vdb /mnt/data

# Beim Start automatisch einhängen
UUID=$(sudo blkid -s UUID -o value /dev/vdb)
echo "UUID=$UUID /mnt/data ext4 defaults,nofail 0 2" | sudo tee -a /etc/fstab

# Testen
echo "hello hikube" | sudo tee /mnt/data/test.txt
df -h /mnt/data
```

**Erwartetes Ergebnis:** `df -h` zeigt ein Dateisystem von etwa 20 GB an, das unter `/mnt/data` eingehängt ist.

---

## Schritt 6: Schnelle Fehlerbehebung

| Symptom | Wahrscheinliche Ursache | Maßnahme |
|----------|----------------|--------|
| **Next** im Schritt **Configuration** inaktiv | Größe unter 20 GB oder Quota überschritten | Passen Sie die Größe an; „Size exceeds available quota“ gibt das mögliche Maximum an |
| Die Disk erscheint nicht unter **Select an existing volume** | Disk bereits an eine VM angebunden, oder System-Disk für ein Daten-Volume angeboten | Prüfen Sie **Attached to** auf der Seite der Disk; eine leere Disk gehört auf ein Daten-Volume, nicht auf die System-Disk |
| Die Disk erscheint nicht in `lsblk` | Die VM wurde noch nicht neu gestartet | Warten Sie das Ende des Neustarts ab und führen Sie `lsblk` erneut aus |
| Status **Error** | Bereitstellung fehlgeschlagen | [Wenden Sie sich an den Support](mailto:support@hidora.io) mit dem Namen und der Kennung der Disk |

Siehe auch die [vollständige Fehlerbehebung](./troubleshooting.md).

---

## Schritt 7: Aufräumen

1. Hängen Sie in der VM die Disk aus und entfernen Sie ihre Zeile aus `/etc/fstab`:
   ```bash
   sudo umount /mnt/data
   sudo sed -i '\|/mnt/data|d' /etc/fstab
   ```
2. Trennen Sie die Disk: Seite der VM → **Edit** → Abschnitt **Storage**, klicken Sie auf das Löschsymbol des Volumes, bestätigen Sie durch Eingabe seines Namens und klicken Sie dann auf **Save**. Die Disk kehrt in den Status **Ready** zurück.
3. Löschen Sie die Disk: Seite der Disk → **Delete** (oder Aktionsmenü → **Delete** in der Liste), geben Sie ihren genauen Namen in **Resource name to confirm** ein und klicken Sie dann auf **Permanently delete**.

:::warning
Das Löschen einer Disk ist unwiderruflich: Alle ihre Daten gehen verloren. Eine an eine VM angebundene Disk kann nicht gelöscht werden; trennen Sie sie zuerst.
:::

<NavigationFooter
  nextSteps={[
    {label: "Die Größe einer Disk ändern", href: "../how-to/resize"},
    {label: "FAQ", href: "../faq"},
  ]}
  seeAlso={[
    {label: "Virtuelle Maschinen", href: "../../../compute/overview"},
  ]}
/>
