---
title: "Comment renouveler le mot de passe Redis"
sidebar_position: 3
---

# Comment renouveler le mot de passe Redis

Ce guide explique comment générer un nouveau mot de passe pour un cluster Redis depuis la [console Hikube](https://console.hikube.cloud), par exemple après la perte du mot de passe initial ou dans le cadre d'une rotation périodique.

## Prérequis

- Un cluster **Redis** avec l'authentification activée
- La liste des applications qui utilisent ce cluster, pour les mettre à jour juste après la rotation

:::warning
La rotation révoque immédiatement le mot de passe actuel. Les applications qui l'utilisent encore perdent l'accès jusqu'à leur mise à jour.
:::

## Étapes

### 1. Ouvrir la section Sécurité

Ouvrez **DB & Messaging** → **Redis**, puis le cluster concerné. La section **Sécurité** indique : « Générez un nouveau mot de passe global pour ce cluster. Cette action révoquera le mot de passe actuel. »

### 2. Lancer la rotation

1. Cliquez sur **Effectuer une rotation**.
2. Dans la fenêtre **Rotation du mot de passe**, confirmez avec **Effectuer la rotation**.

### 3. Copier le nouveau mot de passe

La fenêtre **Mot de passe généré** affiche le nouveau mot de passe. Copiez-le dans votre gestionnaire de mots de passe : il ne sera plus affiché après la fermeture de la fenêtre. Cliquez sur **Terminer**.

### 4. Mettre à jour vos applications

Remplacez l'ancien mot de passe dans la configuration de vos applications (variables d'environnement, secrets Kubernetes de vos clusters, fichiers de configuration), puis redémarrez-les si elles ne relisent pas la configuration à chaud.

## Vérification

```bash
REDISCLI_AUTH='<nouveau mot de passe>' redis-cli -h <hôte> -p 6379 ping
# PONG
```

## Pour aller plus loin

- [Concepts Redis](../concepts.md) : authentification
- [Dépannage Redis](../troubleshooting.md)
