---
sidebar_position: 7
title: Risoluzione dei problemi
---

# Risoluzione dei problemi — Redis

### Perdita di dati dopo il riavvio

**Causa**: la `storageClass` utilizzata e `local`, il che significa che i dati sono archiviati unicamente sul nodo fisico dove veniva eseguito il pod. Se il pod viene ripianificato su un altro nodo, i dati precedenti vengono persi.

**Soluzione**:

1. Verificate la `storageClass` utilizzata:
   ```bash
   kubectl get pvc -l app=redis-<name>
   ```
2. Se usate una sola replica (`replicas` = 1), passate a `storageClass: replicated` affinche lo storage compensi l'assenza di replica applicativa. Se avete piu repliche (`replicas` >= 3), `storageClass: local` e appropriato perche Redis Sentinel assicura gia l'alta disponibilita:
   ```yaml title="redis.yaml"
   spec:
     storageClass: replicated    # Se replicas = 1
     # storageClass: local       # Se replicas >= 3 (Sentinel assicura l'HA)
   ```
3. Applicate la modifica. Notate che un cambio di `storageClass` richiede generalmente la ricreazione dei PVC.
4. Assicuratevi anche che `replicas` >= 3 per beneficiare della replica Redis Sentinel.

### Redis Sentinel non converge

**Causa**: il numero di repliche e pari o inferiore a 3, il che impedisce al quorum Sentinel di funzionare correttamente. Sentinel necessita di una maggioranza per eleggere un nuovo primary.

**Soluzione**:

1. Verificate il numero di repliche:
   ```bash
   kubectl get pods -l app=redis-<name>
   ```
2. Assicuratevi di usare un numero **dispari** >= 3:
   ```yaml title="redis.yaml"
   spec:
     replicas: 3    # Oppure 5, mai 2 o 4
   ```
3. Consultate i log di Sentinel per identificare i problemi di convergenza:
   ```bash
   kubectl logs -l app=rfs-redis-<name>
   ```
4. Verificate la connettivita di rete tra i pod Redis. Problemi di DNS o di rete possono impedire la scoperta dei nodi.

### Memoria satura (OOMKilled)

**Causa**: il dataset Redis supera la memoria allocata al contenitore. Kubernetes termina il pod quando supera il suo limite di memoria.

**Soluzione**:

1. Verificate se il pod e stato terminato per OOM:
   ```bash
   kubectl describe pod rfr-redis-<name>-0 | grep -i oom
   ```
2. Aumentate la memoria allocata tramite `resources.memory` o un `resourcesPreset` superiore:
   ```yaml title="redis.yaml"
   spec:
     resources:
       cpu: 1000m
       memory: 2Gi    # Aumentare la memoria
   ```
3. Verificate la politica di eviction Redis (`maxmemory-policy`). Per impostazione predefinita, Redis restituisce un errore quando la memoria e piena. Considerate l'uso di `allkeys-lru` se Redis funge da cache.
4. Monitorate la dimensione del dataset:
   ```bash
   redis-cli -h rfr-redis-<name> -p 6379 -a <password> INFO memory
   ```

### Timeout di connessione

**Causa**: i pod Redis non sono in esecuzione, gli endpoint del servizio sono vuoti, o la configurazione di autenticazione lato client non corrisponde a quella del server.

**Soluzione**:

1. Verificate che i pod siano nello stato `Running`:
   ```bash
   kubectl get pods -l app=redis-<name>
   ```
2. Verificate che i servizi abbiano endpoint:
   ```bash
   kubectl get endpoints rfr-redis-<name>
   kubectl get endpoints rfs-redis-<name>
   ```
3. Se `authEnabled: true`, assicuratevi che il vostro client fornisca la password corretta.
4. Testate la connessione da un pod di debug:
   ```bash
   kubectl run test-redis --rm -it --image=redis:7 -- redis-cli -h rfr-redis-<name> -p 6379 -a <password> PING
   ```

### Autenticazione fallita

**Causa**: la password utilizzata non corrisponde a quella memorizzata nel Secret Kubernetes, oppure `authEnabled` non e attivato sul server mentre il client invia una password (o viceversa).

**Soluzione**:

1. Recuperate la password corretta dal Secret:
   ```bash
   kubectl get tenantsecret redis-<name>-auth -o jsonpath='{.data.password}' | base64 -d
   ```
2. Verificate che `authEnabled: true` sia configurato nel vostro manifesto:
   ```yaml title="redis.yaml"
   spec:
     authEnabled: true
   ```
3. Assicuratevi che il vostro client utilizzi esattamente la password recuperata al passo 1.
4. Se avete cambiato la configurazione `authEnabled`, i client esistenti devono essere aggiornati per riflettere il cambiamento.
