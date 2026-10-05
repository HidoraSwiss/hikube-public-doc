---
title: "ClickHouse-Sharding konfigurieren"
sidebar_position: 3
---

# ClickHouse-Sharding konfigurieren

:::info Verfügbarkeit
ClickHouse ist in der [Hikube-Konsole](https://console.hikube.cloud) noch nicht als Self-Service verfügbar.
Um eine Instanz bereitzustellen oder ihre Konfiguration zu ändern, [wenden Sie sich an den Support](mailto:support@hidora.io).
:::

Diese Anleitung erklärt, wie Sie die Anzahl der Shards und Replicas einer ClickHouse-Instanz wählen und anschließend Tabellen erstellen, die diese Topologie nutzen.

## Schritte

### 1. Shards und Replicas verstehen

- **Shards**: verteilen die Daten horizontal. Jeder Shard enthält einen Teil der Daten. Mehr Shards = mehr Speicher- und Parallelverarbeitungskapazität.
- **Replicas**: duplizieren die Daten innerhalb jedes Shards für die Redundanz. Mehr Replicas = höhere Verfügbarkeit bei einem Ausfall.

Mit 2 Shards und 2 Replicas pro Shard umfasst die Instanz zum Beispiel insgesamt 4 ClickHouse-Knoten.

:::note
Sharding ist sinnvoll, wenn das Datenvolumen die Kapazität eines einzelnen Knotens übersteigt oder wenn Sie Abfragen auf mehrere Server parallelisieren möchten.
:::

### 2. Topologie anfragen

[Wenden Sie sich an den Support](mailto:support@hidora.io) und geben Sie die Anzahl der Shards, die Anzahl der Replicas pro Shard, das Preset und die Speichergröße an. Eine replizierte oder geshardete Konfiguration stützt sich auf **ClickHouse Keeper** (3 Instanzen empfohlen, immer in ungerader Anzahl).

### 3. Verteilte Tabellen erstellen

Erstellen Sie auf einer geshardeten Instanz auf jedem Shard eine replizierte lokale Tabelle und anschließend eine `Distributed`-Tabelle, die die Abfragen verteilt:

```sql
-- Lokale Tabelle, auf allen Knoten des Clusters erstellt
CREATE TABLE default.events_local ON CLUSTER '{cluster}'
(
    ts DateTime,
    user_id UInt64,
    action String
)
ENGINE = ReplicatedMergeTree
ORDER BY (ts, user_id);

-- Verteilte Tabelle, Einstiegspunkt der Abfragen
CREATE TABLE default.events ON CLUSTER '{cluster}'
AS default.events_local
ENGINE = Distributed('{cluster}', default, events_local, cityHash64(user_id));
```

:::tip
Wählen Sie einen Verteilungsschlüssel (hier `cityHash64(user_id)`), der die Daten gleichmäßig verteilt und gemeinsam abgefragte Daten zusammenfasst.
:::

## Überprüfung

```sql
-- Topologie aus Sicht von ClickHouse
SELECT cluster, shard_num, replica_num, host_name
FROM system.clusters;

-- Verteilung der Zeilen pro Shard
SELECT _shard_num, count() FROM default.events GROUP BY _shard_num;
```

## Weiterführende Informationen

- [ClickHouse-Konzepte](../concepts.md): Sharding, Replikation, Keeper
- [Vertikal skalieren](./scale-resources.md)
