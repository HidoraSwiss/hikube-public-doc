---
sidebar_position: 3
title: API-Referenz
---

# API-Referenz Kafka

Diese Referenz beschreibt die Konfiguration und Funktionsweise der **Kafka-Cluster** auf Hikube, einschließlich der Verwaltung von **Topics**, der Konfiguration der **Kafka-Broker** und der Koordination über **ZooKeeper**.

---

## Grundstruktur

### **Kafka-Ressource**

#### Beispiel einer YAML-Konfiguration

```yaml
apiVersion: apps.cozystack.io/v1alpha1
kind: Kafka
metadata:
  name: kafka
spec:
  external: false
  kafka:
    replicas: 3
    resourcesPreset: small
    size: 10Gi
  topics: []
  zookeeper:
    replicas: 3
    resourcesPreset: small
    size: 5Gi
```

---

## Parameter

### **Allgemeine Parameter**

| **Parameter** | **Typ** | **Beschreibung** | **Standard** | **Erforderlich** |
| ------------- | ------- | ---------------- | ------------ | ---------------- |
| `external` | `bool` | Aktiviert den externen Zugang zum Kafka-Cluster (Exposition außerhalb des Kubernetes-Clusters) | `false` | Nein |

#### YAML-Beispiel

```yaml title="kafka.yaml"
external: true
```

---

### **Kafka-Parameter**

| **Parameter** | **Typ** | **Beschreibung** | **Standard** | **Erforderlich** |
| ------------- | ------- | ---------------- | ------------ | ---------------- |
| `kafka` | `object` | Konfiguration des Kafka-Clusters | `{}` | Ja |
| `kafka.replicas` | `int` | Anzahl der Kafka-Replikate (Broker) | `3` | Ja |
| `kafka.resources` | `object` | Explizite CPU- und Speicherkonfiguration pro Broker. Wenn leer, wird `kafka.resourcesPreset` verwendet. | `{}` | Nein |
| `kafka.resources.cpu` | `quantity` | Verfügbare CPU pro Broker | `null` | Nein |
| `kafka.resources.memory` | `quantity` | Verfügbarer RAM pro Broker | `null` | Nein |
| `kafka.resourcesPreset` | `string` | Standard-Ressourcen-Preset (`nano`, `micro`, `small`, `medium`, `large`, `xlarge`, `2xlarge`) | `"small"` | Ja |
| `kafka.size` | `quantity` | Größe des persistenten Volumes für Kafka-Daten | `10Gi` | Ja |
| `kafka.storageClass` | `string` | StorageClass für die Speicherung der Kafka-Daten | `""` | Nein |

#### YAML-Beispiel

```yaml title="kafka.yaml"
kafka:
  replicas: 3
  resources:
    cpu: 2000m
    memory: 2Gi
  resourcesPreset: medium
  size: 20Gi
  storageClass: replicated
```

---

### **ZooKeeper-Parameter**

| **Parameter** | **Typ** | **Beschreibung** | **Standard** | **Erforderlich** |
| ------------- | ------- | ---------------- | ------------ | ---------------- |
| `zookeeper` | `object` | Konfiguration des von Kafka verwendeten ZooKeeper-Clusters | `{}` | Ja |
| `zookeeper.replicas` | `int` | Anzahl der ZooKeeper-Replikate | `3` | Ja |
| `zookeeper.resources` | `object` | Explizite CPU- und Speicherkonfiguration pro Replikat. Wenn leer, wird `zookeeper.resourcesPreset` verwendet. | `{}` | Nein |
| `zookeeper.resources.cpu` | `quantity` | Verfügbare CPU pro ZooKeeper-Replikat | `null` | Nein |
| `zookeeper.resources.memory` | `quantity` | Verfügbarer RAM pro ZooKeeper-Replikat | `null` | Nein |
| `zookeeper.resourcesPreset` | `string` | Standard-Ressourcen-Preset (`nano`, `micro`, `small`, `medium`, `large`, `xlarge`, `2xlarge`) | `"small"` | Ja |
| `zookeeper.size` | `quantity` | Größe des persistenten Volumes für ZooKeeper | `5Gi` | Ja |
| `zookeeper.storageClass` | `string` | StorageClass für die Speicherung der ZooKeeper-Daten | `""` | Nein |

#### YAML-Beispiel

```yaml title="kafka.yaml"
zookeeper:
  replicas: 3
  resourcesPreset: small
  size: 5Gi
  storageClass: replicated
```

---

