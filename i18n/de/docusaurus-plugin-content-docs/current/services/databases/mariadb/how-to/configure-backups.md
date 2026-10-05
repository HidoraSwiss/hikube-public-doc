---
title: "Automatische Backups konfigurieren"
sidebar_position: 3
---

# Automatische Backups konfigurieren

:::info Verfügbarkeit
Die Konfiguration von MariaDB-Backups ist in der [Hikube-Konsole](https://console.hikube.cloud) noch nicht als Self-Service verfügbar.
Um die Backups eines Clusters zu aktivieren oder zu ändern, [wenden Sie sich an den Support](mailto:support@hidora.io).
:::

## Prinzip

Die Backups der MariaDB-Cluster beruhen auf **verschlüsselten** Snapshots, die an einen S3-kompatiblen Objektspeicher gesendet werden, in regelmäßigen Abständen geplant sind und einer **Aufbewahrungsstrategie** unterliegen, die ihre Aufbewahrungsdauer festlegt.

## Vorzubereitende Informationen

Geben Sie dem Support für eine Aktivierungsanfrage Folgendes an:

| Information | Beispiel |
|-------------|---------|
| Projekt und Name des Clusters | `prod` / `shop-db` |
| Häufigkeit der Backups | Täglich um 2 Uhr |
| Gewünschte Aufbewahrung | 7 tägliche, 4 wöchentliche Backups |
| Ziel-Bucket | Ein dedizierter Bucket in [Hikube Object Storage](../../../storage/buckets/overview.md) oder ein externer S3-Speicher |

:::warning
Übermitteln Sie S3-Zugriffsschlüssel niemals über einen unsicheren Kanal. Der Support teilt Ihnen das geeignete Verfahren mit.
:::

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
- [MariaDB-Konzepte](../concepts.md)
