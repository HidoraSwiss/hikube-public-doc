---
title: "Netzwerk und Firewall konfigurieren"
---

# Netzwerk und Firewall konfigurieren

Eine Hikube-VM kann über eine öffentliche IPv4-IP im Internet erreichbar gemacht werden, gefiltert durch eine Firewall, die nur die gewählten Ports öffnet. Sie kann außerdem mit privaten Netzwerken (VPC) verbunden werden. Diese Anleitung erklärt, wie Sie diese Optionen in der Konsole einstellen, bei der Erstellung oder bei einer bestehenden VM.

## Voraussetzungen

- Ein Hikube-Konto und ein Projekt
- Eine bestehende VM oder der geöffnete Erstellungsassistent
- Die Liste der Ports, die Ihre Anwendung benötigt

## Schritte

### 1. Die Art der Erreichbarkeit wählen

| Konfiguration | Wirkung | Anwendungsfall |
|---------------|-------|-------------|
| **Public IPv4 Address** aktiviert + **Enable Firewall** angehakt | Nur die **Allowed Ports** sind aus dem Internet erreichbar | Produktion, gezielte Dienste (empfohlen) |
| **Public IPv4 Address** aktiviert + Firewall nicht angehakt | Alle Ports der VM sind aus dem Internet erreichbar | VPN, Gateway, Protokolle mit dynamischen Ports |
| **Public IPv4 Address** deaktiviert | Keine Erreichbarkeit aus dem Internet | Interne VM, über ein [VPC](../../networking/overview.md) erreichbar |

:::tip Empfehlung
Lassen Sie die Firewall in der Produktion aktiviert und öffnen Sie nur die notwendigen Ports.

Die Firewall filtert nur den Datenverkehr, der über die öffentliche IP ankommt. Der Datenverkehr zwischen den VMs des Projekts, sowohl in einem VPC als auch im Hauptnetzwerk, wird nicht gefiltert: Verwenden Sie dafür die Firewall des Betriebssystems (ufw, firewalld, nftables).
:::

### 2. Die Optionen bei der Erstellung einstellen

Im Schritt **Network** des Assistenten:

1. **Public IPv4 Address**: Lassen Sie den Schalter aktiviert, um die VM erreichbar zu machen.
2. **Enable Firewall**: Lassen Sie das Kästchen angehakt.
3. **Allowed Ports**: Haken Sie je nach Bedarf **SSH (22)**, **HTTP (80)**, **HTTPS (443)** an.
4. Für einen anderen Port geben Sie ihn in **Custom port...** ein (1 bis 65535) und klicken auf die Schaltfläche zum Hinzufügen. Er erscheint angehakt in der Liste; das Papierkorbsymbol entfernt ihn.

Die **Summary** zeigt vor der Bereitstellung **Public IP**, **Firewall** und **Open Ports** an.

### 3. Die Optionen einer bestehenden VM ändern

1. Öffnen Sie die Detailseite der VM und klicken Sie auf **Edit**.
2. Passen Sie unter **Network & Security** die Optionen **Public IPv4 Address**, **Enable Firewall** und die **Allowed Ports** an.
3. Klicken Sie auf **Save**.

Diese Änderungen werden innerhalb weniger Sekunden angewendet, ohne die VM neu zu starten, im Gegensatz zu einer Änderung des Instanztyps, der Disks oder der GPUs.

### 4. Die VM mit einem privaten Netzwerk verbinden (optional)

Haken Sie unter **VPC Networks (Secondary)** ein VPC und dann eines oder mehrere seiner **Subnets** an. Jedes Subnetz fügt der VM eine private Schnittstelle hinzu, die das Betriebssystem nicht automatisch konfiguriert (siehe [Eine VM mit einem VPC verbinden](../../networking/how-to/attach-vm-to-vpc.md#4-im-betriebssystem-prüfen)). Die Schaltfläche **+ VPC** erstellt ein VPC, ohne den Bildschirm zu verlassen, und **Add subnet** erstellt ein Subnetz im angehakten VPC. Die Einzelheiten finden Sie im [Netzwerk-Schnellstart](../../networking/quick-start.md).

## Überprüfung

Auf der Detailseite, Abschnitt **Network & Security**:

- **Public IP**: **Active** oder **Disabled**;
- **IP Addresses**: die **Primary**-Adresse und gegebenenfalls die **Secondary**-Adressen der VPC-Subnetze;
- **VPC Networks**: die verbundenen VPCs und Subnetze;
- **Firewall & Ports**: die offenen Ports oder **No ports open**.

Testen Sie von Ihrem Rechner aus:

```bash
# SSH
ssh ubuntu@<public-ip>

# HTTP, falls ein Webserver lauscht
curl http://<public-ip>

# Ein nicht erlaubter Port muss unerreichbar sein
nc -zv -w 5 <public-ip> 8080
```

:::warning Firewall deaktiviert
Ohne Hikube-Firewall ist die VM vollständig exponiert. Konfigurieren Sie eine Firewall im Betriebssystem (ufw, firewalld, nftables), bevor Sie die Option deaktivieren.
:::

## Weiterführende Informationen

- [Netzwerk: VPC und Subnetze](../../networking/overview.md)
- [VM-Schnellstart](../quick-start.md)
- [Fehlerbehebung](../troubleshooting.md)
