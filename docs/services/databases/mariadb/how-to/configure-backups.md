---
title: "Comment configurer les sauvegardes automatiques"
sidebar_position: 3
---

# Comment configurer les sauvegardes automatiques

:::info Disponibilité
La configuration des sauvegardes MariaDB n'est pas encore disponible en libre-service dans la [console Hikube](https://console.hikube.cloud).
Pour activer ou modifier les sauvegardes d'un cluster, [contactez le support](mailto:support@hidora.io).
:::

## Principe

Les sauvegardes des clusters MariaDB reposent sur des snapshots **chiffrés** envoyés vers un stockage objet compatible S3, planifiés à intervalle régulier et soumis à une **stratégie de rétention** qui détermine leur durée de conservation.

## Informations à préparer

Pour une demande d'activation, indiquez au support :

| Information | Exemple |
|-------------|---------|
| Projet et nom du cluster | `prod` / `shop-db` |
| Fréquence des sauvegardes | Tous les jours à 2h |
| Rétention souhaitée | 7 sauvegardes quotidiennes, 4 hebdomadaires |
| Bucket de destination | Un bucket [Hikube Object Storage](../../../storage/buckets/overview.md) dédié ou un stockage S3 externe |

:::warning
Ne transmettez jamais de clés d'accès S3 par un canal non sécurisé. Le support vous indiquera la procédure adaptée.
:::

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
- [Concepts MariaDB](../concepts.md)
