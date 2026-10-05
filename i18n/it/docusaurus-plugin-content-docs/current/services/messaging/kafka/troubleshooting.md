---
sidebar_position: 7
title: Risoluzione dei problemi
---

# Risoluzione dei problemi — Kafka

:::info Disponibilità
Kafka non è ancora disponibile in modalità self-service nella [console Hikube](https://console.hikube.cloud).
Per effettuare il provisioning di un'istanza o modificarne la configurazione, [contatti il supporto](mailto:support@hidora.io).
:::

Le diagnosi riportate di seguito si effettuano dai suoi strumenti client Kafka. Quando è necessaria un'azione lato piattaforma (risorse, storage, riavvio, log del server), [contatti il supporto](mailto:support@hidora.io) indicando il progetto e il nome dell'istanza.

### Connessione al cluster impossibile

**Causa**: indirizzo o porta dei server bootstrap errati, accesso esterno non attivato mentre il client si trova fuori dalla piattaforma, oppure parametri di sicurezza del client mancanti.

**Soluzione**:

1. Verifichi di utilizzare l'indirizzo comunicato dal supporto.
2. Interroghi i metadati del cluster:
   ```bash
   kcat -b <bootstrap-servers> -L
   ```
3. Se il comando non riesce dall'esterno della piattaforma, verifichi con il supporto che l'accesso esterno sia attivato sull'istanza.

### ZooKeeper perde il quorum

**Causa**: il numero di istanze ZooKeeper è insufficiente o pari, oppure un volume ZooKeeper è pieno. Un quorum richiede una maggioranza stretta (es. 2 nodi su 3).

**Soluzione**: questa diagnosi e la relativa correzione (numero dispari di istanze, aumento dello storage di ZooKeeper) si effettuano lato piattaforma. Contatti il supporto.

### Topic inaccessibile o broker non disponibile

**Causa**: uno o più broker non funzionano correttamente, oppure il topic non ha abbastanza repliche sincronizzate rispetto a `min.insync.replicas`.

**Soluzione**:

1. Descriva il topic dal suo client per verificare i leader e gli ISR (In-Sync Replicas):
   ```bash
   kafka-topics.sh --describe --topic <nome-topic> --bootstrap-server <bootstrap-servers>
   ```
2. Verifichi che il numero di repliche del topic sia coerente con il numero di broker.
3. Se alcune partizioni non hanno un leader o mancano dei broker, contatti il supporto (stato dei broker, spazio su disco).

### Consumer lag elevato

**Causa**: i consumer non elaborano i messaggi abbastanza rapidamente rispetto al throughput di produzione. Ciò può dipendere da un numero insufficiente di partizioni, da troppo pochi consumer nel gruppo o da consumer sottodimensionati.

**Soluzione**:

1. Misuri il lag del consumer group:
   ```bash
   kafka-consumer-groups.sh --describe --group <group-id> --bootstrap-server <bootstrap-servers>
   ```
2. Se il lag è distribuito su numerose partizioni, **aumenti il numero di consumer** nel gruppo (senza superare il numero di partizioni).
3. Se tutte le partizioni presentano lag, valuti di **aumentare il numero di partizioni** del topic. Questa opzione non è disponibile nella console; contatti il supporto.
4. Verifichi che i suoi consumer dispongano di risorse sufficienti (CPU, memoria) per elaborare i messaggi.

### Broker riavviato per mancanza di memoria

**Causa**: il broker consuma più memoria del limite assegnato. Ciò accade spesso con i preset `nano` o `micro` sotto carico.

**Soluzione**: richieda un preset superiore o risorse esplicite per i broker. Questa opzione non è disponibile nella console; contatti il supporto.

### Messaggi duplicati

**Causa**: per impostazione predefinita, Kafka funziona in modalità **at-least-once delivery**. In caso di retry del producer o di rebalancing dei consumer, i messaggi possono essere consegnati più volte.

**Soluzione**:

1. **Lato producer**: attivi l'idempotenza per evitare i duplicati durante i retry:
   ```properties title="producer.properties"
   enable.idempotence=true
   acks=all
   ```
2. **Lato consumer**: implementi un meccanismo di **deduplicazione** basato su un identificativo univoco del messaggio (chiave, UUID, ecc.).
3. Per i casi critici, combini `acks=all`, `enable.idempotence=true` sul producer e un'elaborazione idempotente lato consumer.

:::tip
L'idempotenza del producer garantisce che un messaggio inviato più volte (a causa di retry di rete) venga scritto **una sola volta** nella partizione. L'elaborazione idempotente lato consumer resta necessaria per coprire gli scenari di rebalancing.
:::
