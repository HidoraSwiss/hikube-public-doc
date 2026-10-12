---
title: "Comment attacher un disque à une VM"
---

# Comment attacher un disque à une VM

Ce guide explique comment attacher un disque existant à une machine virtuelle, le rendre utilisable dans le système, puis le détacher, depuis la [console Hikube](https://console.hikube.cloud).

## Prérequis

- Un **disque** au statut **Prêt** (non attaché) dans votre projet (voir le [démarrage rapide](../quick-start.md))
- Une **VM** dans le même projet

## Principe

L'attachement se configure **côté VM**, dans la section **Stockage** :

- à la création d'une VM (étape **Stockage** de l'assistant) ;
- ou sur une VM existante (page de la VM → **Modifier** → section **Stockage**).

Chaque volume de la VM peut être **Nouveau** (la console crée le disque) ou **Existant** (vous choisissez un disque déjà créé). Le premier volume est le **Disque Système (Boot)** ; les suivants sont des volumes de données.

| Volume | Disques proposés en mode **Existant** |
|--------|----------------------------------------|
| **Disque Système (Boot)** | Disques système (créés à partir d'une image) non attachés |
| **Volume de Stockage #N** | Disques de données non attachés |

## Attacher un disque à une VM existante

1. Ouvrez **Infrastructure** → **Instances VM**, puis la page de la VM, et cliquez sur **Modifier**.
2. Dans la section **Stockage**, cliquez sur **Ajouter un disque**.
3. Sur le nouveau volume, sélectionnez **Existant**.
4. Dans **Sélectionner un volume existant**, recherchez et choisissez le disque. La liste affiche son nom et sa taille.
5. Cliquez sur **Enregistrer**.

:::warning Redémarrage
Le disque n'est pris en compte qu'au prochain redémarrage de la VM. La console l'indique : « Le type d'instance, le stockage ou les GPU ont changé. Ces modifications ne prennent effet qu'au prochain redémarrage : redémarrez la VM pour les appliquer. » Cliquez sur **Redémarrer** dans la section **Actions** de la page de la VM.
:::

## Attacher un disque à la création d'une VM

À l'étape **Stockage** de l'assistant de création de VM, cliquez sur **Ajouter un disque**, sélectionnez **Existant** puis le disque dans **Sélectionner un volume existant**. Pour démarrer la VM sur un disque système créé à l'avance, sélectionnez **Existant** sur le **Disque Système (Boot)**.

## Rendre le disque utilisable dans la VM (Linux)

Connectez-vous à la VM en SSH et identifiez le disque :

```bash
lsblk
```

Pour un **disque vide**, créez un système de fichiers et montez-le :

```bash
# Attention : mkfs efface le contenu du disque
sudo mkfs.ext4 /dev/vdb
sudo mkdir -p /mnt/data
sudo mount /dev/vdb /mnt/data

# Montage automatique au démarrage
UUID=$(sudo blkid -s UUID -o value /dev/vdb)
echo "UUID=$UUID /mnt/data ext4 defaults,nofail 0 2" | sudo tee -a /etc/fstab
```

Pour un disque **déjà formaté** (par exemple détaché d'une autre VM), ne lancez pas `mkfs` : montez-le directement.

:::tip
Utilisez l'UUID plutôt que le nom de périphérique (`/dev/vdb`) dans `/etc/fstab` : l'ordre des périphériques peut changer lorsque vous ajoutez ou retirez des disques.
:::

## Détacher un disque

1. Dans la VM, démontez le disque et retirez sa ligne de `/etc/fstab`.
2. Ouvrez la page de la VM → **Modifier** → section **Stockage**.
3. Cliquez sur **Détacher le disque** sur le volume, puis confirmez avec **Détacher** dans la boîte **Détacher `<nom>` ?**. Aucune saisie du nom n'est demandée.
4. Cliquez sur **Enregistrer**, puis sur **Redémarrer** : le détachement ne prend effet qu'au prochain redémarrage de la VM ; d'ici là, le disque reste visible par le système.

Le disque est **détaché**, pas supprimé : ses données sont conservées et il reste dans **Infrastructure** → **Disques** avec le statut **Prêt**, et peut être attaché à une autre VM. Pour le supprimer définitivement, utilisez l'action **Supprimer** de la page du disque. Un disque détaché reste utilisé par la VM jusqu'à son prochain redémarrage. Redémarrez la VM, puis attendez quelques minutes avant de supprimer le disque : une suppression trop rapide peut laisser l'espace occupé dans votre quota.

:::note
La suppression d'une VM détache aussi ses disques sans les supprimer. Pensez à supprimer les disques devenus inutiles : ils continuent de consommer le quota de stockage du projet.
:::

## Vérification

- La page du disque affiche le nom de la VM dans **Attaché à** (lien vers la VM) et le statut **En cours d'utilisation**.
- Dans la VM, `lsblk` liste le disque et `df -h` affiche le point de montage.

## Pour aller plus loin

- [Redimensionner un disque](./resize.md)
- [Créer un disque système à partir d'une image](./create-from-image.md)
- [Machines virtuelles](../../../compute/overview.md)
