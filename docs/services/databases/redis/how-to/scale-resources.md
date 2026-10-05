---
title: "Comment modifier les ressources d'un cluster Redis"
sidebar_position: 2
---

# Comment modifier les ressources d'un cluster Redis

Ce guide explique comment ajuster un cluster Redis existant depuis la [console Hikube](https://console.hikube.cloud) : préconfiguration (CPU et mémoire), taille du volume, version, accès externe et authentification.

## Prérequis

- Un cluster **Redis** existant dans votre projet
- Des quotas de projet suffisants pour la nouvelle configuration

## Ce qui est modifiable

| Paramètre | Modifiable après création |
|-----------|---------------------------|
| **Version Redis** | Oui |
| **Préconfiguration** | Oui |
| **Taille du volume (Go)** | Oui |
| **Accès externe** | Oui |
| **Authentification requise** | Oui |
| **Nombre de réplicas** | Non, « Le mode ne peut pas être modifié après création » |

Pour changer le nombre de réplicas, [contactez le support](mailto:support@hidora.io).

## Étapes

### 1. Ouvrir le formulaire de modification

1. Ouvrez **DB & Messaging** → **Redis**.
2. Ouvrez le cluster, puis cliquez sur **Modifier** (ou utilisez **Actions** → **Modifier** dans la liste).

La page **Modifier le cluster** affiche la carte **Paramètres du cluster** et l'impact sur les quotas du projet.

### 2. Ajuster les paramètres

- **Préconfiguration** : choisissez un preset supérieur si la mémoire est saturée. La mémoire du preset borne le volume de données que Redis peut garder en mémoire.
- **Taille du volume (Go)** : « La taille de stockage allouée à chaque nœud du cluster ».
- **Version Redis** : `8 (Latest)` ou `7`.
- **Accès externe** : « Autoriser l'accès au cluster depuis l'extérieur du réseau privé ».
- **Authentification requise** : « Activer la protection par mot de passe ».

### 3. Enregistrer

Cliquez sur **Enregistrer les modifications**. Le message « Modifications enregistrées » confirme la prise en compte.

:::warning
Désactiver l'authentification sur un cluster exposé au réseau public rend vos données accessibles à quiconque connaît l'adresse. Conservez l'authentification activée.
:::

## Vérification

- La page du cluster, section **Général**, affiche la nouvelle **Version** et la nouvelle **Taille**.
- Depuis un client, contrôlez la mémoire disponible :

```bash
redis-cli -h <hôte> -p 6379 INFO memory | grep -E 'used_memory_human|maxmemory_human'
```

## Pour aller plus loin

- [Configurer la haute disponibilité](./configure-ha.md)
- [Renouveler le mot de passe](./rotate-password.md)
