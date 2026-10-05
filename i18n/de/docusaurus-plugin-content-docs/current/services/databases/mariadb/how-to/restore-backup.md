---
title: "Ein Backup wiederherstellen"
sidebar_position: 4
---

# Ein Backup wiederherstellen

:::info Verfügbarkeit
Die Wiederherstellung von MariaDB-Backups ist in der [Hikube-Konsole](https://console.hikube.cloud) noch nicht als Self-Service verfügbar.
Um einen Cluster aus einem von der Plattform verwalteten Backup wiederherzustellen, [wenden Sie sich an den Support](mailto:support@hidora.io).
:::

## Vorzubereitende Informationen

| Information | Beispiel |
|-------------|---------|
| Projekt und Name des Clusters | `prod` / `shop-db` |
| Wiederherzustellendes Backup | Das neueste oder ein bestimmtes Datum |

## Wiederherstellung eines logischen Exports

Wenn Sie über einen mit `mysqldump` erstellten Export verfügen, stellen Sie ihn selbst in einer bestehenden Datenbank wieder her. Der Benutzer muss auf der Zieldatenbank über das Recht **Administrator (Admin)** verfügen:

```bash
mysql -h <host> -P 3306 -u app-user -p myapp < myapp-2026-06-15.sql
```

## Überprüfung

```sql
-- Anzahl der Zeilen der wiederhergestellten Tabellen kontrollieren
SELECT table_name, table_rows
FROM information_schema.tables
WHERE table_schema = 'myapp'
ORDER BY table_rows DESC;
```

## Weiterführende Informationen

- [Backups konfigurieren](./configure-backups.md)
- [Benutzer und Datenbanken verwalten](./manage-users-databases.md)
