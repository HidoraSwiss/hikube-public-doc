---
title: "Comment modifier les ressources d'un cluster"
sidebar_position: 2
---

# Comment modifier les ressources d'un cluster

Ce guide explique comment ajuster un cluster PostgreSQL existant depuis la [console Hikube](https://console.hikube.cloud) : preset d'instance (CPU et mémoire), taille du disque, version et accès externe.

## Prérequis

- Un cluster **PostgreSQL** existant dans votre projet
- Des quotas de projet suffisants pour la nouvelle configuration

## Ce qui est modifiable

| Paramètre | Modifiable après création |
|-----------|---------------------------|
| **Version PostgreSQL** | Oui |
| **Préconfiguration (Preset)** | Oui |
| **Taille du disque (Go)** | Oui |
| **Accès externe** | Oui |
| **Nombre de réplicas** | Non, « Le mode ne peut pas être modifié après création » |

Pour changer le nombre de réplicas d'un cluster existant, [contactez le support](mailto:support@hidora.io).

## Presets disponibles

| Preset | CPU | Mémoire |
|--------|-----|---------|
| `nano` | 250m | 128Mi |
| `micro` | 500m | 256Mi |
| `small` | 1 | 512Mi |
| `medium` | 1 | 1Gi |
| `large` | 2 | 2Gi |
| `xlarge` | 4 | 4Gi |
| `2xlarge` | 8 | 8Gi |

La liste affichée dans le formulaire fait foi. Les ressources s'appliquent à chaque nœud du cluster.

## Étapes

### 1. Ouvrir le formulaire de modification

1. Ouvrez **DB & Messaging** → **PostgreSQL**.
2. Dans la liste **Clusters PostgreSQL**, ouvrez le menu **Actions** du cluster et choisissez **Modifier**, ou ouvrez la page du cluster et cliquez sur **Modifier**.

La page **Modifier PostgreSQL** affiche la carte **Paramètres du cluster** et l'impact de la configuration sur les quotas du projet.

### 2. Ajuster les paramètres

- **Préconfiguration (Preset)** : sélectionnez un preset supérieur pour augmenter le CPU et la mémoire de chaque nœud.
- **Taille du disque (Go)** : saisissez la nouvelle capacité.
- **Version PostgreSQL** : sélectionnez la version cible.
- **Accès externe** : activez ou désactivez l'exposition sur l'Internet public.

### 3. Enregistrer

Cliquez sur **Sauvegarder**. Le message « Cluster mis à jour » confirme la prise en compte. Si la nouvelle configuration dépasse les quotas du projet, le bouton reste inactif.

:::warning
Un changement de preset ou de version entraîne le redémarrage des instances. Sur un cluster à 1 réplica, la base est indisponible pendant le redémarrage ; planifiez l'opération en dehors des heures de forte charge.
:::

:::tip
Augmentez la taille du disque avant qu'il ne soit plein. Surveillez l'espace utilisé avec `SELECT pg_size_pretty(pg_database_size(current_database()));`.
:::

## Vérification

La page du cluster affiche les nouvelles valeurs dans les cartes **Version PostgreSQL**, **Taille allouée** et **Accès externe**, et le statut revient à **Prêt** une fois la mise à jour appliquée.

## Pour aller plus loin

- [Concepts PostgreSQL](../concepts.md) : réplication, presets, accès réseau
- [Gérer les utilisateurs et bases de données](./manage-users-databases.md)
