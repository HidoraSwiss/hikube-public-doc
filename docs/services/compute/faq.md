---
sidebar_position: 6
title: FAQ
---

# FAQ — Machines virtuelles

### Quelle est la différence entre pare-feu activé et désactivé ?

| | **Activer le Pare-feu** coché | Pare-feu décoché |
|---|---|---|
| **Ports ouverts sur l'IP publique** | Uniquement les **Ports Autorisés** | Tous |
| **Sécurité** | Surface d'attaque réduite | Pare-feu à configurer dans l'OS (ufw, firewalld, nftables) |
| **Cas d'usage** | Production, services ciblés | VPN, passerelle, protocoles à ports dynamiques |

Les ports se modifient à tout moment depuis la page de détail > **Modifier** > **Réseau & Sécurité**. Voir [Configurer le réseau](./how-to/configure-network.md).

---

### Quelles images sont disponibles ?

AlmaLinux, CentOS Stream, CloudLinux, Debian, openSUSE, Oracle Linux, Rocky Linux, Ubuntu et Windows Server. Le détail des versions figure dans la [vue d'ensemble](./overview.md#systèmes-dexploitation) ; la liste affichée à l'étape **Stockage** de l'assistant fait foi.

---

### Puis-je utiliser ma propre image ?

Oui, en deux temps : créez d'abord un disque à partir de l'URL de votre image (ISO ou QCOW2, en HTTPS) dans le menu **Disques**, puis, dans l'assistant de création de VM, choisissez **Existant** pour le **Disque Système (Boot)** et sélectionnez ce disque. La carte **Image perso** est grisée (**Réservé**) dans l'assistant VM : elle n'est utilisable que lors de la création d'un disque. Voir [Créer un disque système à partir d'une image](../storage/disks/how-to/create-from-image.md).

---

### Comment choisir mon type d'instance ?

| Série | Libellé | Ratio | Exemple d'usage |
|-------|---------|-------|-----------------|
| `s1` | **Standard (S)** | 1:2 | Développement, tests |
| `u1` | **Universel (U)** | 1:4 | Serveurs web, applications |
| `m1` | **Mémoire (M)** | 1:8 | Bases de données, caches |

Par exemple, `u1.xlarge` offre 4 vCPU et 16 Go de RAM. Le gabarit peut être changé plus tard depuis **Modifier** ; la VM redémarre.

---

### Comment ajouter un disque supplémentaire ?

À la création, cliquez sur **Ajouter un disque** à l'étape **Stockage**. Sur une VM existante, ouvrez la page de détail, cliquez sur **Modifier**, puis **Ajouter un disque** dans la section **Stockage**, et **Enregistrer**. La VM redémarre. Le guide complet, y compris le formatage dans l'OS, est [ici](./how-to/attach-extra-disk.md).

---

### Comment me connecter en SSH ?

1. Ajoutez votre clé publique dans **Clés SSH autorisées** (étape **Réseau** de l'assistant, ou **Modifier** > **Configuration avancée** > **Clés SSH**).
2. Laissez **Adresse IPv4 Publique** activée et le port **SSH (22)** autorisé.
3. Copiez la commande du bloc **Connexion SSH** sur la page de détail et ajoutez votre clé privée :
   ```bash
   ssh -i ~/.ssh/ma-cle ubuntu@<ip-publique>
   ```

Utilisateurs par défaut selon l'image :

| Image | Utilisateur |
|-------|-------------|
| Ubuntu | `ubuntu` |
| Debian | `debian` |
| Rocky Linux | `rocky` |
| AlmaLinux | `almalinux` |
| CentOS Stream, CloudLinux | `cloud-user` |
| Oracle Linux | `opc` |
| openSUSE | `opensuse` |

L'utilisateur effectif est toujours affiché sur la page de détail, sous **Image Système**.

---

### Comment personnaliser la VM au démarrage ?

À l'étape **Réseau** de l'assistant, activez **Script Cloud-Init (User Data)** et saisissez votre configuration :

```yaml title="user-data.yaml"
#cloud-config
packages:
  - nginx
  - htop
runcmd:
  - systemctl enable --now nginx
```

Voir [Configurer cloud-init](./how-to/configure-cloud-init.md).

---

### Que deviennent les disques quand je supprime une VM ?

Ils sont détachés, pas supprimés. Ils restent dans le menu **Disques**, peuvent être rattachés à une autre VM (option **Existant**) et continuent de compter dans le quota de stockage du projet jusqu'à leur suppression.

---

### Puis-je accéder à la console série ou VNC de la VM ?

Cette option n'est pas proposée dans la console ; contactez le [support](mailto:support@hidora.io). L'accès se fait en SSH (Linux) ou en RDP (Windows).

---

### Pourquoi le bouton Éditer est-il grisé dans la liste ?

Dans le menu **Actions** de la liste, **Éditer** n'est disponible que lorsque la VM est **Actif**. Pour modifier une VM arrêtée, ouvrez sa page de détail et cliquez sur **Modifier**.
