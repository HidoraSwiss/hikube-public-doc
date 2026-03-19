---
title: "Comment attacher un disque supplémentaire"
---

# Comment attacher un disque supplémentaire

Séparer les données applicatives du disque système est une bonne pratique pour la fiabilité et la flexibilité de vos VMs. Ce guide explique comment créer un disque supplémentaire, l'attacher à une VMInstance existante, puis le formater et le monter dans le système d'exploitation.

## Prérequis

- **kubectl** configuré avec votre kubeconfig Hikube
- Une **VMInstance** existante et fonctionnelle
- Un accès **SSH** ou **console** à la VM

## Étapes

### 1. Créer un VMDisk supplémentaire

Créez un disque vide de la taille souhaitée. Un disque vide utilise `source: {}` sans URL ni image :

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

Appliquez le manifeste :

```bash
kubectl apply -f data-disk.yaml
```

Vérifiez que le disque est prêt :

```bash
kubectl get vmdisk vm-data-disk -w
```

**Résultat attendu :**

```
NAME            STATUS   SIZE   STORAGECLASS   AGE
vm-data-disk    Ready    50Gi   replicated     30s
```

### 2. Référencer le disque dans la VMInstance

Ajoutez le nom du nouveau disque dans la liste `spec.disks[]` de votre VMInstance. Par exemple, si votre VM utilise déjà un disque système `vm-system-disk` :

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

### 3. Appliquer les changements

```bash
kubectl apply -f vm-instance.yaml
```

:::warning
La VM ne redémarre pas automatiquement après l'ajout d'un disque. Vous devez la redémarrer manuellement :

```bash
# Option 1 : via virtctl
virtctl restart my-vm

# Option 2 : via runStrategy
kubectl patch vminstance my-vm --type='merge' -p '{"spec":{"runStrategy":"Halted"}}'
kubectl patch vminstance my-vm --type='merge' -p '{"spec":{"runStrategy":"Always"}}'
```

Attendez que la VM soit de nouveau en état `Running` avant de continuer.
:::

### 4. Formater et monter le disque dans la VM

Connectez-vous à la VM :

```bash
virtctl ssh -i ~/.ssh/id_ed25519 ubuntu@my-vm
```

Identifiez le nouveau disque avec `lsblk` :

```bash
lsblk
```

**Résultat attendu :**

```
NAME    MAJ:MIN RM  SIZE RO TYPE MOUNTPOINTS
vda     252:0    0   20G  0 disk
├─vda1  252:1    0 19.9G  0 part /
└─vda15 252:15   0  106M  0 part /boot/efi
vdb     252:16   0   50G  0 disk
```

Le nouveau disque apparait comme `vdb` (sans partition ni point de montage).

Formatez le disque en ext4 :

```bash
sudo mkfs.ext4 /dev/vdb
```

Créez le point de montage et montez le disque :

```bash
sudo mkdir -p /mnt/data
sudo mount /dev/vdb /mnt/data
```

Pour rendre le montage persistant au redémarrage, ajoutez une entrée dans `/etc/fstab` :

```bash
echo '/dev/vdb /mnt/data ext4 defaults 0 2' | sudo tee -a /etc/fstab
```

## Vérification

Vérifiez que le disque est correctement monté et accessible :

```bash
df -h /mnt/data
```

**Résultat attendu :**

```
Filesystem      Size  Used Avail Use% Mounted on
/dev/vdb         49G   24K   47G   1% /mnt/data
```

Testez l'écriture :

```bash
sudo touch /mnt/data/test.txt && echo "OK"
```

:::tip Stockage répliqué
Utilisez toujours `storageClass: replicated` pour les disques de données en production. Cela garantit la réplication sur plusieurs datacenters.
:::

## Pour aller plus loin

- [Référence API](../api-reference.md)
- [Démarrage rapide](../quick-start.md)
