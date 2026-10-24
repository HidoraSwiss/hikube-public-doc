---
title: "Comment configurer les sauvegardes automatiques — PostgreSQL"
sidebar_label: "Comment configurer les sauvegardes automatiques"
sidebar_position: 3
description: "Programmez les sauvegardes d'un cluster PostgreSQL Hikube depuis la console, vers un bucket de votre projet, et exportez une base à la demande avec pg_dump."
---

# Comment configurer les sauvegardes automatiques

Les clusters PostgreSQL se sauvegardent avec le [service de sauvegarde](../../../backups/overview.md) d'Hikube, depuis l'onglet **Sauvegardes** de la page du cluster dans la [console Hikube](https://console.hikube.cloud).

## Principe

- **Sauvegardes complètes**, programmées ou à la demande, écrites dans un bucket S3 de votre projet ;
- **Archivage continu des journaux de transactions** entre deux sauvegardes, qui permet de restaurer la base à un instant précis ;
- **Rétention** en jours, fixée par la destination.

## Étapes

1. Créez une destination dans **Infrastructure** > **Sauvegardes** > **Destinations** : voir [Créer une destination](../../../backups/how-to/create-destination.md).
2. Ouvrez **PostgreSQL**, le cluster, puis l'onglet **Sauvegardes**.
3. Cliquez sur **Programmer**, choisissez la destination et l'horaire, puis **Programmer**. Voir [Programmer des sauvegardes](../../../backups/how-to/schedule-backups.md).

:::warning Une seule destination par cluster
Toutes les sauvegardes d'un même cluster PostgreSQL doivent viser la même destination : une seconde destination est refusée.
:::

## Sauvegarde logique à la demande

Indépendamment des sauvegardes gérées par la plateforme, vous pouvez à tout moment exporter une base avec les outils PostgreSQL standards :

```bash
# Export d'une base au format custom
pg_dump "host=<hôte> port=5432 dbname=myapp user=app_user sslmode=require" \
  --format=custom --file=myapp-$(date +%F).dump
```

L'utilisateur doit disposer du droit **Administrateur (Admin)** ou **Lecture seule (Read-only)** sur la base exportée.

## Pour aller plus loin

- [Restaurer une sauvegarde](./restore-backup.md)
- [Concepts des sauvegardes](../../../backups/concepts.md)
