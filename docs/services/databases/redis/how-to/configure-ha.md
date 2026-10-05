---
title: "Comment configurer la haute disponibilité Redis"
sidebar_position: 1
---

# Comment configurer la haute disponibilité Redis

Ce guide explique comment créer un cluster Redis hautement disponible depuis la [console Hikube](https://console.hikube.cloud). Le service utilise **Redis Sentinel** pour assurer le failover automatique dès que le cluster compte au moins 2 réplicas. Trois sentinelles sont toujours déployées, quel que soit le nombre de réplicas.

## Prérequis

- Un **projet** Hikube disposant de quotas suffisants : la consommation CPU, mémoire et stockage est multipliée par le nombre de réplicas
- Connaissance des bases de Redis (voir le [démarrage rapide](../quick-start.md))

:::warning
La haute disponibilité se décide **à la création** : le nombre de réplicas ne peut plus être modifié ensuite. Pour transformer un cluster existant, [contactez le support](mailto:support@hidora.io) ou créez un nouveau cluster.
:::

## Étapes

### 1. Ouvrir l'assistant

Ouvrez **DB & Messaging** → **Redis**, puis cliquez sur **Créer un cluster**. Renseignez le **Nom du cluster** et cliquez sur **Suivant**.

### 2. Configurer au moins 3 réplicas

À l'étape **Configuration** :

| Champ | Valeur recommandée en production |
|-------|----------------------------------|
| **Nombre de réplicas** | `3` (ou `5` pour une tolérance à deux pannes) |
| **Préconfiguration** | `medium` ou supérieur, selon la taille du jeu de données |
| **Taille du volume (Go)** | Supérieure au volume de données attendu |
| **Activer l'authentification** | Activé |
| **Réseau public** | Désactivé, sauf besoin d'accès depuis Internet |

:::tip
Le quorum repose sur les trois sentinelles, pas sur le nombre de réplicas : 2 réplicas suffisent au failover, 3 ou plus permettent de tolérer davantage de pannes.
:::

### 3. Créer le cluster

À l'étape **Vérification**, contrôlez la ligne **Réplicas** et le coût estimé, puis cliquez sur **Déployer**. Copiez le mot de passe affiché à l'étape **Résumé**.

### 4. Comprendre le failover automatique

Lorsque le master devient indisponible :

1. Les Sentinels détectent la panne et se mettent d'accord par quorum.
2. Un réplica est promu nouveau master.
3. Les autres réplicas sont reconfigurés pour le suivre.

Avec le réseau public activé, l'adresse affichée dans le champ **Hôte** pointe vers le master courant : vos clients n'ont pas à changer d'adresse après un failover, mais les connexions ouvertes sont coupées et doivent être rétablies.

:::note
Configurez vos clients Redis avec une reconnexion automatique et des délais de nouvelle tentative pour absorber la bascule.
:::

## Vérification

- Dans la page du cluster, section **Général**, le champ **Réplicas** affiche le nombre choisi.
- La section **Connexion** affiche le **Statut** **Prêt**.
- Depuis un client, vérifiez le rôle du nœud joint :

```bash
redis-cli -h <hôte> -p 6379 INFO replication
```

**Résultat attendu :** `role:master` et `connected_slaves` égal au nombre de réplicas moins un.

## Pour aller plus loin

- [Concepts Redis](../concepts.md) : Sentinel, persistance, authentification
- [Modifier les ressources](./scale-resources.md)
