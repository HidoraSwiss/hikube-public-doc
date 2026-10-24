---
title: "Ein Backup wiederherstellen"
sidebar_position: 4
description: "Stellen Sie einen Hikube-MariaDB-Cluster in der Konsole wieder her, auf dem ursprünglichen Cluster oder auf einem anderen Cluster, oder spielen Sie selbst einen mysqldump-Export ein."
---

# Ein Backup wiederherstellen

Ein MariaDB-Archiv wird über die Registerkarte **Backups** der Cluster-Seite in der [Hikube-Konsole](https://console.hikube.cloud) wiederhergestellt oder über **Infrastructure** > **Backups** > **Archives**. Siehe [Eine PostgreSQL- oder MariaDB-Datenbank wiederherstellen](../../../backups/how-to/restore-database.md).

Die Wiederherstellung schreibt entweder **auf den ursprünglichen Cluster** oder **auf einen anderen bestehenden MariaDB-Cluster** des Projekts. Das Archiv wird im Ziel eingespielt: Jede darin enthaltene Tabelle ersetzt die gleichnamige Tabelle; Tabellen und Datenbanken, die es nicht enthält, bleiben erhalten.

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
