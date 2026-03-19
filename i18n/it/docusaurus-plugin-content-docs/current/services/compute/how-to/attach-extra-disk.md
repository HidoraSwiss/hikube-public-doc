---
title: "Come collegare un disco supplementare"
---

# Come collegare un disco supplementare

Separare i dati applicativi dal disco di sistema è una buona pratica per l'affidabilità e la flessibilità delle vostre VM. Questa guida spiega come creare un disco supplementare, collegarlo a una VMInstance esistente, poi formattarlo e montarlo nel sistema operativo.

## Prerequisiti

- **kubectl** configurato con il vostro kubeconfig Hikube
- Una **VMInstance** esistente e funzionante
- Un accesso **SSH** o **console** alla VM

## Passi

### 1. Creare un VMDisk supplementare

Create un disco vuoto della dimensione desiderata. Un disco vuoto utilizza `source: {}` senza URL né immagine:

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

Applicate il manifest:

```bash
kubectl apply -f data-disk.yaml
```

Verificate che il disco sia pronto:

```bash
kubectl get vmdisk vm-data-disk -w
```

**Risultato atteso:**

```
NAME            STATUS   SIZE   STORAGECLASS   AGE
vm-data-disk    Ready    50Gi   replicated     30s
```

### 2. Referenziare il disco nella VMInstance

Aggiungete il nome del nuovo disco nella lista `spec.disks[]` della vostra VMInstance. Ad esempio, se la vostra VM utilizza già un disco di sistema `vm-system-disk`:

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

### 3. Applicare le modifiche

```bash
kubectl apply -f vm-instance.yaml
```

:::warning
La VM non si riavvia automaticamente dopo l'aggiunta di un disco. Dovete riavviarla manualmente:

```bash
# Opzione 1: tramite virtctl
virtctl restart my-vm

# Opzione 2: tramite runStrategy
kubectl patch vminstance my-vm --type='merge' -p '{"spec":{"runStrategy":"Halted"}}'
kubectl patch vminstance my-vm --type='merge' -p '{"spec":{"runStrategy":"Always"}}'
```

Attendete che la VM sia di nuovo in stato `Running` prima di continuare.
:::

### 4. Formattare e montare il disco nella VM

Connettetevi alla VM:

```bash
virtctl ssh -i ~/.ssh/id_ed25519 ubuntu@my-vm
```

Identificate il nuovo disco con `lsblk`:

```bash
lsblk
```

**Risultato atteso:**

```
NAME    MAJ:MIN RM  SIZE RO TYPE MOUNTPOINTS
vda     252:0    0   20G  0 disk
├─vda1  252:1    0 19.9G  0 part /
└─vda15 252:15   0  106M  0 part /boot/efi
vdb     252:16   0   50G  0 disk
```

Il nuovo disco appare come `vdb` (senza partizione né punto di montaggio).

Formattate il disco in ext4:

```bash
sudo mkfs.ext4 /dev/vdb
```

Create il punto di montaggio e montate il disco:

```bash
sudo mkdir -p /mnt/data
sudo mount /dev/vdb /mnt/data
```

Per rendere il montaggio persistente al riavvio, aggiungete una voce in `/etc/fstab`:

```bash
echo '/dev/vdb /mnt/data ext4 defaults 0 2' | sudo tee -a /etc/fstab
```

## Verifica

Verificate che il disco sia correttamente montato e accessibile:

```bash
df -h /mnt/data
```

**Risultato atteso:**

```
Filesystem      Size  Used Avail Use% Mounted on
/dev/vdb         49G   24K   47G   1% /mnt/data
```

Testate la scrittura:

```bash
sudo touch /mnt/data/test.txt && echo "OK"
```

:::tip Storage replicato
Utilizzate sempre `storageClass: replicated` per i dischi dati in produzione. Questo garantisce la replica su più datacenter.
:::

## Per approfondire

- [Riferimento API](../api-reference.md)
- [Avvio rapido](../quick-start.md)
