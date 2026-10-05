---
title: "Ein Backup wiederherstellen (PITR)"
sidebar_position: 4
---

# Ein Backup wiederherstellen (PITR)

:::info Verfügbarkeit
Die Wiederherstellung von PostgreSQL-Backups ist in der [Hikube-Konsole](https://console.hikube.cloud) noch nicht als Self-Service verfügbar.
Um einen Cluster wiederherzustellen, [wenden Sie sich an den Support](mailto:support@hidora.io).
:::

## Prinzip

Wenn auf einem Cluster Backups aktiviert sind, ermöglicht die kontinuierliche WAL-Archivierung, die Daten zu einem **bestimmten Zeitpunkt** wiederherzustellen (Point-In-Time Recovery). Die Wiederherstellung erstellt einen **neuen Cluster** unter einem anderen Namen; der ursprüngliche Cluster wird nicht verändert.

## Vorzubereitende Informationen

| Information | Beispiel |
|-------------|---------|
| Projekt und Name des ursprünglichen Clusters | `prod` / `orders-db` |
| Gewünschter Name für den wiederhergestellten Cluster | `orders-restored` |
| Wiederherstellungszeitpunkt (mit Zeitzone) | `2026-06-15 14:30 Europe/Zurich` oder „letzter verfügbarer Stand“ |

## Nach der Wiederherstellung

Der wiederhergestellte Cluster erscheint in der Liste **PostgreSQL Clusters** Ihres Projekts. Prüfen Sie Ihre Daten, bevor Sie Ihre Anwendungen umstellen:

```sql
-- Datenvolumen kontrollieren
SELECT schemaname, relname, n_live_tup
FROM pg_stat_user_tables
ORDER BY n_live_tup DESC;
```

Aktualisieren Sie anschließend die Konfiguration Ihrer Anwendungen mit der Adresse des neuen Clusters (Feld **Host** auf seiner Seite) und den zugehörigen Zugangsdaten.

## Wiederherstellung eines logischen Exports

Wenn Sie über einen mit `pg_dump` erstellten Export verfügen, können Sie ihn selbst in einer bestehenden Datenbank wiederherstellen:

```bash
pg_restore --no-owner --dbname "host=<host> port=5432 dbname=myapp user=app_user sslmode=require" \
  myapp-2026-06-15.dump
```

## Weiterführende Informationen

- [Backups konfigurieren](./configure-backups.md)
- [Benutzer und Datenbanken verwalten](./manage-users-databases.md)
