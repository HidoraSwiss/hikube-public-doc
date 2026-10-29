---
title: "ClickHouse vertikal skalieren"
description: "Messen Sie Speicher- und Plattennutzung einer ClickHouse-Instanz auf Hikube und fordern Sie beim Support ein anderes Preset oder mehr Speicherplatz an."
sidebar_position: 2
---

# ClickHouse vertikal skalieren

:::info Verfügbarkeit
ClickHouse ist in der [Hikube-Konsole](https://console.hikube.cloud) noch nicht als Self-Service verfügbar.
Um eine Instanz bereitzustellen oder ihre Konfiguration zu ändern, [wenden Sie sich an den Support](mailto:support@hidora.io).
:::

Diese Anleitung hilft Ihnen zu entscheiden, wann und wie Sie die Ressourcen einer ClickHouse-Instanz erhöhen.

## Verfügbare Presets

Die Ressourcen jeder ClickHouse-Replica werden durch ein Preset festgelegt:

| Preset | CPU | Arbeitsspeicher |
|--------|-----|---------|
| `t1.nano` | 250m | 128Mi |
| `t1.micro` | 500m | 256Mi |
| `t1.small` | 1 | 512Mi |
| `c1.small` | 1 | 1Gi |
| `c1.medium` | 2 | 2Gi |
| `c1.large` | 4 | 4Gi |
| `c1.xlarge` | 8 | 8Gi |

## Schritte

### 1. Aktuellen Verbrauch messen

Ermitteln Sie die Abfragen mit dem höchsten Speicherbedarf:

```sql
SELECT query, memory_usage, elapsed
FROM system.query_log
WHERE type = 'QueryFinish'
ORDER BY memory_usage DESC
LIMIT 10;
```

Sowie den belegten Speicherplatz pro Tabelle:

```sql
SELECT database, table, formatReadableSize(sum(bytes_on_disk)) AS size
FROM system.parts
WHERE active
GROUP BY database, table
ORDER BY sum(bytes_on_disk) DESC;
```

### 2. Änderung anfragen

[Wenden Sie sich an den Support](mailto:support@hidora.io) und geben Sie das Projekt, den Namen der Instanz und das Ziel an: Preset, Speichergröße oder Anzahl der Shards, wenn ein einzelner Knoten nicht mehr ausreicht (siehe [Sharding konfigurieren](./configure-sharding.md)).

:::warning
Ein Wechsel des Presets startet die Replicas neu. Mit mehreren Replicas pro Shard bleibt der Dienst während des Vorgangs verfügbar.
:::

## Überprüfung

Kontrollieren Sie nach dem Eingriff die Ressourcen aus Sicht von ClickHouse:

```sql
SELECT name, value FROM system.settings WHERE name = 'max_memory_usage';
SELECT * FROM system.disks;
```

## Weiterführende Informationen

- [ClickHouse-Konzepte](../concepts.md)
- [Sharding konfigurieren](./configure-sharding.md)
