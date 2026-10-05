---
title: "Comment relier une VM à un VPC"
---

# Comment relier une VM à un VPC

Ce guide explique comment relier une VM à un ou plusieurs sous-réseaux VPC, à la création ou sur une VM existante, puis comment vérifier et configurer l'interface dans l'OS. Il couvre aussi le détachement.

## Prérequis

- Un compte Hikube et un projet
- Un VPC avec au moins un sous-réseau (voir [Démarrage rapide](../quick-start.md)), ou l'intention d'en créer un depuis l'assistant VM
- Un accès SSH à la VM pour la vérification

## Étapes

### 1. Relier une nouvelle VM

1. Ouvrez **Instances VM** > **Créer une Instance** et renseignez les premières étapes.
2. À l'étape **Réseau**, section **Réseaux VPC (Secondaires)**, cochez le VPC voulu.
3. Sous **Sous-réseaux**, cochez un ou plusieurs sous-réseaux.
4. Terminez l'assistant : le **Récapitulatif** affiche **Réseaux privés** avec le nombre de sous-réseaux. Cliquez sur **Déployer**.

Pas encore de VPC ? Cliquez sur **+ VPC** dans la section **Réseaux VPC (Secondaires)** : la boîte **Créer un VPC** permet de créer le VPC et ses sous-réseaux, puis le coche automatiquement. Pour ajouter un sous-réseau à un VPC coché, cliquez sur **Ajouter un sous-réseau**, saisissez un nom et une plage CIDR, puis validez.

### 2. Relier une VM existante

1. Ouvrez la page de détail de la VM et cliquez sur **Modifier**.
2. Dans **Réseau & Sécurité**, sous **Réseaux VPC (Secondaires)**, cochez le VPC puis les sous-réseaux.
3. Cliquez sur **Enregistrer**.

### 3. Vérifier dans la console

Sur la page de détail de la VM, section **Réseau et Sécurité** :

- **Réseaux VPC** liste chaque VPC avec ses **Sous-réseaux connectés** et leur plage, par exemple `app (172.16.0.0/24)` ;
- **Adresses IP** ajoute une adresse **Secondaire** par sous-réseau.

### 4. Vérifier dans l'OS

```bash
ip -br addr
```

**Résultat attendu :** une interface par sous-réseau relié, avec l'adresse affichée dans la console, par exemple :

```
lo               UNKNOWN        127.0.0.1/8 ::1/128
enp1s0           UP             10.x.x.x/xx ...
enp2s0           UP             172.16.0.11/24 ...
```

Si l'interface secondaire est présente mais sans adresse, activez DHCP dessus. Exemple avec netplan (Ubuntu) :

```yaml title="/etc/netplan/60-vpc.yaml"
network:
  version: 2
  ethernets:
    enp2s0:
      dhcp4: true
      dhcp4-overrides:
        use-routes: false
```

```bash
sudo chmod 600 /etc/netplan/60-vpc.yaml
sudo netplan apply
ip -br addr show enp2s0
```

`use-routes: false` évite que l'interface VPC ne remplace la route par défaut : l'accès Internet continue de passer par l'interface principale.

### 5. Détacher une VM

1. Page de détail de la VM > **Modifier**.
2. Sous **Réseaux VPC (Secondaires)**, décochez le sous-réseau, ou le VPC entier.
3. Cliquez sur **Enregistrer**.

Retirez ensuite la configuration correspondante dans l'OS (par exemple le fichier netplan ajouté).

## Vérification

Depuis une autre VM du même sous-réseau :

```bash
ping -c 3 <adresse-secondaire-de-la-vm>
```

## Pour aller plus loin

- [Gérer les sous-réseaux](./manage-subnets.md)
- [Configurer le réseau et le pare-feu d'une VM](../../compute/how-to/configure-network.md)
- [Dépannage](../troubleshooting.md)
