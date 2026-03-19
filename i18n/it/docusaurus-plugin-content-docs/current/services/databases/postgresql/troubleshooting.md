---
sidebar_position: 7
title: Risoluzione dei problemi
---

# Risoluzione dei problemi — PostgreSQL

### Pod PostgreSQL in stato Pending

**Causa**: il PersistentVolumeClaim (PVC) non riesce a legarsi a un volume. Questo può essere dovuto a una `storageClass` inesistente, una quota di archiviazione superata o una mancanza di risorse sui nodi.

**Soluzione**:

1. Verificate lo stato del pod e gli eventi associati:
   ```bash
   kubectl describe pod pg-<name>-1
   ```
2. Verificate lo stato del PVC:
   ```bash
   kubectl get pvc
   kubectl describe pvc pg-<name>-1
   ```
3. Verificate che la `storageClass` utilizzata sia una delle classi disponibili: `local`, `replicated` o `replicated-async`.
4. Verificate che la vostra quota di archiviazione non sia stata raggiunta.
5. Se necessario, correggete la `storageClass` nel vostro manifesto e riapplicate:
   ```bash
   kubectl apply -f postgresql.yaml
   ```

### Replica desincronizzata tra primary e standby

**Causa**: un ritardo (lag) di replica può verificarsi a causa di un carico di rete elevato, risorse insufficienti sugli standby, o un volume di transazioni importante sul primary.

**Soluzione**:

1. Connettetevi al primary e verificate lo stato della replica:
   ```sql
   SELECT client_addr, state, sent_lsn, write_lsn, flush_lsn, replay_lsn
   FROM pg_stat_replication;
   ```
2. Confrontate le posizioni LSN tra `sent_lsn` e `replay_lsn`. Un divario importante indica un lag.
3. Verificate le risorse allocate agli standby (CPU, memoria). Se necessario, aumentate il `resourcesPreset` o le `resources` esplicite.
4. Verificate la connettività di rete tra i pod:
   ```bash
   kubectl logs pg-<name>-2
   ```
5. Se il lag persiste, considerate la riduzione del carico di scrittura sul primary o l'aumento delle risorse.

### Connessione rifiutata a PostgreSQL

**Causa**: i pod non sono in esecuzione, il nome del Secret e errato, o il servizio non è accessibile.

**Soluzione**:

1. Verificate che i pod PostgreSQL siano nello stato `Running`:
   ```bash
   kubectl get pods -l app=pg-<name>
   ```
2. Verificate che il servizio esista e punti agli endpoint corretti:
   ```bash
   kubectl get svc pg-<name>-rw
   kubectl get endpoints pg-<name>-rw
   ```
3. Assicuratevi di usare il nome corretto del Secret per le credenziali. Il pattern e `pg-<name>-app`:
   ```bash
   kubectl get tenantsecret pg-<name>-app
   ```
4. Testate la connessione da un pod nello stesso namespace:
   ```bash
   kubectl run test-pg --rm -it --image=postgres:16 -- psql -h pg-<name>-rw -p 5432 -U <user>
   ```

### Ripristino PITR fallito

**Causa**: i parametri di bootstrap sono mal configurati. Il campo `bootstrap.oldName` deve corrispondere esattamente al nome dell'istanza originale, e il nome della nuova istanza deve essere diverso.

**Soluzione**:

1. Verificate che `bootstrap.oldName` corrisponda esattamente al nome dell'istanza PostgreSQL originale:
   ```yaml title="postgresql-restore.yaml"
   apiVersion: apps.cozystack.io/v1alpha1
   kind: Postgres
   metadata:
     name: restored-db       # Deve essere un nuovo nome
   spec:
     bootstrap:
       enabled: true
       oldName: "original-db"  # Nome esatto della vecchia istanza
       recoveryTime: "2025-06-15T14:30:00Z"  # Formato RFC 3339
   ```
2. Il `recoveryTime` deve essere nel formato **RFC 3339** (es: `2025-06-15T14:30:00Z`). Se lasciato vuoto, il ripristino avviene all'ultimo stato disponibile.
3. Il nome in `metadata.name` deve essere **diverso** da `bootstrap.oldName`.
4. Assicuratevi che i backup dell'istanza originale siano ancora accessibili nello storage S3.

### Prestazioni lente

**Causa**: i parametri PostgreSQL non sono adatti al carico di lavoro, o le risorse allocate sono insufficienti.

**Soluzione**:

1. Regolate i parametri PostgreSQL nel vostro manifesto:
   ```yaml title="postgresql.yaml"
   spec:
     postgresql:
       parameters:
         shared_buffers: 512MB       # ~25% della RAM allocata
         work_mem: 64MB              # Memoria per operazione di ordinamento
         max_connections: 200        # Adattare in base al carico
         effective_cache_size: 1536MB  # ~75% della RAM
   ```
2. Verificate che il `resourcesPreset` sia adatto al vostro carico:
   - Sviluppo: `nano` o `micro`
   - Produzione: `medium`, `large` o superiore
3. Monitorate l'utilizzo delle risorse:
   ```bash
   kubectl top pod pg-<name>-1
   ```
4. Se le query sono lente, identificatele con `pg_stat_statements` e ottimizzate gli indici.
5. Aumentate le risorse se necessario passando a un preset superiore o definendo `resources` esplicite.
