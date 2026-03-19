---
sidebar_position: 6
title: FAQ
---

# FAQ — ClickHouse

### Was ist der Unterschied zwischen Shards und Replikas?

**Shards** und **Replikas** spielen unterschiedliche Rollen in der ClickHouse-Architektur:

- **Shards**: **Horizontale** Verteilung der Daten. Jeder Shard enthält einen Teil des Gesamtdatasets. Mehr Shards erhöhen die Speicher- und Verarbeitungskapazität.
- **Replikas**: **Identische** Kopien der Daten innerhalb eines Shards. Jedes Replika enthält die gleichen Daten für Hochverfügbarkeit.

```yaml title="clickhouse.yaml"
spec:
  shards: 2       # Daten werden auf 2 Shards verteilt
  replicas: 3     # Jeder Shard hat 3 Kopien (insgesamt: 6 Pods)
```

:::tip
Verwenden Sie in der Produktion mindestens 2 Replikas pro Shard für Hochverfügbarkeit. Erhöhen Sie die Anzahl der Shards, um größere Datenvolumen zu verarbeiten.
:::

### Wofür dient ClickHouse Keeper?

**ClickHouse Keeper** ist die Cluster-Koordinationskomponente, basierend auf dem **Raft**-Protokoll. Er ersetzt Apache ZooKeeper und gewährleistet:

- Die **Leader-Wahl** für replizierte Tabellen
- Die **Koordination** der Replikationsvorgänge zwischen Replikas
- Die Verwaltung der **Cluster-Metadaten**

Die Anzahl der Keeper-Replikas muss **ungerade** sein (3 oder 5), um das Quorum zu gewährleisten (Mehrheit erforderlich für die Leader-Wahl). Das empfohlene Minimum sind **3 Replikas**.

```yaml title="clickhouse.yaml"
spec:
  clickhouseKeeper:
    enabled: true
    replicas: 3        # Immer ungerade: 3 oder 5
    resourcesPreset: micro
    size: 2Gi
```

### Ist ClickHouse für transaktionale Abfragen (OLTP) geeignet?

**Nein.** ClickHouse ist eine **OLAP**-Datenbank-Engine (Online Analytical Processing), optimiert für Datenanalyse:

- **Spaltenorientierte** Architektur: sehr leistungsfähig für Aggregationen und Scans über große Datenvolumen
- Optimiert für **massives Lesen** und analytische Abfragen
- **Nicht geeignet** für häufige transaktionale Operationen (einzelne `UPDATE`, `DELETE`)

Wenn Sie eine transaktionale Engine (OLTP) benötigen, verwenden Sie stattdessen **PostgreSQL** oder **MySQL** auf Hikube.

### Was ist der Unterschied zwischen `resourcesPreset` und `resources`?

Das Feld `resourcesPreset` ermöglicht die Auswahl eines vordefinierten Ressourcenprofils für jedes ClickHouse-Replika. Wenn das Feld `resources` (explizite CPU/Speicher) definiert ist, wird `resourcesPreset` **vollständig ignoriert**.

| **Preset** | **CPU** | **Speicher** |
|------------|---------|-------------|
| `nano`     | 250m    | 128Mi       |
| `micro`    | 500m    | 256Mi       |
| `small`    | 1       | 512Mi       |
| `medium`   | 1       | 1Gi         |
| `large`    | 2       | 2Gi         |
| `xlarge`   | 4       | 4Gi         |
| `2xlarge`  | 8       | 8Gi         |

```yaml title="clickhouse.yaml"
spec:
  # Verwendung eines Presets
  resourcesPreset: large

  # ODER explizite Konfiguration (das Preset wird dann ignoriert)
  resources:
    cpu: 4000m
    memory: 8Gi
```

### Wie werden die Daten zwischen Shards verteilt?

Die Daten werden zwischen Shards über die **Distributed**-Engine von ClickHouse verteilt:

- Jeder Shard speichert eine **Partition** des Gesamtdatasets
- Die `Distributed`-Engine leitet Abfragen an alle Shards weiter und **fusioniert die Ergebnisse**
- Die Daten werden innerhalb jedes Shards gemäß der konfigurierten Replika-Anzahl **repliziert**

Um von der Verteilung zu profitieren, erstellen Sie Tabellen mit der `ReplicatedMergeTree`-Engine auf jedem Shard und eine `Distributed`-Tabelle für globale Abfragen.

### Wie konfiguriere ich ClickHouse-Backups?

Die ClickHouse-Sicherungen verwenden **Restic** für den Versand an S3-kompatiblen Speicher. Konfigurieren Sie den Abschnitt `backup`:

```yaml title="clickhouse.yaml"
spec:
  backup:
    enabled: true
    s3Region: eu-central-1
    s3Bucket: s3.example.com/clickhouse-backups
    schedule: "0 3 * * *"
    cleanupStrategy: "--keep-last=7 --keep-daily=7 --keep-weekly=4"
    s3AccessKey: your-access-key
    s3SecretKey: your-secret-key
    resticPassword: your-restic-password
```

:::warning
Bewahren Sie das `resticPassword` an einem sicheren Ort auf. Ohne dieses Passwort können die Sicherungen nicht entschlüsselt werden.
:::
