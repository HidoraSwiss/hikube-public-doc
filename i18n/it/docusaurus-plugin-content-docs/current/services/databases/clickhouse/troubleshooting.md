---
sidebar_position: 7
title: Risoluzione dei problemi
---

# Risoluzione dei problemi — ClickHouse

:::info Disponibilità
ClickHouse non è ancora disponibile in modalità self-service nella [console Hikube](https://console.hikube.cloud).
Per effettuare il provisioning di un'istanza o modificarne la configurazione, [contatti il supporto](mailto:support@hidora.io).
:::

### Query lente su grandi volumi

**Causa**: le tabelle non utilizzano i motori corretti o un `ORDER BY` adeguato, la topologia non è ottimale, oppure le risorse assegnate sono insufficienti.

**Soluzione**:

1. Su un'istanza con sharding, interroghi tabelle **Distributed** per ripartire le query su tutti gli shard.
2. Si assicuri che le tabelle locali utilizzino `ReplicatedMergeTree` con un `ORDER BY` adatto ai filtri che usa più spesso.
3. Analizzi le query lente tramite il log di sistema:
   ```sql
   SELECT query, elapsed, read_rows, memory_usage
   FROM system.query_log
   WHERE type = 'QueryFinish'
   ORDER BY elapsed DESC
   LIMIT 10;
   ```
4. Se le risorse sono sature, richieda al [supporto](mailto:support@hidora.io) un preset superiore o shard aggiuntivi. Consulti [Scalare verticalmente](./how-to/scale-resources.md).

### Spazio su disco insufficiente

**Causa**: il volume dei dati supera la dimensione dello storage, oppure i log di sistema (`query_log`, `query_thread_log`) accumulano troppi dati.

**Soluzione**:

1. Identifichi le tabelle più voluminose:
   ```sql
   SELECT database, table, formatReadableSize(sum(bytes_on_disk)) AS size
   FROM system.parts
   WHERE active
   GROUP BY database, table
   ORDER BY sum(bytes_on_disk) DESC;
   ```
2. Elimini le partizioni obsolete dei suoi dati applicativi (`ALTER TABLE ... DROP PARTITION`) oppure imposti un `TTL` sulle sue tabelle.
3. Per aumentare lo storage o la dimensione del volume dei log, oppure per ridurne la conservazione, contatti il supporto.

### Errori di replica o Keeper non disponibile

**Causa**: ClickHouse Keeper non ha il quorum, oppure una replica non riesce più a sincronizzarsi.

**Soluzione**:

1. Controlli lo stato delle tabelle replicate:
   ```sql
   SELECT database, table, is_readonly, absolute_delay, queue_size
   FROM system.replicas
   WHERE is_readonly OR absolute_delay > 60;
   ```
2. Una replica in sola lettura (`is_readonly = 1`) segnala generalmente una perdita di contatto con Keeper. [Contatti il supporto](mailto:support@hidora.io) indicando il progetto, il nome dell'istanza e il risultato della query.

### Autenticazione rifiutata

**Causa**: utente o password errati, oppure un utente in sola lettura che tenta una scrittura (`Not enough privileges`).

**Soluzione**: verifichi le credenziali ricevute e il livello di accesso dell'utente (`SHOW GRANTS`). Per creare un utente o modificarne i diritti, contatti il supporto. Consulti [Gestire gli utenti](./how-to/manage-users.md).
