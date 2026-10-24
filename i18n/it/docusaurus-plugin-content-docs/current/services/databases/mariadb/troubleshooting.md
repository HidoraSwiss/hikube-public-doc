---
sidebar_position: 7
title: "Risoluzione dei problemi — MariaDB"
sidebar_label: Risoluzione dei problemi
description: "Risolvete i problemi di MariaDB su Hikube: cluster in errore, connessione rifiutata, Access denied, errori di accesso, disco pieno, replica non sincronizzata."
---

# Risoluzione dei problemi — MariaDB

### Il cluster resta nello stato « Creating »

**Causa**: il provisioning dei nodi e dei relativi volumi è in corso. Può richiedere diversi minuti, di più con 3 o 5 repliche.

**Soluzione**:

1. Attenda qualche minuto e aggiorni la pagina del cluster.
2. Se lo stato non cambia dopo una quindicina di minuti, [contatti il supporto](mailto:support@hidora.io) indicando il progetto e il nome del cluster.

### Il cluster passa allo stato « Error »

**Causa**: la piattaforma non è riuscita ad applicare la creazione del cluster o la sua ultima modifica. Dopo una modifica, il cluster può continuare a funzionare con la configurazione precedente.

**Soluzione**: [contatti il supporto](mailto:support@hidora.io) indicando il progetto, il nome del cluster e la modifica richiesta.

### Connessione rifiutata o timeout

**Causa**: l'accesso esterno è disattivato, l'indirizzo IP non è ancora stato assegnato, oppure il client utilizza un indirizzo o una porta errati.

**Soluzione**:

1. Nel riquadro **Connection and network**, verifichi che la zona **External** contenga un indirizzo, e non **Disabled** o « Waiting for allocation… ». Da una VM del progetto, utilizzi piuttosto l'host della zona **Internal**.
2. Utilizzi la porta `3306` e testi la connettività:
   ```bash
   mysqladmin -h <host> -P 3306 -u <utente> -p ping
   ```
3. Verifichi che nessun firewall in uscita della sua rete blocchi la porta `3306`.

### `Access denied for user`

**Causa**: password errata o revocata da una rotazione, oppure utente senza diritti sul database indicato.

**Soluzione**:

1. Nell'elenco degli utenti, verifichi la colonna **Databases**: l'utente deve avere un accesso sul database utilizzato.
2. Se necessario, aggiunga l'accesso tramite **Actions** → **Manage Access**.
3. In caso di dubbi sulla password, ne generi una nuova tramite **Actions** → **Change Password** e aggiorni le sue applicazioni.

### Errore durante l'aggiunta di un accesso o di un utente

**Causa**: il nome del database o dell'utente non rispetta le regole di denominazione, oppure l'accesso riguarda un database di sistema (`mysql`, `information_schema`, `performance_schema`, `sys`).

**Soluzione**: utilizzi solo lettere minuscole, cifre e trattini, iniziando con una lettera e terminando con una lettera o una cifra. I trattini bassi (`_`) e le lettere maiuscole non sono accettati. Conceda l'accesso a un database applicativo, mai a un database di sistema. Consulti [Concetti MariaDB](./concepts.md#regole-di-denominazione).

### Una riga `mysql` appare in errore in « Manage Access »

**Causa**: l'utente è stato creato con la procedura guidata di creazione del cluster prima della console v1.3.0, che gli assegnava un ruolo sul database di sistema `mysql`. Un database di sistema non può più ricevere accessi, e l'aggiornamento dell'utente è rifiutato finché questa riga è presente.

**Soluzione**: rimuova la riga `mysql`, aggiunga se necessario il database applicativo dell'utente, quindi faccia clic su **Save**. Il messaggio « Access updated » conferma il salvataggio.

### Spazio su disco esaurito

**Causa**: il volume dei dati (inclusi i binary log) ha raggiunto l'**Allocated Size**.

**Soluzione**:

1. Misuri lo spazio utilizzato per database:
   ```sql
   SELECT table_schema, ROUND(SUM(data_length + index_length) / 1024 / 1024, 1) AS size_mb
   FROM information_schema.tables
   GROUP BY table_schema;
   ```
2. Aumenti la **Disk size (GB)** tramite **Edit**, entro il limite della quota di storage del progetto. La dimensione non può essere ridotta in seguito. Consulti [Modificare le risorse](./how-to/scale-resources.md).
3. Elimini i dati obsoleti, quindi ottimizzi le tabelle interessate (`OPTIMIZE TABLE`).

### Replica non sincronizzata

**Causa**: una replica non riesce più a seguire il primary (carico di scrittura elevato, risorse insufficienti, incidente infrastrutturale).

**Soluzione**: la risincronizzazione di una replica non è proposta nella console. [Contatti il supporto](mailto:support@hidora.io) indicando il progetto e il nome del cluster.
