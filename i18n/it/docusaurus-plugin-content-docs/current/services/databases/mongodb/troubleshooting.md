---
sidebar_position: 7
title: Risoluzione dei problemi
---

# Risoluzione dei problemi — MongoDB

### Il cluster resta nello stato «Creating»

**Causa**: il provisioning dei membri e dei relativi volumi è in corso. Con lo sharding, che distribuisce più componenti, richiede più tempo.

**Soluzione**:

1. Attenda qualche minuto e aggiorni la pagina del cluster.
2. Se lo stato non cambia dopo una quindicina di minuti, oppure passa a **Error** o **Failed**, [contatti il supporto](mailto:support@hidora.io) indicando il progetto e il nome del cluster.

### Impossibile superare il passaggio Configuration della procedura guidata

**Causa**: la configurazione supera le quote del progetto. Con lo sharding, il consumo include 2 shard, i server di configurazione e i router Mongos.

**Soluzione**: riduca il preset, la dimensione del disco o il numero di repliche, disattivi lo sharding se non le serve, oppure richieda un aumento delle quote del progetto.

### Connessione rifiutata o timeout

**Causa**: l'accesso esterno è disattivato, l'indirizzo non è ancora stato assegnato, oppure un firewall blocca la porta.

**Soluzione**:

1. Nel riquadro **Network and Connection**, verifichi che l'**External Access** sia **Enabled** e che il campo **Host** contenga un indirizzo.
2. Verifichi la connettività:
   ```bash
   mongosh "mongodb://<host>:27017" --eval 'db.runCommand({ ping: 1 })'
   ```
3. Verifichi che nessun firewall in uscita della sua rete blocchi la porta `27017`.

### `Authentication failed`

**Causa**: password errata o revocata da una rotazione, oppure database di autenticazione errato.

**Soluzione**:

1. Indichi il database di autenticazione `admin` (`--authenticationDatabase admin` o `?authSource=admin` nell'URI).
2. In caso di dubbi sulla password, ne generi una nuova tramite **Actions** → **Change Password**, quindi aggiorni le sue applicazioni.

### `not authorized on <database> to execute command`

**Causa**: l'utente non ha accesso a questo database, oppure ha solo un accesso **Read-only**.

**Soluzione**: tramite **Actions** → **Manage Access**, aggiunga il database interessato con i **Rights** appropriati, quindi si riconnetta.

### Errore durante l'aggiunta di un accesso o di un utente

**Causa**: non è definito alcun ruolo, oppure un nome non rispetta le regole di denominazione.

**Soluzione**: assegni almeno un ruolo globale o un accesso specifico e utilizzi solo minuscole, cifre e trattini, iniziando con una lettera. Si veda [Concetti MongoDB](./concepts.md#regole-di-denominazione).

### Disco pieno

**Causa**: il volume di dati ha raggiunto la **Allocated Size**.

**Soluzione**: aumenti la **Disk size (GB)** tramite **Edit**, entro il limite della quota di storage del progetto. Si veda [Modificare le risorse](./how-to/scale-resources.md). Se necessario, elimini i dati obsoleti o imposti indici TTL sulle collection di eventi.
