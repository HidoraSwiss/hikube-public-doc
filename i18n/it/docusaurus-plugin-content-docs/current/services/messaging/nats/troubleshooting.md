---
sidebar_position: 7
title: Risoluzione dei problemi
---

# Risoluzione dei problemi — NATS

### Messaggi persi (senza JetStream)

**Causa**: JetStream non è attivato o nessuno stream è configurato per catturare i messaggi. Senza JetStream, NATS funziona in modalità fire-and-forget: i messaggi vengono consegnati solo agli iscritti connessi al momento della pubblicazione.

**Soluzione**:

1. Verificate che JetStream sia attivato nel vostro manifesto:
   ```yaml title="nats.yaml"
   jetstream:
     enabled: true
     size: 10Gi
   ```
2. Riapplicate il manifesto se necessario:
   ```bash
   kubectl apply -f nats.yaml
   ```
3. Create uno stream per catturare i messaggi dei subject desiderati:
   ```bash
   nats stream add --subjects "orders.>" --storage file --replicas 3 --retention limits orders-stream
   ```
4. Verificate che lo stream sia stato creato e catturi i messaggi:
   ```bash
   nats stream info orders-stream
   ```

### Il consumer non riceve i messaggi

**Causa**: il consumer è iscritto a un subject che non corrisponde a quello utilizzato dal produttore. Gli errori comuni includono un errore di battitura nel nome del subject, un uso errato dei wildcard, o una configurazione di queue group non corretta.

**Soluzione**:

1. Verificate il subject esatto utilizzato dal produttore e dal consumer — i subject sono **sensibili alle maiuscole/minuscole**
2. Testate la ricezione con un abbonamento di diagnostica:
   ```bash
   nats sub ">"
   ```
   Questo consente di vedere **tutti i messaggi** pubblicati sul server
3. Verificate i wildcard utilizzati:
   - `orders.*` non corrisponde a `orders.new.urgent` (utilizzate `orders.>` per i sotto-livelli)
4. Se utilizzate i queue group, verificate che il consumer sia membro del gruppo atteso e che il nome del gruppo sia identico

### Archiviazione JetStream piena

**Causa**: il volume JetStream ha raggiunto la sua capacità massima (`jetstream.size`). I nuovi messaggi non possono più essere persistiti e le pubblicazioni falliscono.

**Soluzione**:

1. Verificate l'utilizzo dell'archiviazione JetStream:
   ```bash
   nats account info
   ```
2. Identificate gli stream più voluminosi:
   ```bash
   nats stream list
   ```
3. Eliminate i vecchi messaggi dagli stream che lo consentono:
   ```bash
   nats stream purge <nome-stream>
   ```
4. Verificate la politica di retention degli stream — utilizzate `limits` con `max-age` per eliminare automaticamente i vecchi messaggi:
   ```bash
   nats stream edit <nome-stream> --max-age 72h
   ```
5. Se necessario, aumentate `jetstream.size` nel vostro manifesto:
   ```yaml title="nats.yaml"
   jetstream:
     enabled: true
     size: 50Gi
   ```

### Memoria insufficiente

**Causa**: il server NATS consuma più memoria del limite allocato, spesso a causa di un numero elevato di connessioni, di messaggi voluminosi (`max_payload` troppo elevato), o di stream JetStream in memoria.

**Soluzione**:

1. Verificate gli eventi del pod per confermare un OOMKill:
   ```bash
   kubectl describe pod <pod-nats> | grep -A 5 "Last State"
   ```
2. Aumentate le risorse allocate a NATS:
   ```yaml title="nats.yaml"
   replicas: 3
   resources:
     cpu: 1
     memory: 2Gi
   ```
3. Verificate il valore di `max_payload` in `config.merge` — riducetelo se i messaggi molto voluminosi non sono necessari
4. Riapplicate il manifesto:
   ```bash
   kubectl apply -f nats.yaml
   ```

### Connessione rifiutata

**Causa**: il client non riesce a connettersi al server NATS. Questo può essere dovuto a pod non avviati, credenziali errate, o un tentativo di connessione esterna senza `external: true`.

**Soluzione**:

1. Verificate che i pod NATS siano nello stato `Running`:
   ```bash
   kubectl get pods -l app.kubernetes.io/component=nats
   ```
2. Consultate i log del pod per identificare gli errori:
   ```bash
   kubectl logs <pod-nats>
   ```
3. Verificate le credenziali utente nel Secret Kubernetes:
   ```bash
   kubectl get tenantsecret <nome-nats>-credentials -o jsonpath='{.data}' | base64 -d
   ```
4. Se vi connettete dall'esterno del cluster, assicuratevi che `external: true` sia configurato:
   ```yaml title="nats.yaml"
   external: true
   ```
5. Testate la connettività da un pod nel cluster:
   ```bash
   kubectl exec <pod-nats> -- nats-server --help 2>&1 | head -1
   ```
