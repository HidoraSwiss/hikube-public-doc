---
sidebar_position: 7
title: "Risoluzione dei problemi — MongoDB"
sidebar_label: Risoluzione dei problemi
description: "Risolvete i problemi di MongoDB su Hikube: cluster in errore, connessione rifiutata, not primary, Authentication failed, not authorized, disco pieno."
---

# Risoluzione dei problemi — MongoDB

### Il cluster resta nello stato «Creating»

**Causa**: il provisioning dei membri e dei relativi volumi è in corso. Con lo sharding, che distribuisce più componenti, richiede più tempo.

**Soluzione**:

1. Attenda qualche minuto e aggiorni la pagina del cluster.
2. Se lo stato non cambia dopo una quindicina di minuti, [contatti il supporto](mailto:support@hidora.io) indicando il progetto e il nome del cluster.

### Il cluster passa allo stato «Error»

**Causa**: la piattaforma non è riuscita ad applicare la creazione del cluster o la sua ultima modifica. Dopo una modifica, il cluster può continuare a funzionare con la configurazione precedente.

**Soluzione**: [contatti il supporto](mailto:support@hidora.io) indicando il progetto, il nome del cluster e la modifica richiesta.

### Impossibile superare il passaggio Configuration della procedura guidata

**Causa**: la configurazione supera le quote del progetto. Con lo sharding, il consumo include 2 shard, i server di configurazione e i router Mongos.

**Soluzione**: riduca il preset, la dimensione del disco o il numero di repliche, disattivi lo sharding se non le serve, oppure richieda un aumento delle quote del progetto.

### Connessione rifiutata o timeout

**Causa**: l'accesso esterno è disattivato, l'indirizzo non è ancora stato assegnato, oppure un firewall blocca la porta.

**Soluzione**:

1. Nel riquadro **Network and Connection**, verifichi che l'**External Access** sia **Enabled** e che il campo **Host** contenga un indirizzo oppure, per un replica set, che i **Replica set rs0 members** siano elencati.
2. Verifichi la connettività (su un replica set, con l'indirizzo di un membro):
   ```bash
   mongosh "mongodb://<host>:27017/?directConnection=true" --eval 'db.runCommand({ ping: 1 })'
   ```
3. Verifichi che nessun firewall in uscita della sua rete blocchi la porta `27017`.

### `ENOTFOUND`, oppure scrittura rifiutata con `not primary`

**Causa**: su un replica set, il client ha ricevuto il parametro `replicaSet` e cerca di raggiungere i membri con i loro nomi interni al cluster, che non si risolvono dall'esterno; oppure è connesso direttamente a un secondario, che non accetta scritture.

**Soluzione**:

1. Rimuova `replicaSet` dalla stringa di connessione e aggiunga `directConnection=true`, come nella **External connection string** del riquadro **Network and Connection**.
2. Per scrivere, si connetta al membro primario: `db.hello().isWritablePrimary` indica se il membro raggiunto lo è. Altrimenti, provi un altro membro dell'elenco.

### `Authentication failed`

**Causa**: password errata o revocata da una rotazione, oppure database di autenticazione errato.

**Soluzione**:

1. Indichi il database di autenticazione `admin` (`--authenticationDatabase admin` o `?authSource=admin` nell'URI).
2. In caso di dubbi sulla password, ne generi una nuova tramite **Actions** → **Change Password**, quindi aggiorni le sue applicazioni.

### `not authorized on <database> to execute command`

**Causa**: l'utente non ha accesso a questo database, oppure ha solo un accesso **Read-only**.

**Soluzione**: tramite **Actions** → **Manage Access**, aggiunga il database interessato con i **Rights** appropriati, quindi si riconnetta.

### Errore durante l'aggiunta di un accesso o di un utente

**Causa**: non è definito alcun accesso a un database, un accesso riguarda un database di sistema (`admin`, `local`, `config`), oppure un nome non rispetta le regole di denominazione.

**Soluzione**: assegni almeno un accesso a un database applicativo e utilizzi solo minuscole, cifre e trattini, iniziando con una lettera e terminando con una lettera o una cifra. Si veda [Concetti MongoDB](./concepts.md#regole-di-denominazione).

### Una riga `admin` appare in errore in «Manage Access»

**Causa**: l'utente è stato creato con la procedura guidata di creazione del cluster prima della console v1.3.0, che gli assegnava un ruolo sul database di sistema `admin`. Un database di sistema non può più ricevere accessi, e l'aggiornamento dell'utente è rifiutato finché questa riga è presente.

**Soluzione**: rimuova la riga `admin`, aggiunga se necessario il database applicativo dell'utente, quindi faccia clic su **Save**. Il messaggio «Access updated» conferma il salvataggio.

### Disco pieno

**Causa**: il volume di dati ha raggiunto la **Allocated Size**.

**Soluzione**: aumenti la **Disk size (GB)** tramite **Edit**, entro il limite della quota di storage del progetto. La dimensione non può essere ridotta in seguito. Si veda [Modificare le risorse](./how-to/scale-resources.md). Se necessario, elimini i dati obsoleti o imposti indici TTL sulle collection di eventi.
