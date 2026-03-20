---
title: "Topics erstellen und verwalten"
---

# Topics erstellen und verwalten

Diese Anleitung erklärt, wie Sie Kafka-Topics auf Hikube deklarativ über Kubernetes-Manifeste erstellen, konfigurieren und verwalten. Sie lernen, wie Sie Partitionen, Replikate sowie Aufbewahrungs- und Bereinigungsrichtlinien definieren.

## Voraussetzungen

- **kubectl** konfiguriert mit Ihrer Hikube-Kubeconfig
- Ein auf Hikube bereitgestellter **Kafka**-Cluster (oder ein Manifest zur Bereitstellung)

## Schritte

### 1. Ein Topic zum Manifest hinzufügen

Die Topics werden im Abschnitt `topics` des Kafka-Manifests deklariert. Jedes Topic hat einen Namen, eine Anzahl von Partitionen und eine Anzahl von Replikaten.

```yaml title="kafka-topics.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Kafka
metadata:
  name: my-kafka
spec:
  kafka:
    replicas: 3
    resourcesPreset: small
    size: 10Gi
  zookeeper:
    replicas: 3
    resourcesPreset: small
    size: 5Gi
  topics:
    - name: events
      partitions: 6
      replicas: 3
    - name: orders
      partitions: 3
      replicas: 3
```

**Topic-Parameter:**

| Parameter | Typ | Beschreibung |
|-----------|-----|--------------|
| `topics[i].name` | `string` | Name des Topics |
| `topics[i].partitions` | `int` | Anzahl der Partitionen (Parallelität des Konsums) |
| `topics[i].replicas` | `int` | Anzahl der Replikate (Datenhaltbarkeit) |
| `topics[i].config` | `object` | Erweiterte Topic-Konfiguration |

:::warning
Die Anzahl der Replikate eines Topics darf die Anzahl der verfügbaren Broker nicht überschreiten. Beispielsweise ist bei 3 Brokern das Maximum `replicas: 3`.
:::

### 2. Aufbewahrung und Bereinigungsrichtlinie konfigurieren

Jedes Topic kann über das Feld `config` angepasst werden. Die beiden wichtigsten Bereinigungsrichtlinien sind:

- **`delete`**: Nachrichten werden nach Ablauf der Aufbewahrungsfrist gelöscht (`retention.ms`)
- **`compact`**: Nur der letzte Wert jedes Schlüssels wird beibehalten (ideal für Referenztabellen, Zustände)

```yaml title="kafka-topics-config.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Kafka
metadata:
  name: my-kafka
spec:
  kafka:
    replicas: 3
    resourcesPreset: small
    size: 20Gi
  zookeeper:
    replicas: 3
    resourcesPreset: small
    size: 5Gi
  topics:
    - name: events
      partitions: 6
      replicas: 3
      config:
        cleanup.policy: "delete"
        retention.ms: "604800000"
        min.insync.replicas: "2"
    - name: orders
      partitions: 3
      replicas: 3
      config:
        cleanup.policy: "compact"
        segment.ms: "3600000"
        max.compaction.lag.ms: "5400000"
        min.insync.replicas: "2"
```

**Gängige Konfigurationsoptionen:**

| Parameter | Beschreibung | Beispiel |
|-----------|--------------|----------|
| `cleanup.policy` | Bereinigungsrichtlinie: `delete` oder `compact` | `"delete"` |
| `retention.ms` | Aufbewahrungsdauer der Nachrichten in Millisekunden | `"604800000"` (7 Tage) |
| `min.insync.replicas` | Mindestanzahl synchronisierter Replikate zur Bestätigung eines Schreibvorgangs | `"2"` |
| `segment.ms` | Dauer vor Rotation eines Log-Segments (in ms) | `"3600000"` (1 Stunde) |
| `max.compaction.lag.ms` | Maximale Verzögerung vor der Kompaktierung einer Nachricht (in ms) | `"5400000"` (1h30) |

:::tip
Konfigurieren Sie für Produktions-Topics immer `min.insync.replicas: "2"` mit 3 Replikaten. Dies stellt sicher, dass mindestens 2 Broker jeden Schreibvorgang bestätigen und schützt vor Datenverlust bei Ausfall eines Brokers.
:::

### 3. Änderungen anwenden

```bash
kubectl apply -f kafka-topics-config.yaml
```

Der Kafka-Operator erstellt oder aktualisiert automatisch die im Manifest deklarierten Topics.

### 4. Topics überprüfen

Überprüfen Sie, ob die Kafka-Ressource aktualisiert wurde:

```bash
kubectl get kafka my-kafka -o yaml | grep -A 10 "topics:"
```

Für eine eingehendere Überprüfung können Sie einen Debug-Pod mit dem Kafka-CLI starten:

```bash
kubectl run kafka-debug --rm -it --image=bitnami/kafka:latest --restart=Never -- \
  kafka-topics.sh --bootstrap-server my-kafka-kafka-bootstrap:9092 --list
```

**Erwartetes Ergebnis:**

```console
events
orders
```

Um die Details eines Topics anzuzeigen:

```bash
kubectl run kafka-debug --rm -it --image=bitnami/kafka:latest --restart=Never -- \
  kafka-topics.sh --bootstrap-server my-kafka-kafka-bootstrap:9092 --describe --topic events
```

**Erwartetes Ergebnis:**

```console
Topic: events   TopicId: AbC123...   PartitionCount: 6   ReplicationFactor: 3
  Topic: events   Partition: 0   Leader: 1   Replicas: 1,2,0   Isr: 1,2,0
  Topic: events   Partition: 1   Leader: 2   Replicas: 2,0,1   Isr: 2,0,1
  ...
```

## Überprüfung

Die Konfiguration ist erfolgreich, wenn:

- Die Topics in der Liste erscheinen (`--list`)
- Die Anzahl der Partitionen und der Replikationsfaktor mit dem Manifest übereinstimmen
- Die ISR (In-Sync Replicas) die erwartete Anzahl von Brokern enthalten

## Weiterführende Informationen

- **[Kafka API-Referenz](../api-reference.md)**: Vollständige Dokumentation der `topics`-Parameter und der erweiterten Konfiguration
- **[Kafka-Cluster skalieren](./scale-resources.md)**: Ressourcen der Broker und ZooKeeper anpassen
