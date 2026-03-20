---
sidebar_position: 2
title: Schnellstart
---

# Erstellen Sie Ihre erste Virtuelle Maschine

Diese Anleitung begleitet Sie bei der Erstellung Ihrer ersten virtuellen Maschine auf Hikube in **5 Minuten**!

---

## Ziel

Am Ende dieser Anleitung werden Sie haben:

- Eine funktionierende Ubuntu-VM
- SSH-Zugang konfiguriert
- Funktionierende Netzwerkverbindung
- Persistenter Speicher angehängt

---

## Voraussetzungen

Stellen Sie vor Beginn sicher, dass Sie haben:

- **kubectl** konfiguriert mit Ihrem Hikube-Kubeconfig
- **Administratorrechte** auf Ihrem Tenant

---

## 🚀 Schritt 1: VM-Festplatte erstellen (2 Minuten)

### **Manifest-Datei vorbereiten**

Erstellen Sie eine Datei `vm-disk.yaml` mit einem Ubuntu Cloud Image:

```yaml title="vm-disk.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: VMDisk
metadata:
  name: disk-example
spec:
  source:
    http:
      url: https://cloud-images.ubuntu.com/noble/current/noble-server-cloudimg-amd64.img
  optical: false
  storage: 20Gi
  storageClass: "replicated"
```

### **Festplatte bereitstellen**

```bash
# VM-Festplatte erstellen
kubectl apply -f vm-disk.yaml

# Status überprüfen (kann 1-2 Minuten dauern)
kubectl get vmdisk disk-example -w
```

**Erwartetes Ergebnis:**

```
NAME          STATUS   SIZE   STORAGECLASS   AGE
disk-example  Ready    20Gi   replicated     90s
```

---

## Schritt 2: Virtuelle Maschine erstellen (2 Minuten)

### **SSH-Schlüssel generieren**

Falls Sie noch keinen SSH-Schlüssel haben:

```bash
# Ed25519 SSH-Schlüssel generieren (modern und sicher)
ssh-keygen -t ed25519 -f ~/.ssh/hikube-vm

# Öffentlichen Schlüssel anzeigen
cat ~/.ssh/hikube-vm.pub
```

### **VM-Manifest vorbereiten**

Erstellen Sie eine Datei `vm-instance.yaml`:

```yaml title="vm-instance.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: VMInstance
metadata:
  name: vm-example
spec:
  external: true
  externalMethod: PortList
  externalPorts:
    - 22
  running: true
  instanceType: u1.xlarge
  instanceProfile: "ubuntu"
  disks:
    - name: disk-example #Den Namen Ihrer Festplatte angeben
  resources:
    cpu: ""
    memory: ""
  sshKeys:
    - ihr-oeffentlicher-schluessel-hier
  cloudInit: |
    #cloud-config
  cloudInitSeed: ""
```

:::warning Achtung
Ersetzen Sie `ihr-oeffentlicher-schluessel-hier` durch Ihren echten öffentlichen SSH-Schlüssel!
:::

### **VM bereitstellen**

```bash
# Virtuelle Maschine erstellen
kubectl apply -f vm-instance.yaml

# Startvorgang verfolgen
kubectl get vminstance vm-example -w
```

---

## Expositionsmethoden verstehen

### **PortList vs WholeIP: Was ist der Unterschied?**

Hikube bietet zwei externe Expositionsmethoden, jede mit ihren Besonderheiten:

#### **PortList (Empfohlen)**

- **Kontrollierte Firewall**: Nur die in `externalPorts` angegebenen Ports sind erreichbar
- **Verstärkte Sicherheit**: Automatischer Schutz gegen unbefugten Zugriff
- **Verwendung**: Produktion, gesicherte Umgebungen
- **Konfiguration**: `externalMethod: PortList` + `externalPorts: [22, 80, 443]`

#### **WholeIP**

- **Vollständiger Zugang**: Alle Ports der VM sind direkt erreichbar
- **Keine Firewall**: Kein Netzwerkschutz über den Service konfiguriert
- **Verwendung**: Entwicklung, vollständiger administrativer Zugang
- **Konfiguration**: `externalMethod: WholeIP` (kein `externalPorts` erforderlich)

:::tip Methodenwahl

- **Produktion/Gesichert** → `PortList` mit spezifischen Ports
- **Entwicklung/Debug** → `WholeIP` für vollständigen Zugang
:::

---

## 🔌 Schritt 3: Auf Ihre VM zugreifen (1 Minute)

### **Installation von virtctl**

Falls Sie `virtctl` noch nicht installiert haben:

```bash
# Installation von virtctl
export VERSION=$(curl https://storage.googleapis.com/kubevirt-prow/release/kubevirt/kubevirt/stable.txt)
wget https://github.com/kubevirt/kubevirt/releases/download/${VERSION}/virtctl-${VERSION}-linux-amd64
chmod +x virtctl
sudo mv virtctl /usr/local/bin/

# Installation überprüfen
virtctl version
```

### **Zugriffsmethoden**

#### **Option 1: Direktes SSH**

```bash
# SSH via virtctl (mit benutzerdefiniertem Schlüssel)
virtctl ssh -i ~/.ssh/hikube-vm ubuntu@vm-example
# oder SSH über die öffentliche IP (mit benutzerdefiniertem Schlüssel)
ssh -i ~/.ssh/hikube-vm ubuntu@public-ip
```

#### **Option 2: Serielle Konsole (immer verfügbar)**

```bash
# Direkter Konsolenzugriff
virtctl console vm-example
```

#### **Option 3: VNC-Interface**

```bash
# Grafischer Zugriff
virtctl vnc vm-example
```

---

## 🎉 Herzlichen Glückwunsch

Ihre Hikube-VM ist **betriebsbereit**!

### **Was Sie erreicht haben:**

- **Ubuntu-VM** bereitgestellt mit 4 vCPU / 16 GB RAM
- **Persistenter Speicher** von 20 GB repliziert
- **SSH-Zugang** sicher konfiguriert
- **Externe Konnektivität** aktiviert
- **Resiliente Infrastruktur** mit Compute/Speicher-Trennung

---

## Bereinigung (Optional)

Wenn Sie die erstellten Ressourcen löschen möchten:

```bash
# VM löschen (Vorsicht!)
kubectl delete vminstance vm-example

# Festplatte löschen (Vorsicht!)
kubectl delete vmdisk disk-example
```

:::warning Unwiderrufliche Löschung
Das Löschen von VMs und Festplatten ist **unwiderruflich**. Stellen Sie sicher, dass Sie alle wichtigen Daten gesichert haben, bevor Sie fortfahren.
:::

---

## 🎯 Nächste Schritte

<div style={{display: 'flex', gap: '20px', flexWrap: 'wrap'}}>

**📚 Erweiterte Konfiguration**
→ [Vollständige API-Referenz](./api-reference.md)

**📖 Technische Architektur**
→ [Funktionsweise verstehen](./overview.md)

</div>

---

**💡 Wichtige Punkte:**

- Ihre **Daten sind immer sicher** dank der Replikation über 3 Rechenzentren
- Ihre VM kann bei einem Knotenausfall **automatisch verlagert** werden
- Die **vollständige Isolation** gewährleistet die Sicherheit zwischen Tenants
