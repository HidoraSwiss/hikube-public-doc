---
sidebar_position: 7
title: Risoluzione dei problemi
---

# Risoluzione dei problemi — Redis

### Il cluster resta nello stato «Creating»

**Causa**: il provisioning dei nodi Redis, dei Sentinel e dei relativi volumi è in corso.

**Soluzione**:

1. Attenda qualche minuto e aggiorni la pagina del cluster.
2. Se lo stato non cambia dopo una quindicina di minuti, oppure passa a **Error** o **Failed**, [contatti il supporto](mailto:support@hidora.io) indicando il progetto e il nome del cluster.

### L'host mostra «Waiting for allocation...»

**Causa**: la rete pubblica è disattivata, oppure l'indirizzo IP pubblico non è ancora stato assegnato.

**Soluzione**:

1. Apra **Edit** e verifichi l'opzione **External access**. La attivi se deve connettersi da Internet, quindi faccia clic su **Save changes**.
2. Attenda qualche istante e aggiorni la pagina del cluster.

### Timeout di connessione

**Causa**: l'indirizzo o la porta utilizzati non sono corretti, il cluster non è pronto, oppure un firewall blocca la porta `6379`.

**Soluzione**:

1. Verifichi che lo **Status** della sezione **Connection** sia **Ready**.
2. Copi l'**Host** con il pulsante di copia per evitare errori di digitazione.
3. Verifichi che nessun firewall in uscita della sua rete blocchi la porta `6379`.

### L'autenticazione non riesce (`NOAUTH` o `WRONGPASS`)

**Causa**: il client non invia alcuna password, utilizza una password errata oppure una password revocata da una rotazione.

**Soluzione**:

1. Verifichi il valore fornito al client (`REDISCLI_AUTH`, opzione `-a` o configurazione applicativa).
2. In caso di dubbi, generi una nuova password dalla sezione **Security** (**Rotate password**) e aggiorni le sue applicazioni. Si veda [Rinnovare la password](./how-to/rotate-password.md).
3. Se l'opzione **Authentication required** è stata modificata, aggiorni i client di conseguenza.

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
