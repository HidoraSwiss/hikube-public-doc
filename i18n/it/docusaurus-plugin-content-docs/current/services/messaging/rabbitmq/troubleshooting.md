---
sidebar_position: 7
title: Risoluzione dei problemi
---

# Risoluzione dei problemi — RabbitMQ

### Coda bloccata (flow control)

**Causa**: RabbitMQ ha attivato un **allarme memoria** o **allarme disco**, bloccando le pubblicazioni per proteggere il sistema. Questo si verifica quando il consumo di memoria supera la soglia (high watermark) o lo spazio su disco è insufficiente.

**Soluzione**:

1. Verificate lo stato del cluster e gli allarmi attivi:
   ```bash
   kubectl exec <pod-rabbitmq> -- rabbitmqctl status | grep -A 10 "alarms"
   ```
2. Identificate la risorsa in causa (memoria o disco):
   ```bash
   kubectl exec <pod-rabbitmq> -- rabbitmqctl status | grep -E "mem_|disk_"
   ```
3. Aumentate le risorse allocate nel vostro manifesto:
   ```yaml title="rabbitmq.yaml"
   replicas: 3
   resources:
     cpu: 1
     memory: 2Gi
   size: 20Gi
   ```
4. Eliminate le code inutilizzate se necessario:
   ```bash
   kubectl exec <pod-rabbitmq> -- rabbitmqctl purge_queue <nome-coda>
   ```

### Nodo RabbitMQ non unito al cluster

**Causa**: un nodo RabbitMQ non riesce a unirsi al cluster, spesso a causa di un problema di risoluzione DNS, di incoerenza del cookie Erlang, o di policy di rete restrittive.

**Soluzione**:

1. Verificate lo stato del cluster da un nodo funzionante:
   ```bash
   kubectl exec <pod-rabbitmq> -- rabbitmqctl cluster_status
   ```
2. Consultate i log del pod in errore:
   ```bash
   kubectl logs <pod-rabbitmq-problematico>
   ```
3. Verificate che la risoluzione DNS funzioni tra i pod:
   ```bash
   kubectl exec <pod-rabbitmq> -- nslookup <pod-rabbitmq-problematico>.<servizio-headless>
   ```
4. Se il problema persiste, eliminate il pod in errore per forzarne la ricreazione:
   ```bash
   kubectl delete pod <pod-rabbitmq-problematico>
   ```

### Messaggi non instradati (exchange mal configurato)

**Causa**: i messaggi pubblicati non raggiungono le code, generalmente a causa di un tipo di exchange errato, di una routing key non corretta, o di un binding mancante tra l'exchange e la coda.

**Soluzione**:

1. Elencate i binding esistenti per identificare le rotte configurate:
   ```bash
   kubectl exec <pod-rabbitmq> -- rabbitmqctl list_bindings -p <vhost>
   ```
2. Verificate il tipo di exchange e la routing key attesa:
   ```bash
   kubectl exec <pod-rabbitmq> -- rabbitmqctl list_exchanges -p <vhost>
   ```
3. Configurate un **dead letter exchange** per catturare i messaggi non instradati e facilitare la diagnostica:
   ```bash
   kubectl exec <pod-rabbitmq> -- rabbitmqctl set_policy DLX ".*" '{"dead-letter-exchange":"dlx"}' -p <vhost>
   ```
4. Verificate che il produttore utilizzi l'exchange e la routing key corretti nella sua configurazione

### Memoria satura (memory alarm)

**Causa**: RabbitMQ ha raggiunto la soglia di memoria (**high watermark**, per impostazione predefinita il 40% della memoria disponibile). Tutte le pubblicazioni sono bloccate fino a quando la memoria non scende sotto la soglia.

**Soluzione**:

1. Verificate il consumo di memoria:
   ```bash
   kubectl exec <pod-rabbitmq> -- rabbitmqctl status | grep "mem_used"
   ```
2. Identificate le code più voluminose:
   ```bash
   kubectl exec <pod-rabbitmq> -- rabbitmqctl list_queues name messages memory -p <vhost> --formatter table
   ```
3. Aumentate la memoria allocata a RabbitMQ:
   ```yaml title="rabbitmq.yaml"
   resources:
     cpu: 1
     memory: 4Gi
   ```
4. Eliminate le code inutilizzate o le code contenenti un gran numero di messaggi non consumati

### Connessione AMQP rifiutata

**Causa**: il client non riesce a connettersi al broker RabbitMQ. Questo può essere dovuto a credenziali errate, permessi vhost mancanti, o un problema di accessibilità di rete.

**Soluzione**:

1. Verificate le credenziali di connessione nel Secret Kubernetes:
   ```bash
   kubectl get tenantsecret <nome-rabbitmq>-credentials -o jsonpath='{.data}' | base64 -d
   ```
2. Verificate che l'utente abbia i permessi necessari sul vhost:
   ```bash
   kubectl exec <pod-rabbitmq> -- rabbitmqctl list_permissions -p <vhost>
   ```
3. Testate la connettività alla porta AMQP (5672):
   ```bash
   kubectl exec <pod-rabbitmq> -- rabbitmq-diagnostics check_port_connectivity
   ```
4. Se vi connettete dall'esterno del cluster, assicuratevi che `external: true` sia configurato nel vostro manifesto
