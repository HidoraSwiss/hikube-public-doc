---
sidebar_position: 2
title: Concetti
---

# Concetti — RabbitMQ

## Architettura

RabbitMQ su Hikube è un servizio di messaggistica gestito basato sul protocollo **AMQP**. Ogni istanza distribuita tramite la risorsa `RabbitMQ` crea un cluster ad alta disponibilità con **quorum queue** (protocollo Raft) per la replica dei messaggi.

```mermaid
graph TB
    subgraph "Hikube Platform"
        subgraph "Tenant namespace"
            CR[RabbitMQ CRD]
            SEC[Secret credentials]
        end

        subgraph "Cluster RabbitMQ"
            N1[Node 1 - Leader]
            N2[Node 2 - Follower]
            N3[Node 3 - Follower]
        end

        subgraph "Componenti AMQP"
            EX[Exchange]
            Q1[Queue 1]
            Q2[Queue 2]
            B[Bindings]
        end

        subgraph "Archiviazione"
            PV1[PV Node 1]
            PV2[PV Node 2]
            PV3[PV Node 3]
        end

        subgraph "Virtual Hosts"
            VH1[vhost: production]
            VH2[vhost: staging]
        end
    end

    CR --> N1
    CR --> N2
    CR --> N3
    N1 <-->|Raft| N2
    N2 <-->|Raft| N3
    N1 --> PV1
    N2 --> PV2
    N3 --> PV3
    EX -->|routing| B
    B --> Q1
    B --> Q2
    VH1 --> EX
    VH2 --> EX
    CR --> SEC
```

---

## Terminologia

| Termine | Descrizione |
|---------|-------------|
| **RabbitMQ** | Risorsa Kubernetes (`apps.cozystack.io/v1alpha1`) che rappresenta un cluster RabbitMQ gestito. |
| **AMQP** | Advanced Message Queuing Protocol — protocollo standard di messaggistica supportato da RabbitMQ. |
| **Exchange** | Punto di ingresso dei messaggi. Instrada i messaggi verso le code tramite binding. |
| **Queue** | Coda che archivia i messaggi in attesa che un consumer li elabori. |
| **Binding** | Regola di routing tra un exchange e una coda (basata su una routing key). |
| **Quorum Queue** | Tipo di coda che utilizza il protocollo **Raft** per replicare i messaggi su più nodi. |
| **Virtual Host (vhost)** | Spazio dei nomi logico che isola exchange, code e permessi all'interno di uno stesso cluster. |
| **Consumer** | Applicazione che legge ed elabora i messaggi di una coda. |
| **resourcesPreset** | Profilo di risorse predefinito (da nano a 2xlarge). |

---

## Routing dei messaggi

RabbitMQ utilizza un modello di routing flessibile basato sugli exchange e i binding:

```mermaid
graph LR
    P[Producer] -->|publish| EX[Exchange]

    subgraph "Routing"
        EX -->|binding key: order.*| Q1[Queue: orders]
        EX -->|binding key: payment.*| Q2[Queue: payments]
        EX -->|binding key: #| Q3[Queue: audit-log]
    end

    Q1 --> C1[Consumer 1]
    Q2 --> C2[Consumer 2]
    Q3 --> C3[Consumer 3]
```

### Tipi di exchange

| Tipo | Routing |
|------|---------|
| **direct** | Routing key esatta |
| **topic** | Pattern matching con wildcard (`*`, `#`) |
| **fanout** | Broadcast a tutte le code collegate |
| **headers** | Routing basato sugli header del messaggio |

---

## Quorum Queue e alta disponibilità

Le quorum queue utilizzano il protocollo **Raft** per replicare i messaggi:

1. Un nodo viene eletto **leader** per ogni coda
2. I messaggi vengono replicati sui **follower** prima della conferma
3. In caso di guasto del leader, un follower viene automaticamente promosso

```mermaid
sequenceDiagram
    participant P as Producer
    participant L as Leader (Node 1)
    participant F1 as Follower (Node 2)
    participant F2 as Follower (Node 3)

    P->>L: Publish message
    L->>F1: Replicate (Raft)
    L->>F2: Replicate (Raft)
    F1-->>L: ACK
    F2-->>L: ACK
    Note over L: Quorum raggiunto (2/3)
    L-->>P: Confirm
```

:::tip
Configurate `replicas: 3` minimo per garantire il quorum Raft e l'alta disponibilità delle quorum queue.
:::

---

## Virtual Host

I **vhost** isolano le risorse all'interno di uno stesso cluster:

- Ogni vhost ha i propri exchange, code e permessi
- Gli utenti possono avere ruoli diversi per vhost: `admin` o `readonly`
- Utile per separare gli ambienti (produzione, staging) sullo stesso cluster

---

## Gestione degli utenti

Gli utenti sono dichiarati nel manifesto con:

- **Password** per l'autenticazione
- **Ruoli per vhost**: `admin` (lettura/scrittura/configurazione), `readonly` (sola lettura)

Le credenziali sono archiviate nel Secret `<istanza>-credentials`.

---

## Preset di risorse

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
| Repliche max | Secondo la quota del tenant |
| Dimensione archiviazione (`size`) | Variabile (in Gi) |
| Vhost per cluster | Illimitato (secondo le risorse) |
| Protocolli supportati | AMQP 0-9-1, AMQP 1.0, MQTT, STOMP |

---

## Per approfondire

- [Panoramica](./overview.md): presentazione del servizio
- [Riferimento API](./api-reference.md): tutti i parametri della risorsa RabbitMQ
