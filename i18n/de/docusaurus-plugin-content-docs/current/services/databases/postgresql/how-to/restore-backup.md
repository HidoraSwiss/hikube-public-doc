---
title: "Ein Backup wiederherstellen (PITR)"
sidebar_position: 4
description: "Stellen Sie einen Hikube-PostgreSQL-Cluster in der Konsole wieder her: Stand eines Backups, neuester Stand oder bestimmter Zeitpunkt, auf dem ursprünglichen Cluster oder auf einem anderen Cluster."
---

# Ein Backup wiederherstellen (PITR)

Ein PostgreSQL-Archiv wird über die Registerkarte **Backups** der Cluster-Seite in der [Hikube-Konsole](https://console.hikube.cloud) wiederhergestellt oder über **Infrastructure** > **Backups** > **Archives**.

## Prinzip

Dank der kontinuierlichen Archivierung der Transaktionsprotokolle kann eine Wiederherstellung die Datenbank zurückversetzen:

- auf den **exakten Stand eines Backups**;
- auf ihren **neuesten Stand**;
- auf einen **bestimmten Zeitpunkt** (PITR, *Point-In-Time Recovery*) zwischen zwei Backups.

Die Wiederherstellung schreibt entweder **auf den ursprünglichen Cluster**, dessen Inhalt überschrieben wird, oder **auf einen anderen bestehenden PostgreSQL-Cluster** des Projekts mit derselben Hauptversion.

## Schritte

- [Eine PostgreSQL- oder MariaDB-Datenbank wiederherstellen](../../../backups/how-to/restore-database.md)
- [Eine PostgreSQL-Datenbank zu einem bestimmten Zeitpunkt wiederherstellen](../../../backups/how-to/restore-point-in-time.md)

## Nach der Wiederherstellung

Prüfen Sie Ihre Daten, bevor Sie Ihre Anwendungen wieder in Betrieb nehmen:

```sql
-- Datenvolumen kontrollieren
SELECT schemaname, relname, n_live_tup
FROM pg_stat_user_tables
ORDER BY n_live_tup DESC;
```

Wenn Sie auf einem anderen Cluster wiederhergestellt haben, aktualisieren Sie die Konfiguration Ihrer Anwendungen mit seiner Adresse (Bereiche **Internal** und **External** auf seiner Seite) und seinen Zugangsdaten.

## Wiederherstellung eines logischen Exports

Wenn Sie über einen mit `pg_dump` erstellten Export verfügen, können Sie ihn selbst in einer bestehenden Datenbank wiederherstellen:

```bash
pg_restore --no-owner --dbname "host=<host> port=5432 dbname=myapp user=app_user sslmode=require" \
  myapp-2026-06-15.dump
```

## Weiterführende Informationen

- [Backups konfigurieren](./configure-backups.md)
- [Benutzer und Datenbanken verwalten](./manage-users-databases.md)
