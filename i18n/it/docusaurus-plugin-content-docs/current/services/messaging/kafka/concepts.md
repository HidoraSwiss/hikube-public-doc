---
sidebar_position: 2
title: Concetti
---

# Concetti — Kafka

## Architettura

Kafka su Hikube è un servizio gestito di streaming distribuito. Ogni istanza distribuita tramite la risorsa `Kafka` crea un cluster di **broker** coordinati da **ZooKeeper**, capace di gestire milioni di messaggi al secondo con persistenza garantita.

```mermaid
graph TB
    subgraph "Hikube Platform"
        subgraph "Tenant namespace"
            CR[Kafka CRD]
            SEC[Secret credentials]
        end

        subgraph "Cluster Kafka"
            B1[Broker 1]
            B2[Broker 2]
            B3[Broker 3]
        end

        subgraph "ZooKeeper"
            Z1[ZK 1]
            Z2[ZK 2]
            Z3[ZK 3]
        end

        subgraph "Topics"
            T1["Topic A (3 partitions)"]
            T2["Topic B (2 partitions)"]
        end

        subgraph "Archiviazione"
            PV1[PV Broker 1]
            PV2[PV Broker 2]
            PV3[PV Broker 3]
        end
    end

    CR --> B1
    CR --> B2
    CR --> B3
    B1 --> PV1
    B2 --> PV2
    B3 --> PV3
    Z1 <--> Z2
    Z2 <--> Z3
    B1 -.-> Z1
    B2 -.-> Z1
    B3 -.-> Z1
    T1 --> B1
    T1 --> B2
    T1 --> B3
    T2 --> B1
    T2 --> B2
```

---

## Terminologia

| Termine | Descrizione |
|---------|-------------|
| **Kafka** | Risorsa Kubernetes (`apps.cozystack.io/v1alpha1`) che rappresenta un cluster Kafka gestito. |
| **Broker** | Istanza Kafka che archivia i messaggi e serve produttori/consumatori. |
| **ZooKeeper** | Servizio di coordinamento distribuito che gestisce i metadati del cluster, l'elezione del leader e la configurazione dei topic. |
| **Topic** | Canale di messaggi con un nome. I produttori scrivono in un topic, i consumatori leggono da un topic. |
| **Partizione** | Suddivisione di un topic. Ogni partizione è un log ordinato di messaggi, distribuito su un broker. |
| **Replication Factor** | Numero di copie di ogni partizione su diversi broker. |
| **Consumer Group** | Gruppo di consumatori che si ripartiscono le partizioni di un topic per l'elaborazione parallela. |
| **Retention** | Durata o dimensione massima di conservazione dei messaggi in un topic. |
| **resourcesPreset** | Profilo di risorse predefinito (da nano a 2xlarge). |

---

## Topic e partizioni

### Funzionamento

Un **topic** è suddiviso in **partizioni**, ciascuna distribuita su un broker diverso:

```mermaid
graph LR
    subgraph "Topic: orders"
        P0[Partition 0<br/>Broker 1]
        P1[Partition 1<br/>Broker 2]
        P2[Partition 2<br/>Broker 3]
    end

    Prod[Produttore] --> P0
    Prod --> P1
    Prod --> P2

    P0 --> C1[Consumer 1]
    P1 --> C2[Consumer 2]
    P2 --> C3[Consumer 3]
```

- Più partizioni = più parallelismo
- Ogni partizione ha un **leader** (un broker) e dei **follower** (repliche)
- Il `replicationFactor` determina il numero di copie di ogni partizione

### Configurazione dei topic

I topic sono dichiarati direttamente nel manifesto Kafka:

| Parametro | Descrizione |
|-----------|-------------|
| `topics[name].partitions` | Numero di partizioni del topic |
| `topics[name].config.replicationFactor` | Numero di repliche per partizione |
| `topics[name].config.retentionMs` | Durata di retention in ms (es: `604800000` = 7 giorni) |
| `topics[name].config.cleanupPolicy` | `delete` (eliminazione per TTL) o `compact` (conservazione dell'ultimo messaggio per chiave) |

---

## ZooKeeper

ZooKeeper garantisce il coordinamento del cluster Kafka:

- **Elezione del leader** per ogni partizione
- **Archiviazione dei metadati** (topic, partizioni, offset)
- **Rilevamento dei guasti** dei broker

:::tip
Configurate sempre un numero dispari di istanze ZooKeeper (`zookeeper.replicas: 3`) per garantire il quorum.
:::

Le risorse ZooKeeper sono configurate indipendentemente dai broker tramite `zookeeper.resources` o `zookeeper.resourcesPreset`.

---

## Preset di risorse

I preset si applicano separatamente ai **broker Kafka** e allo **ZooKeeper**:

| Preset | CPU | Memoria |
|--------|-----|---------|
| `nano` | 250m | 128Mi |
| `micro` | 500m | 256Mi |
| `small` | 1 | 512Mi |
| `medium` | 1 | 1Gi |
| `large` | 2 | 2Gi |
| `xlarge` | 4 | 4Gi |
| `2xlarge` | 8 | 8Gi |

---

## Limiti e quote

| Parametro | Valore |
|-----------|--------|
| Broker Kafka max | Secondo la quota del tenant |
| Istanze ZooKeeper | 3 raccomandato (dispari) |
| Topic per cluster | Illimitato (secondo le risorse) |
| Partizioni per topic | Configurabile |
| Dimensione archiviazione | Variabile (`kafka.size`, `zookeeper.size`) |

---

## Per approfondire

- [Panoramica](./overview.md): presentazione del servizio
- [Riferimento API](./api-reference.md): tutti i parametri della risorsa Kafka
