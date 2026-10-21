---
title: "Comment renouveler le mot de passe Redis"
sidebar_position: 3
---

# Comment renouveler le mot de passe Redis

Ce guide explique comment générer un nouveau mot de passe pour un cluster Redis depuis la [console Hikube](https://console.hikube.cloud), par exemple après la perte du mot de passe initial ou dans le cadre d'une rotation périodique.

## Prérequis

- Un cluster **Redis** avec l'authentification activée. Sur un cluster sans authentification, la rotation est refusée : activez d'abord l'**Authentification requise** depuis **Modifier** (voir [Modifier les ressources](./scale-resources.md)).
- La liste des applications qui utilisent ce cluster, pour les mettre à jour juste après le redémarrage

:::warning
Le nouveau mot de passe ne s'applique qu'après un [redémarrage du cluster](./restart-cluster.md). D'ici là, les serveurs Redis acceptent encore l'ancien mot de passe et refusent le nouveau. Le redémarrage interrompt brièvement le cluster (environ une minute) : planifiez la rotation dans une fenêtre de maintenance.
:::

## Étapes

### 1. Ouvrir la section Sécurité

Ouvrez **DB & Messaging** → **Redis**, puis le cluster concerné. La section **Sécurité** permet de générer un nouveau mot de passe global pour ce cluster.

### 2. Lancer la rotation

1. Cliquez sur **Effectuer une rotation**.
2. Dans la fenêtre **Rotation du mot de passe**, confirmez avec **Effectuer la rotation**.

### 3. Copier le nouveau mot de passe

La fenêtre **Mot de passe généré** affiche le nouveau mot de passe. Copiez-le dans votre gestionnaire de mots de passe : il ne sera plus affiché après la fermeture de la fenêtre.

La fenêtre rappelle : « Le nouveau mot de passe ne sera accepté qu'après un redémarrage du cluster ; d'ici là, les serveurs acceptent encore l'ancien. »

### 4. Redémarrer le cluster

1. Dans la même fenêtre, cliquez sur **Redémarrer maintenant**, puis confirmez avec **Redémarrer**.
2. Pour redémarrer plus tard, cliquez sur **Terminer** : la page du cluster affiche le bandeau **Redémarrage requis** jusqu'au redémarrage, avec un bouton **Redémarrer maintenant**.

Le cluster est injoignable pendant environ une minute. Voir [Redémarrer un cluster](./restart-cluster.md).

### 5. Mettre à jour vos applications

Une fois le cluster redémarré, remplacez l'ancien mot de passe dans la configuration de vos applications (variables d'environnement, secrets Kubernetes de vos clusters, fichiers de configuration), puis redémarrez-les si elles ne relisent pas la configuration à chaud. Avant le redémarrage du cluster, le nouveau mot de passe est encore refusé.

## Vérification

```bash
REDISCLI_AUTH='<nouveau mot de passe>' redis-cli -h <hôte> -p 6379 ping
# PONG
```

Si la commande répond `WRONGPASS`, le cluster n'a pas encore redémarré : vérifiez si le bandeau **Redémarrage requis** est affiché sur la page du cluster.

## Pour aller plus loin

- [Redémarrer un cluster](./restart-cluster.md)
- [Concepts Redis](../concepts.md) : authentification
- [Dépannage Redis](../troubleshooting.md)
