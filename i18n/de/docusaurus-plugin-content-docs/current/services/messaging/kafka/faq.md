---
sidebar_position: 6
title: FAQ
---

# FAQ — Kafka

### Was ist der Unterschied zwischen `partitions` und `replicationFactor`?

Diese beiden Parameter dienen unterschiedlichen Zwecken:

- **`partitions`**: Bestimmt die **Parallelität und den Durchsatz** eines Topics. Je mehr Partitionen vorhanden sind, desto mehr Consumer können parallel lesen. Jede Partition ist eine geordnete Sequenz von Nachrichten.
- **`replicas`** (Replikationsfaktor): Bestimmt die Anzahl der **Kopien** jeder Partition, die auf verschiedene Broker verteilt sind, und gewährleistet die **Hochverfügbarkeit**. Wenn ein Broker ausfällt, übernimmt ein Replikat.

:::warning
Die Anzahl der Replikate eines Topics **darf nicht** die Anzahl der verfügbaren Broker überschreiten. Beispielsweise können Sie mit 3 Brokern (`kafka.replicas: 3`) maximal `replicas: 3` für ein Topic konfigurieren.
:::

### Warum verwendet Kafka ZooKeeper?

ZooKeeper sorgt für die **Koordination des Kafka-Clusters**:

- **Controller-Wahl**: Bestimmt den Leader-Broker, der für die Verwaltung der Partitionen verantwortlich ist
- **Topic-Metadaten**: Speichert die Liste der Topics, Partitionen und deren Zuordnung zu den Brokern
- **Ausfallerkennung**: Überwacht den Status der Broker und löst bei Ausfall die Neuzuordnung aus

:::tip
ZooKeeper erfordert eine **ungerade Anzahl von Replikaten** (3, 5, 7...), um das Quorum aufrechtzuerhalten. Verwenden Sie in der Produktion mindestens `zookeeper.replicas: 3`.
:::

### Wozu dient `cleanup.policy` bei einem Topic?

Die Bereinigungsrichtlinie definiert, wie Kafka alte Nachrichten verwaltet:

- **`delete`** (Standard): Löscht Log-Segmente, die die durch `retention.ms` definierte Aufbewahrungsdauer überschreiten. Geeignet für Ereignisströme.
- **`compact`**: Behält nur den **letzten Wert für jeden Schlüssel** bei. Geeignet für Referenztabellen oder Zustände (Changelog).

Konfigurationsbeispiel:

```yaml title="kafka.yaml"
topics:
  - name: user-profiles
    partitions: 3
    replicas: 3
    config:
      cleanup.policy: compact
```

### Wie funktionieren Consumer Groups?

Eine **Consumer Group** ist eine Gruppe von Consumern, die sich das Lesen der Partitionen eines Topics aufteilen:

- Jede Partition wird zu einem bestimmten Zeitpunkt von **einem einzigen Consumer** der Gruppe gelesen
- Wenn ein Consumer ausfällt, werden seine Partitionen an die anderen Mitglieder der Gruppe umverteilt (**Rebalancing**)
- Mehrere Consumer Groups können dasselbe Topic unabhängig lesen (jede behält ihren eigenen Offset bei)

Dies ermöglicht einen **parallelen Konsum** bei gleichzeitiger Gewährleistung der Nachrichtenreihenfolge innerhalb jeder Partition.

### Was ist der Unterschied zwischen `resourcesPreset` und `resources`?

Das Feld `resourcesPreset` wendet eine vordefinierte CPU-/Speicherkonfiguration an, während `resources` die Angabe expliziter Werte ermöglicht. Wenn `resources` definiert ist, wird `resourcesPreset` **ignoriert**.

| **Preset** | **CPU** | **Speicher** |
| ---------- | ------- | ------------ |
| `nano` | 250m | 128Mi |
| `micro` | 500m | 256Mi |
| `small` | 1 | 512Mi |
| `medium` | 1 | 1Gi |
| `large` | 2 | 2Gi |
| `xlarge` | 4 | 4Gi |
| `2xlarge` | 8 | 8Gi |

Beispiel mit expliziten Ressourcen:

```yaml title="kafka.yaml"
kafka:
  replicas: 3
  resources:
    cpu: 2000m
    memory: 4Gi
  size: 50Gi
```

### Wie kann Kafka außerhalb des Clusters exponiert werden?

Aktivieren Sie den Parameter `external: true` in Ihrem Manifest:

```yaml title="kafka.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Kafka
metadata:
  name: kafka
spec:
  external: true
  kafka:
    replicas: 3
    resourcesPreset: small
    size: 10Gi
  zookeeper:
    replicas: 3
    resourcesPreset: small
    size: 5Gi
```

Dies erstellt einen **LoadBalancer**-Service für jeden Broker, der den Zugang von außerhalb des Kubernetes-Clusters ermöglicht.

:::warning
Die externe Exposition macht Ihre Broker über das Internet zugänglich. Stellen Sie sicher, dass Authentifizierung und Verschlüsselung korrekt konfiguriert sind, bevor Sie diese Option aktivieren.
:::

### Wie konfiguriert man `min.insync.replicas`?

Der Parameter `min.insync.replicas` stellt sicher, dass eine Mindestanzahl von Replikaten jeden Schreibvorgang bestätigt, bevor er als erfolgreich gilt. Dies ist eine Konfiguration auf **Topic**-Ebene:

```yaml title="kafka.yaml"
topics:
  - name: orders
    partitions: 6
    replicas: 3
    config:
      min.insync.replicas: "2"
```

:::tip
Konfigurieren Sie für einen Produktionscluster mit 3 Replikaten `min.insync.replicas: 2`. Dies toleriert den Ausfall eines Brokers und gewährleistet gleichzeitig die Datenhaltbarkeit.
:::
