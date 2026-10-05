---
title: "Comment démarrer, arrêter, modifier et supprimer une VM"
---

# Comment démarrer, arrêter, modifier et supprimer une VM

Ce guide regroupe les actions courantes sur une VM existante depuis la console : démarrage, arrêt, redémarrage, modification des ressources et suppression.

## Prérequis

- Un compte Hikube et un projet
- Une VM existante dans **Infrastructure** > **Instances VM**

## Où trouver les actions

| Emplacement | Actions disponibles |
|-------------|---------------------|
| Liste **Instances VM**, menu **Actions** (⋯) d'une ligne | **Voir les détails**, **Démarrer**, **Arrêter**, **Redémarrer**, **Recharger UserData**, **Éditer**, **Supprimer** |
| Page de détail, en-tête | **Modifier**, **Supprimer** |
| Page de détail, section **Actions** | **Démarrer** (VM arrêtée), **Arrêter** et **Redémarrer** (VM active), **Recharger UserData** (VM active) |

La liste propose aussi une recherche (**Rechercher des instances...**) et un filtre par statut (**Tous les statuts**, **Actif**, **Arrêté**).

## Étapes

### 1. Arrêter une VM

1. Cliquez sur **Arrêter**.
2. Confirmez dans la boîte **Arrêter la machine virtuelle ?** : les services hébergés sont interrompus jusqu'au redémarrage.

Le statut passe à **Arrêt en cours**, puis **Arrêté**.

:::warning VM avec GPU
L'arrêt libère le GPU, qui peut être attribué à un autre workload. Vous risquez de ne pas pouvoir redémarrer la VM immédiatement si aucun GPU n'est disponible ensuite. Voir [GPU indisponible au démarrage](../troubleshooting.md#gpu-indisponible-au-démarrage).
:::

### 2. Démarrer une VM

Cliquez sur **Démarrer**. Le statut passe à **Démarrage en cours**, puis **Actif**.

### 3. Redémarrer une VM

Cliquez sur **Redémarrer** et confirmez dans **Redémarrer la machine virtuelle ?**. Les applications sont temporairement indisponibles. Le statut passe par **Redémarrage en cours**.

### 4. Modifier une VM

1. Sur la page de détail, cliquez sur **Modifier** (ou **Éditer** dans le menu **Actions** de la liste, disponible seulement pour une VM **Actif**).
2. Modifiez les sections voulues :
   - **Ressources (CPU / RAM)** : série et taille, GPU ;
   - **Stockage** : ajout ou détachement de disques ;
   - **Réseau & Sécurité** : IP publique, pare-feu, ports, VPC ;
   - **Configuration avancée** : clés SSH, script cloud-init, **Redémarrage Automatique**.
3. Vérifiez le récapitulatif de quota en haut de page et cliquez sur **Enregistrer**.

Si le type d'instance, les disques ou les GPU changent, la console affiche **Redémarrage requis** : la VM redémarre, ce qui peut prendre plusieurs minutes. Sinon, elle affiche **Instance mise à jour**.

Le nom et l'image système ne sont pas modifiables.

### 5. Supprimer une VM

1. Cliquez sur **Supprimer**.
2. Saisissez le nom exact de la VM, puis cliquez sur **Supprimer définitivement**.

Les disques de la VM sont détachés et restent dans le menu **Disques**, où vous pouvez les rattacher à une autre VM ou les supprimer (voir [Disques](../../storage/disks/overview.md)).

## Vérification

Le statut affiché dans la liste et sur la page de détail se met à jour sans recharger la page. Les compteurs en haut de la liste (**Instances Actives**, **Instances arrêtées**, **CPU Total**, **RAM Total**) reflètent les changements.

## Pour aller plus loin

- [Concepts : cycle de vie](../concepts.md#cycle-de-vie)
- [Dépannage](../troubleshooting.md)
