---
title: "Comment redémarrer un cluster — PostgreSQL"
sidebar_label: "Comment redémarrer un cluster"
sidebar_position: 5
---

# Comment redémarrer un cluster

Ce guide explique comment redémarrer un cluster PostgreSQL depuis la [console Hikube](https://console.hikube.cloud), par exemple lorsqu'une instance ne se comporte plus normalement.

## Prérequis

- Un cluster **PostgreSQL** au statut **Prêt** dans votre projet
- Le droit de modifier ce cluster

## Ce qui se passe pendant le redémarrage

Le redémarrage est progressif : les réplicas redémarrent d'abord, puis le primaire.

- Les lectures restent servies pendant toute l'opération.
- Les écritures sont suspendues une quarantaine de secondes, le temps que le primaire redémarre.
- Les données sont conservées.

Sur un cluster à 1 réplica, aucune autre instance ne prend le relais : la base est indisponible le temps du redémarrage.

:::warning
Planifiez le redémarrage dans une fenêtre de maintenance ou en dehors des heures de forte charge, et vérifiez que vos applications savent se reconnecter et rejouer une écriture refusée.
:::

## Étapes

### 1. Ouvrir la page du cluster

1. Ouvrez **DB & Messaging** → **PostgreSQL**.
2. Dans la liste **Clusters PostgreSQL**, ouvrez le cluster.

### 2. Lancer le redémarrage

1. Cliquez sur **Redémarrer**, à côté des boutons **Modifier** et **Supprimer**.
2. La fenêtre « Redémarrer `<nom>` ? » rappelle l'effet du redémarrage. Confirmez avec **Redémarrer**.

Le message « Redémarrage lancé » confirme la prise en compte. Le redémarrage se poursuit en arrière-plan.

:::note
Un cluster encore en cours de création n'a rien à redémarrer : la demande est refusée. Patientez quelques minutes après le passage au statut **Prêt**, le temps que le cluster finisse de démarrer, puis relancez le redémarrage.
:::

## Vérification

Le statut du cluster ne change pas pendant un redémarrage : il reste affiché **Prêt**. Pour confirmer le redémarrage, contrôlez l'heure de démarrage du primaire :

```bash
psql "host=<hôte> port=5432 dbname=<base> user=<utilisateur> sslmode=require" \
  -c "SELECT pg_postmaster_start_time();"
```

L'heure renvoyée correspond au moment du redémarrage.

## Pour aller plus loin

- [Concepts PostgreSQL](../concepts.md) : réplication et haute disponibilité
- [Modifier les ressources d'un cluster](./scale-resources.md)
