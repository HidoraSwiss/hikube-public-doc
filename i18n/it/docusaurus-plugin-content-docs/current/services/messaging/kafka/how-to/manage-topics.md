---
title: "Come creare e gestire i topic"
---

# Come creare e gestire i topic

:::info Disponibilità
Kafka non è ancora disponibile in modalità self-service nella [console Hikube](https://console.hikube.cloud).
Per effettuare il provisioning di un'istanza o modificarne la configurazione, [contatti il supporto](mailto:support@hidora.io).
:::

Questa guida presenta i parametri di un topic Kafka su Hikube (partizioni, repliche, conservazione, politica di pulizia) e il modo per verificarne la configurazione da un client Kafka.

I topic gestiti fanno parte della configurazione dell'istanza: la loro creazione e modifica si richiedono al supporto. Questa opzione non è disponibile nella console; contatti il supporto.

## Prerequisiti

- Un cluster **Kafka** fornito su Hikube e l'indirizzo dei suoi server bootstrap (`<bootstrap-servers>`)
- Gli script client Kafka (`kafka-topics.sh`) installati sul suo computer

## Passaggi

### 1. Definire i topic

Per ogni topic, prepari:

| Parametro | Descrizione |
|-----------|-------------|
| Nome | Nome del topic |
| Partizioni | Numero di partizioni (parallelismo di consumo) |
| Repliche | Numero di copie di ogni partizione (durabilità dei dati) |
| Opzioni | Configurazione avanzata del topic (vedere di seguito) |

:::warning
Il numero di repliche di un topic non può superare il numero di broker disponibili. Ad esempio, con 3 broker il massimo è 3 repliche.
:::

### 2. Scegliere la conservazione e la politica di pulizia

Le due principali politiche di pulizia sono:

- **`delete`**: i messaggi vengono eliminati alla scadenza del periodo di conservazione (`retention.ms`)
- **`compact`**: viene conservato solo l'ultimo valore di ogni chiave (ideale per tabelle di riferimento e stati)

**Opzioni di configurazione comuni:**

| Parametro | Descrizione | Esempio |
|-----------|-------------|---------|
| `cleanup.policy` | Politica di pulizia: `delete` o `compact` | `"delete"` |
| `retention.ms` | Durata di conservazione dei messaggi in millisecondi | `"604800000"` (7 giorni) |
| `min.insync.replicas` | Numero minimo di repliche sincronizzate per confermare una scrittura | `"2"` |
| `segment.ms` | Durata prima della rotazione di un segmento di log (in ms) | `"3600000"` (1 ora) |
| `max.compaction.lag.ms` | Ritardo massimo prima della compattazione di un messaggio (in ms) | `"5400000"` (1h30) |

:::tip
Per i topic di produzione, preveda `min.insync.replicas: "2"` con 3 repliche. In questo modo almeno 2 broker confermano ogni scrittura, il che protegge dalla perdita di dati in caso di guasto di un broker.
:::

### 3. Inviare la richiesta

Invii l'elenco dei topic e delle relative opzioni al [supporto](mailto:support@hidora.io), precisando il progetto e il nome dell'istanza Kafka.

### 4. Verificare i topic

Una volta applicata la configurazione, elenchi i topic dal suo client:

```bash
kafka-topics.sh --bootstrap-server <bootstrap-servers> --list
```

**Risultato atteso:**

```console
events
orders
```

Per visualizzare il dettaglio di un topic:

```bash
kafka-topics.sh --bootstrap-server <bootstrap-servers> --describe --topic events
```

**Risultato atteso:**

```console
Topic: events   TopicId: AbC123...   PartitionCount: 6   ReplicationFactor: 3
  Topic: events   Partition: 0   Leader: 1   Replicas: 1,2,0   Isr: 1,2,0
  Topic: events   Partition: 1   Leader: 2   Replicas: 2,0,1   Isr: 2,0,1
  ...
```

## Verifica

La configurazione è corretta se:

- I topic compaiono nell'elenco (`--list`)
- Il numero di partizioni e il fattore di replica corrispondono alla sua richiesta
- Gli ISR (In-Sync Replicas) contengono il numero di broker previsto

## Per approfondire

- **[Concetti](../concepts.md)**: topic, partizioni e replica
- **[Come scalare il cluster Kafka](./scale-resources.md)**: regolare le risorse dei broker e di ZooKeeper
