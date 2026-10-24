---
title: "Automatische Backups konfigurieren — MariaDB"
sidebar_label: "Automatische Backups konfigurieren"
sidebar_position: 3
description: "Planen Sie die Backups eines Hikube-MariaDB-Clusters in der Konsole, in einen Bucket Ihres Projekts, und exportieren Sie eine Datenbank bei Bedarf mit mysqldump."
---

# Automatische Backups konfigurieren

MariaDB-Cluster werden mit dem [Backup-Service](../../../backups/overview.md) von Hikube gesichert, über die Registerkarte **Backups** der Cluster-Seite in der [Hikube-Konsole](https://console.hikube.cloud).

## Prinzip

Jedes Backup ist ein vollständiger Export des Clusters, geplant oder auf Abruf, der in einen S3-Bucket Ihres Projekts geschrieben und gemäß der **Aufbewahrung** des Ziels aufbewahrt wird.

## Schritte

1. Erstellen Sie ein Ziel unter **Infrastructure** > **Backups** > **Destinations**: siehe [Ein Ziel erstellen](../../../backups/how-to/create-destination.md).
2. Öffnen Sie **MariaDB**, den Cluster und dann die Registerkarte **Backups**.
3. Klicken Sie auf **Schedule**, wählen Sie das Ziel und den Zeitplan, dann **Schedule**. Siehe [Backups planen](../../../backups/how-to/schedule-backups.md).

Um Backups unterschiedlich lange aufzubewahren (zum Beispiel tägliche Backups 7 Tage und wöchentliche 30 Tage), erstellen Sie zwei Ziele mit jeweils eigener Aufbewahrung und einen Zeitplan für jedes davon.

## Logisches Backup auf Abruf

Unabhängig von den durch die Plattform verwalteten Backups können Sie eine Datenbank jederzeit mit `mysqldump` (oder `mariadb-dump`) exportieren:

```bash
mysqldump -h <host> -P 3306 -u app-user -p \
  --single-transaction --routines --triggers \
  myapp > myapp-$(date +%F).sql
```

Die Option `--single-transaction` erzeugt einen konsistenten Export, ohne die InnoDB-Tabellen zu sperren.

## Weiterführende Informationen

- [Ein Backup wiederherstellen](./restore-backup.md)
- [Konzepte der Backups](../../../backups/concepts.md)
