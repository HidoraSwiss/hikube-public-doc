---
title: "Comment restaurer une sauvegarde (PITR)"
sidebar_position: 4
---

# Comment restaurer une sauvegarde (PITR)

:::info Disponibilité
La restauration de sauvegardes PostgreSQL n'est pas encore disponible en libre-service dans la [console Hikube](https://console.hikube.cloud).
Pour restaurer un cluster, [contactez le support](mailto:support@hidora.io).
:::

## Principe

Lorsque les sauvegardes sont activées sur un cluster, l'archivage continu des WAL permet de restaurer les données à un **instant précis** (Point-In-Time Recovery). La restauration crée un **nouveau cluster**, sous un nom différent ; le cluster d'origine n'est pas modifié.

## Informations à préparer

| Information | Exemple |
|-------------|---------|
| Projet et nom du cluster d'origine | `prod` / `orders-db` |
| Nom souhaité pour le cluster restauré | `orders-restored` |
| Instant de restauration (avec fuseau horaire) | `2026-06-15 14:30 Europe/Zurich`, ou « dernier état disponible » |

## Après la restauration

Le cluster restauré apparaît dans la liste **Clusters PostgreSQL** de votre projet. Vérifiez vos données avant de basculer vos applications :

```sql
-- Contrôler le volume de données
SELECT schemaname, relname, n_live_tup
FROM pg_stat_user_tables
ORDER BY n_live_tup DESC;
```

Mettez ensuite à jour la configuration de vos applications avec l'adresse du nouveau cluster (champ **Hôte (Host)** de sa page) et les identifiants associés.

## Restauration d'un export logique

Si vous disposez d'un export réalisé avec `pg_dump`, vous pouvez le restaurer vous-même dans une base existante :

```bash
pg_restore --no-owner --dbname "host=<hôte> port=5432 dbname=myapp user=app_user sslmode=require" \
  myapp-2026-06-15.dump
```

## Pour aller plus loin

- [Configurer les sauvegardes](./configure-backups.md)
- [Gérer les utilisateurs et bases de données](./manage-users-databases.md)
