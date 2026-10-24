---
title: "Comment configurer les sauvegardes automatiques — MariaDB"
sidebar_label: "Comment configurer les sauvegardes automatiques"
sidebar_position: 3
description: "Programmez les sauvegardes d'un cluster MariaDB Hikube depuis la console, vers un bucket de votre projet, et exportez une base à la demande avec mysqldump."
---

# Comment configurer les sauvegardes automatiques

Les clusters MariaDB se sauvegardent avec le [service de sauvegarde](../../../backups/overview.md) d'Hikube, depuis l'onglet **Sauvegardes** de la page du cluster dans la [console Hikube](https://console.hikube.cloud).

## Principe

Chaque sauvegarde est un export complet du cluster, programmé ou à la demande, écrit dans un bucket S3 de votre projet et conservé selon la **rétention** de la destination.

## Étapes

1. Créez une destination dans **Infrastructure** > **Sauvegardes** > **Destinations** : voir [Créer une destination](../../../backups/how-to/create-destination.md).
2. Ouvrez **MariaDB**, le cluster, puis l'onglet **Sauvegardes**.
3. Cliquez sur **Programmer**, choisissez la destination et l'horaire, puis **Programmer**. Voir [Programmer des sauvegardes](../../../backups/how-to/schedule-backups.md).

Pour conserver des sauvegardes sur des durées différentes (par exemple quotidiennes gardées 7 jours et hebdomadaires gardées 30 jours), créez deux destinations avec chacune sa rétention, et une programmation vers chacune.

## Sauvegarde logique à la demande

Indépendamment des sauvegardes gérées par la plateforme, vous pouvez à tout moment exporter une base avec `mysqldump` (ou `mariadb-dump`) :

```bash
mysqldump -h <hôte> -P 3306 -u app-user -p \
  --single-transaction --routines --triggers \
  myapp > myapp-$(date +%F).sql
```

L'option `--single-transaction` produit un export cohérent sans verrouiller les tables InnoDB.

## Pour aller plus loin

- [Restaurer une sauvegarde](./restore-backup.md)
- [Concepts des sauvegardes](../../../backups/concepts.md)
