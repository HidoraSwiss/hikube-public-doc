---
title: "Comment restaurer une sauvegarde (PITR)"
sidebar_position: 4
description: "Restaurez un cluster PostgreSQL Hikube depuis la console : état d'une sauvegarde, état le plus récent ou instant précis, sur le cluster d'origine ou sur un autre cluster."
---

# Comment restaurer une sauvegarde (PITR)

Une archive PostgreSQL se restaure depuis l'onglet **Sauvegardes** de la page du cluster, dans la [console Hikube](https://console.hikube.cloud), ou depuis **Infrastructure** > **Sauvegardes** > **Archives**.

## Principe

Grâce à l'archivage continu des journaux de transactions, une restauration peut ramener la base :

- à l'**état exact d'une sauvegarde** ;
- à son **état le plus récent** ;
- à un **instant précis** (PITR, *Point-In-Time Recovery*), entre deux sauvegardes.

La restauration écrit soit **sur le cluster d'origine**, dont le contenu est écrasé, soit **sur un autre cluster PostgreSQL** existant du projet, de la même version majeure.

## Étapes

- [Restaurer une base PostgreSQL ou MariaDB](../../../backups/how-to/restore-database.md)
- [Restaurer une base PostgreSQL à un instant précis](../../../backups/how-to/restore-point-in-time.md)

## Après la restauration

Vérifiez vos données avant de remettre vos applications en service :

```sql
-- Contrôler le volume de données
SELECT schemaname, relname, n_live_tup
FROM pg_stat_user_tables
ORDER BY n_live_tup DESC;
```

Si vous avez restauré sur un autre cluster, mettez à jour la configuration de vos applications avec son adresse (zones **Interne** et **Externe** de sa page) et ses identifiants.

## Restauration d'un export logique

Si vous disposez d'un export réalisé avec `pg_dump`, vous pouvez le restaurer vous-même dans une base existante :

```bash
pg_restore --no-owner --dbname "host=<hôte> port=5432 dbname=myapp user=app_user sslmode=require" \
  myapp-2026-06-15.dump
```

## Pour aller plus loin

- [Configurer les sauvegardes](./configure-backups.md)
- [Gérer les utilisateurs et bases de données](./manage-users-databases.md)
