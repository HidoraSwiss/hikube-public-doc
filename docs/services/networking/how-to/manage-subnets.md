---
title: "Comment gérer les sous-réseaux d'un VPC"
---

# Comment gérer les sous-réseaux d'un VPC

Un VPC ne se modifie pas après sa création, mais vous pouvez lui ajouter des sous-réseaux et supprimer ceux qui ne servent plus. Ce guide montre comment faire depuis la console et comment choisir les plages d'adresses.

## Prérequis

- Un compte Hikube et un projet
- Un VPC existant dans **Infrastructure** > **Réseau**

## Étapes

### 1. Planifier les plages d'adresses

Choisissez une plage IPv4 privée qui ne chevauche aucun autre sous-réseau du VPC. Exemple de découpage :

| Sous-réseau | Plage CIDR | Adresses |
|-------------|------------|----------|
| `app` | `172.16.0.0/24` | 256 |
| `db` | `172.16.1.0/24` | 256 |
| `admin` | `172.16.2.0/26` | 64 |

Plages autorisées : `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, hors plages réservées `10.244.0.0/16` et `10.96.0.0/12`.

### 2. Ouvrir la liste des sous-réseaux

1. Ouvrez **Infrastructure** > **Réseau**.
2. Dans le menu **Actions** du VPC, cliquez sur **Voir les sous-réseaux**.

La page **Sous-réseaux pour `<vpc>`** liste chaque sous-réseau avec son **Nom** et son **Bloc CIDR**.

### 3. Créer un sous-réseau

1. Cliquez sur **Créer un sous-réseau**.
2. **Nom du sous-réseau** : 1 à 63 caractères, minuscules, chiffres et tirets.
3. **Bloc CIDR IPv4** : par exemple `172.16.2.0/26`.
4. Cliquez sur **Créer le sous-réseau**.

La console affiche **Subnet créé !** et revient à la liste. Le sous-réseau est immédiatement proposé dans la section **Réseaux VPC (Secondaires)** des VM.

### 4. Supprimer un sous-réseau

1. Détachez d'abord les VM qui l'utilisent (voir [Relier une VM à un VPC](./attach-vm-to-vpc.md#5-détacher-une-vm)).
2. Dans la liste des sous-réseaux, ouvrez le menu **Actions** de la ligne et cliquez sur **Supprimer**.
3. Saisissez le nom du sous-réseau pour confirmer, puis cliquez sur **Supprimer définitivement**.

Si une VM y est encore reliée, la console affiche **Suppression impossible** et la liste des VM concernées.

### 5. Changer la plage d'un sous-réseau

Un sous-réseau ne se modifie pas. Créez un nouveau sous-réseau avec la bonne plage, reliez-y les VM, détachez-les de l'ancien, puis supprimez-le.

## Vérification

La page **Sous-réseaux pour `<vpc>`** reflète les créations et suppressions. Sur une VM reliée, la section **Réseaux VPC** de la page de détail affiche les sous-réseaux connectés avec leur plage.

## Pour aller plus loin

- [Concepts : plages d'adresses](../concepts.md#plages-dadresses)
- [Relier une VM à un VPC](./attach-vm-to-vpc.md)
