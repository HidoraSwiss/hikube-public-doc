---
title: "Come creare e gestire i topic"
---

# Come creare e gestire i topic

Questa guida spiega come creare, configurare e gestire i topic Kafka su Hikube in modo dichiarativo tramite i manifesti Kubernetes. Imparerete a definire le partizioni, le repliche e le politiche di retention e pulizia.

## Prerequisiti

- **kubectl** configurato con il vostro kubeconfig Hikube
- Un cluster **Kafka** distribuito su Hikube (o un manifesto pronto per la distribuzione)

## Passi

### 1. Aggiungere un topic al manifesto

I topic sono dichiarati nella sezione `topics` del manifesto Kafka. Ogni topic possiede un nome, un numero di partizioni e un numero di repliche.

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

**Parametri dei topic:**

| Parametro | Tipo | Descrizione |
|-----------|------|-------------|
| `topics[i].name` | `string` | Nome del topic |
| `topics[i].partitions` | `int` | Numero di partizioni (parallelismo di consumo) |
| `topics[i].replicas` | `int` | Numero di repliche (durabilità dei dati) |
| `topics[i].config` | `object` | Configurazione avanzata del topic |

:::warning
Il numero di repliche di un topic non può superare il numero di broker disponibili. Ad esempio, con 3 broker, il massimo è `replicas: 3`.
:::

### 2. Configurare la retention e la politica di pulizia

Ogni topic può essere personalizzato tramite il campo `config`. Le due principali politiche di pulizia sono:

- **`delete`**: i messaggi vengono eliminati dopo la scadenza del periodo di retention (`retention.ms`)
- **`compact`**: viene conservato solo l'ultimo valore di ogni chiave (ideale per le tabelle di riferimento, gli stati)

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

**Opzioni di configurazione comuni:**

| Parametro | Descrizione | Esempio |
|-----------|-------------|---------|
| `cleanup.policy` | Politica di pulizia: `delete` o `compact` | `"delete"` |
| `retention.ms` | Durata di retention dei messaggi in millisecondi | `"604800000"` (7 giorni) |
| `min.insync.replicas` | Numero minimo di repliche sincronizzate per confermare una scrittura | `"2"` |
| `segment.ms` | Durata prima della rotazione di un segmento di log (in ms) | `"3600000"` (1 ora) |
| `max.compaction.lag.ms` | Ritardo massimo prima della compaction di un messaggio (in ms) | `"5400000"` (1h30) |

:::tip
Per i topic di produzione, configurate sempre `min.insync.replicas: "2"` con 3 repliche. Questo garantisce che almeno 2 broker confermino ogni scrittura, proteggendo dalla perdita di dati in caso di guasto di un broker.
:::

### 3. Applicare le modifiche

```bash
kubectl apply -f kafka-topics-config.yaml
```

L'operatore Kafka crea o aggiorna automaticamente i topic dichiarati nel manifesto.

### 4. Verificare i topic

Verificate che la risorsa Kafka sia stata aggiornata correttamente:

```bash
kubectl get kafka my-kafka -o yaml | grep -A 10 "topics:"
```

Per una verifica più approfondita, potete lanciare un pod di debug con la CLI Kafka:

```bash
kubectl run kafka-debug --rm -it --image=bitnami/kafka:latest --restart=Never -- \
  kafka-topics.sh --bootstrap-server my-kafka-kafka-bootstrap:9092 --list
```

**Risultato atteso:**

```console
events
orders
```

Per vedere il dettaglio di un topic:

```bash
kubectl run kafka-debug --rm -it --image=bitnami/kafka:latest --restart=Never -- \
  kafka-topics.sh --bootstrap-server my-kafka-kafka-bootstrap:9092 --describe --topic events
```

**Risultato atteso:**

```console
Topic: events   TopicId: AbC123...   PartitionCount: 6   ReplicationFactor: 3
  Topic: events   Partition: 0   Leader: 1   Replicas: 1,2,0   Isr: 1,2,0
  Topic: events   Partition: 1   Leader: 2   Replicas: 2,0,1   Isr: 2,0,1
  ...
```

## Verifica

La configurazione è riuscita se:

- I topic appaiono nella lista (`--list`)
- Il numero di partizioni e il fattore di replica corrispondono al manifesto
- Gli ISR (In-Sync Replicas) contengono il numero atteso di broker

## Per approfondire

- **[Riferimento API Kafka](../api-reference.md)**: documentazione completa dei parametri `topics` e della configurazione avanzata
- **[Come scalare il cluster Kafka](./scale-resources.md)**: regolare le risorse dei broker e di ZooKeeper
