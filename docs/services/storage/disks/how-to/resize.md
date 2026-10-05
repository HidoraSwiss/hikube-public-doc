---
title: "Comment redimensionner un disque"
---

# Comment redimensionner un disque

Ce guide explique comment agrandir un disque depuis la [console Hikube](https://console.hikube.cloud), puis étendre son système de fichiers dans la VM.

## Prérequis

- Un **disque** dans votre projet
- Un quota de stockage suffisant pour la nouvelle taille

:::warning Pas de réduction
La réduction de taille n'est pas supportée. La nouvelle taille doit être supérieure ou égale à la taille actuelle, et d'au moins 20 Go.
:::

## Étapes

### 1. Ouvrir la modification du disque

1. Ouvrez **Infrastructure** → **Disques**.
2. Ouvrez le menu d'actions du disque et choisissez **Modifier**, ou ouvrez la page du disque et cliquez sur **Modifier**.

La page **Modifier le disque** affiche la **TAILLE ACTUELLE** et l'état du chiffrement.

### 2. Saisir la nouvelle taille

1. Dans **Nouvelle Taille (Go)**, saisissez la taille souhaitée.
2. Vérifiez la jauge **Usage projet estimé**. Si la taille dépasse le quota, la console affiche « La taille dépasse le quota du projet » et le bouton reste inactif.
3. Cliquez sur **Enregistrer les modifications**.

La console confirme : « Le disque a été redimensionné avec succès à N Go. »

### 3. Étendre le système de fichiers dans la VM

Le redimensionnement agrandit le périphérique bloc à chaud, sans redémarrer la VM ; la partition et le système de fichiers doivent ensuite être étendus depuis la VM, sans redémarrage non plus. Connectez-vous en SSH et vérifiez la nouvelle taille du périphérique :

```bash
lsblk
```

Si la nouvelle taille n'est toujours pas visible au bout de quelques minutes, redémarrez la VM depuis la console.

**Disque formaté sans partition** (par exemple `/dev/vdb` monté directement) :

```bash
# ext4
sudo resize2fs /dev/vdb

# XFS (indiquer le point de montage)
sudo xfs_growfs /mnt/data
```

**Disque partitionné** (par exemple le disque système `/dev/vda`, partition 1) :

```bash
# Agrandir la partition (paquet cloud-guest-utils ou cloud-utils-growpart)
sudo growpart /dev/vda 1

# Puis étendre le système de fichiers
sudo resize2fs /dev/vda1      # ext4
sudo xfs_growfs /             # XFS
```

:::tip
Beaucoup d'images cloud étendent automatiquement la partition racine au démarrage (cloud-init). Si vous préférez ne pas lancer `growpart` vous-même, un redémarrage suffit souvent pour un disque système.
:::

## Vérification

- La page du disque affiche la nouvelle **Capacité**.
- Dans la VM, `df -h` affiche la nouvelle taille du système de fichiers.

## Pour aller plus loin

- [Attacher un disque à une VM](./attach-to-vm.md)
- [FAQ](../faq.md)
