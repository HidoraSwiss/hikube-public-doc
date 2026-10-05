---
sidebar_position: 6
title: FAQ
---

# FAQ — Kafka

:::info Disponibilità
Kafka non è ancora disponibile in modalità self-service nella [console Hikube](https://console.hikube.cloud).
Per effettuare il provisioning di un'istanza o modificarne la configurazione, [contatti il supporto](mailto:support@hidora.io).
:::

### Come ottenere un cluster Kafka?

Invii la sua richiesta al [supporto](mailto:support@hidora.io) con i parametri dell'istanza (numero di broker, preset, storage, topic, accesso esterno). L'[avvio rapido](./quick-start.md) elenca le informazioni da preparare.

### Qual è la differenza tra le partizioni e il fattore di replica?

Questi due parametri servono a obiettivi distinti:

- **Partizioni**: determinano il **parallelismo e il throughput** di un topic. Più partizioni ci sono, più alto è il numero di consumer che possono leggere in parallelo. Ogni partizione è una sequenza ordinata di messaggi.
- **Repliche** (fattore di replica): determinano il numero di **copie** di ogni partizione distribuite su broker diversi, garantendo l'**alta disponibilità**. Se un broker si arresta, una replica subentra.

:::warning
Il numero di repliche di un topic **non può superare** il numero di broker disponibili. Ad esempio, con 3 broker un topic può avere al massimo 3 repliche.
:::

### Perché Kafka utilizza ZooKeeper?

ZooKeeper garantisce il **coordinamento del cluster Kafka**:

- **Elezione del controller**: designa il broker leader responsabile della gestione delle partizioni
- **Metadati dei topic**: archivia l'elenco dei topic, delle partizioni e la loro assegnazione ai broker
- **Rilevamento dei guasti**: monitora lo stato dei broker e avvia la riassegnazione in caso di guasto

:::tip
ZooKeeper richiede un **numero dispari di istanze** (3, 5, 7…) per mantenere il quorum. In produzione, preveda almeno 3 istanze.
:::

### A cosa serve `cleanup.policy` su un topic?

La politica di pulizia definisce come Kafka gestisce i messaggi meno recenti:

- **`delete`** (predefinita): elimina i segmenti di log che superano la durata di conservazione definita da `retention.ms`. Adatta ai flussi di eventi.
- **`compact`**: conserva solo l'**ultimo valore per ogni chiave**. Adatta alle tabelle di riferimento o agli stati (changelog).

La politica di ogni topic fa parte della configurazione dell'istanza. Questa opzione non è disponibile nella console; contatti il supporto.

### Come funzionano i consumer group?

Un **consumer group** è un insieme di consumer che si ripartiscono la lettura delle partizioni di un topic:

- Ogni partizione viene letta da **un solo consumer** del gruppo in un dato momento
- Se un consumer si arresta, le sue partizioni vengono ridistribuite agli altri membri del gruppo (**rebalancing**)
- Più consumer group possono leggere lo stesso topic in modo indipendente (ciascuno mantiene il proprio offset)

Ciò consente un **consumo parallelo** garantendo al tempo stesso l'ordine dei messaggi all'interno di ogni partizione.

### Quali preset di risorse sono disponibili?

I preset si applicano separatamente ai broker e a ZooKeeper:

| **Preset** | **CPU** | **Memoria** |
| ---------- | ------- | ----------- |
| `nano`     | 250m    | 128Mi       |
| `micro`    | 500m    | 256Mi       |
| `small`    | 1       | 512Mi       |
| `medium`   | 1       | 1Gi         |
| `large`    | 2       | 2Gi         |
| `xlarge`   | 4       | 4Gi         |
| `2xlarge`  | 8       | 8Gi         |

È possibile richiedere anche valori espliciti di CPU/memoria, che in tal caso sostituiscono il preset. Questa opzione non è disponibile nella console; contatti il supporto.

### Come esporre Kafka all'esterno della piattaforma?

L'accesso esterno è un'opzione dell'istanza: quando è attivata, i broker diventano raggiungibili dall'esterno della piattaforma. Questa opzione non è disponibile nella console; contatti il supporto.

:::warning
L'esposizione esterna rende i suoi broker accessibili su Internet, sulla porta `9094`. Questo listener è cifrato in TLS per impostazione predefinita, ma non è configurata alcuna autenticazione dei client: chiunque conosca l'indirizzo può produrre e consumare messaggi. Concordi con il supporto l'attivazione di un'autenticazione (SCRAM o mTLS) prima di attivare questa opzione.
:::

### Come configurare `min.insync.replicas`?

Il parametro `min.insync.replicas` garantisce che un numero minimo di repliche confermi ogni scrittura prima che sia considerata riuscita. È una configurazione a livello di **topic**, definita nella configurazione dell'istanza.

:::tip
Per un topic di produzione con 3 repliche, `min.insync.replicas: 2` tollera la perdita di un broker garantendo al tempo stesso la durabilità dei dati. Lato producer, lo combini con `acks=all`.
:::
