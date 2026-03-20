---
sidebar_position: 7
title: Fehlerbehebung
---

# Fehlerbehebung — Virtuelle Maschinen

### VM startet nicht

**Ursache**: Die Systemfestplatte ist nicht bereit, das Quellimage ist ungültig oder das Instanzprofil passt nicht zum Image.

**Lösung**:

1. Überprüfen Sie, dass die VMDisk-Ressourcen existieren und bereit sind:
   ```bash
   kubectl get vmdisk
   ```

2. Überprüfen Sie die Ereignisse der VMInstance:
   ```bash
   kubectl describe vminstance <vm-name>
   ```

3. Überprüfen Sie, dass das `instanceProfile` zum OS des Images passt (z.B. `ubuntu` für ein Ubuntu-Image). Ein unpassendes Profil verhindert den Start nicht, aber die VM wird nicht optimiert (fehlende Treiber).

4. Überprüfen Sie, dass der gewählte `instanceType` gültig ist (Präfix `s1`, `u1` oder `m1` gefolgt von einer gültigen Größe).

---

### SSH-Timeout mit PortList

**Ursache**: Port 22 ist nicht in der Liste `externalPorts`, die externe Exposition ist nicht aktiviert oder der SSH-Schlüssel wurde nicht injiziert.

**Lösung**:

1. Überprüfen Sie, dass `external: true` aktiviert ist und Port 22 aufgelistet ist:
   ```yaml title="vm.yaml"
   spec:
     external: true
     externalMethod: PortList
     externalPorts:
       - 22
   ```

2. Rufen Sie die IP-Adresse des exponierten Services ab:
   ```bash
   kubectl get svc
   ```

3. Überprüfen Sie, dass Ihr SSH-Schlüssel im Manifest injiziert wurde:
   ```yaml title="vm.yaml"
   spec:
     sshKeys:
       - "ssh-ed25519 AAAAC3... user@laptop"
   ```

4. Testen Sie die Verbindung im Verbose-Modus:
   ```bash
   ssh -v user@<external-ip>
   ```

---

### DNS .local funktioniert nicht in der VM

**Ursache**: `systemd-resolved` behandelt `.local`-Domains als mDNS (Multicast DNS), was die klassische DNS-Auflösung für diese Domains verhindert.

**Lösung**:

1. Erstellen Sie ein Drop-in für `systemd-networkd`, das mDNS deaktiviert:
   ```bash
   sudo mkdir -p /etc/systemd/network/10-cloud-init-eth0.network.d
   ```

2. Erstellen Sie die Konfigurationsdatei:
   ```bash
   sudo tee /etc/systemd/network/10-cloud-init-eth0.network.d/override.conf << 'EOF'
   [Network]
   MulticastDNS=no
   EOF
   ```

3. Laden Sie die Netzwerkkonfiguration neu:
   ```bash
   sudo networkctl reload
   ```

4. Überprüfen Sie, dass die Auflösung funktioniert:
   ```bash
   resolvectl status
   resolvectl query mon-service.local
   ```

:::note
Dieses Problem betrifft alle Distributionen, die `systemd-resolved` verwenden (Ubuntu 22.04+, Debian 12+, usw.). Die Korrektur bleibt nach einem Neustart bestehen.
:::

---

### Festplatte nicht an die VM angehängt

**Ursache**: Der VMDisk-Name stimmt nicht mit dem Eintrag in `spec.disks` überein, der VMDisk ist nicht bereit oder die `storageClass` ist ungültig.

**Lösung**:

1. Überprüfen Sie, dass der VMDisk-Name genau mit dem in `spec.disks` referenzierten übereinstimmt:
   ```yaml title="vm.yaml"
   spec:
     disks:
       - data-volume  # Muss mit metadata.name des VMDisk übereinstimmen
   ```

2. Überprüfen Sie den Status des VMDisk:
   ```bash
   kubectl get vmdisk data-volume
   kubectl describe vmdisk data-volume
   ```

3. Die auf Hikube verfügbaren storageClasses sind: `local`, `replicated` und `replicated-async`. Für eine VM (isolierte Instanz) wird `replicated` empfohlen.

---

### Serielle Konsole / VNC für Debugging

**Ursache**: Die VM antwortet nicht per SSH und Sie benötigen einen direkten Zugang zur Diagnose des Problems.

**Lösung**:

1. Für seriellen Konsolenzugang (Text):
   ```bash
   virtctl console <vm-name>
   ```

2. Für VNC-Zugang (grafisch):
   ```bash
   virtctl vnc <vm-name>
   ```

3. Von der Konsole aus können Sie überprüfen:
   - Die Startprotokolle
   - Die Netzwerkkonfiguration (`ip addr`, `ip route`)
   - Den Zustand der Dienste (`systemctl status`)
   - Die Systemprotokolle (`journalctl -xe`)

:::tip
`virtctl` ist das KubeVirt-CLI. Installieren Sie es von den [KubeVirt-Releases](https://github.com/kubevirt/kubevirt/releases).
:::
