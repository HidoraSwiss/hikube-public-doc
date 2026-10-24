---
title: "Comment restaurer une sauvegarde"
sidebar_position: 4
description: "Restaurez un cluster MariaDB Hikube depuis la console, sur le cluster d'origine ou sur un autre cluster, ou rejouez vous-même un export mysqldump."
---

# Comment restaurer une sauvegarde

Une archive MariaDB se restaure depuis l'onglet **Sauvegardes** de la page du cluster, dans la [console Hikube](https://console.hikube.cloud), ou depuis **Infrastructure** > **Sauvegardes** > **Archives**. Voir [Restaurer une base PostgreSQL ou MariaDB](../../../backups/how-to/restore-database.md).

La restauration écrit soit **sur le cluster d'origine**, soit **sur un autre cluster MariaDB** existant du projet. L'archive est rejouée dans la cible : chaque table qu'elle contient remplace la table du même nom ; les tables et bases qu'elle ne contient pas sont conservées.

## Restauration d'un export logique

Si vous disposez d'un export réalisé avec `mysqldump`, restaurez-le vous-même dans une base existante. L'utilisateur doit disposer du droit **Administrateur (Admin)** sur la base cible :

```bash
mysql -h <hôte> -P 3306 -u app-user -p myapp < myapp-2026-06-15.sql
```

## Vérification

```sql
-- Contrôler le nombre de lignes des tables restaurées
SELECT table_name, table_rows
FROM information_schema.tables
WHERE table_schema = 'myapp'
ORDER BY table_rows DESC;
```

## Pour aller plus loin

- [Configurer les sauvegardes](./configure-backups.md)
- [Gérer les utilisateurs et bases de données](./manage-users-databases.md)
