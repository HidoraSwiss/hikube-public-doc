---
title: "DNS .local in VMs auflösen"
---

# DNS .local in VMs auflösen

Hikube-VMs auf Basis von Debian oder Ubuntu verwenden `systemd-resolved` für die DNS-Auflösung. Die interne DNS-Domain der Plattform endet jedoch auf `.local` (`cozy.local`), und `systemd-resolved` lehnt `*.local`-Anfragen standardmäßig ab, da diese TLD für das mDNS-Protokoll reserviert ist (RFC 6762). Diese Anleitung erklärt, wie Sie dieses Verhalten im Betriebssystem der VM korrigieren.

## Voraussetzungen

- Eine Hikube-VM auf Basis von Debian oder Ubuntu
- Ein **SSH**-Zugang zur VM (Befehl aus dem Block **SSH Connection** der Detailseite)
- **root**- oder **sudo**-Rechte

## Schritte

### 1. Das Problem diagnostizieren

Verbinden Sie sich mit der VM:

```bash
ssh -i ~/.ssh/hikube-vm ubuntu@<public-ip>
```

Prüfen Sie die aktuelle DNS-Konfiguration:

```bash
resolvectl status
```

Suchen Sie den Abschnitt der Hauptnetzwerkschnittstelle (oft `enp1s0`). Er enthält weder eine Such-Domain noch eine Routing-Domain.

Testen Sie die Auflösung eines Namens unter `.local`:

```bash
dig mon-service.cozy.local
```

**Typisches Ergebnis bei diesem Problem:**

```
;; ->>HEADER<<- opcode: QUERY, status: REFUSED, id: 12345
```

Der Status `REFUSED` bestätigt, dass `systemd-resolved` die `.local`-Anfrage an mDNS statt an den Unicast-DNS-Server sendet.

**Grundursache**: Der DHCP der Plattform liefert einen DNS-Server, aber keine Such-Domain. Ohne Routing-Domain `~local` wendet `systemd-resolved` RFC 6762 an und leitet `.local` an mDNS weiter.

### 2. Das systemd-networkd-Drop-in erstellen

:::warning Netplan nicht verwenden
Netplan unterstützt keine Routing-Domains (Präfix `~`). Verwenden Sie direkt ein `systemd-networkd`-Drop-in.
:::

Ermitteln Sie den Namen der für die Schnittstelle generierten Netzwerkdatei:

```bash
networkctl status enp1s0 | grep "Network File"
```

Erstellen Sie das entsprechende Drop-in-Verzeichnis (hier für `10-netplan-enp1s0.network`):

```bash
sudo mkdir -p /etc/systemd/network/10-netplan-enp1s0.network.d/
```

Erstellen Sie die Konfigurationsdatei:

```bash
sudo tee /etc/systemd/network/10-netplan-enp1s0.network.d/dns-fix.conf << 'EOF'
[Network]
Domains=cozy.local ~local ~.
EOF
```

**Konfigurierte Domains:**

| Domain | Rolle |
|---------|------|
| `cozy.local` | Such-Domain: ermöglicht die Auflösung eines Namens relativ zu `cozy.local` |
| `~local` | Routing-Domain: erzwingt `.local` über den Unicast-DNS statt über mDNS |
| `~.` | Routing-Domain: macht diese Schnittstelle zur Standard-DNS-Route (ohne sie funktioniert die externe Auflösung nicht mehr) |

:::note Zusätzliche Such-Domains
Wenn Ihnen eine genauere interne Domain mitgeteilt wurde (zum Beispiel `<space>.svc.cozy.local`), fügen Sie sie am Anfang der Zeile `Domains=` hinzu, um Kurznamen verwenden zu können. Wenn Sie unsicher sind, welche Domain Sie verwenden sollen, wenden Sie sich an den [Support](mailto:support@hidora.io).
:::

### 3. Die Konfiguration anwenden

```bash
sudo systemctl restart systemd-networkd systemd-resolved
```

### 4. Die Konfiguration prüfen

```bash
resolvectl status
```

Der Abschnitt der Schnittstelle muss die Domains auflisten:

```
Link 2 (enp1s0)
    Current Scopes: DNS
         Protocols: +DefaultRoute ...
Current DNS Server: 10.x.x.x
       DNS Servers: 10.x.x.x
        DNS Domain: ~.
                    ~local
                    cozy.local
```

## Überprüfung

Testen Sie die Auflösung eines vollständigen `.local`-Namens:

```bash
dig mon-service.cozy.local
```

**Erwartetes Ergebnis:** Status `NOERROR` (oder `NXDOMAIN`, wenn der Name nicht existiert) und nicht mehr `REFUSED`.

Prüfen Sie, dass die externe Auflösung weiterhin funktioniert:

```bash
dig example.com
```

:::tip Persistenz
Das Drop-in wird von `systemd-networkd` bei jedem Start gelesen: Die Korrektur bleibt über Neustarts hinweg erhalten.
:::

:::tip Mit cloud-init automatisieren
Um die Korrektur bereits bei der Erstellung anzuwenden, fügen Sie sie dem **Cloud-Init script (User Data)** hinzu:

```yaml title="user-data.yaml"
#cloud-config
write_files:
  - path: /etc/systemd/network/10-netplan-enp1s0.network.d/dns-fix.conf
    content: |
      [Network]
      Domains=cozy.local ~local ~.
runcmd:
  - systemctl restart systemd-networkd systemd-resolved
```
:::

## Weiterführende Informationen

- [cloud-init konfigurieren](./configure-cloud-init.md)
- [Fehlerbehebung](../troubleshooting.md)
