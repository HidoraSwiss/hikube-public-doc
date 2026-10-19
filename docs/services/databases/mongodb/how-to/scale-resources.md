---
title: "Comment modifier les ressources d'un cluster — MongoDB"
sidebar_label: "Comment modifier les ressources d'un cluster"
sidebar_position: 2
---

# Comment modifier les ressources d'un cluster

Ce guide explique comment ajuster un cluster MongoDB existant depuis la [console Hikube](https://console.hikube.cloud) : taille du disque, version et accès externe.

## Prérequis

- Un cluster **MongoDB** existant dans votre projet
- Des quotas de projet suffisants pour la nouvelle configuration

## Ce qui est modifiable

| Paramètre | Modifiable après création |
|-----------|---------------------------|
| **Version MongoDB** | Oui, vers une version supérieure uniquement |
| **Taille du disque (Go)** | Oui, à la hausse uniquement |
| **Accès externe** | Oui |
| **Préconfiguration (Preset)** | Non, « La préconfiguration ne peut pas être modifiée après création » |
| **Nombre de réplicas** | Non, « Le mode ne peut pas être modifié après création » |
| **Sharding** | Non, l'option ne figure pas dans le formulaire de modification |

Pour changer la préconfiguration, le nombre de réplicas ou la topologie d'un cluster existant, [contactez le support](mailto:support@hidora.io).

## Étapes

### 1. Ouvrir le formulaire de modification

1. Ouvrez **DB & Messaging** → **MongoDB**.
2. Ouvrez le cluster, puis cliquez sur **Modifier** (ou utilisez **Actions** → **Modifier** dans la liste).

La page **Modifier MongoDB** affiche la carte **Paramètres du cluster** et l'impact sur les quotas du projet.

### 2. Ajuster les paramètres

- **Taille du disque (Go)** : saisissez la nouvelle capacité, au moins égale à la taille actuelle. Une valeur inférieure affiche « La taille du disque ne peut pas être réduite : N Go minimum. » et n'est pas enregistrée.
- **Version MongoDB** : sélectionnez la version cible. Le formulaire ne propose que la version actuelle et les versions supérieures.
- **Accès externe** : activez ou désactivez l'exposition sur l'Internet public.

:::tip
MongoDB ne prend en charge les montées de version majeure que d'une version à la suivante (6.0 → 7.0 → 8.0). Le formulaire propose toutes les versions supérieures, y compris un saut de version : ne sautez pas de version.
:::

Quand vous changez la version, l'avertissement « Les instances du cluster vont redémarrer » s'affiche : le changement redémarre les instances du cluster dès l'enregistrement, et une version mise à niveau ne peut plus être abaissée. Planifiez-le en dehors des périodes de forte activité.

### 3. Enregistrer

Cliquez sur **Sauvegarder**. Le message « Cluster mis à jour » confirme la prise en compte. Si la nouvelle configuration dépasse les quotas du projet, le bouton reste inactif.

:::note
L'API applique les mêmes règles : une version inférieure à la version actuelle est refusée avec le code `150203`, une taille de disque inférieure à la taille actuelle avec le code `150204`.
:::

## Vérification

La page du cluster affiche les nouvelles valeurs dans les cartes **Version MongoDB** et **Taille allouée**. Depuis `mongosh`, contrôlez l'espace utilisé :

```javascript
db.stats({ scale: 1024 * 1024 })
```

## Pour aller plus loin

- [Concepts MongoDB](../concepts.md) : réplication, préconfigurations, accès réseau
- [Configurer le sharding](./configure-sharding.md)
