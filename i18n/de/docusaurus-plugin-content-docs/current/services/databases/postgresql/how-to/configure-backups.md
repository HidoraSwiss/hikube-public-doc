---
title: "Automatische Backups konfigurieren"
sidebar_position: 3
---

# Automatische Backups konfigurieren

:::info Verfügbarkeit
Die Konfiguration von PostgreSQL-Backups ist in der [Hikube-Konsole](https://console.hikube.cloud) noch nicht als Self-Service verfügbar.
Um die Backups eines Clusters zu aktivieren oder zu ändern, [wenden Sie sich an den Support](mailto:support@hidora.io).
:::

## Prinzip

Hikube-PostgreSQL-Cluster können eine Datenbank in einen S3-kompatiblen Objektspeicher sichern:

- **Vollständige Backups** (Base Backups), die in regelmäßigen Abständen geplant werden;
- **Kontinuierliche WAL-Archivierung**, die eine Wiederherstellung zu einem **bestimmten Zeitpunkt** ermöglicht (PITR, Point-In-Time Recovery);
- **Aufbewahrungsrichtlinie**, die festlegt, wie lange die Backups aufbewahrt werden.

## Vorzubereitende Informationen

Geben Sie dem Support für eine Aktivierungsanfrage Folgendes an:

| Information | Beispiel |
|-------------|---------|
| Projekt und Name des Clusters | `prod` / `orders-db` |
| Häufigkeit der vollständigen Backups | Täglich um 2 Uhr |
| Aufbewahrungsdauer | 30 Tage |
| Ziel-Bucket | Ein dedizierter Bucket in [Hikube Object Storage](../../../storage/buckets/overview.md) oder ein externer S3-Speicher |

:::warning
Übermitteln Sie S3-Zugriffsschlüssel niemals über einen unsicheren Kanal. Der Support teilt Ihnen das geeignete Verfahren mit.
:::

## Logisches Backup auf Abruf

Unabhängig von den durch die Plattform verwalteten Backups können Sie eine Datenbank jederzeit mit den Standardwerkzeugen von PostgreSQL exportieren:

```bash
# Export einer Datenbank im Custom-Format
pg_dump "host=<host> port=5432 dbname=myapp user=app_user sslmode=require" \
  --format=custom --file=myapp-$(date +%F).dump
```

Der Benutzer muss auf der exportierten Datenbank über das Recht **Administrator (Admin)** oder **Read-only** verfügen.

## Weiterführende Informationen

- [Ein Backup wiederherstellen](./restore-backup.md)
- [PostgreSQL-Konzepte](../concepts.md)
