---
title: "DNS .local in VMs auflösen"
---

# DNS .local in VMs auflösen

Hikube-VMs, die auf Debian oder Ubuntu basieren, verwenden `systemd-resolved` für die DNS-Auflösung. Die interne DNS-Domain des Clusters ist jedoch `cozy.local`, und `systemd-resolved` lehnt standardmäßig alle `*.local`-Anfragen ab, da diese TLD dem mDNS-Protokoll vorbehalten ist (RFC 6762). Diese Anleitung erklärt, wie Sie dieses Verhalten korrigieren, um die DNS-Auflösung von Kubernetes-Diensten aus einer VM heraus zu ermöglichen.

## Voraussetzungen

- Eine **VMInstance** auf Hikube, basierend auf Debian oder Ubuntu
- Ein **SSH**- oder **Konsolen**-Zugang zur VM
- **Root**- oder **sudo**-Rechte auf der VM

## Schritte

### 1. Problem diagnostizieren

Verbinden Sie sich mit der VM:

```bash
virtctl ssh -i ~/.ssh/id_ed25519 ubuntu@my-vm
```

Überprüfen Sie die aktuelle DNS-Konfiguration:

```bash
resolvectl status
```

Beobachten Sie den Abschnitt Ihrer Netzwerkschnittstelle (in der Regel `enp1s0`). Sie werden feststellen, dass keine Suchdomains (search domains) und keine Routing-Domains vorhanden sind.

Testen Sie die Auflösung eines Kubernetes-Dienstes:

```bash
dig my-service.my-namespace.svc.cozy.local
```

**Typisches Ergebnis des Problems:**

```
;; ->>HEADER<<- opcode: QUERY, status: REFUSED, id: 12345
```

Der Status `REFUSED` bestätigt, dass `systemd-resolved` die `.local`-Anfrage an mDNS sendet (in der VM deaktiviert) anstatt an den Unicast-DNS-Server.

**Grundursache**: Der DHCP von KubeVirt (virt-launcher) liefert einen DNS-Server, übermittelt aber keine Suchdomains. Ohne die Routing-Domain `~local` wendet `systemd-resolved` das Standardverhalten nach RFC 6762 an und routet `.local` über mDNS.

### 2. systemd-networkd Drop-in erstellen

Die Lösung besteht darin, eine Drop-in-Datei für `systemd-networkd` zu erstellen, die die entsprechenden Suchdomains und Routing-Domains deklariert.

:::warning Netplan nicht verwenden
Netplan unterstützt keine Routing-Domains (Präfix `~`). Verwenden Sie direkt ein `systemd-networkd` Drop-in.
:::

Erstellen Sie das Drop-in-Verzeichnis:

```bash
sudo mkdir -p /etc/systemd/network/10-netplan-enp1s0.network.d/
```

Erstellen Sie die Konfigurationsdatei:

```bash
sudo tee /etc/systemd/network/10-netplan-enp1s0.network.d/dns-fix.conf << 'EOF'
[Network]
Domains=<namespace>.svc.cozy.local svc.cozy.local cozy.local ~local ~.
EOF
```

:::note Namespace ersetzen
Ersetzen Sie `<namespace>` durch den tatsächlichen Namen Ihres Hikube-Namespace (Tenant). Zum Beispiel: `tenant-prod.svc.cozy.local`.
:::

**Erklärung der konfigurierten Domains:**

| Domain | Rolle |
|---------|------|
| `<namespace>.svc.cozy.local` | Suchdomain: ermöglicht die Auflösung über Kurznamen (z.B.: `my-service` anstatt `my-service.my-namespace.svc.cozy.local`) |
| `svc.cozy.local` | Suchdomain: Auflösung von Diensten in anderen Namespaces |
| `cozy.local` | Suchdomain: Auflösung aller Namen im Cluster |
| `~local` | Routing-Domain: erzwingt `.local` über Unicast-DNS statt mDNS |
| `~.` | Routing-Domain: macht diese Schnittstelle zur Standard-DNS-Route (sonst funktioniert die externe Auflösung nicht mehr) |

### 3. Konfiguration anwenden

Starten Sie die Netzwerkdienste neu:

```bash
sudo systemctl restart systemd-networkd systemd-resolved
```

### 4. Konfiguration überprüfen

Überprüfen Sie, dass die Domains korrekt angewendet wurden:

```bash
resolvectl status
```

Sie sollten die Such- und Routing-Domains im Abschnitt der Schnittstelle `enp1s0` sehen:

```
Link 2 (enp1s0)
    Current Scopes: DNS
         Protocols: +DefaultRoute ...
Current DNS Server: 10.x.x.x
       DNS Servers: 10.x.x.x
        DNS Domain: ~.
                    ~local
                    <namespace>.svc.cozy.local
                    svc.cozy.local
                    cozy.local
```

## Überprüfung

Testen Sie die DNS-Auflösung eines Kubernetes-Dienstes über den vollständigen Namen (FQDN):

```bash
dig my-service.my-namespace.svc.cozy.local
```

**Erwartetes Ergebnis:** Status `NOERROR` mit einer Antwort, die die IP-Adresse des Dienstes enthält.

Testen Sie die Auflösung über den Kurznamen (dank der Suchdomains):

```bash
dig my-service
```

Testen Sie, dass die externe DNS-Auflösung weiterhin funktioniert:

```bash
dig google.com
```

:::tip Persistenz
Diese Konfiguration ist **persistent**: sie übersteht Neustarts der VM. Die Drop-in-Datei wird beim Start automatisch von `systemd-networkd` gelesen.
:::

:::note Lösung auf Plattformebene
Dieses Problem wird langfristig auf Hikube-Plattformebene gelöst, indem der DHCP von KubeVirt (virt-launcher) so konfiguriert wird, dass er die Suchdomains an die VMs übermittelt. In der Zwischenzeit ist diese manuelle Korrektur notwendig.
:::

## Weiterführende Informationen

- [API-Referenz](../api-reference.md)
- [Schnellstart](../quick-start.md)
