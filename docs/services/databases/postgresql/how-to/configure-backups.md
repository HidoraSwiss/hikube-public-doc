---
title: "Comment configurer les sauvegardes automatiques"
sidebar_position: 3
---

# Comment configurer les sauvegardes automatiques

:::info Disponibilité
La configuration des sauvegardes PostgreSQL n'est pas encore disponible en libre-service dans la [console Hikube](https://console.hikube.cloud).
Pour activer ou modifier les sauvegardes d'un cluster, [contactez le support](mailto:support@hidora.io).
:::

## Principe

Les clusters PostgreSQL Hikube reposent sur l'opérateur **CloudNativePG**, qui sait sauvegarder une base vers un stockage objet compatible S3 :

- **Sauvegardes complètes** (base backups) planifiées à intervalle régulier ;
- **Archivage continu des WAL**, qui permet la restauration à un instant précis (PITR, Point-In-Time Recovery) ;
- **Politique de rétention** qui détermine la durée de conservation des sauvegardes.

## Informations à préparer

Pour une demande d'activation, indiquez au support :

| Information | Exemple |
|-------------|---------|
| Projet et nom du cluster | `prod` / `orders-db` |
| Fréquence des sauvegardes complètes | Tous les jours à 2h |
| Durée de rétention | 30 jours |
| Bucket de destination | Un bucket [Hikube Object Storage](../../../storage/buckets/overview.md) dédié ou un stockage S3 externe |

:::warning
Ne transmettez jamais de clés d'accès S3 par un canal non sécurisé. Le support vous indiquera la procédure adaptée.
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
- [Concepts PostgreSQL](../concepts.md)
