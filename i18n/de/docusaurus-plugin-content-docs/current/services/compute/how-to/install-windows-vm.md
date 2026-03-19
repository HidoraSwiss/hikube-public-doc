---
title: "Windows-VM installieren"
---

# Windows-VM installieren

Die Installation einer Windows Server-VM auf Hikube erfordert mehrere manuelle Schritte: ISO-Festplatten vorbereiten, VM erstellen, Windows über VNC installieren und dann die virtio-Treiber laden. Diese Anleitung beschreibt den gesamten Prozess.

## Voraussetzungen

- **kubectl** konfiguriert mit Ihrem Hikube-Kubeconfig
- **virtctl** installiert für den VNC-Zugang
- Lizenz oder Evaluierung von **Windows Server 2025** (in dieser Anleitung wird die Evaluierungs-ISO verwendet)
- Ausreichend Speicherplatz (insgesamt ca. 70 Gi)

## Schritte

### 1. Windows Server 2025 ISO-Festplatte erstellen

Erstellen Sie einen VMDisk vom Typ optisch mit der Windows Server-Installations-ISO:

```yaml title="win-iso-disk.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: VMDisk
metadata:
  name: win2k25-iso
spec:
  source:
    http:
      url: https://software-static.download.prss.microsoft.com/dbazure/888969d5-f34g-4e03-ac9d-1f9786c66749/SERVER_EVAL_x64FRE_en-us.iso
  optical: true
  storage: 7Gi
  storageClass: replicated
```

```bash
kubectl apply -f win-iso-disk.yaml
```

### 2. Virtio-Treiber ISO-Festplatte erstellen

Die virtio-Treiber sind unerlässlich, damit Windows die Festplatten und das Netzwerk in einer KubeVirt-Umgebung erkennt:

```yaml title="virtio-drivers-disk.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: VMDisk
metadata:
  name: virtio-drivers
spec:
  source:
    http:
      url: https://fedorapeople.org/groups/virt/virtio-win/direct-downloads/stable-virtio/virtio-win.iso
  optical: true
  storage: 1Gi
  storageClass: replicated
```

```bash
kubectl apply -f virtio-drivers-disk.yaml
```

### 3. Systemfestplatte erstellen

Erstellen Sie eine leere Festplatte, die als Systemfestplatte für Windows dient:

```yaml title="win-system-disk.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: VMDisk
metadata:
  name: win-system
spec:
  source: {}
  optical: false
  storage: 60Gi
  storageClass: replicated
```

```bash
kubectl apply -f win-system-disk.yaml
```

### 4. Überprüfen, dass alle drei Festplatten bereit sind

```bash
kubectl get vmdisk win2k25-iso virtio-drivers win-system
```

**Erwartetes Ergebnis:**

```
NAME              STATUS   SIZE   STORAGECLASS   AGE
win2k25-iso       Ready    7Gi    replicated     2m
virtio-drivers    Ready    1Gi    replicated     2m
win-system        Ready    60Gi   replicated     1m
```

:::note Download-Zeit
Der Download der Windows-ISO (~5 GB) kann je nach Bandbreite mehrere Minuten dauern. Warten Sie, bis alle Festplatten den Status `Ready` haben.
:::

### 5. VMInstance erstellen

Erstellen Sie die VM mit den drei angehängten Festplatten. Die Systemfestplatte muss an erster Position stehen:

```yaml title="windows-vm.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: VMInstance
metadata:
  name: windows-server
spec:
  runStrategy: Always
  instanceProfile: windows.2k25.virtio
  instanceType: u1.xlarge
  external: true
  externalMethod: PortList
  externalPorts:
    - 3389
  disks:
    - win-system
    - win2k25-iso
    - virtio-drivers
```

```bash
kubectl apply -f windows-vm.yaml
```

Warten Sie, bis die VM startet:

```bash
kubectl get vminstance windows-server -w
```

### 6. Über VNC für die Installation zugreifen

Öffnen Sie eine VNC-Sitzung zur VM:

```bash
virtctl vnc windows-server
```

Das Windows-Installationsprogramm sollte automatisch von der ISO starten. Folgen Sie den klassischen Installationsschritten:

1. Wählen Sie Sprache und Tastatur
2. Klicken Sie auf **Jetzt installieren**
3. Wählen Sie die gewünschte Windows Server-Edition
4. Akzeptieren Sie den Lizenzvertrag
5. Wählen Sie **Benutzerdefinierte Installation**

### 7. Virtio-Treiber während der Installation laden

Beim Schritt der Auswahl der Installationsfestplatte erkennt Windows keine Festplatte. Sie müssen die virtio-Treiber laden:

1. Klicken Sie auf **Treiber laden** (Load driver)
2. Klicken Sie auf **Durchsuchen** (Browse)
3. Navigieren Sie zum CD-Laufwerk der virtio-Treiber (in der Regel `E:\`)
4. Wählen Sie den Ordner `vioscsi\2k25\amd64` (Storage Controller)
5. Klicken Sie auf **OK** und dann **Weiter**

Die 60-GB-Festplatte sollte nun erscheinen. Wählen Sie sie aus und setzen Sie die Installation fort.

:::warning Netzwerktreiber
Installieren Sie nach der Installation auch die Netzwerktreiber (NetKVM) und den Memory Balloon (Balloon) von der virtio-CD für optimale Leistung. Navigieren Sie zu den Ordnern `NetKVM\2k25\amd64` und `Balloon\2k25\amd64`.
:::

### 8. Nach der Installation: ISO-Festplatten entfernen

Sobald Windows installiert und funktionsfähig ist, entfernen Sie die ISO-Festplatten aus dem Manifest, um Ressourcen freizugeben und einen Start von der ISO zu vermeiden:

```yaml title="windows-vm.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: VMInstance
metadata:
  name: windows-server
spec:
  runStrategy: Always
  instanceProfile: windows.2k25.virtio
  instanceType: u1.xlarge
  external: true
  externalMethod: PortList
  externalPorts:
    - 3389
  disks:
    - win-system
```

```bash
kubectl apply -f windows-vm.yaml
```

Sie können dann die ISO-VMDisks löschen, wenn Sie sie nicht mehr benötigen:

```bash
kubectl delete vmdisk win2k25-iso virtio-drivers
```

### 9. RDP-Zugang konfigurieren (optional)

Die VM exponiert bereits Port 3389 (RDP). Rufen Sie die externe IP-Adresse ab:

```bash
kubectl get vminstance windows-server -o yaml
```

Verbinden Sie sich mit Ihrem RDP-Client:

```bash
# Von Linux
xfreerdp /v:<IP-EXTERNE> /u:Administrator

# Von macOS (Microsoft Remote Desktop)
# Fügen Sie einen PC mit der Adresse <IP-EXTERNE> hinzu
```

## Überprüfung

Überprüfen Sie, ob die Windows-VM korrekt funktioniert:

```bash
kubectl get vminstance windows-server
```

**Erwartetes Ergebnis:**

```
NAME              STATUS    AGE
windows-server    Running   15m
```

Testen Sie den RDP-Zugang auf Port 3389:

```bash
nc -zv <IP-EXTERNE> 3389
```

## Weiterführende Informationen

- [API-Referenz](../api-reference.md)
- [Externes Netzwerk konfigurieren](./configure-network.md)
