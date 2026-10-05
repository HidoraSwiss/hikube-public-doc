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
   - **Storage**: Hinzufügen oder Trennen von Disks;
   - **Network & Security**: öffentliche IP, Firewall, Ports, VPC;
   - **Advanced Configuration**: SSH-Schlüssel, cloud-init-Skript, **Automatic Restart**.
3. Prüfen Sie die Quota-Übersicht oben auf der Seite und klicken Sie auf **Save**.

Wenn sich der Instanztyp, die Disks oder die GPUs ändern, zeigt die Konsole **Restart required** an: Die VM wird neu gestartet, was mehrere Minuten dauern kann. Andernfalls zeigt sie **Instance updated** an.

Der Name und das System-Image sind nicht änderbar.

### 5. Eine VM löschen

1. Klicken Sie auf **Delete**.
2. Geben Sie den genauen Namen der VM ein und klicken Sie dann auf **Permanently delete**.

Die Disks der VM werden getrennt und bleiben im Menü **Disks**, wo Sie sie an eine andere VM anbinden oder löschen können (siehe [Disks](../../storage/disks/overview.md)).

## Überprüfung

Der in der Liste und auf der Detailseite angezeigte Status wird aktualisiert, ohne die Seite neu zu laden. Die Zähler oben in der Liste (**Active Instances**, **Stopped Instances**, **Total CPU**, **Total RAM**) spiegeln die Änderungen wider.

## Weiterführende Informationen

- [Konzepte: Lebenszyklus](../concepts.md#lebenszyklus)
- [Fehlerbehebung](../troubleshooting.md)
