---
title: "Zusätzliche Festplatte anhängen"
---

# Zusätzliche Festplatte anhängen

Die Trennung von Anwendungsdaten und Systemfestplatte ist eine bewährte Praxis für die Zuverlässigkeit und Flexibilität Ihrer VMs. Diese Anleitung erklärt, wie Sie eine zusätzliche Festplatte erstellen, an eine bestehende VMInstance anhängen und anschließend im Betriebssystem formatieren und einhängen.

## Voraussetzungen

- **kubectl** konfiguriert mit Ihrem Hikube-Kubeconfig
- Eine bestehende und funktionsfähige **VMInstance**
- Ein **SSH**- oder **Konsolen**-Zugang zur VM

## Schritte

### 1. Zusätzlichen VMDisk erstellen

Erstellen Sie eine leere Festplatte in der gewünschten Größe. Eine leere Festplatte verwendet `source: {}` ohne URL oder Image:

```yaml title="data-disk.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: VMDisk
metadata:
  name: vm-data-disk
spec:
  source: {}
  optical: false
  storage: 50Gi
  storageClass: replicated
```

Wenden Sie das Manifest an:

```bash
kubectl apply -f data-disk.yaml
```

Überprüfen Sie, ob die Festplatte bereit ist:

```bash
kubectl get vmdisk vm-data-disk -w
```

**Erwartetes Ergebnis:**

```
NAME            STATUS   SIZE   STORAGECLASS   AGE
vm-data-disk    Ready    50Gi   replicated     30s
```

### 2. Festplatte in der VMInstance referenzieren

Fügen Sie den Namen der neuen Festplatte in die Liste `spec.disks[]` Ihrer VMInstance ein. Zum Beispiel, wenn Ihre VM bereits eine Systemfestplatte `vm-system-disk` verwendet:

```yaml title="vm-instance.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: VMInstance
metadata:
  name: my-vm
spec:
  runStrategy: Always
  instanceType: u1.xlarge
  instanceProfile: ubuntu
  external: true
  externalMethod: PortList
  externalPorts:
    - 22
  disks:
    - vm-system-disk
    - vm-data-disk
  sshKeys:
    - ssh-ed25519 AAAA... user@host
```

### 3. Änderungen anwenden

```bash
kubectl apply -f vm-instance.yaml
```

:::warning
Die VM startet nach dem Hinzufügen einer Festplatte nicht automatisch neu. Sie müssen sie manuell neu starten:

```bash
# Option 1: über virtctl
virtctl restart my-vm

# Option 2: über runStrategy
kubectl patch vminstance my-vm --type='merge' -p '{"spec":{"runStrategy":"Halted"}}'
kubectl patch vminstance my-vm --type='merge' -p '{"spec":{"runStrategy":"Always"}}'
```

Warten Sie, bis die VM wieder im Zustand `Running` ist, bevor Sie fortfahren.
:::

### 4. Festplatte in der VM formatieren und einhängen

Verbinden Sie sich mit der VM:

```bash
virtctl ssh -i ~/.ssh/id_ed25519 ubuntu@my-vm
```

Identifizieren Sie die neue Festplatte mit `lsblk`:

```bash
lsblk
```

**Erwartetes Ergebnis:**

```
NAME    MAJ:MIN RM  SIZE RO TYPE MOUNTPOINTS
vda     252:0    0   20G  0 disk
├─vda1  252:1    0 19.9G  0 part /
└─vda15 252:15   0  106M  0 part /boot/efi
vdb     252:16   0   50G  0 disk
```

Die neue Festplatte erscheint als `vdb` (ohne Partition und ohne Einhängepunkt).

Formatieren Sie die Festplatte mit ext4:

```bash
sudo mkfs.ext4 /dev/vdb
```

Erstellen Sie den Einhängepunkt und hängen Sie die Festplatte ein:

```bash
sudo mkdir -p /mnt/data
sudo mount /dev/vdb /mnt/data
```

Um das Einhängen beim Neustart persistent zu machen, fügen Sie einen Eintrag in `/etc/fstab` hinzu:

```bash
echo '/dev/vdb /mnt/data ext4 defaults 0 2' | sudo tee -a /etc/fstab
```

## Überprüfung

Überprüfen Sie, ob die Festplatte korrekt eingehängt und zugänglich ist:

```bash
df -h /mnt/data
```

**Erwartetes Ergebnis:**

```
Filesystem      Size  Used Avail Use% Mounted on
/dev/vdb         49G   24K   47G   1% /mnt/data
```

Testen Sie den Schreibzugriff:

```bash
sudo touch /mnt/data/test.txt && echo "OK"
```

:::tip Replizierter Speicher
Verwenden Sie für Datenfestplatten in der Produktion immer `storageClass: replicated`. Dies gewährleistet die Replikation über mehrere Rechenzentren.
:::

## Weiterführende Informationen

- [API-Referenz](../api-reference.md)
- [Schnellstart](../quick-start.md)
