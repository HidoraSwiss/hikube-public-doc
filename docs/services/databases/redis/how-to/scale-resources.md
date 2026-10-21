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
| **Version Redis** | Oui, vers une version supérieure uniquement |
| **Préconfiguration** | Oui |
| **Taille du volume (Go)** | Oui, à la hausse uniquement |
| **Accès externe** | Oui |
| **Authentification requise** | Oui |
| **Nombre de réplicas** | Non, « Le mode ne peut pas être modifié après création » |

Pour changer le nombre de réplicas, [contactez le support](mailto:support@hidora.io).

## Étapes

### 1. Ouvrir le formulaire de modification

1. Ouvrez **DB & Messaging** → **Redis**.
2. Ouvrez le cluster, puis cliquez sur **Modifier** (ou utilisez **Actions** → **Modifier** dans la liste).

La page **Modifier le cluster** affiche la carte **Paramètres du cluster** et l'impact sur les quotas du projet, qui compte aussi les trois sentinelles à la taille de la préconfiguration.

### 2. Ajuster les paramètres

- **Préconfiguration** : choisissez un preset supérieur si la mémoire est saturée. La mémoire du preset borne le volume de données que Redis peut garder en mémoire. Un cluster créé avec un ancien preset (`small`, `medium`…) le conserve tant que vous n'en choisissez pas un autre.
- **Taille du volume (Go)** : « La taille de stockage allouée à chaque nœud du cluster ». Saisissez une taille au moins égale à la taille actuelle.
- **Version Redis** : `8 (Latest)` ou `7`. Le formulaire propose les deux versions, mais seule la version actuelle ou une version supérieure est acceptée : sur un cluster en `8`, ne choisissez pas `7`.
- **Accès externe** : « Autoriser l'accès au cluster depuis l'extérieur du réseau privé ».
- **Authentification requise** : « Activer la protection par mot de passe ».

### 3. Enregistrer

Cliquez sur **Enregistrer les modifications**. Le message « Modifications enregistrées » confirme la prise en compte.

Une version inférieure ou une taille de volume réduite est refusée : la console affiche « Une erreur est survenue lors de la mise à jour du cluster. », suivi de la raison renvoyée par l'API (codes `120203` pour la version, `120204` pour le volume).

Un changement de l'**Authentification requise** ne s'applique aux serveurs Redis qu'après un redémarrage du cluster. Après l'enregistrement, la console propose de redémarrer : confirmez avec **Redémarrer**, ou cliquez sur **Plus tard** et redémarrez depuis le bandeau **Redémarrage requis** de la page du cluster. Voir [Redémarrer un cluster](./restart-cluster.md).

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
- [Redémarrer un cluster](./restart-cluster.md)
