---
title: "Comment redémarrer un cluster — MongoDB"
sidebar_label: "Comment redémarrer un cluster"
sidebar_position: 4
---

# Comment redémarrer un cluster

Ce guide explique comment redémarrer un cluster MongoDB depuis la [console Hikube](https://console.hikube.cloud), par exemple lorsqu'un membre ne se comporte plus normalement.

## Prérequis

- Un cluster **MongoDB** au statut **Prêt** dans votre projet
- Le droit de modifier ce cluster

## Ce qui se passe pendant le redémarrage

Toutes les instances du cluster redémarrent en même temps :

- le cluster est injoignable pendant quelques secondes, le temps que les membres redémarrent ;
- les connexions ouvertes sont coupées et vos applications doivent se reconnecter ;
- les données sont conservées.

Sur un cluster shardé, les routeurs `mongos` ne sont pas redémarrés.

:::warning
Planifiez le redémarrage dans une fenêtre de maintenance ou en dehors des heures de forte charge, et vérifiez que vos applications savent se reconnecter automatiquement.
:::

## Étapes

### 1. Ouvrir la page du cluster

1. Ouvrez **DB & Messaging** → **MongoDB**.
2. Ouvrez le cluster.

### 2. Lancer le redémarrage

1. Cliquez sur **Redémarrer**, à côté des boutons **Modifier** et **Supprimer**.
2. La fenêtre « Redémarrer `<nom>` ? » rappelle l'effet du redémarrage. Confirmez avec **Redémarrer**.

Le message « Redémarrage lancé » confirme la prise en compte. Le redémarrage se poursuit en arrière-plan.

:::note
Un cluster encore en cours de création n'a rien à redémarrer : la demande est refusée. Patientez quelques minutes après le passage au statut **Prêt**, le temps que le cluster finisse de démarrer, puis relancez le redémarrage.
:::

## Vérification

Le statut du cluster ne change pas pendant un redémarrage : il reste affiché **Prêt**. Pour confirmer le redémarrage, contrôlez depuis combien de secondes le membre tourne :

```bash
mongosh "mongodb://<hôte>:27017/admin?directConnection=true&authSource=admin" --username <utilisateur> \
  --eval "db.serverStatus().uptime"
```

Une valeur faible confirme que le membre vient de redémarrer.

## Pour aller plus loin

- [Concepts MongoDB](../concepts.md) : réplication, haute disponibilité et sharding
- [Modifier les ressources d'un cluster](./scale-resources.md)
