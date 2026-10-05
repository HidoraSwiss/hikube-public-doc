---
title: "ClickHouse-Benutzer und -Profile verwalten"
sidebar_position: 1
---

# ClickHouse-Benutzer und -Profile verwalten

:::info Verfügbarkeit
ClickHouse ist in der [Hikube-Konsole](https://console.hikube.cloud) noch nicht als Self-Service verfügbar.
Um eine Instanz bereitzustellen oder ihre Konfiguration zu ändern, [wenden Sie sich an den Support](mailto:support@hidora.io).
:::

Diese Anleitung stellt die Optionen zur Benutzerverwaltung einer ClickHouse-Instanz auf Hikube vor und zeigt, wie Sie deren Berechtigungen überprüfen.

## Verfügbare Optionen

Die Benutzer einer ClickHouse-Instanz werden von der Plattform auf Anfrage beim Support festgelegt. Geben Sie für jeden Benutzer Folgendes an:

| Option | Beschreibung |
|--------|-------------|
| Benutzername | Anmeldekennung |
| Zugriff | **Vollzugriff** (Lesen und Schreiben) oder **nur Lesen** (ausschließlich `SELECT`-Abfragen) |

Die Aufbewahrung der Abfrageprotokolle (`system.query_log`, `system.query_thread_log`) und die Größe des dafür vorgesehenen Speichers werden ebenfalls auf Anfrage eingestellt.

:::tip
Legen Sie für Analyse- und Reporting-Tools (Grafana, Metabase usw.) einen Benutzer mit reinem Lesezugriff an. Das verringert das Risiko versehentlicher Datenänderungen.
:::

## Schritte

### 1. Anlegen oder Ändern eines Benutzers anfragen

[Wenden Sie sich an den Support](mailto:support@hidora.io) und geben Sie das Projekt, den Namen der Instanz, den Benutzernamen und die gewünschte Zugriffsstufe an.

### 2. Mit clickhouse-client verbinden

```bash
clickhouse-client --host <host> --port 9000 --user analyst --password
```

### 3. Berechtigungen überprüfen

Prüfen Sie nach der Anmeldung mit einem Benutzer mit reinem Lesezugriff, dass Schreibvorgänge blockiert werden:

```sql
-- Diese Abfrage muss erfolgreich sein (Lesen erlaubt)
SELECT count() FROM system.tables;

-- Diese Abfrage muss fehlschlagen (Schreiben verboten)
CREATE TABLE test_write (id UInt32) ENGINE = Memory;
```

Der Benutzer mit reinem Lesezugriff erhält einen Fehler wie:

```console
Code: 164. DB::Exception: analyst: Not enough privileges.
```

## Überprüfung

```sql
SHOW GRANTS;
```

## Weiterführende Informationen

- [ClickHouse-Konzepte](../concepts.md)
- [Fehlerbehebung](../troubleshooting.md)
