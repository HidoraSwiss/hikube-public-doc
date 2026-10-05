---
title: "Topics erstellen und verwalten"
---

# Topics erstellen und verwalten

:::info Verfügbarkeit
Kafka ist in der [Hikube-Konsole](https://console.hikube.cloud) noch nicht als Self-Service verfügbar.
Um eine Instanz bereitzustellen oder ihre Konfiguration zu ändern, [wenden Sie sich an den Support](mailto:support@hidora.io).
:::

Diese Anleitung stellt die Parameter eines Kafka-Topics auf Hikube vor (Partitionen, Replicas, Aufbewahrung, Cleanup-Policy) und zeigt, wie Sie die Konfiguration von einem Kafka-Client aus überprüfen.

Die verwalteten Topics sind Teil der Konfiguration der Instanz: Ihre Erstellung und Änderung beantragen Sie beim Support. Diese Option wird in der Konsole nicht angeboten; wenden Sie sich an den Support.

## Voraussetzungen

- Ein auf Hikube bereitgestellter **Kafka**-Cluster und die Adresse seiner Bootstrap-Server (`<bootstrap-servers>`)
- Die Kafka-Client-Skripte (`kafka-topics.sh`), auf Ihrem Rechner installiert

## Schritte

### 1. Topics festlegen

Bereiten Sie für jeden Topic Folgendes vor:

| Parameter | Beschreibung |
|-----------|-------------|
| Name | Name des Topics |
| Partitionen | Anzahl der Partitionen (Parallelität beim Konsumieren) |
| Replicas | Anzahl der Kopien jeder Partition (Dauerhaftigkeit der Daten) |
| Optionen | Erweiterte Konfiguration des Topics (siehe unten) |

:::warning
Die Anzahl der Replicas eines Topics darf die Anzahl der verfügbaren Broker nicht übersteigen. Mit 3 Brokern liegt das Maximum zum Beispiel bei 3 Replicas.
:::

### 2. Aufbewahrung und Cleanup-Policy wählen

Die beiden wichtigsten Cleanup-Policies sind:

- **`delete`**: Die Nachrichten werden nach Ablauf der Aufbewahrungsdauer (`retention.ms`) gelöscht
- **`compact`**: Nur der letzte Wert jedes Schlüssels wird aufbewahrt (ideal für Referenztabellen und Zustände)

**Gängige Konfigurationsoptionen:**

| Parameter | Beschreibung | Beispiel |
|-----------|-------------|---------|
| `cleanup.policy` | Cleanup-Policy: `delete` oder `compact` | `"delete"` |
| `retention.ms` | Aufbewahrungsdauer der Nachrichten in Millisekunden | `"604800000"` (7 Tage) |
| `min.insync.replicas` | Mindestanzahl synchronisierter Replicas, um einen Schreibvorgang zu bestätigen | `"2"` |
| `segment.ms` | Dauer bis zur Rotation eines Log-Segments (in ms) | `"3600000"` (1 Stunde) |
| `max.compaction.lag.ms` | Maximale Verzögerung bis zur Compaction einer Nachricht (in ms) | `"5400000"` (1 h 30) |

:::tip
Sehen Sie für Produktions-Topics `min.insync.replicas: "2"` mit 3 Replicas vor. Dann bestätigen mindestens 2 Broker jeden Schreibvorgang, was bei einem Broker-Ausfall vor Datenverlust schützt.
:::

### 3. Anfrage übermitteln

Senden Sie die Liste der Topics und ihrer Optionen an den [Support](mailto:support@hidora.io) und geben Sie das Projekt und den Namen der Kafka-Instanz an.

### 4. Topics überprüfen

Sobald die Konfiguration angewendet ist, listen Sie die Topics von Ihrem Client aus auf:

```bash
kafka-topics.sh --bootstrap-server <bootstrap-servers> --list
```

**Erwartetes Ergebnis:**

```console
events
orders
```

Um die Details eines Topics anzuzeigen:

```bash
kafka-topics.sh --bootstrap-server <bootstrap-servers> --describe --topic events
```

**Erwartetes Ergebnis:**

```console
Topic: events   TopicId: AbC123...   PartitionCount: 6   ReplicationFactor: 3
  Topic: events   Partition: 0   Leader: 1   Replicas: 1,2,0   Isr: 1,2,0
  Topic: events   Partition: 1   Leader: 2   Replicas: 2,0,1   Isr: 2,0,1
  ...
```

## Überprüfung

Die Konfiguration ist korrekt, wenn:

- Die Topics in der Liste erscheinen (`--list`)
- Die Anzahl der Partitionen und der Replikationsfaktor Ihrer Anfrage entsprechen
- Die ISR (In-Sync Replicas) die erwartete Anzahl von Brokern enthalten

## Weiterführende Informationen

- **[Konzepte](../concepts.md)**: Topics, Partitionen und Replikation
- **[Kafka-Cluster skalieren](./scale-resources.md)**: Ressourcen der Broker und von ZooKeeper anpassen