### **Topic-Parameter**

| **Parameter** | **Typ** | **Beschreibung** | **Standard** | **Erforderlich** |
| ------------- | ------- | ---------------- | ------------ | ---------------- |
| `topics` | `[]object` | Liste der automatisch zu erstellenden Topics | `[]` | Nein |
| `topics[i].name` | `string` | Name des Topics | `""` | Ja |
| `topics[i].partitions` | `int` | Anzahl der Partitionen des Topics | `0` | Ja |
| `topics[i].replicas` | `int` | Anzahl der Replikate des Topics | `0` | Ja |
| `topics[i].config` | `object` | Erweiterte Topic-Konfiguration (Bereinigung, Aufbewahrung usw.) | `{}` | Nein |

#### YAML-Beispiel

```yaml title="kafka.yaml"
topics:
  - name: results
    partitions: 1
    replicas: 3
    config:
      min.insync.replicas: 2
  - name: orders
    partitions: 1
    replicas: 3
    config:
      cleanup.policy: compact
      segment.ms: 3600000
      max.compaction.lag.ms: 5400000
      min.insync.replicas: 2
```

---

### **resources und resourcesPreset**

Das Feld `resources` ermöglicht die explizite Definition der CPU- und Speicherkonfiguration jedes Brokers oder ZooKeeper-Knotens.
Wenn dieses Feld leer gelassen wird, wird der Wert des Parameters `resourcesPreset` verwendet.

#### YAML-Beispiel

```yaml title="kafka.yaml"
resources:
  cpu: 4000m
  memory: 4Gi
```

⚠️ Achtung: Wenn `resources` definiert ist, wird der Wert von `resourcesPreset` ignoriert.

| **Preset-Name** | **CPU** | **Speicher** |
| --------------- | ------- | ------------ |
| `nano` | 250m | 128Mi |
| `micro` | 500m | 256Mi |
| `small` | 1 | 512Mi |
| `medium` | 1 | 1Gi |
| `large` | 2 | 2Gi |
| `xlarge` | 4 | 4Gi |
| `2xlarge` | 8 | 8Gi |

---

## Vollständige Beispiele

### Produktionscluster

```yaml title="kafka-production.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Kafka
metadata:
  name: production
spec:
  external: false
  kafka:
    replicas: 3
    resources:
      cpu: 4000m
      memory: 8Gi
    size: 100Gi
    storageClass: replicated
  zookeeper:
    replicas: 3
    resourcesPreset: small
    size: 10Gi
    storageClass: replicated
  topics:
    - name: events
      partitions: 6
      replicas: 3
      config:
        retention.ms: "604800000"
        cleanup.policy: "delete"
        min.insync.replicas: "2"
    - name: commands
      partitions: 3
      replicas: 3
      config:
        cleanup.policy: "compact"
        min.insync.replicas: "2"
```

### Entwicklungscluster

```yaml title="kafka-development.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Kafka
metadata:
  name: development
spec:
  external: false
  kafka:
    replicas: 1
    resourcesPreset: nano
    size: 5Gi
  zookeeper:
    replicas: 1
    resourcesPreset: nano
    size: 2Gi
  topics:
    - name: test-topic
      partitions: 1
      replicas: 1
```

---

:::tip Best Practices

- **`min.insync.replicas: 2`**: Konfigurieren Sie diesen Parameter für Ihre Produktions-Topics, um sicherzustellen, dass mindestens 2 Replikate jeden Schreibvorgang bestätigen
- **Replizierter Speicher**: Verwenden Sie `storageClass: replicated`, um die Daten vor dem Verlust eines physischen Knotens zu schützen
- **Speicherdimensionierung**: Planen Sie ausreichend Speicherplatz für die Nachrichtenaufbewahrung (`retention.ms`) und die Kompaktierung ein
- **ZooKeeper: mindestens 3 Replikate** in der Produktion, um Quorum und Fehlertoleranz zu gewährleisten
:::

:::warning Achtung

- **Löschungen sind unwiderruflich**: Das Löschen einer Kafka-Ressource führt zum endgültigen Verlust aller Nachrichten und Topics
- **Topic-Replikate vs. Broker**: Die Anzahl der Replikate eines Topics darf die Anzahl der verfügbaren Broker nicht überschreiten
- **Reduzierung der Broker-Anzahl**: Die Reduzierung der Broker-Anzahl auf einem bestehenden Cluster kann zu Datenverlust führen, wenn die Partitionen nicht zuvor umverteilt werden
:::
