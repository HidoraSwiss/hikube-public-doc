---
title: "Come scalare il cluster"
---

# Come scalare il cluster Kafka

:::info Disponibilità
Kafka non è ancora disponibile in modalità self-service nella [console Hikube](https://console.hikube.cloud).
Per effettuare il provisioning di un'istanza o modificarne la configurazione, [contatti il supporto](mailto:support@hidora.io).
:::

Questa guida presenta i parametri di dimensionamento di un cluster Kafka su Hikube (numero di broker, risorse CPU/memoria, storage, ZooKeeper) e i punti da verificare prima e dopo una modifica.

Il dimensionamento fa parte della configurazione dell'istanza. Questa opzione non è disponibile nella console; contatti il supporto.

## Prerequisiti

- Un cluster **Kafka** fornito su Hikube e l'indirizzo dei suoi server bootstrap (`<bootstrap-servers>`)
- Gli script client Kafka installati sul suo computer (per la verifica)

## Preset disponibili

I preset si applicano separatamente ai broker Kafka e ai nodi ZooKeeper:

| Preset | CPU | Memoria |
|--------|-----|---------|
| `nano` | 250m | 128Mi |
| `micro` | 500m | 256Mi |
| `small` | 1 | 512Mi |
| `medium` | 1 | 1Gi |
| `large` | 2 | 2Gi |
| `xlarge` | 4 | 4Gi |
| `2xlarge` | 8 | 8Gi |

:::note
È possibile richiedere valori espliciti di CPU/memoria al posto di un preset; in tal caso sostituiscono il preset.
:::

## Passaggi

### 1. Identificare l'esigenza

| Sintomo | Leva |
|---------|------|
| Throughput insufficiente, consumer lag su tutte le partizioni | Più broker e/o più partizioni |
| Broker riavviati per mancanza di memoria | Preset superiore per i broker |
| Spazio su disco insufficiente sui broker | Storage dei broker più grande |
| Instabilità del coordinamento | Risorse o storage di ZooKeeper |

### 2. Preparare la richiesta

Indichi al supporto, per il progetto e l'istanza interessati:

- **Broker**: numero di broker, preset (o CPU/memoria espliciti), dimensione dello storage per broker;
- **ZooKeeper**: numero di istanze (dispari: 1, 3, 5), preset, dimensione dello storage.

:::warning
Ridurre il numero di broker su un cluster esistente può causare una perdita di dati se le partizioni non vengono prima ridistribuite. Privilegi l'aumento del numero di broker.
:::

:::tip
In produzione, 3 istanze ZooKeeper sono sufficienti nella maggior parte dei casi. 5 istanze si giustificano solo per cluster molto grandi (10 broker e oltre).
:::

### 3. Adattare i topic se necessario

Il numero di repliche di un topic non può superare il numero di broker. Dopo un aumento del numero di broker, può richiedere l'aumento del fattore di replica o del numero di partizioni dei suoi topic (vedere [Come creare e gestire i topic](./manage-topics.md)).

### 4. Inviare la richiesta

Invii la richiesta al [supporto](mailto:support@hidora.io). L'applicazione delle modifiche può comportare il riavvio successivo dei broker; preveda client in grado di riconnettersi.

## Verifica

Una volta applicata la modifica, verifichi che il cluster risponda e che tutti i topic abbiano le repliche sincronizzate:

```bash
kafka-topics.sh --bootstrap-server <bootstrap-servers> --list
kafka-topics.sh --bootstrap-server <bootstrap-servers> --describe --under-replicated-partitions
```

Il secondo comando non deve restituire nulla quando tutte le partizioni sono replicate.

## Per approfondire

- **[Concetti](../concepts.md)**: architettura, ZooKeeper e preset
- **[Come creare e gestire i topic](./manage-topics.md)**: configurare i topic dopo lo scaling
