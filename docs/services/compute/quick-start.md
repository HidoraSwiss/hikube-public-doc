---
sidebar_position: 3
title: Démarrage rapide
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# Créer votre première machine virtuelle

Ce guide vous accompagne dans la création d'une VM Ubuntu depuis la [console Hikube](https://console.hikube.cloud), jusqu'à la première connexion SSH.

---

## Objectif

À la fin de ce guide, vous aurez :

- une VM Ubuntu en statut **Actif** ;
- une IP publique avec le port 22 ouvert ;
- un accès SSH par clé ;
- un disque système répliqué.

---

## Prérequis

- Un compte Hikube et un **projet** (voir [Démarrage rapide Hikube](../../getting-started/quick-start.md)).
- Des quotas disponibles dans ce projet : au moins 4 vCPU, 16 Go de mémoire et 20 Go de stockage pour l'exemple ci-dessous.
- Une paire de clés SSH. Si vous n'en avez pas :

```bash
ssh-keygen -t ed25519 -f ~/.ssh/hikube-vm
cat ~/.ssh/hikube-vm.pub
```

Gardez la clé publique affichée (ligne commençant par `ssh-ed25519`) : vous la collerez dans l'assistant.

---

## Étape 1 : Ouvrir l'assistant de création

1. Connectez-vous à [https://console.hikube.cloud](https://console.hikube.cloud) et sélectionnez votre projet.
2. Dans le menu latéral, ouvrez **Infrastructure** > **Instances VM**.
3. Cliquez sur **Créer une Instance**.

L'assistant **Créer une nouvelle instance** s'ouvre. Il comporte cinq étapes : **Général**, **Configuration**, **Stockage**, **Réseau** et **Vérification**.

---

## Étape 2 : Configurer et valider

### Général

Saisissez le **Nom de l'instance**, par exemple `vm-demo`. Le nom doit faire 3 à 16 caractères, commencer par une lettre, se terminer par une lettre ou un chiffre, et ne contenir que des minuscules, des chiffres et des tirets. Cliquez sur **Suivant**.

### Configuration

1. Sous **Ressources (CPU / RAM)**, choisissez la série **Universel (U)**, puis la taille **XLARGE** (4 vCPU, 16 Go).
2. Laissez la section **Accélération Matérielle (GPU)** vide (voir [GPU](../gpu/overview.md) pour une VM avec GPU).
3. Laissez **Redémarrage Automatique** désactivé ou activez-le selon votre besoin.
4. Cliquez sur **Suivant**.

Le bandeau en haut de l'étape affiche le coût estimé et la consommation de quota du projet.

### Stockage

Le **Disque Système (Boot)** est pré-rempli : il porte le nom de la VM et mesure 20 Go.

1. Sous **Système d'exploitation**, sélectionnez la carte **ubuntu** et la version **24.04**.
2. Conservez **Taille (Go)** à `20`.
3. Conservez **Réplication Asynchrone** (Recommandé).
4. Activez **Chiffrement du disque** si vous voulez chiffrer les données au repos.
5. Cliquez sur **Suivant**.

### Réseau

1. Vérifiez que **Adresse IPv4 Publique** est activée.
2. Vérifiez que **Activer le Pare-feu** est coché et que **SSH (22)** est sélectionné dans **Ports Autorisés**.
3. Sous **Clés SSH autorisées**, collez votre clé publique dans le champ **Ajouter une clé SSH publique**, puis validez avec Entrée ou le bouton d'ajout. Le format attendu est `<algorithme> <clé-base64> [commentaire]`.
4. Cliquez sur **Suivant**.

### Vérification

Le **Récapitulatif** reprend l'instance, le stockage et la section **Réseau & Sécurité** (IP publique, pare-feu, ports ouverts, clés SSH). Cliquez sur **Déployer**.

La console affiche **Instance créée** et revient à la liste des instances.

---

## Étape 3 : Vérifier l'état

Dans la liste **Instances VM**, la VM passe de **En création** à **Actif**. La mise à jour est automatique, sans recharger la page.

Cliquez sur le nom de la VM pour ouvrir sa page de détail. Vous y trouvez :

- **Ressources & Caractéristiques** : type d'instance, image système, utilisateur par défaut, vCPU et RAM ;
- **Stockage & Disques** : disques attachés, taille, réplication, chiffrement ;
- **Réseau et Sécurité** : **IP Publique**, **Connexion SSH**, **Adresses IP**, **Pare-feu & Ports**.

**Résultat attendu :** statut **Actif**, **IP Publique** à **Active**, port **22** listé sous **Pare-feu & Ports**.

---

## Étape 4 : Récupérer les informations de connexion

Dans la section **Réseau et Sécurité** de la page de détail, le bloc **Connexion SSH** affiche la commande prête à l'emploi, par exemple :

```bash
ssh ubuntu@203.0.113.10
```

Cliquez sur l'icône de copie pour la copier dans le presse-papier. L'utilisateur par défaut dépend de l'image ; il est aussi affiché sous **Image Système** (**Utilisateur**).

---

## Étape 5 : Connexion et tests

Connectez-vous avec votre clé privée :

```bash
ssh -i ~/.ssh/hikube-vm ubuntu@203.0.113.10
```

Une fois connecté, vérifiez les ressources et le disque :

```bash
nproc
free -h
lsblk
```

**Résultat attendu :** 4 processeurs, environ 16 Go de mémoire et un disque `vda` d'environ 20 Go.

---

## Étape 6 : Dépannage rapide

| Symptôme | Vérification |
|----------|--------------|
| **Suivant** reste grisé à l'étape Configuration ou Stockage | Un quota du projet est dépassé : réduisez le gabarit ou la taille du disque, ou faites augmenter les quotas du projet. |
| `Connection timed out` en SSH | Vérifiez sur la page de détail que **IP Publique** est **Active** et que le port 22 figure dans **Pare-feu & Ports**. |
| `Permission denied (publickey)` | Vérifiez l'utilisateur (bloc **Connexion SSH**) et que la clé privée utilisée correspond à la clé publique listée dans **Configuration avancée** > **Clés SSH**. |
| Statut **Erreur** ou **Échec** | Consultez le [dépannage](./troubleshooting.md). |

---

## Étape 7 : Nettoyage

1. Ouvrez la page de détail de la VM, ou le menu **Actions** de la ligne dans la liste.
2. Cliquez sur **Supprimer**.
3. Saisissez le nom exact de la VM pour confirmer, puis cliquez sur **Supprimer définitivement**.

Le disque système est détaché mais **pas supprimé** : il reste dans le menu **Disques** et continue de consommer du quota de stockage. Supprimez-le depuis **Disques** si vous n'en avez plus besoin (voir [Disques](../storage/disks/overview.md)).

:::warning Suppression irréversible
La suppression d'une VM, puis celle de ses disques, est définitive. Sauvegardez les données importantes avant.
:::

---

## Prochaines étapes

- [Attacher un disque de données](./how-to/attach-extra-disk.md)
- [Configurer cloud-init](./how-to/configure-cloud-init.md)
- [Configurer le réseau et le pare-feu](./how-to/configure-network.md)
- [Relier la VM à un réseau privé (VPC)](../networking/quick-start.md)

<NavigationFooter
  nextSteps={[
    {label: "Guides pratiques", href: "../how-to/attach-extra-disk"},
    {label: "FAQ", href: "../faq"},
  ]}
/>
