---
title: "Comment modifier les ressources d'un cluster"
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
| **Version MongoDB** | Oui |
| **Taille du disque (Go)** | Oui |
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

- **Taille du disque (Go)** : saisissez la nouvelle capacité.
- **Version MongoDB** : sélectionnez la version cible (6.0, 7.0 ou 8.0).
- **Accès externe** : activez ou désactivez l'exposition sur l'Internet public.

:::tip
MongoDB ne prend en charge les montées de version majeure que d'une version à la suivante (6.0 → 7.0 → 8.0). Ne sautez pas de version.
:::

### 3. Enregistrer

Cliquez sur **Sauvegarder**. Le message « Cluster mis à jour » confirme la prise en compte. Si la nouvelle configuration dépasse les quotas du projet, le bouton reste inactif.

## Vérification

La page du cluster affiche les nouvelles valeurs dans les cartes **Version MongoDB** et **Taille allouée**. Depuis `mongosh`, contrôlez l'espace utilisé :

```javascript
db.stats({ scale: 1024 * 1024 })
```

## Pour aller plus loin

- [Concepts MongoDB](../concepts.md) : réplication, préconfigurations, accès réseau
- [Configurer le sharding](./configure-sharding.md)
