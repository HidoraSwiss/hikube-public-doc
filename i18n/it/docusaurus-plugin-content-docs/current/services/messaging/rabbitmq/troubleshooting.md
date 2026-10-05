---
sidebar_position: 7
title: Risoluzione dei problemi
---

# Risoluzione dei problemi — RabbitMQ

### Il cluster resta in « Creating » o passa in « Error »

**Causa**: il provisioning è in corso, oppure non è riuscito (ad esempio per mancanza di risorse disponibili).

**Soluzione**:

1. Attenda qualche minuto: la pagina di dettaglio e l'elenco si aggiornano automaticamente.
2. Se lo stato resta in **Creating** per un tempo anomalo o passa a **Error** / **Failed**, [contatti il supporto](mailto:support@hidora.io) indicando il nome del progetto, il nome del cluster e il suo identificativo (mostrato sotto il nome del cluster, con un pulsante di copia).

### « Storage quota exceeded for this project » nella procedura guidata

**Causa**: la dimensione del disco moltiplicata per il numero di repliche supera lo storage residuo della quota del progetto.

**Soluzione**:

1. Riduca il **Disk size (GB)** o il **Number of replicas**.
2. Se necessario, liberi storage nel progetto o faccia aumentare la quota del progetto.

### « A cluster with this name already exists. »

**Causa**: un cluster RabbitMQ del progetto ha già questo nome.

**Soluzione**: torni al passaggio **General** e scelga un altro **Cluster Name**.

### Il campo « Host » mostra « Not available / Creating »

**Causa**: l'indirizzo pubblico non è ancora assegnato, oppure l'**External Access** è disattivato.

**Soluzione**:

1. Verifichi nella sezione **Connection** che **External Access** indichi **Enabled**. In caso contrario, lo attivi (vedere [Configurare l'accesso esterno](./how-to/configure-external-access.md)).
2. Se l'accesso esterno è attivato, attenda e poi ricarichi la pagina.

### Connessione AMQP rifiutata (`ACCESS_REFUSED`)

**Causa**: credenziali errate, oppure l'utente non ha diritti sul vhost richiesto.

**Soluzione**:

1. Verifichi nella tabella **Users** (colonna **VHosts**) che l'utente abbia effettivamente un diritto sul vhost utilizzato dal client.
2. Se necessario, aggiunga l'accesso con **Manage Access**.
3. Se la password è stata smarrita o è dubbia, ne generi una nuova con **Change Password** e aggiorni il client.
4. Verifichi che il client indichi il vhost corretto (nome esatto, con distinzione tra maiuscole e minuscole).

### Connessione impossibile (timeout, connessione rifiutata)

**Causa**: accesso esterno disattivato, indirizzo o porta errati, oppure filtraggio di rete lato client.

**Soluzione**:

1. Verifichi l'**Host** e lo stato dell'**External Access** nella sezione **Connection**.
2. Utilizzi la porta **5672**.
3. Verifichi l'apertura della porta dalla macchina client:
   ```bash
   nc -zv <host> 5672
   ```
4. Verifichi che la sua rete o il firewall locale autorizzino le connessioni in uscita verso questa porta.

### Pubblicazioni bloccate (flow control, allarme di memoria o disco)

**Causa**: RabbitMQ blocca le pubblicazioni quando raggiunge la soglia di memoria (high watermark) o quando lo spazio su disco è insufficiente, per proteggere il broker. I client ricevono allora una notifica `connection.blocked`.

**Soluzione**:

1. Lato applicazioni, verifichi che i consumer tengano il ritmo dei producer ed elimini i messaggi dalle queue che accumulano messaggi non consumati.
2. Aumenti il **Disk size (GB)** da **Edit** se l'allarme riguarda il disco (vedere [Modificare la configurazione di un cluster](./how-to/scale-resources.md)).
3. Il preset (memoria) non è modificabile dopo la creazione: crei un cluster con un preset superiore oppure [contatti il supporto](mailto:support@hidora.io).

### Messaggi non instradati

**Causa**: il producer pubblica verso un exchange senza binding corrispondente (tipo di exchange errato, routing key errata, binding mancante). Il messaggio viene quindi scartato.

**Soluzione**:

1. Verifichi nel codice del producer il nome dell'exchange e la routing key.
2. Verifichi che il consumer dichiari correttamente il binding tra la queue e l'exchange.
3. Pubblichi con il flag `mandatory` per essere avvisato dei messaggi non instradati, oppure dichiari un *alternate exchange* per acquisirli.

### L'eliminazione del cluster non riesce

**Causa**: un conflitto impedisce l'eliminazione (« Cannot delete this cluster (conflict). ») oppure il servizio è momentaneamente non disponibile.

**Soluzione**: riprovi qualche minuto più tardi. Se l'errore persiste, [contatti il supporto](mailto:support@hidora.io).
