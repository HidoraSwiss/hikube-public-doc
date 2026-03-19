---
sidebar_position: 6
title: FAQ
---

# FAQ — Virtuelle Maschinen

### Was ist der Unterschied zwischen PortList und WholeIP?

| Eigenschaft | `PortList` | `WholeIP` |
|----------------|-----------|-----------|
| **Funktionsweise** | Nur die in `externalPorts` aufgelisteten Ports werden exponiert | Alle Ports der VM werden exponiert |
| **Sicherheit** | Feinsteuerung, reduzierte Angriffsfläche | Erfordert eine Firewall auf OS-Ebene |
| **Anwendungsfall** | Produktion, gezielte Dienste | Entwicklung, schnelle Tests |

:::warning
Mit `WholeIP` müssen Sie zwingend eine Firewall in der VM konfigurieren (iptables, nftables, ufw), um nicht exponierte Dienste zu schützen.
:::

```yaml title="vm-portlist.yaml"
spec:
  external: true
  externalMethod: PortList
  externalPorts:
    - 22
    - 443
```

---

### Welche Images sind verfügbar?

Hikube bietet vorkonfigurierte **Golden Images**:

| Betriebssystem | Verfügbare Versionen |
|----------------------|---------------------|
| **Ubuntu** | 22.04, 24.04 |
| **Debian** | 11, 12, 13 |
| **CentOS Stream** | 9, 10 |
| **Rocky Linux** | 8, 9, 10 |
| **AlmaLinux** | 8, 9, 10 |

Die Images werden im Feld `source.image.name` der **VMDisk**-Ressource angegeben, im Format `{os}-{version}`. Zum Beispiel: `ubuntu-2404`, `debian-12`, `rocky-9`.

---

### Wie wähle ich meinen instanceType?

Die Instanzen folgen drei Serien mit unterschiedlichen vCPU:RAM-Verhältnissen:

| Serie | Präfix | Verhältnis | Anwendungsbeispiel |
|-------|---------|-------|-----------------|
| **Standard** | `s1` | 1:2 | Webserver, leichte Anwendungen |
| **Universal** | `u1` | 1:4 | Geschäftsanwendungen, Datenbanken |
| **Memory** | `m1` | 1:8 | Cache, In-Memory-Verarbeitung |

Die verfügbaren Größen reichen von `small` bis `8xlarge`. Zum Beispiel: `u1.xlarge` bietet 4 vCPU und 16 GB RAM.

---

### Wie füge ich eine zusätzliche Festplatte hinzu?

Erstellen Sie zunächst eine `VMDisk`-Ressource und referenzieren Sie sie dann in Ihrer `VMInstance`:

```yaml title="data-disk.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: VMDisk
metadata:
  name: data-volume
spec:
  size: 100Gi
  storageClass: replicated
```

```yaml title="vm.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: VMInstance
metadata:
  name: my-vm
spec:
  instanceType: u1.large
  instanceProfile: ubuntu
  disks:
    - data-volume
```

---

### Wie greife ich per SSH auf meine VM zu?

1. Injizieren Sie Ihren öffentlichen SSH-Schlüssel in das VM-Manifest:
   ```yaml title="vm-ssh.yaml"
   spec:
     sshKeys:
       - "ssh-ed25519 AAAAC3... user@laptop"
   ```

2. Exponieren Sie Port 22 über `PortList`:
   ```yaml title="vm-ssh.yaml"
   spec:
     external: true
     externalMethod: PortList
     externalPorts:
       - 22
   ```

3. Rufen Sie die externe IP-Adresse ab:
   ```bash
   kubectl get svc
   ```

4. Verbinden Sie sich:
   ```bash
   ssh user@<external-ip>
   ```

:::note
Der Standard-Benutzername hängt vom Image ab: `ubuntu` für Ubuntu, `debian` für Debian, `cloud-user` für CentOS/Rocky/AlmaLinux.
:::

---

### Wie personalisiere ich die VM beim Start?

Verwenden Sie das Feld `cloudInit`, um eine cloud-init-Konfiguration im YAML-Format zu injizieren:

```yaml title="vm-cloudinit.yaml"
spec:
  cloudInit: |
    #cloud-config
    packages:
      - nginx
      - htop
    users:
      - name: admin
        sudo: ALL=(ALL) NOPASSWD:ALL
        ssh_authorized_keys:
          - ssh-ed25519 AAAAC3... admin@company
    runcmd:
      - systemctl enable nginx
      - systemctl start nginx
```

Cloud-init wird beim ersten Start der VM ausgeführt und ermöglicht die Installation von Paketen, das Erstellen von Benutzern, das Ausführen von Befehlen usw.

---

### Was ist der Unterschied zwischen `instanceProfile` und `instanceType`?

| Parameter | Rolle | Beispiele |
|-----------|------|----------|
| `instanceProfile` | Lädt die **Treiber und Kernel**, die an das OS angepasst sind | `ubuntu`, `centos`, `windows.2k25.virtio` |
| `instanceType` | Definiert die **Größe** der VM (CPU/RAM) | `s1.small`, `u1.large`, `m1.2xlarge` |

`instanceProfile` bestimmt nicht das OS-Image — dieses wird in der **VMDisk**-Ressource über `source.image.name` definiert. Das Profil dient dazu, optimierte Treiber und Kernel für das Betriebssystem zu laden. Dies ist hauptsächlich für **Windows** nützlich (virtio-Treiber). `instanceType` dimensioniert die der VM zugewiesenen CPU- und Speicher-Ressourcen.
