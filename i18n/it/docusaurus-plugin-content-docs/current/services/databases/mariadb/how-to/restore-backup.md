---
title: "Come ripristinare un backup"
sidebar_position: 4
description: "Ripristini un cluster MariaDB Hikube dalla console, sul cluster di origine o su un altro cluster, oppure riesegua lei stesso un'esportazione mysqldump."
---

# Come ripristinare un backup

Un archivio MariaDB si ripristina dalla scheda **Backups** della pagina del cluster, nella [console Hikube](https://console.hikube.cloud), oppure da **Infrastructure** > **Backups** > **Archives**. Vedere [Ripristinare un database PostgreSQL o MariaDB](../../../backups/how-to/restore-database.md).

Il ripristino scrive **sul cluster di origine** oppure **su un altro cluster MariaDB** esistente del progetto. L'archivio viene rieseguito nel target: ogni tabella che contiene sostituisce la tabella con lo stesso nome; le tabelle e i database che non contiene vengono conservati.

## Ripristino di un'esportazione logica

Se dispone di un'esportazione eseguita con `mysqldump`, può ripristinarla autonomamente in un database esistente. L'utente deve disporre del diritto **Administrator (Admin)** sul database di destinazione:

```bash
mysql -h <host> -P 3306 -u app-user -p myapp < myapp-2026-06-15.sql
```

## Verifica

```sql
-- Controllare il numero di righe delle tabelle ripristinate
SELECT table_name, table_rows
FROM information_schema.tables
WHERE table_schema = 'myapp'
ORDER BY table_rows DESC;
```

## Per approfondire

- [Configurare i backup](./configure-backups.md)
- [Gestire utenti e database](./manage-users-databases.md)
