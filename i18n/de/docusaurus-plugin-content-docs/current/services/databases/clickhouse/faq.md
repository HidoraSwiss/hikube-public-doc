---
sidebar_position: 6
title: FAQ
---

# FAQ — ClickHouse

:::info Verfügbarkeit
ClickHouse ist in der [Hikube-Konsole](https://console.hikube.cloud) noch nicht als Self-Service verfügbar.
Um eine Instanz bereitzustellen oder ihre Konfiguration zu ändern, [wenden Sie sich an den Support](mailto:support@hidora.io).
:::

### Was ist der Unterschied zwischen Shards und Replicas?

**Shards** und **Replicas** übernehmen in der ClickHouse-Architektur unterschiedliche Rollen:

- **Shards**: **horizontale** Verteilung der Daten. Jeder Shard enthält einen Teil des gesamten Datensatzes. Zusätzliche Shards erhöhen die Speicher- und Verarbeitungskapazität.
- **Replicas**: **identische** Kopien der Daten innerhalb desselben Shards, für die Hochverfügbarkeit.

2 Shards mit jeweils 3 Replicas ergeben zum Beispiel 6 ClickHouse-Knoten.

:::tip
Sehen Sie in der Produktion mindestens 2 Replicas pro Shard für die Hochverfügbarkeit vor. Erhöhen Sie die Anzahl der Shards, um größere Datenmengen zu verarbeiten.
:::

### Wozu dient ClickHouse Keeper?

**ClickHouse Keeper** ist die Koordinationskomponente des Clusters und basiert auf dem **Raft**-Protokoll. Es ersetzt Apache ZooKeeper und übernimmt:

- Die **Leader-Wahl** für replizierte Tabellen
- Die **Koordination** der Replikationsvorgänge zwischen den Replicas
- Die Verwaltung der **Metadaten** des Clusters

Die Anzahl der Keeper-Instanzen muss **ungerade** sein (3 oder 5), um das Quorum zu gewährleisten. Das empfohlene Minimum ist **3**.

### Eignet sich ClickHouse für transaktionale Abfragen (OLTP)?

**Nein.** ClickHouse ist eine **OLAP**-Engine (Online Analytical Processing), die für die Datenanalyse optimiert ist:

- **Spaltenorientierte** Architektur: sehr leistungsfähig für Aggregationen und Scans über große Datenmengen
- Optimiert für **massive Lesezugriffe** und analytische Abfragen
- **Nicht geeignet** für häufige transaktionale Operationen (einzelne `UPDATE`, `DELETE`)

Für eine transaktionale Engine verwenden Sie besser [PostgreSQL](../postgresql/overview.md) oder [MariaDB](../mariadb/overview.md), die in der Konsole verfügbar sind.

### Welche Presets sind verfügbar?

| **Preset** | **CPU** | **Arbeitsspeicher** |
|------------|---------|-------------|
| `nano`     | 250m    | 128Mi       |
| `micro`    | 500m    | 256Mi       |
| `small`    | 1       | 512Mi       |
| `medium`   | 1       | 1Gi         |
| `large`    | 2       | 2Gi         |
| `xlarge`   | 4       | 4Gi         |
| `2xlarge`  | 8       | 8Gi         |

Das Preset gilt für jede Replica. Geben Sie es in Ihrer Anfrage an den Support an.

### Wie werden die Daten auf die Shards verteilt?

Die Daten werden über die **Distributed**-Engine von ClickHouse auf die Shards verteilt:

- Jeder Shard speichert eine **Partition** des gesamten Datensatzes
- Die `Distributed`-Engine leitet die Abfragen an alle Shards weiter und **führt die Ergebnisse zusammen**
- Die Daten werden innerhalb jedes Shards entsprechend der Anzahl der Replicas **repliziert**

Erstellen Sie auf jedem Shard `ReplicatedMergeTree`-Tabellen und eine `Distributed`-Tabelle für globale Abfragen. Siehe [Sharding konfigurieren](./how-to/configure-sharding.md).

### Wie konfiguriere ich ClickHouse-Backups?

ClickHouse-Backups senden verschlüsselte Snapshots an einen S3-kompatiblen Speicher. Sie werden auf Anfrage eingerichtet: [Wenden Sie sich an den Support](mailto:support@hidora.io) und geben Sie die gewünschte Häufigkeit und Aufbewahrungsdauer an.
