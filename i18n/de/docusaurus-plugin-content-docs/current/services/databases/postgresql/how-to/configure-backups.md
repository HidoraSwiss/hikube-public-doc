---
title: "Automatische Backups konfigurieren — PostgreSQL"
sidebar_label: "Automatische Backups konfigurieren"
sidebar_position: 3
description: "Planen Sie die Backups eines Hikube-PostgreSQL-Clusters in der Konsole, in einen Bucket Ihres Projekts, und exportieren Sie eine Datenbank bei Bedarf mit pg_dump."
---

# Automatische Backups konfigurieren

PostgreSQL-Cluster werden mit dem [Backup-Service](../../../backups/overview.md) von Hikube gesichert, über die Registerkarte **Backups** der Cluster-Seite in der [Hikube-Konsole](https://console.hikube.cloud).

## Prinzip

- **Vollständige Backups**, geplant oder auf Abruf, die in einen S3-Bucket Ihres Projekts geschrieben werden;
- **Kontinuierliche Archivierung der Transaktionsprotokolle** zwischen zwei Backups, die eine Wiederherstellung der Datenbank zu einem bestimmten Zeitpunkt ermöglicht;
- **Aufbewahrung** in Tagen, festgelegt durch das Ziel.

## Schritte

1. Erstellen Sie ein Ziel unter **Infrastructure** > **Backups** > **Destinations**: siehe [Ein Ziel erstellen](../../../backups/how-to/create-destination.md).
2. Öffnen Sie **PostgreSQL**, den Cluster und dann die Registerkarte **Backups**.
3. Klicken Sie auf **Schedule**, wählen Sie das Ziel und den Zeitplan, dann **Schedule**. Siehe [Backups planen](../../../backups/how-to/schedule-backups.md).

:::warning Nur ein Ziel pro Cluster
Alle Backups desselben PostgreSQL-Clusters müssen dasselbe Ziel verwenden: Ein zweites Ziel wird abgelehnt.
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
- [Konzepte der Backups](../../../backups/concepts.md)
