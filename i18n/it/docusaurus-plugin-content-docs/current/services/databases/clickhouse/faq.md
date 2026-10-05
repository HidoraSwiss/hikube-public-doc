---
sidebar_position: 6
title: FAQ
---

# FAQ — ClickHouse

:::info Disponibilità
ClickHouse non è ancora disponibile in modalità self-service nella [console Hikube](https://console.hikube.cloud).
Per effettuare il provisioning di un'istanza o modificarne la configurazione, [contatti il supporto](mailto:support@hidora.io).
:::

### Qual è la differenza tra shard e repliche?

Gli **shard** e le **repliche** svolgono ruoli diversi nell'architettura ClickHouse:

- **Shard**: distribuzione **orizzontale** dei dati. Ogni shard contiene una parte del dataset totale. Aggiungere shard aumenta la capacità di storage e di elaborazione.
- **Repliche**: copie **identiche** dei dati all'interno di uno stesso shard, per l'alta disponibilità.

Ad esempio, 2 shard con 3 repliche ciascuno corrispondono a 6 nodi ClickHouse.

:::tip
In produzione, preveda almeno 2 repliche per shard per l'alta disponibilità. Aumenti il numero di shard per elaborare volumi di dati più importanti.
:::

### A cosa serve ClickHouse Keeper?

**ClickHouse Keeper** è il componente di coordinamento del cluster, basato sul protocollo **Raft**. Sostituisce Apache ZooKeeper e garantisce:

- L'**elezione del leader** per le tabelle replicate
- Il **coordinamento** delle operazioni di replica tra le repliche
- La gestione dei **metadati** del cluster

Il numero di istanze Keeper deve essere **dispari** (3 o 5) per garantire il quorum. Il minimo consigliato è **3**.

### ClickHouse è adatto alle query transazionali (OLTP)?

**No.** ClickHouse è un motore **OLAP** (Online Analytical Processing) ottimizzato per l'analisi dei dati:

- Architettura **orientata alle colonne**: molto performante per aggregazioni e scansioni su grandi volumi
- Ottimizzato per **letture massive** e query analitiche
- **Non adatto** alle operazioni transazionali frequenti (`UPDATE`, `DELETE` puntuali)

Per un motore transazionale, utilizzi piuttosto [PostgreSQL](../postgresql/overview.md) o [MariaDB](../mariadb/overview.md), disponibili nella console.

### Quali preset sono disponibili?

| **Preset** | **CPU** | **Memoria** |
|------------|---------|-------------|
| `nano`     | 250m    | 128Mi       |
| `micro`    | 500m    | 256Mi       |
| `small`    | 1       | 512Mi       |
| `medium`   | 1       | 1Gi         |
| `large`    | 2       | 2Gi         |
| `xlarge`   | 4       | 4Gi         |
| `2xlarge`  | 8       | 8Gi         |

Il preset si applica a ogni replica. Lo indichi nella sua richiesta al supporto.

### Come vengono distribuiti i dati tra gli shard?

I dati vengono distribuiti tra gli shard tramite il motore **Distributed** di ClickHouse:

- Ogni shard archivia una **partizione** del dataset totale
- Il motore `Distributed` inoltra le query a tutti gli shard e **unisce i risultati**
- I dati vengono **replicati** all'interno di ogni shard in base al numero di repliche

Crei tabelle `ReplicatedMergeTree` su ogni shard e una tabella `Distributed` per le query globali. Consulti [Configurare lo sharding](./how-to/configure-sharding.md).

### Come configurare i backup ClickHouse?

I backup ClickHouse inviano snapshot cifrati verso uno storage compatibile S3. L'attivazione avviene su richiesta: [contatti il supporto](mailto:support@hidora.io) precisando la frequenza e la conservazione desiderate.
