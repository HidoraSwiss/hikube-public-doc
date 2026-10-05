---
title: "Cluster skalieren"
---

# Kafka-Cluster skalieren

:::info Verfügbarkeit
Kafka ist in der [Hikube-Konsole](https://console.hikube.cloud) noch nicht als Self-Service verfügbar.
Um eine Instanz bereitzustellen oder ihre Konfiguration zu ändern, [wenden Sie sich an den Support](mailto:support@hidora.io).
:::

Diese Anleitung stellt die Dimensionierungsparameter eines Kafka-Clusters auf Hikube vor (Anzahl der Broker, CPU-/Arbeitsspeicherressourcen, Speicher, ZooKeeper) sowie die Punkte, die vor und nach einer Änderung zu prüfen sind.

Die Dimensionierung ist Teil der Konfiguration der Instanz. Diese Option wird in der Konsole nicht angeboten; wenden Sie sich an den Support.

## Voraussetzungen

- Ein auf Hikube bereitgestellter **Kafka**-Cluster und die Adresse seiner Bootstrap-Server (`<bootstrap-servers>`)
- Die Kafka-Client-Skripte, auf Ihrem Rechner installiert (für die Überprüfung)

## Verfügbare Presets

Die Presets gelten getrennt für die Kafka-Broker und die ZooKeeper-Knoten:

| Preset | CPU | Arbeitsspeicher |
|--------|-----|---------|
| `nano` | 250m | 128Mi |
| `micro` | 500m | 256Mi |
| `small` | 1 | 512Mi |
| `medium` | 1 | 1Gi |
| `large` | 2 | 2Gi |
| `xlarge` | 4 | 4Gi |
| `2xlarge` | 8 | 8Gi |

:::note
Anstelle eines Presets können explizite CPU-/Arbeitsspeicherwerte angefordert werden; sie ersetzen dann das Preset.
:::

## Schritte

### 1. Bedarf ermitteln

| Symptom | Stellschraube |
|----------|--------|
| Unzureichender Durchsatz, Consumer-Lag auf allen Partitionen | Mehr Broker und/oder mehr Partitionen |
| Broker werden wegen Speichermangels neu gestartet | Größeres Preset für die Broker |
| Unzureichender Speicherplatz auf den Brokern | Größerer Speicher für die Broker |
| Instabile Koordination | Ressourcen oder Speicher von ZooKeeper |

### 2. Anfrage vorbereiten

Geben Sie dem Support für das betreffende Projekt und die betreffende Instanz Folgendes an:

- **Broker**: Anzahl der Broker, Preset (oder explizite CPU-/Arbeitsspeicherwerte), Speichergröße pro Broker;
- **ZooKeeper**: Anzahl der Instanzen (ungerade: 1, 3, 5), Preset, Speichergröße.

:::warning
Das Verringern der Anzahl der Broker in einem bestehenden Cluster kann zu Datenverlust führen, wenn Partitionen nicht vorher umverteilt werden. Erhöhen Sie bevorzugt die Anzahl der Broker.
:::

:::tip
In der Produktion genügen in den meisten Fällen 3 ZooKeeper-Instanzen. 5 Instanzen sind nur bei sehr großen Clustern (10 Broker und mehr) gerechtfertigt.
:::

### 3. Topics bei Bedarf anpassen

Die Anzahl der Replicas eines Topics darf die Anzahl der Broker nicht übersteigen. Nach einer Erhöhung der Anzahl der Broker können Sie eine Erhöhung des Replikationsfaktors oder der Anzahl der Partitionen Ihrer Topics beantragen (siehe [Topics erstellen und verwalten](./manage-topics.md)).

### 4. Anfrage übermitteln

Senden Sie die Anfrage an den [Support](mailto:support@hidora.io). Das Anwenden der Änderungen kann einen schrittweisen Neustart der Broker zur Folge haben; sehen Sie Clients vor, die sich erneut verbinden können.

## Überprüfung

Sobald die Änderung angewendet ist, prüfen Sie, dass der Cluster antwortet und dass bei allen Topics sämtliche Replicas synchronisiert sind:

```bash
kafka-topics.sh --bootstrap-server <bootstrap-servers> --list
kafka-topics.sh --bootstrap-server <bootstrap-servers> --describe --under-replicated-partitions
```

Der zweite Befehl darf nichts zurückgeben, wenn alle Partitionen repliziert sind.

## Weiterführende Informationen

- **[Konzepte](../concepts.md)**: Architektur, ZooKeeper und Presets
- **[Topics erstellen und verwalten](./manage-topics.md)**: Topics nach dem Skalieren konfigurieren
