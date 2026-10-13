---
title: "Eine VM starten, stoppen, ändern und löschen"
---

# Eine VM starten, stoppen, ändern und löschen

Diese Anleitung fasst die gängigen Aktionen an einer bestehenden VM in der Konsole zusammen: Starten, Stoppen, Neustarten, Ändern der Ressourcen und Löschen.

## Voraussetzungen

- Ein Hikube-Konto und ein Projekt
- Eine bestehende VM unter **Infrastructure** > **VM Instances**

## Wo Sie die Aktionen finden

| Ort | Verfügbare Aktionen |
|-------------|---------------------|
| Liste **VM Instances**, Menü **Actions** (⋯) einer Zeile | **View details**, **Start**, **Stop**, **Restart**, **Reload UserData**, **Edit**, **Delete** |
| Detailseite, Kopfbereich | **Edit**, **Delete** |
| Detailseite, Abschnitt **Actions** | **Start** (gestoppte VM), **Stop** und **Restart** (laufende VM), **Reload UserData** (laufende VM) |

Die Liste bietet außerdem eine Suche (**Search instances...**) und einen Statusfilter (**All statuses**, **Running**, **Stopped**).

## Schritte

### 1. Eine VM stoppen

1. Klicken Sie auf **Stop**.
2. Bestätigen Sie im Dialog **Stop virtual machine?**: Die gehosteten Dienste werden bis zum Neustart unterbrochen.

Der Status wechselt zu **Stopping** und dann zu **Stopped**.

:::warning VM mit GPU
Das Stoppen gibt die GPU frei, die einem anderen Workload zugewiesen werden kann. Möglicherweise können Sie die VM nicht sofort wieder starten, wenn danach keine GPU verfügbar ist. Siehe [GPU beim Start nicht verfügbar](../troubleshooting.md#gpu-beim-start-nicht-verfügbar).
:::

### 2. Eine VM starten

Klicken Sie auf **Start**. Der Status wechselt zu **Starting** und dann zu **Running**.

### 3. Eine VM neu starten

Klicken Sie auf **Restart** und bestätigen Sie im Dialog **Restart virtual machine?**. Die Anwendungen sind vorübergehend nicht verfügbar. Der Status wechselt über **Restarting**.

### 4. Eine VM ändern

1. Klicken Sie auf der Detailseite auf **Edit** (oder auf **Edit** im Menü **Actions** der Liste, nur für eine VM im Status **Running** verfügbar).
2. Ändern Sie die gewünschten Abschnitte:
   - **Resources (CPU / RAM)**: Serie und Größe, GPU;
   - **Storage**: Hinzufügen von Disks, Trennen von Daten-Disks;
   - **Network & Security**: öffentliche IP, Firewall, Ports, VPC;
   - **Advanced Configuration**: SSH-Schlüssel, cloud-init-Skript, **Automatic Restart**.
3. Prüfen Sie die Quota-Übersicht oben auf der Seite und klicken Sie auf **Save**.

Wenn sich der Instanztyp, die Disks oder die GPUs ändern, zeigt die Konsole **Restart required** an: Diese Änderungen werden erst beim nächsten Neustart der VM wirksam. Klicken Sie auf **Restart**, um sie anzuwenden. Andernfalls zeigt sie **Instance updated** an.

Wird das Speichern abgelehnt, zeigt die Konsole **Incomplete form** an und nennt die fehlerhaften Felder.

Der Name und das System-Image sind nicht änderbar.

Im Abschnitt **Storage** werden die Disks, die die VM bereits besitzt, schreibgeschützt angezeigt (**Volume Name**, **Size (GB)**):

- Die **System Disk (Boot)** hat keine Aktion; die Konsole erklärt dies: „The system disk of an existing VM cannot be replaced: the VM boots from it.“;
- Eine Daten-Disk bietet nur **Detach disk** an;
- Die Auswahl **New** / **Existing** erscheint nur bei Disks, die mit **Add a disk** hinzugefügt wurden.

Um eine Disk zu vergrößern, verwenden Sie ihre Seite im Menü **Disks** (siehe [Die Größe einer Disk ändern](../../storage/disks/how-to/resize.md)).

Um die VM von einer anderen System-Disk zu starten, löschen Sie die VM: Ihre Disks werden getrennt und bleiben im Menü **Disks** erhalten. Erstellen Sie sie anschließend mit dem Assistenten neu, wählen Sie bei der **System Disk (Boot)** **Existing** und dann die gewünschte Disk; binden Sie ihre Daten-Disks auf dieselbe Weise wieder an. Über die API wird eine Änderung, die die System-Disk einer VM ersetzt, entfernt oder verschiebt, abgelehnt (Code `20208`).

### 5. Eine VM löschen

1. Klicken Sie auf **Delete**.
2. Geben Sie den genauen Namen der VM ein und klicken Sie dann auf **Permanently delete**.

Die Disks der VM werden getrennt und bleiben im Menü **Disks**, wo Sie sie an eine andere VM anbinden oder löschen können (siehe [Disks](../../storage/disks/overview.md)).

## Überprüfung

Der in der Liste und auf der Detailseite angezeigte Status wird aktualisiert, ohne die Seite neu zu laden. Die Zähler oben in der Liste (**Active Instances**, **Stopped Instances**, **Total CPU**, **Total RAM**) spiegeln die Änderungen wider.

## Weiterführende Informationen

- [Konzepte: Lebenszyklus](../concepts.md#lebenszyklus)
- [Fehlerbehebung](../troubleshooting.md)
