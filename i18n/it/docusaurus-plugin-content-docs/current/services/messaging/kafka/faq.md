---
sidebar_position: 6
title: FAQ
---

# FAQ — Kafka

### Qual è la differenza tra `partitions` e `replicationFactor`?

Questi due parametri servono obiettivi distinti:

- **`partitions`**: determina il **parallelismo e il throughput** di un topic. Più partizioni ci sono, più consumatori possono leggere in parallelo. Ogni partizione è una sequenza ordinata di messaggi.
- **`replicas`** (fattore di replica): determina il numero di **copie** di ogni partizione distribuite su diversi broker, garantendo l'**alta disponibilità**. Se un broker cade, una replica prende il suo posto.

:::warning
Il numero di repliche di un topic **non può superare** il numero di broker disponibili. Ad esempio, con 3 broker (`kafka.replicas: 3`), potete configurare al massimo `replicas: 3` su un topic.
:::

### Perché Kafka utilizza ZooKeeper?

ZooKeeper garantisce il **coordinamento del cluster Kafka**:

- **Elezione del controller**: designa il broker leader responsabile della gestione delle partizioni
- **Metadati dei topic**: archivia la lista dei topic, delle partizioni e la loro assegnazione ai broker
- **Rilevamento dei guasti**: monitora lo stato dei broker e avvia la riassegnazione in caso di malfunzionamento

:::tip
ZooKeeper richiede un **numero dispari di repliche** (3, 5, 7...) per mantenere il quorum. In produzione, utilizzate almeno `zookeeper.replicas: 3`.
:::

### A cosa serve `cleanup.policy` su un topic?

La politica di pulizia definisce come Kafka gestisce i vecchi messaggi:

- **`delete`** (predefinito): elimina i segmenti di log che superano la durata di retention definita da `retention.ms`. Adatto ai flussi di eventi.
- **`compact`**: conserva unicamente l'**ultimo valore per ogni chiave**. Adatto alle tabelle di riferimento o agli stati (changelog).

Esempio di configurazione:

```yaml title="kafka.yaml"
topics:
  - name: user-profiles
    partitions: 3
    replicas: 3
    config:
      cleanup.policy: compact
```

### Come funzionano i consumer group?

Un **consumer group** è un insieme di consumer che si ripartiscono la lettura delle partizioni di un topic:

- Ogni partizione è letta da **un solo consumer** del gruppo in un dato momento
- Se un consumer cade, le sue partizioni vengono redistribuite agli altri membri del gruppo (**rebalancing**)
- Più consumer group possono leggere lo stesso topic indipendentemente (ognuno mantiene il proprio offset)

Questo consente un **consumo parallelo** garantendo al contempo l'ordine dei messaggi all'interno di ogni partizione.

### Qual è la differenza tra `resourcesPreset` e `resources`?

Il campo `resourcesPreset` applica una configurazione CPU/memoria predefinita, mentre `resources` permette di specificare valori espliciti. Se `resources` è definito, `resourcesPreset` viene **ignorato**.

| **Preset** | **CPU** | **Memoria** |
| ---------- | ------- | ----------- |
| `nano`     | 250m    | 128Mi       |
| `micro`    | 500m    | 256Mi       |
| `small`    | 1       | 512Mi       |
| `medium`   | 1       | 1Gi         |
| `large`    | 2       | 2Gi         |
| `xlarge`   | 4       | 4Gi         |
| `2xlarge`  | 8       | 8Gi         |

Esempio con risorse esplicite:

```yaml title="kafka.yaml"
kafka:
  replicas: 3
  resources:
    cpu: 2000m
    memory: 4Gi
  size: 50Gi
```

### Come esporre Kafka all'esterno del cluster?

Attivate il parametro `external: true` nel vostro manifesto:

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

Questo crea un servizio di tipo **LoadBalancer** per ogni broker, consentendo l'accesso dall'esterno del cluster Kubernetes.

:::warning
L'esposizione esterna rende i vostri broker accessibili su Internet. Assicuratevi che l'autenticazione e la crittografia siano correttamente configurate prima di attivare questa opzione.
:::

### Come configurare `min.insync.replicas`?

Il parametro `min.insync.replicas` garantisce che un numero minimo di repliche confermi ogni scrittura prima che venga considerata riuscita. Si tratta di una configurazione a livello di **topic**:

```yaml title="kafka.yaml"
topics:
  - name: orders
    partitions: 6
    replicas: 3
    config:
      min.insync.replicas: "2"
```

:::tip
Per un cluster di produzione con 3 repliche, configurate `min.insync.replicas: 2`. Questo tollera la perdita di un broker garantendo al contempo la durabilità dei dati.
:::
