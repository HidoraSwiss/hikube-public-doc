---
title: "Comment restaurer une sauvegarde"
sidebar_position: 4
---

# Comment restaurer une sauvegarde

:::info Disponibilité
La restauration de sauvegardes MariaDB n'est pas encore disponible en libre-service dans la [console Hikube](https://console.hikube.cloud).
Pour restaurer un cluster à partir d'une sauvegarde gérée par la plateforme, [contactez le support](mailto:support@hidora.io).
:::

## Informations à préparer

| Information | Exemple |
|-------------|---------|
| Projet et nom du cluster | `prod` / `shop-db` |
| Sauvegarde à restaurer | La plus récente, ou une date précise |

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
