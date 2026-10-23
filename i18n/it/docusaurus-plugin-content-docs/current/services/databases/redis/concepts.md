---
sidebar_position: 2
title: "Concetti — Redis"
sidebar_label: Concetti
description: "I concetti di Redis su Hikube: architettura master e repliche, failover gestito da Redis Sentinel, persistenza su disco, autenticazione e accesso di rete."
---

# Concetti — Redis

## Architettura

Redis su Hikube è un servizio gestito. Ogni cluster creato dalla console è un insieme master-repliche, supervisionato da **Redis Sentinel** per il failover automatico. Appartiene a un **progetto** e consuma le quote di tale progetto.

```mermaid
graph TB
    subgraph "Console Hikube"
        UI[Progetto → DB & Messaging → Redis]
    end

    subgraph "Cluster Redis"
        M[Master - R/W]
        R1[Replica 1 - RO]
        R2[Replica 2 - RO]
    end

    subgraph "Redis Sentinel"
        S1[Sentinel 1]
        S2[Sentinel 2]
        S3[Sentinel 3]
    end

    UI -->|creazione / modifica| M
    M -->|replicazione| R1
    M -->|replicazione| R2
    S1 -.->|monitoraggio| M
    S2 -.->|monitoraggio| M
    S3 -.->|monitoraggio| M
```

---

## Terminologia

| Termine | Descrizione |
|-------|-------------|
| **Cluster Redis** | Istanza gestita creata dalla console, composta da un master ed eventuali repliche. |
| **Progetto** | Spazio isolato che raggruppa le sue risorse e a cui si applicano le quote. |
| **Master** | Istanza principale che accetta letture e scritture. |
| **Replica** | Istanza in sola lettura, sincronizzata dal master. |
| **Sentinel** | Processo di supervisione che rileva i guasti del master e orchestra il failover automatico. |
| **Preset** | Modello di risorse (CPU, memoria) allocato a ogni nodo del cluster. |
| **Public network** | Opzione (chiamata anche **External access**) che espone il cluster su Internet tramite un indirizzo IP pubblico. |
| **Autenticazione** | Protezione dell'accesso tramite una password globale del cluster. |

---

## Alta disponibilità con Sentinel

Redis Sentinel garantisce l'alta disponibilità:

1. **Monitorando** costantemente il master e le repliche
2. **Rilevando** il guasto del master tramite consenso tra i Sentinel
3. **Promuovendo** automaticamente una replica a nuovo master
4. **Riconfigurando** le altre repliche affinché seguano il nuovo master

```mermaid
sequenceDiagram
    participant S1 as Sentinel 1
    participant S2 as Sentinel 2
    participant S3 as Sentinel 3
    participant M as Master
    participant R1 as Replica

    S1->>M: PING
    M--xS1: Timeout (guasto)
    S1->>S2: Master down?
    S1->>S3: Master down?
    S2-->>S1: Sì
    S3-->>S1: Sì
    Note over S1,S3: Quorum raggiunto
    S1->>R1: Promozione
    Note over R1: Nuovo master
```

Il valore **Number of replicas** si sceglie alla creazione (da 1 a 8).

:::tip
Il failover automatico funziona a partire da **2 repliche**: vengono sempre distribuiti tre Sentinel, che formano il quorum. Per la produzione scelga **3 repliche** o più, in modo da tollerare un numero maggiore di guasti.
:::

:::warning
Il numero di repliche non può essere modificato dopo la creazione («The mode cannot be changed after creation»). Per cambiarlo, [contatti il supporto](mailto:support@hidora.io).
:::

---

## Persistenza

Ogni nodo dispone di un volume persistente la cui capacità è definita dal campo **Volume size (GB)** («Storage capacity allocated to each node in the cluster.»). Redis scrive i dati su disco tramite i propri meccanismi nativi, il che consente loro di sopravvivere ai riavvii.

---

## Autenticazione

L'opzione **Enable authentication** è attiva per impostazione predefinita nella procedura guidata:

