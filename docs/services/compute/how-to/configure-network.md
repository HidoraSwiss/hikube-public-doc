---
title: "Comment configurer le réseau et le pare-feu"
---

# Comment configurer le réseau et le pare-feu

Une VM Hikube peut être exposée sur Internet via une IP publique IPv4, filtrée par un pare-feu qui n'ouvre que les ports choisis. Elle peut aussi être reliée à des réseaux privés (VPC). Ce guide explique comment régler ces options depuis la console, à la création ou sur une VM existante.

## Prérequis

- Un compte Hikube et un projet
- Une VM existante, ou l'assistant de création ouvert
- La liste des ports dont votre application a besoin

## Étapes

### 1. Choisir le mode d'exposition

| Configuration | Effet | Cas d'usage |
|---------------|-------|-------------|
| **Adresse IPv4 Publique** activée + **Activer le Pare-feu** coché | Seuls les **Ports Autorisés** sont joignables depuis Internet | Production, services ciblés (recommandé) |
| **Adresse IPv4 Publique** activée + pare-feu décoché | Tous les ports de la VM sont joignables depuis Internet | VPN, passerelle, protocoles à ports dynamiques |
| **Adresse IPv4 Publique** désactivée | Aucune exposition sur Internet | VM interne, joignable par son IP **mgmt** ou via un [VPC](../../networking/overview.md) |

:::tip Recommandation
Gardez le pare-feu activé en production et n'ouvrez que les ports nécessaires.

Le pare-feu ne filtre que le trafic qui arrive par l'IP publique. Le trafic entre les VM du projet, sur un VPC comme sur le réseau principal, n'est pas filtré : utilisez pour cela le pare-feu de l'OS (ufw, firewalld, nftables).
:::

### 2. Régler les options à la création

À l'étape **Réseau** de l'assistant :

1. **Adresse IPv4 Publique** : laissez l'interrupteur activé pour exposer la VM.
2. **Activer le Pare-feu** : laissez la case cochée.
3. **Ports Autorisés** : cochez **SSH (22)**, **HTTP (80)**, **HTTPS (443)** selon vos besoins.
4. Pour un autre port, saisissez-le dans **Port personnalisé...** (1 à 65535) et cliquez sur le bouton d'ajout. Il apparaît coché dans la liste ; l'icône de corbeille le retire.

Le **Récapitulatif** affiche **IP Publique**, **Pare-feu** et **Ports Ouverts** avant le déploiement.

### 3. Modifier les options d'une VM existante

1. Ouvrez la page de détail de la VM et cliquez sur **Modifier**.
2. Dans **Réseau & Sécurité**, ajustez **Adresse IPv4 Publique**, **Activer le Pare-feu** et les **Ports Autorisés**.
3. Cliquez sur **Enregistrer**.

Ces changements s'appliquent en quelques secondes, sans redémarrer la VM. Un changement de gabarit, de disques ou de GPU, lui, ne prend effet qu'au prochain redémarrage.

### 4. Relier la VM à un réseau privé (optionnel)

Sous **Réseaux VPC (Secondaires)**, cochez un VPC puis un ou plusieurs de ses **Sous-réseaux**. Chaque sous-réseau ajoute une interface privée à la VM, dont l'adresse est distribuée par DHCP : AlmaLinux ou Rocky la prennent automatiquement, Debian et Ubuntu demandent d'activer DHCP sur l'interface (voir [Relier une VM à un VPC](../../networking/how-to/attach-vm-to-vpc.md#4-vérifier-dans-los)). Sur une image Debian ou Ubuntu, la console le rappelle par l'avertissement **Configuration manuelle requise sur Debian et Ubuntu**. Le bouton **+ VPC** crée un VPC sans quitter l'écran, et **Ajouter un sous-réseau** crée un sous-réseau dans le VPC coché. Le détail est dans [Réseau : démarrage rapide](../../networking/quick-start.md).

## Vérification

Sur la page de détail, section **Réseau et Sécurité**, les adresses de la VM sont réparties en deux zones :

- **Interne**, *Depuis les ressources du projet uniquement* : l'adresse étiquetée **mgmt**, puis, le cas échéant, les adresses des sous-réseaux VPC (voir [Les adresses d'une VM](#les-adresses-dune-vm)) ;
- **Externe**, *Depuis Internet* : l'IP publique. Sans IP publique, la zone indique **Désactivé** et « Cette instance n'a pas d'IP publique. ». Tant que l'adresse n'est pas attribuée, elle indique « En attente d'attribution… ».

Viennent ensuite :

- **Connexion SSH** : la commande prête à copier, sur l'IP publique, ou sur l'IP **mgmt** si la VM n'a pas d'IP publique ;
- **Réseaux VPC** : les VPC et sous-réseaux connectés ;
- **Pare-feu & Ports** : les ports ouverts, ou **Aucun port ouvert**.

Testez depuis votre poste :

```bash
# SSH
ssh ubuntu@<ip-publique>

# HTTP, si un serveur web écoute
curl http://<ip-publique>

# Un port non autorisé doit être injoignable
nc -zv -w 5 <ip-publique> 8080
```

:::warning Pare-feu désactivé
Sans pare-feu Hikube, la VM est entièrement exposée. Configurez un pare-feu dans l'OS (ufw, firewalld, nftables) avant de désactiver l'option.
:::

## Les adresses d'une VM

### L'IP mgmt

Toute VM reçoit au démarrage une adresse sur le réseau de son projet : l'IP **mgmt** (pour *management*), affichée dans la zone **Interne**. Elle existe que l'IP publique soit activée ou non, et elle est joignable depuis les autres ressources du même projet, par exemple ses autres VM. C'est l'adresse à utiliser entre deux VM du projet sans passer par Internet. Tant que la VM est arrêtée, la zone **Interne** indique « Attribuée au démarrage de l'instance. ».

Le pare-feu Hikube ne filtre pas ce trafic : filtrez-le, si besoin, avec le pare-feu de l'OS. Pour joindre la VM depuis un autre projet ou depuis Internet, utilisez son IP publique.

### Joindre un service managé du projet

Les bases de données et RabbitMQ affichent dans leur zone **Interne** un nom d'hôte complet, qui se termine par `.local`. Depuis une VM du projet, copiez-le tel quel, en entier : sa forme courte ne se résout pas sur toutes les images.

Sur Debian 13, le nom ne se résout pas sans configuration : le système ignore le domaine de recherche distribué par DHCP. Ajoutez ces lignes au **User Data (Cloud-Init)** de la VM (si votre configuration contient déjà `write_files` ou `runcmd`, fusionnez les entrées dans les listes existantes) :

```yaml title="cloud-init.yaml"
#cloud-config
write_files:
  - path: /etc/netplan/90-hikube-dns.yaml
    permissions: '0600'
    content: |
      network:
        version: 2
        ethernets:
          enp1s0:
            dhcp4-overrides:
              use-domains: true
            dhcp6-overrides:
              use-domains: true
runcmd:
  - netplan apply
```

Sur une VM déjà démarrée, écrivez le même fichier puis lancez `sudo netplan apply`. Ubuntu, AlmaLinux et Debian 12 résolvent le nom sans configuration.

## Pour aller plus loin

- [Réseau : VPC et sous-réseaux](../../networking/overview.md)
- [Démarrage rapide VM](../quick-start.md)
- [Dépannage](../troubleshooting.md)
