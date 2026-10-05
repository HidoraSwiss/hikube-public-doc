---
title: "Comment attacher un disque supplémentaire"
---

# Comment attacher un disque supplémentaire

Séparer les données applicatives du disque système facilite les sauvegardes, les migrations et le redimensionnement. Ce guide explique comment ajouter un disque de données à une VM depuis la console, puis le formater et le monter dans le système d'exploitation.

## Prérequis

- Un compte Hikube et un projet avec du quota de **Stockage** disponible
- Une **instance VM** existante
- Un accès **SSH** à la VM

## Étapes

### 1. Ouvrir la modification de la VM

1. Ouvrez **Infrastructure** > **Instances VM** et cliquez sur le nom de la VM.
2. Cliquez sur **Modifier**.

### 2. Ajouter le disque

Dans la section **Stockage**, cliquez sur **Ajouter un disque**. Un bloc **Volume de Stockage #1** apparaît. Deux options :

**Nouveau disque** (onglet **Nouveau**) :

1. **Nom du volume** : conservez le nom proposé ou saisissez le vôtre (minuscules, chiffres et tirets).
2. **Taille (Go)** : 20 Go minimum, par exemple `50`.
3. **Type de réplication** : **Réplication Asynchrone** (Recommandé) ou **Réplication Synchrone**.
4. **Chiffrement du disque** : activez-le pour chiffrer les données au repos.

**Disque existant** (onglet **Existant**) : sous **Sélectionner un volume existant**, choisissez un disque de données du projet qui n'est attaché à aucune VM. Les disques se créent aussi indépendamment dans le menu **Disques** (voir [Disques](../../storage/disks/quick-start.md)).

### 3. Enregistrer

Vérifiez le récapitulatif de quota en haut de la page, puis cliquez sur **Enregistrer**.

La console affiche **Redémarrage requis** : la VM redémarre pour prendre en compte le nouveau disque. Attendez qu'elle revienne au statut **Actif**. Le disque apparaît dans la section **Stockage & Disques** de la page de détail.

:::note Disque ajouté à la création
Vous pouvez aussi ajouter des disques directement à la création de la VM, avec **Ajouter un disque** à l'étape **Stockage** de l'assistant. Ils prennent alors le nom de la VM suffixé (`ma-vm-2`, `ma-vm-3`…).
:::

### 4. Formater et monter le disque dans la VM

Connectez-vous à la VM avec la commande du bloc **Connexion SSH** :

```bash
ssh -i ~/.ssh/hikube-vm ubuntu@<ip-publique>
```

Identifiez le nouveau disque :

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

Le nouveau disque apparaît comme `vdb`, sans partition ni point de montage.

Formatez-le en ext4 :

```bash
sudo mkfs.ext4 /dev/vdb
```

Montez-le :

```bash
sudo mkdir -p /mnt/data
sudo mount /dev/vdb /mnt/data
```

Rendez le montage persistant en utilisant l'UUID du système de fichiers, plus stable que le nom du périphérique :

```bash
UUID=$(sudo blkid -s UUID -o value /dev/vdb)
echo "UUID=$UUID /mnt/data ext4 defaults,nofail 0 2" | sudo tee -a /etc/fstab
```

## Vérification

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

## Détacher un disque

Dans **Modifier** > **Stockage**, cliquez sur l'icône de suppression du volume, confirmez en saisissant son nom, puis cliquez sur **Enregistrer**. Le disque est détaché de la VM (qui redémarre) et reste disponible dans le menu **Disques**. Démontez-le d'abord dans l'OS et retirez sa ligne de `/etc/fstab`.

## Pour aller plus loin

- [Disques : vue d'ensemble](../../storage/disks/overview.md)
- [Attacher un disque existant à une VM](../../storage/disks/how-to/attach-to-vm.md)
- [Redimensionner un disque](../../storage/disks/how-to/resize.md)
- [Démarrage rapide VM](../quick-start.md)
