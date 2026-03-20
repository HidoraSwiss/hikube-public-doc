---
sidebar_position: 7
title: Risoluzione dei problemi
---

# Risoluzione dei problemi — Kafka

### ZooKeeper perde il quorum

**Causa**: il numero di repliche ZooKeeper è insufficiente o pari, impedendo la formazione di un quorum maggioritario. Un quorum richiede una maggioranza stretta (es. 2/3 nodi).

**Soluzione**:

1. Verificate il numero di repliche ZooKeeper configurato:
   ```bash
   kubectl get kafka -o yaml | grep -A 5 zookeeper
   ```
2. Assicuratevi che `zookeeper.replicas` sia un **numero dispari** (3, 5 o 7)
3. Verificate lo stato dei pod ZooKeeper:
   ```bash
   kubectl get pods -l app.kubernetes.io/component=zookeeper
   ```
4. Controllate lo spazio disco disponibile sui volumi ZooKeeper — un disco pieno provoca la perdita del quorum:
   ```bash
   kubectl exec <pod-zookeeper> -- df -h /data
   ```
5. Se necessario, aumentate `zookeeper.size` nel vostro manifesto e riapplicatelo

### Topic inaccessibile o broker non disponibile

**Causa**: uno o più broker Kafka non funzionano correttamente, oppure il topic non ha un numero sufficiente di repliche sincronizzate rispetto a `min.insync.replicas`.

**Soluzione**:

1. Verificate lo stato dei pod Kafka:
   ```bash
   kubectl get pods -l app.kubernetes.io/component=kafka
   ```
2. Ispezionate gli eventi di un pod in errore:
   ```bash
   kubectl describe pod <pod-kafka>
   ```
3. Verificate che il numero di repliche del topic sia coerente con il numero di broker disponibili:
   ```bash
   kubectl exec <pod-kafka> -- kafka-topics.sh --describe --topic <nome-topic> --bootstrap-server localhost:9092
   ```
4. Controllate lo spazio di archiviazione — un volume pieno impedisce al broker di funzionare:
   ```bash
   kubectl exec <pod-kafka> -- df -h /bitnami/kafka
   ```

### Consumer lag elevato

**Causa**: i consumer non elaborano i messaggi abbastanza rapidamente rispetto al throughput di produzione. Questo può essere dovuto a un numero insufficiente di partizioni, troppo pochi consumer nel gruppo, o consumer sottodimensionati.

**Soluzione**:

1. Identificate il lag del consumer group:
   ```bash
   kubectl exec <pod-kafka> -- kafka-consumer-groups.sh --describe --group <group-id> --bootstrap-server localhost:9092
   ```
2. Se il lag è distribuito su molte partizioni, **aumentate il numero di consumer** nel gruppo (senza superare il numero di partizioni)
3. Se tutte le partizioni presentano lag, considerate di **aumentare il numero di partizioni** del topic:
   ```yaml title="kafka.yaml"
   topics:
     - name: events
       partitions: 12
       replicas: 3
   ```
4. Verificate che i consumer abbiano risorse sufficienti (CPU, memoria) per elaborare i messaggi

### Broker in OOMKilled

**Causa**: il broker Kafka consuma più memoria del limite allocato. Questo si verifica frequentemente con il preset `nano` o `micro` sotto carico.

**Soluzione**:

1. Verificate gli eventi del pod per confermare l'OOMKill:
   ```bash
   kubectl describe pod <pod-kafka> | grep -A 5 "Last State"
   ```
2. Aumentate le risorse di memoria del broker utilizzando un preset superiore o risorse esplicite:
   ```yaml title="kafka.yaml"
   kafka:
     replicas: 3
     resources:
       cpu: 2000m
       memory: 4Gi
     size: 20Gi
   ```
3. Riapplicate il manifesto:
   ```bash
   kubectl apply -f kafka.yaml
   ```

### Messaggi duplicati

**Causa**: per impostazione predefinita, Kafka funziona in modalità **at-least-once delivery**. In caso di retry del produttore o di rebalancing dei consumer, i messaggi possono essere consegnati più volte.

**Soluzione**:

1. **Lato produttore**: attivate l'idempotenza per evitare duplicati durante i retry:
   ```
   enable.idempotence=true
   acks=all
   ```
2. **Lato consumer**: implementate un meccanismo di **deduplicazione** basato su un identificativo univoco del messaggio (chiave, UUID, ecc.)
3. Per i casi critici, combinate `acks=all`, `enable.idempotence=true` sul produttore e un'elaborazione idempotente lato consumer

:::tip
L'idempotenza del produttore garantisce che un messaggio inviato più volte (a causa di retry di rete) venga scritto una sola volta nella partizione. L'elaborazione idempotente lato consumer resta necessaria per coprire gli scenari di rebalancing.
:::
