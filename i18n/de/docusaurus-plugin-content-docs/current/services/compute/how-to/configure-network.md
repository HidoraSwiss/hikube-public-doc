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
| **Public IPv4 Address** deaktiviert | Keine Erreichbarkeit aus dem Internet | Interne VM, über ihre **mgmt**-IP oder über ein [VPC](../../networking/overview.md) erreichbar |

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

Diese Änderungen werden innerhalb weniger Sekunden angewendet, ohne die VM neu zu starten. Eine Änderung des Instanztyps, der Disks oder der GPUs wird dagegen erst beim nächsten Neustart wirksam.

### 4. Die VM mit einem privaten Netzwerk verbinden (optional)

Haken Sie unter **VPC Networks (Secondary)** ein VPC und dann eines oder mehrere seiner **Subnets** an. Jedes Subnetz fügt der VM eine private Schnittstelle hinzu, deren Adresse per DHCP vergeben wird: AlmaLinux oder Rocky übernehmen sie automatisch, unter Debian und Ubuntu muss DHCP auf der Schnittstelle aktiviert werden (siehe [Eine VM mit einem VPC verbinden](../../networking/how-to/attach-vm-to-vpc.md#4-im-betriebssystem-prüfen)). Bei einem Debian- oder Ubuntu-Image erinnert die Konsole mit der Warnung **Manual setup required on Debian and Ubuntu** daran. Die Schaltfläche **+ VPC** erstellt ein VPC, ohne den Bildschirm zu verlassen, und **Add subnet** erstellt ein Subnetz im angehakten VPC. Die Einzelheiten finden Sie im [Netzwerk-Schnellstart](../../networking/quick-start.md).

## Überprüfung

Auf der Detailseite, Abschnitt **Network & Security**, sind die Adressen der VM auf zwei Bereiche verteilt:

- **Internal**, *From the project's resources only*: die mit **mgmt** gekennzeichnete Adresse, dann gegebenenfalls die Adressen der VPC-Subnetze (siehe [Die Adressen einer VM](#die-adressen-einer-vm));
- **External**, *From the Internet*: die öffentliche IP. Ohne öffentliche IP zeigt der Bereich **Disabled** und „This instance has no public IP.“ an. Solange die Adresse nicht zugewiesen ist, zeigt er „Waiting for allocation…“ an.

Danach folgen:

- **SSH Connection**: der kopierfertige Befehl, auf die öffentliche IP oder auf die **mgmt**-IP, wenn die VM keine öffentliche IP hat;
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

## Die Adressen einer VM

### Die mgmt-IP

Jede VM erhält beim Start eine Adresse im Netzwerk ihres Projekts: die **mgmt**-IP, angezeigt im Bereich **Internal**. Sie besteht unabhängig davon, ob die öffentliche IP aktiviert ist, und ist von den anderen Ressourcen desselben Projekts aus erreichbar, zum Beispiel von dessen anderen VMs. Sie ist die Adresse, die zwischen zwei VMs des Projekts ohne Umweg über das Internet zu verwenden ist. Solange die VM gestoppt ist, zeigt der Bereich **Internal** „Assigned when the instance starts.“ an.

Die Hikube-Firewall filtert diesen Datenverkehr nicht: Filtern Sie ihn bei Bedarf mit der Firewall des Betriebssystems. Um die VM aus einem anderen Projekt oder aus dem Internet zu erreichen, verwenden Sie ihre öffentliche IP.

### Die öffentliche IP

Die Adresse im Bereich **External** ist diejenige, die aus dem Internet zu verwenden ist. Je nach Adresspool kann sie zu einem privaten Bereich gehören (zum Beispiel `10.x.x.x`): Verlassen Sie sich auf den Bereich, in dem die Konsole sie anzeigt, nicht auf ihren Adressbereich.

### Einen verwalteten Dienst des Projekts erreichen

Die Datenbanken und RabbitMQ zeigen in ihrem Bereich **Internal** einen vollständigen Hostnamen an, der auf `.local` endet. Kopieren Sie ihn von einer VM des Projekts aus unverändert und vollständig: Seine Kurzform wird nicht auf allen Images aufgelöst.

Unter Debian 13 wird der Name ohne Konfiguration nicht aufgelöst: Das System ignoriert die per DHCP verteilte Suchdomäne. Fügen Sie diese Zeilen im Feld **Cloud-Init script (User Data)** der VM hinzu (wenn Ihre Konfiguration bereits `write_files` oder `runcmd` enthält, führen Sie die Einträge in den bestehenden Listen zusammen):

```yaml title="cloud-init.yaml"
#cloud-config
write_files:
  - path: /etc/netplan/90-hikube-dns.yaml
    permissions: '0600'
    content: |
      network:
        version: 2
        ethernets:
          enp1s0:
            dhcp4-overrides:
              use-domains: true
            dhcp6-overrides:
              use-domains: true
runcmd:
  - netplan apply
```

Auf einer bereits gestarteten VM schreiben Sie dieselbe Datei und führen dann `sudo netplan apply` aus. Ubuntu, AlmaLinux und Debian 12 lösen den Namen ohne Konfiguration auf.

## Weiterführende Informationen

- [Netzwerk: VPC und Subnetze](../../networking/overview.md)
- [VM-Schnellstart](../quick-start.md)
- [Fehlerbehebung](../troubleshooting.md)
