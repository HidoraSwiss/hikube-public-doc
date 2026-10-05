---
sidebar_position: 3
title: Démarrage rapide
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# Créer et utiliser votre premier disque

Ce guide vous accompagne dans la création d'un **disque de données** depuis la [console Hikube](https://console.hikube.cloud), son attachement à une machine virtuelle, puis son formatage et son montage dans le système.

---

## Objectifs

À la fin de ce guide, vous aurez :

- Un **disque de données** de 20 Go dans votre projet
- Ce disque **attaché** à une VM existante
- Un système de fichiers **monté** et utilisable dans la VM

---

## Prérequis

- Un **compte Hikube** et un **projet** (voir le [démarrage rapide Hikube](../../../getting-started/quick-start.md))
- Une **VM Linux** dans ce projet, accessible en SSH (voir le [démarrage rapide des machines virtuelles](../../compute/quick-start.md))
- Un quota de stockage disponible d'au moins 20 Go

---

## Étape 1 : Ouvrir l'assistant de création

1. Connectez-vous à la [console Hikube](https://console.hikube.cloud) et sélectionnez votre projet.
2. Dans le menu latéral, ouvrez **Infrastructure** → **Disques**. La page **Disques de Stockage** s'affiche.
3. Cliquez sur **Créer un disque**.

---

## Étape 2 : Configurer et créer le disque

L'assistant **Créer un disque** comporte quatre étapes.

1. **Général** : saisissez le **Nom du disque** (un nom est proposé par défaut). Règles : minuscules, chiffres et tirets ; commence par une lettre et se termine par une lettre ou un chiffre ; 16 caractères maximum. Exemple : `data01`.
2. **Source** : choisissez **Disque Vide**.
3. **Configuration** (Taille et Sécurité) :
   - **Taille (Go)** : `20` (minimum 20 Go). La jauge **Usage projet estimé** montre l'impact sur le quota du projet ;
   - **Type de réplication** : laissez **Réplication Asynchrone** (Recommandé) ;
   - **Chiffrement du disque** : laissez désactivé pour ce guide.
4. **Vérification** : contrôlez le nom, la taille, le chiffrement, la réplication et la source, ainsi que le **Coût estimé** affiché en haut de l'assistant, puis cliquez sur **Créer le disque**.

La console affiche « Disque créé » et revient à la liste des disques.

---

## Étape 3 : Vérifier l'état du disque

Dans la liste **Disques de Stockage**, le disque apparaît avec le statut **En création**, puis **Prêt**.

Cliquez sur le disque (ou menu d'actions → **Aperçu**) pour ouvrir sa page de détail :

- **Configuration** : **Capacité**, **Chiffrement**, **Réplication** ;
- **Source** : image d'origine (**N/A** pour un disque vide) et **Attaché à** (**Non rattaché** pour l'instant).

---

## Étape 4 : Attacher le disque à la VM

1. Ouvrez **Infrastructure** → **Instances VM**, puis la page de votre VM, et cliquez sur **Modifier**.
2. Dans la section **Stockage**, cliquez sur **Ajouter un disque**.
3. Sur le nouveau volume, sélectionnez **Existant**, puis choisissez `data01` dans **Sélectionner un volume existant**.
4. Cliquez sur **Enregistrer**.

:::warning Redémarrage de la VM
La modification du stockage redémarre la VM (« Le type d'instance ou le stockage a été modifié. L'instance va redémarrer »). Planifiez l'opération en conséquence.
:::

Une fois l'opération terminée, le disque passe au statut **En cours d'utilisation** et sa page affiche le nom de la VM dans **Attaché à**.

---

## Étape 5 : Formater et monter le disque dans la VM

Connectez-vous à la VM en SSH, puis identifiez le nouveau disque :

```bash
lsblk
```

Le nouveau disque apparaît sans partition ni point de montage, avec une taille de 20 Go (par exemple `vdb`). Adaptez le nom de périphérique dans les commandes suivantes.

```bash
# Créer un système de fichiers (efface le contenu du disque)
sudo mkfs.ext4 /dev/vdb

# Monter le disque
sudo mkdir -p /mnt/data
sudo mount /dev/vdb /mnt/data

# Monter automatiquement au démarrage
UUID=$(sudo blkid -s UUID -o value /dev/vdb)
echo "UUID=$UUID /mnt/data ext4 defaults,nofail 0 2" | sudo tee -a /etc/fstab

# Tester
echo "hello hikube" | sudo tee /mnt/data/test.txt
df -h /mnt/data
```

**Résultat attendu :** `df -h` affiche un système de fichiers d'environ 20 Go monté sur `/mnt/data`.

---

## Étape 6 : Dépannage rapide

| Symptôme | Cause probable | Action |
|----------|----------------|--------|
| **Suivant** inactif à l'étape **Configuration** | Taille inférieure à 20 Go ou quota dépassé | Ajustez la taille ; « La taille dépasse le quota disponible » indique le maximum possible |
| Le disque n'apparaît pas dans **Sélectionner un volume existant** | Disque déjà attaché à une VM, ou disque système proposé pour un volume de données | Vérifiez **Attaché à** sur la page du disque ; un disque vide se place sur un volume de données, pas sur le disque système |
| Le disque n'apparaît pas dans `lsblk` | La VM n'a pas encore redémarré | Attendez la fin du redémarrage puis relancez `lsblk` |
| Statut **Erreur** | Échec du provisionnement | [Contactez le support](mailto:support@hidora.io) avec le nom et l'identifiant du disque |

Voir aussi le [dépannage complet](./troubleshooting.md).

---

## Étape 7 : Nettoyage

1. Dans la VM, démontez le disque et retirez sa ligne de `/etc/fstab` :
   ```bash
   sudo umount /mnt/data
   sudo sed -i '\|/mnt/data|d' /etc/fstab
   ```
2. Détachez le disque : page de la VM → **Modifier** → section **Stockage**, cliquez sur l'icône de suppression du volume, confirmez en saisissant son nom, puis cliquez sur **Enregistrer**. Le disque revient au statut **Prêt**.
3. Supprimez le disque : page du disque → **Supprimer** (ou menu d'actions → **Supprimer** dans la liste), saisissez son nom exact dans **Nom de la ressource à confirmer**, puis cliquez sur **Supprimer définitivement**.

:::warning
La suppression d'un disque est irréversible : toutes ses données sont perdues. Un disque attaché à une VM ne peut pas être supprimé ; détachez-le d'abord.
:::

<NavigationFooter
  nextSteps={[
    {label: "Redimensionner un disque", href: "../how-to/resize"},
    {label: "FAQ", href: "../faq"},
  ]}
  seeAlso={[
    {label: "Machines virtuelles", href: "../../../compute/overview"},
  ]}
/>
