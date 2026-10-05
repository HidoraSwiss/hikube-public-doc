---
sidebar_position: 7
title: Fehlerbehebung
---

# Fehlerbehebung — ClickHouse

:::info Verfügbarkeit
ClickHouse ist in der [Hikube-Konsole](https://console.hikube.cloud) noch nicht als Self-Service verfügbar.
Um eine Instanz bereitzustellen oder ihre Konfiguration zu ändern, [wenden Sie sich an den Support](mailto:support@hidora.io).
:::

### Langsame Abfragen bei großen Datenmengen

**Ursache**: Die Tabellen verwenden nicht die richtigen Engines oder kein passendes `ORDER BY`, die Topologie ist nicht optimal oder die zugewiesenen Ressourcen reichen nicht aus.

**Lösung**:

1. Fragen Sie auf einer geshardeten Instanz **Distributed**-Tabellen ab, um die Abfragen auf alle Shards zu verteilen.
2. Stellen Sie sicher, dass die lokalen Tabellen `ReplicatedMergeTree` mit einem `ORDER BY` verwenden, das zu Ihren häufigsten Filtern passt.
3. Analysieren Sie langsame Abfragen über das Systemprotokoll:
   ```sql
   SELECT query, elapsed, read_rows, memory_usage
   FROM system.query_log
   WHERE type = 'QueryFinish'
   ORDER BY elapsed DESC
   LIMIT 10;
   ```
4. Wenn die Ressourcen ausgelastet sind, fordern Sie beim [Support](mailto:support@hidora.io) ein größeres Preset oder zusätzliche Shards an. Siehe [Vertikal skalieren](./how-to/scale-resources.md).

### Unzureichender Speicherplatz

**Ursache**: Das Datenvolumen übersteigt die Speichergröße, oder die Systemprotokolle (`query_log`, `query_thread_log`) sammeln zu viele Daten an.

**Lösung**:

1. Ermitteln Sie die größten Tabellen:
   ```sql
   SELECT database, table, formatReadableSize(sum(bytes_on_disk)) AS size
   FROM system.parts
   WHERE active
   GROUP BY database, table
   ORDER BY sum(bytes_on_disk) DESC;
   ```
2. Löschen Sie veraltete Partitionen Ihrer Anwendungsdaten (`ALTER TABLE ... DROP PARTITION`) oder setzen Sie ein `TTL` auf Ihre Tabellen.
3. Um den Speicher oder die Volume-Größe der Protokolle zu erhöhen oder deren Aufbewahrungsdauer zu verkürzen, wenden Sie sich an den Support.

### Replikationsfehler oder Keeper nicht verfügbar

**Ursache**: ClickHouse Keeper hat kein Quorum, oder eine Replica kann sich nicht mehr synchronisieren.

**Lösung**:

1. Prüfen Sie den Zustand der replizierten Tabellen:
   ```sql
   SELECT database, table, is_readonly, absolute_delay, queue_size
   FROM system.replicas
   WHERE is_readonly OR absolute_delay > 60;
   ```
2. Eine schreibgeschützte Replica (`is_readonly = 1`) weist in der Regel auf einen Verbindungsverlust zu Keeper hin. [Wenden Sie sich an den Support](mailto:support@hidora.io) und geben Sie das Projekt, den Namen der Instanz und das Ergebnis der Abfrage an.

### Authentifizierung abgelehnt

**Ursache**: falscher Benutzer oder falsches Passwort, oder ein Benutzer mit reinem Lesezugriff versucht zu schreiben (`Not enough privileges`).

**Lösung**: Prüfen Sie die übermittelten Zugangsdaten und die Zugriffsstufe des Benutzers (`SHOW GRANTS`). Um einen Benutzer anzulegen oder seine Rechte zu ändern, wenden Sie sich an den Support. Siehe [Benutzer verwalten](./how-to/manage-users.md).
