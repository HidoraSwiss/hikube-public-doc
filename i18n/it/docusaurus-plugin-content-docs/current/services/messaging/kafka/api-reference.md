---
sidebar_position: 3
title: Riferimento API
---

# Riferimento API Kafka

Questo riferimento descrive in dettaglio la configurazione e il funzionamento dei **cluster Kafka** su Hikube, inclusa la gestione dei **topic**, la configurazione dei **broker Kafka** e il coordinamento tramite **ZooKeeper**.

---

## Struttura di Base

### **Risorsa Kafka**

#### Esempio di configurazione YAML

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

## Parametri

### **Parametri Comuni**

| **Parametro** | **Tipo** | **Descrizione**                                                                 | **Default** | **Richiesto** |
| ------------- | -------- | ------------------------------------------------------------------------------- | ----------- | ------------- |
| `external`    | `bool`   | Attiva l'accesso esterno al cluster Kafka (esposizione fuori dal cluster Kubernetes) | `false`    | No            |

#### Esempio YAML

```yaml title="kafka.yaml"
external: true
```

---

### **Parametri Kafka**

| **Parametro**            | **Tipo**   | **Descrizione**                                                                                          | **Default** | **Richiesto** |
| ------------------------ | ---------- | -------------------------------------------------------------------------------------------------------- | ----------- | ------------- |
| `kafka`                  | `object`   | Configurazione del cluster Kafka                                                                         | `{}`        | Sì            |
| `kafka.replicas`         | `int`      | Numero di repliche Kafka (broker)                                                                        | `3`         | Sì            |
| `kafka.resources`        | `object`   | Configurazione esplicita di CPU e memoria per ogni broker. Se vuoto, viene utilizzato `kafka.resourcesPreset`. | `{}`   | No            |
| `kafka.resources.cpu`    | `quantity` | CPU disponibile per broker                                                                               | `null`      | No            |
| `kafka.resources.memory` | `quantity` | RAM disponibile per broker                                                                               | `null`      | No            |
| `kafka.resourcesPreset`  | `string`   | Preset di risorse predefinito (`nano`, `micro`, `small`, `medium`, `large`, `xlarge`, `2xlarge`)         | `"small"`   | Sì            |
| `kafka.size`             | `quantity` | Dimensione del volume persistente utilizzato per i dati Kafka                                            | `10Gi`      | Sì            |
| `kafka.storageClass`     | `string`   | StorageClass utilizzata per archiviare i dati Kafka                                                      | `""`        | No            |

#### Esempio YAML

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

### **Parametri ZooKeeper**

| **Parametro**                | **Tipo**   | **Descrizione**                                                                                                | **Default** | **Richiesto** |
| ---------------------------- | ---------- | -------------------------------------------------------------------------------------------------------------- | ----------- | ------------- |
| `zookeeper`                  | `object`   | Configurazione del cluster ZooKeeper utilizzato da Kafka                                                       | `{}`        | Sì            |
| `zookeeper.replicas`         | `int`      | Numero di repliche ZooKeeper                                                                                   | `3`         | Sì            |
| `zookeeper.resources`        | `object`   | Configurazione esplicita di CPU e memoria per ogni replica. Se vuoto, viene utilizzato `zookeeper.resourcesPreset`. | `{}`   | No            |
| `zookeeper.resources.cpu`    | `quantity` | CPU disponibile per replica ZooKeeper                                                                          | `null`      | No            |
| `zookeeper.resources.memory` | `quantity` | RAM disponibile per replica ZooKeeper                                                                          | `null`      | No            |
| `zookeeper.resourcesPreset`  | `string`   | Preset di risorse predefinito (`nano`, `micro`, `small`, `medium`, `large`, `xlarge`, `2xlarge`)               | `"small"`   | Sì            |
| `zookeeper.size`             | `quantity` | Dimensione del volume persistente per ZooKeeper                                                                | `5Gi`       | Sì            |
| `zookeeper.storageClass`     | `string`   | StorageClass utilizzata per archiviare i dati ZooKeeper                                                        | `""`        | No            |

#### Esempio YAML

```yaml title="kafka.yaml"
zookeeper:
  replicas: 3
  resourcesPreset: small
  size: 5Gi
  storageClass: replicated
```

---

### **Parametri Topics**

| **Parametro**          | **Tipo**   | **Descrizione**                                             | **Default** | **Richiesto** |
| ---------------------- | ---------- | ----------------------------------------------------------- | ----------- | ------------- |
| `topics`               | `[]object` | Lista dei topic da creare automaticamente                   | `[]`        | No            |
| `topics[i].name`       | `string`   | Nome del topic                                              | `""`        | Sì            |
| `topics[i].partitions` | `int`      | Numero di partizioni del topic                              | `0`         | Sì            |
| `topics[i].replicas`   | `int`      | Numero di repliche del topic                                | `0`         | Sì            |
| `topics[i].config`     | `object`   | Configurazione avanzata del topic (pulizia, retention, ecc.) | `{}`       | No            |

#### Esempio YAML

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

### **resources e resourcesPreset**

Il campo `resources` consente di definire esplicitamente la configurazione CPU e memoria di ogni broker o nodo ZooKeeper.
Se questo campo viene lasciato vuoto, viene utilizzato il valore del parametro `resourcesPreset`.

#### Esempio YAML

```yaml title="kafka.yaml"
resources:
  cpu: 4000m
  memory: 4Gi
```

⚠️ Attenzione: se `resources` è definito, il valore di `resourcesPreset` viene ignorato.

| **Nome Preset** | **CPU** | **Memoria** |
| --------------- | ------- | ----------- |
| `nano`          | 250m    | 128Mi       |
| `micro`         | 500m    | 256Mi       |
| `small`         | 1       | 512Mi       |
| `medium`        | 1       | 1Gi         |
| `large`         | 2       | 2Gi         |
| `xlarge`        | 4       | 4Gi         |
| `2xlarge`       | 8       | 8Gi         |

---

## Esempi Completi

### Cluster di Produzione

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

### Cluster di Sviluppo

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

:::tip Buone Pratiche

- **`min.insync.replicas: 2`**: configurate questo parametro sui vostri topic di produzione per garantire che almeno 2 repliche confermino ogni scrittura
- **Archiviazione replicata**: utilizzate `storageClass: replicated` per proteggere i dati dalla perdita di un nodo fisico
- **Dimensionamento dell'archiviazione**: prevedete spazio su disco sufficiente per la retention dei messaggi (`retention.ms`) e la compaction
- **ZooKeeper: minimo 3 repliche** in produzione per garantire il quorum e la tolleranza ai guasti
:::

:::warning Attenzione

- **Le eliminazioni sono irreversibili**: l'eliminazione di una risorsa Kafka comporta la perdita definitiva di tutti i messaggi e topic
- **Repliche topic vs broker**: il numero di repliche di un topic non può superare il numero di broker disponibili
- **Riduzione del numero di broker**: ridurre il numero di broker su un cluster esistente può comportare una perdita di dati se le partizioni non vengono redistribuite preventivamente
:::
