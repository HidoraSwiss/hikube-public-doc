---
sidebar_position: 3
title: Schnellstart
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# Ihre erste virtuelle Maschine erstellen

Diese Anleitung begleitet Sie bei der Erstellung einer Ubuntu-VM in der [Hikube-Konsole](https://console.hikube.cloud) bis zur ersten SSH-Verbindung.

---

## Ziel

Am Ende dieser Anleitung verfügen Sie über:

- eine Ubuntu-VM im Status **Running**;
- eine öffentliche IP mit geöffnetem Port 22;
- einen SSH-Zugang per Schlüssel;
- eine replizierte System-Disk.

---

## Voraussetzungen

- Ein Hikube-Konto und ein **Projekt** (siehe [Hikube-Schnellstart](../../getting-started/quick-start.md)).
- Verfügbare Quotas in diesem Projekt: mindestens 4 vCPU, 16 GB Arbeitsspeicher und 20 GB Speicher für das folgende Beispiel.
- Ein SSH-Schlüsselpaar. Falls Sie keines haben:

```bash
ssh-keygen -t ed25519 -f ~/.ssh/hikube-vm
cat ~/.ssh/hikube-vm.pub
```

Bewahren Sie den angezeigten öffentlichen Schlüssel auf (Zeile, die mit `ssh-ed25519` beginnt): Sie fügen ihn in den Assistenten ein.

---

## Schritt 1: Den Erstellungsassistenten öffnen

1. Melden Sie sich bei [https://console.hikube.cloud](https://console.hikube.cloud) an und wählen Sie Ihr Projekt aus.
2. Öffnen Sie im Seitenmenü **Infrastructure** > **VM Instances**.
3. Klicken Sie auf **Create an Instance**.

Der Assistent **Create a new instance** öffnet sich. Er umfasst fünf Schritte: **General**, **Configuration**, **Storage**, **Network** und **Summary**.

---

## Schritt 2: Konfigurieren und bestätigen

### General

Geben Sie den **Instance name** ein, zum Beispiel `vm-demo`. Der Name muss 3 bis 16 Zeichen lang sein, mit einem Buchstaben beginnen, mit einem Buchstaben oder einer Ziffer enden und darf nur Kleinbuchstaben, Ziffern und Bindestriche enthalten. Klicken Sie auf **Next**.

### Configuration

1. Wählen Sie unter **Resources (CPU / RAM)** die Serie **Universal (U)** und dann die Größe **XLarge** (4 vCPU, 16 GB).
2. Lassen Sie den Abschnitt **Hardware Acceleration (GPU)** leer (siehe [GPU](../gpu/overview.md) für eine VM mit GPU).
3. Lassen Sie **Automatic Restart** deaktiviert oder aktivieren Sie die Option nach Bedarf.
4. Klicken Sie auf **Next**.

Das Banner oben im Schritt zeigt die geschätzten Kosten und den Quota-Verbrauch des Projekts an.

### Storage

Die **System Disk (Boot)** ist vorausgefüllt: Sie trägt den Namen der VM und ist 20 GB groß.

1. Wählen Sie unter **Operating System** die Karte **ubuntu** und die Version **24.04**.
2. Belassen Sie **Size (GB)** bei `20`.
3. Belassen Sie **Asynchronous Replication** (Recommended).
4. Aktivieren Sie **Disk Encryption**, wenn Sie die Daten im Ruhezustand verschlüsseln möchten.
5. Klicken Sie auf **Next**.

### Network

1. Prüfen Sie, dass **Public IPv4 Address** aktiviert ist.
2. Prüfen Sie, dass **Enable Firewall** angehakt und **SSH (22)** unter **Allowed Ports** ausgewählt ist.
3. Fügen Sie unter **Authorized SSH keys** Ihren öffentlichen Schlüssel in das Feld **Add a public SSH key** ein und bestätigen Sie mit der Eingabetaste oder der Schaltfläche zum Hinzufügen. Das erwartete Format ist `<algorithm> <base64-key> [comment]`.
4. Klicken Sie auf **Next**.

### Summary

Die **Summary** fasst die Instanz, den Speicher und den Abschnitt **Network & Security** zusammen (öffentliche IP, Firewall, offene Ports, SSH-Schlüssel). Klicken Sie auf **Create instance**.

Die Konsole zeigt **Instance created** an und kehrt zur Liste der Instanzen zurück.

---

## Schritt 3: Den Zustand prüfen

In der Liste **VM Instances** wechselt die VM von **Creating** zu **Running**. Die Aktualisierung erfolgt automatisch, ohne die Seite neu zu laden.

Klicken Sie auf den Namen der VM, um ihre Detailseite zu öffnen. Dort finden Sie:

- **Resources & Characteristics**: Instanztyp, System-Image, Standardbenutzer, vCPU und RAM;
- **Storage & Disks**: angebundene Disks, Größe, Replikation, Verschlüsselung;
- **Network & Security**: **Public IP**, **SSH Connection**, **IP Addresses**, **Firewall & Ports**.

**Erwartetes Ergebnis:** Status **Running**, **Public IP** auf **Active**, Port **22** unter **Firewall & Ports** aufgeführt.

---

## Schritt 4: Die Verbindungsinformationen abrufen

Im Abschnitt **Network & Security** der Detailseite zeigt der Block **SSH Connection** den einsatzbereiten Befehl an, zum Beispiel:

```bash
ssh ubuntu@203.0.113.10
```

Klicken Sie auf das Kopiersymbol, um ihn in die Zwischenablage zu kopieren. Der Standardbenutzer hängt vom Image ab; es ist der Benutzer im SSH-Befehl.

---

## Schritt 5: Verbindung und Tests

Verbinden Sie sich mit Ihrem privaten Schlüssel:

```bash
ssh -i ~/.ssh/hikube-vm ubuntu@203.0.113.10
```

Prüfen Sie nach der Anmeldung die Ressourcen und die Disk:

```bash
nproc
free -h
lsblk
```

**Erwartetes Ergebnis:** 4 Prozessoren, etwa 16 GB Arbeitsspeicher und eine Disk `vda` von etwa 20 GB.

---

## Schritt 6: Schnelle Fehlerbehebung

| Symptom | Prüfung |
|----------|--------------|
| **Next** bleibt im Schritt Configuration oder Storage ausgegraut | Ein Quota des Projekts ist überschritten: Verkleinern Sie den Instanztyp oder die Disk-Größe oder lassen Sie die Quotas des Projekts erhöhen. |
| `Connection timed out` bei SSH | Prüfen Sie auf der Detailseite, dass **Public IP** auf **Active** steht und Port 22 unter **Firewall & Ports** aufgeführt ist. |
| `Permission denied (publickey)` | Prüfen Sie den Benutzer (Block **SSH Connection**) und dass der verwendete private Schlüssel zum öffentlichen Schlüssel passt, der unter **Advanced Configuration** > **SSH Keys** aufgeführt ist. |
| Status **Error** oder **Failed** | Siehe [Fehlerbehebung](./troubleshooting.md). |

---

## Schritt 7: Aufräumen

1. Öffnen Sie die Detailseite der VM oder das Menü **Actions** der Zeile in der Liste.
2. Klicken Sie auf **Delete**.
3. Geben Sie zur Bestätigung den genauen Namen der VM ein und klicken Sie dann auf **Permanently delete**.

Die System-Disk wird getrennt, aber **nicht gelöscht**: Sie bleibt im Menü **Disks** und verbraucht weiterhin Speicher-Quota. Löschen Sie sie unter **Disks**, wenn Sie sie nicht mehr benötigen (siehe [Disks](../storage/disks/overview.md)).

:::warning Unwiderrufliches Löschen
Das Löschen einer VM und anschließend ihrer Disks ist endgültig. Sichern Sie wichtige Daten vorher.
:::

---

## Nächste Schritte

- [Eine Daten-Disk anbinden](./how-to/attach-extra-disk.md)
- [cloud-init konfigurieren](./how-to/configure-cloud-init.md)
- [Netzwerk und Firewall konfigurieren](./how-to/configure-network.md)
- [Die VM mit einem privaten Netzwerk (VPC) verbinden](../networking/quick-start.md)

<NavigationFooter
  nextSteps={[
    {label: "Praktische Anleitungen", href: "../how-to/attach-extra-disk"},
    {label: "FAQ", href: "../faq"},
  ]}
/>
