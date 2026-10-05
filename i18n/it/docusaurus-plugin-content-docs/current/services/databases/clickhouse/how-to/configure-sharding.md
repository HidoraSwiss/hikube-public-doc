---
title: "Come configurare lo sharding di ClickHouse"
sidebar_position: 3
---

# Come configurare lo sharding di ClickHouse

:::info Disponibilità
ClickHouse non è ancora disponibile in modalità self-service nella [console Hikube](https://console.hikube.cloud).
Per effettuare il provisioning di un'istanza o modificarne la configurazione, [contatti il supporto](mailto:support@hidora.io).
:::

Questa guida spiega come scegliere il numero di shard e di repliche di un'istanza ClickHouse e come creare tabelle che sfruttano questa topologia.

## Passaggi

### 1. Comprendere shard e repliche

- **Shard**: distribuiscono i dati orizzontalmente. Ogni shard contiene una parte dei dati. Più shard = maggiore capacità di storage e di elaborazione in parallelo.
- **Repliche**: duplicano i dati all'interno di ogni shard per la ridondanza. Più repliche = maggiore disponibilità in caso di guasto.

Ad esempio, con 2 shard e 2 repliche per shard, l'istanza conta 4 nodi ClickHouse in totale.

:::note
Lo sharding è utile quando il volume dei dati supera la capacità di un singolo nodo, oppure quando si desidera parallelizzare le query su più server.
:::

### 2. Richiedere la topologia

[Contatti il supporto](mailto:support@hidora.io) indicando il numero di shard, il numero di repliche per shard, il preset e la dimensione dello storage. Una configurazione replicata o con sharding si basa su **ClickHouse Keeper** (3 istanze consigliate, sempre in numero dispari).

### 3. Creare tabelle distribuite

Su un'istanza con sharding, crei una tabella locale replicata su ogni shard, quindi una tabella `Distributed` che ripartisce le query:

```sql
-- Tabella locale, creata su tutti i nodi del cluster
CREATE TABLE default.events_local ON CLUSTER '{cluster}'
(
    ts DateTime,
    user_id UInt64,
    action String
)
ENGINE = ReplicatedMergeTree
ORDER BY (ts, user_id);

-- Tabella distribuita, punto di ingresso delle query
CREATE TABLE default.events ON CLUSTER '{cluster}'
AS default.events_local
ENGINE = Distributed('{cluster}', default, events_local, cityHash64(user_id));
```

:::tip
Scelga una chiave di distribuzione (qui `cityHash64(user_id)`) che ripartisca uniformemente i dati e raggruppi quelli interrogati insieme.
:::

## Verifica

```sql
-- Topologia vista da ClickHouse
SELECT cluster, shard_num, replica_num, host_name
FROM system.clusters;

-- Ripartizione delle righe per shard
SELECT _shard_num, count() FROM default.events GROUP BY _shard_num;
```

## Per approfondire

- [Concetti ClickHouse](../concepts.md): sharding, replica, Keeper
- [Scalare verticalmente](./scale-resources.md)