- **Attivata**: alla creazione viene generata una password, mostrata una sola volta insieme all'utente `default`. Può rinnovarla in qualsiasi momento dalla sezione **Security** della pagina del cluster (**Rotate password**).
- **Disattivata**: il cluster accetta connessioni senza password. Da evitare, in particolare con la rete pubblica attivata.

Redis su Hikube non offre nella console la gestione di più utenti (ACL): l'accesso si basa su questa password globale.

---

## Accesso di rete

- **Host interno**: sempre assegnato, visualizzato nella zona **Internal** della sezione **Connection**. Punta al master ed è raggiungibile dalle VM e dai cluster Kubernetes dello stesso progetto, non da un altro progetto né da Internet.
- **Public network** disattivata (impostazione predefinita, «Private» nel riepilogo): il cluster non è esposto su Internet. La zona **External** mostra **Disabled**.
- **Public network** attivata («Public»): la piattaforma assegna un indirizzo IP pubblico, mostrato nella zona **External**. Dà accesso al master sulla porta standard di Redis, `6379`, e segue il master dopo una commutazione.

---

## Preset

Il **Preset** definisce la capacità allocata a **ogni nodo** del cluster. I preset riprendono le taglie delle [macchine virtuali](../../compute/overview.md) delle serie `u1`, `s1` e `m1`: un preset ha le stesse risorse della VM con lo stesso nome. Fa fede l'elenco mostrato dalla procedura guidata:

| Preset | CPU | Memoria |
|--------|-----|---------|
| `u1.medium` | 1 | 4Gi |
| `u1.large` | 2 | 8Gi |
| `u1.xlarge` | 4 | 16Gi |
| `u1.2xlarge` | 8 | 32Gi |
| `u1.4xlarge` | 16 | 64Gi |
| `u1.8xlarge` | 32 | 128Gi |
| `s1.small` | 1 | 2Gi |
| `s1.medium` | 2 | 4Gi |
| `s1.large` | 4 | 8Gi |
| `s1.xlarge` | 8 | 16Gi |
| `s1.2xlarge` | 16 | 32Gi |
| `s1.4xlarge` | 32 | 64Gi |
| `m1.large` | 2 | 16Gi |
| `m1.xlarge` | 4 | 32Gi |
| `m1.2xlarge` | 8 | 64Gi |
| `m1.4xlarge` | 16 | 128Gi |
| `m1.8xlarge` | 32 | 256Gi |

La procedura guidata non preseleziona alcun preset: ne scelga uno per proseguire. Ogni opzione indica le sue risorse, ad esempio « u1.medium — 1 CPU / 4Gi ». Se l'elenco non può essere caricato, la procedura guidata mostra « The preset list could not be loaded. Try again later or contact support. »

Un cluster creato con un vecchio preset (`nano`, `micro`, `small`, `medium`, `large`, `xlarge` o `2xlarge`) lo conserva e funziona come prima: il modulo **Edit** lo mostra così com'è e lo salva senza modifiche. Se le risorse di un cluster sono state fissate al di fuori del suo preset, il modulo lo indica con la menzione « (override) ».

La memoria del preset limita la dimensione del dataset che Redis può mantenere in memoria. La definizione di risorse CPU/memoria personalizzate non è disponibile nella console; contatti il supporto.

---

## Quote e costi

La procedura guidata mostra l'**Estimated Cost** e l'impatto del cluster sulle quote del progetto. Se il cluster supera le quote disponibili, il pulsante **Next** resta inattivo.

Oltre alle repliche, la quota conta i tre Sentinel del cluster, ciascuno con la CPU e la memoria del preset scelto, senza storage: un cluster con 3 repliche riserva quindi 6 volte la CPU e la memoria del suo preset.

| Parametro | Valore |
|-----------|--------|
| Repliche | Da 1 a 8 |
| Dimensione del volume | Da 1 a 4.096 GB per nodo, entro il limite della quota del progetto; dopo la creazione, solo aumento |
| Database Redis | Database logico `0` per impostazione predefinita |

---

## Per approfondire

- [Panoramica](./overview.md): presentazione del servizio
- [Avvio rapido](./quick-start.md): creare il suo primo cluster
