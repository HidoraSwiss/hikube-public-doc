---
sidebar_position: 7
title: "Risoluzione dei problemi — Redis"
sidebar_label: Risoluzione dei problemi
description: "Risolvete i problemi comuni di Redis su Hikube: cluster in errore, host in attesa, timeout, NOAUTH o WRONGPASS, memoria satura, failover che non avviene."
---

# Risoluzione dei problemi — Redis

### Il cluster resta nello stato «Creating»

**Causa**: il provisioning dei nodi Redis, dei Sentinel e dei relativi volumi è in corso.

**Soluzione**:

1. Attenda qualche minuto e aggiorni la pagina del cluster.
2. Se lo stato non cambia dopo una quindicina di minuti, [contatti il supporto](mailto:support@hidora.io) indicando il progetto e il nome del cluster.

### Il cluster passa allo stato «Error»

**Causa**: la piattaforma non è riuscita ad applicare la creazione del cluster o la sua ultima modifica. Dopo una modifica, il cluster può continuare a funzionare con la configurazione precedente.

**Soluzione**: [contatti il supporto](mailto:support@hidora.io) indicando il progetto, il nome del cluster e la modifica richiesta.

### «An error occurred while updating the cluster» al salvataggio

**Causa**: la modifica richiede una versione inferiore a quella attuale (ad esempio `7` su un cluster in `8`), oppure una **Volume Size (GB)** inferiore a quella attuale. Queste modifiche sono rifiutate, e il messaggio di errore riporta il motivo restituito dall'API. Lato API, questi rifiuti hanno i codici `120203` (versione) e `120204` (volume).

**Soluzione**: mantenga la versione attuale o una versione superiore, e una dimensione del volume almeno pari a quella attuale.

### La zona External mostra «Disabled» o «Waiting for allocation…»

**Causa**: l'accesso esterno è disattivato, oppure l'indirizzo IP pubblico non è ancora stato assegnato. Da una VM o da un cluster Kubernetes del progetto, l'accesso esterno non è necessario: utilizzi l'host della zona **Internal**.

**Soluzione**:

1. Apra **Edit** e verifichi l'opzione **External access**. La attivi se deve connettersi da Internet, quindi faccia clic su **Save changes**.
2. Attenda qualche istante e aggiorni la pagina del cluster.

### Timeout di connessione

**Causa**: l'indirizzo o la porta utilizzati non sono corretti, il cluster non è pronto, oppure un firewall blocca la porta `6379`.

**Soluzione**:

1. Verifichi che lo **Status** della sezione **Connection** sia **Ready**.
2. Copi l'indirizzo con il suo pulsante di copia per evitare errori di digitazione: zona **External** da Internet, zona **Internal** dal progetto.
3. Verifichi che nessun firewall in uscita della sua rete blocchi la porta `6379`.

### L'autenticazione non riesce (`NOAUTH` o `WRONGPASS`)

**Causa**: il client non invia alcuna password oppure utilizza una password errata. Dopo una rotazione, la nuova password viene rifiutata (`WRONGPASS`) finché il cluster non viene riavviato, e la vecchia smette di funzionare una volta riavviato il cluster.

**Soluzione**:

1. Verifichi il valore fornito al client (`REDISCLI_AUTH`, opzione `-a` o configurazione applicativa).
2. Se la pagina del cluster mostra il banner **Restart required**, una rotazione o una modifica dell'autenticazione attende un riavvio: faccia clic su **Restart now**. Si veda [Riavviare un cluster](./how-to/restart-cluster.md).
3. In caso di dubbi, generi una nuova password dalla sezione **Security** (**Rotate password**), riavvii il cluster e aggiorni le sue applicazioni. Si veda [Rinnovare la password](./how-to/rotate-password.md).
4. Se l'opzione **Authentication required** è stata modificata, aggiorni i client di conseguenza.

### Redis accetta ancora connessioni senza password dopo l'attivazione dell'autenticazione

**Causa**: l'attivazione di **Authentication required** su un cluster esistente viene salvata immediatamente, ma raggiunge i server Redis solo dopo un riavvio del cluster. Fino ad allora, mantengono la configurazione precedente. Lo stesso vale per la disattivazione dell'autenticazione e per la rotazione della password: i server accettano la vecchia password fino al riavvio.

**Soluzione**:

1. Apra la pagina del cluster: il banner **Restart required** conferma che un riavvio è in sospeso.
2. Faccia clic su **Restart now** (o su **Restart**), quindi confermi con **Restart**. Il cluster non è raggiungibile per circa un minuto: scelga un momento di basso carico.
3. Verifichi che una connessione senza password venga ora rifiutata:
   ```bash
   redis-cli -h <host> -p 6379 ping
   # NOAUTH Authentication required.
   ```

Si veda [Riavviare un cluster](./how-to/restart-cluster.md).

### Memoria satura (`OOM command not allowed`)

**Causa**: il dataset supera la memoria allocata dal preset.

**Soluzione**:

1. Controlli l'utilizzo della memoria:
   ```bash
   redis-cli -h <host> -p 6379 INFO memory
   ```
2. Passi a un **Preset** superiore tramite **Edit**. Si veda [Modificare le risorse](./how-to/scale-resources.md).
3. Se Redis viene usato come cache, imposti delle scadenze (`EXPIRE`) sulle chiavi per limitare la crescita del dataset.

### Il failover non avviene

**Causa**: il cluster conta una sola replica; nessuna replica può essere promossa a master.

**Soluzione**: il numero di repliche non può essere modificato dopo la creazione. Crei un nuovo cluster con almeno 2 repliche (3 in produzione) e migri i dati, oppure [contatti il supporto](mailto:support@hidora.io). Si veda [Configurare l'alta disponibilità](./how-to/configure-ha.md).
