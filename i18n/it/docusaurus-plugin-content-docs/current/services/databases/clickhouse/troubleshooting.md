---
sidebar_position: 7
title: Risoluzione dei problemi
---

# Risoluzione dei problemi — ClickHouse

### ClickHouse Keeper instabile (numero pari di repliche)

**Causa**: il numero di repliche ClickHouse Keeper e pari (2, 4, ecc.), il che impedisce il mantenimento del quorum. Il protocollo Raft necessita di una maggioranza stretta per eleggere un leader, e un numero pari di nodi non garantisce questa maggioranza in caso di partizione di rete.

**Soluzione**:

1. Verificate il numero attuale di repliche Keeper:
   ```bash
   kubectl get pods -l app=clickhouse-keeper-<name>
   ```
2. Modificate il numero di repliche per usare un numero **dispari** (3 o 5):
   ```yaml title="clickhouse.yaml"
   spec:
     clickhouseKeeper:
       enabled: true
       replicas: 3    # Sempre dispari
   ```
3. Applicate la modifica:
   ```bash
   kubectl apply -f clickhouse.yaml
   ```
4. Verificate i log del Keeper per confermare che il quorum sia ristabilito:
   ```bash
   kubectl logs -l app=clickhouse-keeper-<name>
   ```

### Query lente su grandi volumi

**Causa**: la configurazione di sharding non e ottimale, le tabelle non usano i motori corretti, o le risorse allocate sono insufficienti.

**Soluzione**:

1. Verificate che usiate tabelle **Distributed** per distribuire le query su tutti gli shard.
2. Assicuratevi che le tabelle locali usino il motore `ReplicatedMergeTree` con un `ORDER BY` adatto alle vostre query piu frequenti.
3. Aumentate il numero di shard per distribuire il carico:
   ```yaml title="clickhouse.yaml"
   spec:
     shards: 4    # Aumentare il numero di shard
   ```
4. Verificate le risorse allocate e aumentatele se necessario:
   ```bash
   kubectl top pod -l app=clickhouse-<name>
   ```
5. Analizzate le query lente tramite il `query_log` di sistema:
   ```sql
   SELECT query, elapsed, read_rows, memory_usage
   FROM system.query_log
   WHERE type = 'QueryFinish'
   ORDER BY elapsed DESC
   LIMIT 10;
   ```

### Spazio disco insufficiente

**Causa**: il volume di dati supera la dimensione del PVC, o i log di sistema (`query_log`, `query_thread_log`) accumulano troppi dati.

**Soluzione**:

1. Aumentate la dimensione del volume dati:
   ```yaml title="clickhouse.yaml"
   spec:
     size: 50Gi    # Aumentare dal valore attuale
   ```
2. Verificate anche la dimensione del volume log e regolatela se necessario:
   ```yaml title="clickhouse.yaml"
   spec:
     logStorageSize: 5Gi    # Aumentare se i log saturano
   ```
3. Riducete la retention dei log di sistema tramite `logTTL`:
   ```yaml title="clickhouse.yaml"
   spec:
     logTTL: 7    # Ridurre da 15 a 7 giorni ad esempio
   ```
4. Verificate le politiche di retention dei vostri dati applicativi ed eliminate le partizioni obsolete.

### Pod ClickHouse in stato Pending

**Causa**: il PersistentVolumeClaim (PVC) non riesce a legarsi a un volume, generalmente a causa di una `storageClass` inesistente o di una quota di risorse superata.

**Soluzione**:

1. Verificate lo stato del pod e gli eventi associati:
   ```bash
   kubectl describe pod clickhouse-<name>-0-0
   ```
2. Verificate lo stato dei PVC:
   ```bash
   kubectl get pvc -l app=clickhouse-<name>
   ```
3. Verificate che la `storageClass` utilizzata sia una delle classi disponibili: `local`, `replicated` o `replicated-async`.
4. Verificate che le quote di risorse (CPU, memoria, archiviazione) non siano state raggiunte.
5. Correggete la configurazione nel vostro manifesto e riapplicate:
   ```bash
   kubectl apply -f clickhouse.yaml
   ```

### Replica inter-shard fallita

**Causa**: ClickHouse Keeper non e funzionale, la rete tra i pod e instabile, o la configurazione delle repliche per shard e errata.

**Soluzione**:

1. Verificate che ClickHouse Keeper sia operativo:
   ```bash
   kubectl get pods -l app=clickhouse-keeper-<name>
   ```
2. Consultate i log del Keeper per identificare gli errori:
   ```bash
   kubectl logs -l app=clickhouse-keeper-<name>
   ```
3. Verificate la connettivita di rete tra i pod ClickHouse:
   ```bash
   kubectl exec clickhouse-<name>-0-0 -- clickhouse-client --query "SELECT * FROM system.clusters"
   ```
4. Assicuratevi che la configurazione delle repliche sia coerente:
   ```yaml title="clickhouse.yaml"
   spec:
     shards: 2
     replicas: 3    # Ogni shard deve avere lo stesso numero di repliche
     clickhouseKeeper:
       enabled: true
       replicas: 3
   ```
5. Se il Keeper e instabile, riavviate i pod Keeper e attendete la stabilizzazione del quorum.
