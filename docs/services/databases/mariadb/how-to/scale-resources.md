---
title: "Comment modifier les ressources d'un cluster"
sidebar_position: 2
---

# Comment modifier les ressources d'un cluster

Ce guide explique comment ajuster un cluster MariaDB existant depuis la [console Hikube](https://console.hikube.cloud) : taille du disque, version et accès externe.

## Prérequis

- Un cluster **MariaDB** existant dans votre projet
- Des quotas de projet suffisants pour la nouvelle configuration

## Ce qui est modifiable

| Paramètre | Modifiable après création |
|-----------|---------------------------|
| **Version MariaDB** | Oui |
| **Taille du disque (Go)** | Oui |
| **Accès externe** | Oui |
| **Préconfiguration (Preset)** | Non, « La préconfiguration ne peut pas être modifiée après création » |
| **Nombre de réplicas** | Non, « Le mode ne peut pas être modifié après création » |

Pour changer la préconfiguration (CPU et mémoire) ou le nombre de réplicas d'un cluster existant, [contactez le support](mailto:support@hidora.io).

## Étapes

### 1. Ouvrir le formulaire de modification

1. Ouvrez **DB & Messaging** → **MariaDB**.
2. Ouvrez le cluster, puis cliquez sur **Modifier** (ou utilisez **Actions** → **Modifier** dans la liste).

La page **Modifier MariaDB** affiche la carte **Paramètres du cluster** et l'impact sur les quotas du projet.

### 2. Ajuster les paramètres

- **Taille du disque (Go)** : saisissez la nouvelle capacité.
- **Version MariaDB** : sélectionnez la version cible (10.6, 10.11, 11.4 ou 11.8).
- **Accès externe** : activez ou désactivez l'exposition sur l'Internet public.

### 3. Enregistrer

Cliquez sur **Sauvegarder**. Le message « Cluster mis à jour » confirme la prise en compte. Si la nouvelle configuration dépasse les quotas du projet, le bouton reste inactif.

:::tip
Augmentez la taille du disque avant qu'il ne soit plein. Pour mesurer l'espace utilisé par base :

```sql
SELECT table_schema, ROUND(SUM(data_length + index_length) / 1024 / 1024, 1) AS size_mb
FROM information_schema.tables
GROUP BY table_schema;
```
:::

## Vérification

La page du cluster affiche les nouvelles valeurs dans les cartes **Version MariaDB** et **Taille allouée**, et l'état de l'**Accès externe** dans la carte **Connexion et réseau**.

## Pour aller plus loin

- [Concepts MariaDB](../concepts.md) : réplication, préconfigurations, accès réseau
- [Gérer les utilisateurs et bases de données](./manage-users-databases.md)
