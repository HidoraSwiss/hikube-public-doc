---
sidebar_position: 7
title: Risoluzione dei problemi
---

# Risoluzione dei problemi — PostgreSQL

### Il cluster resta nello stato « Creating »

**Causa**: il provisioning delle istanze e dei relativi volumi è in corso. Può richiedere diversi minuti, di più con più repliche.

**Soluzione**:

1. Attenda qualche minuto e aggiorni la pagina del cluster.
2. Se lo stato non cambia dopo una quindicina di minuti, oppure passa a **Error** o **Failed**, [contatti il supporto](mailto:support@hidora.io) indicando il progetto e il nome del cluster.

### Impossibile superare il passaggio Configuration della procedura guidata

**Causa**: la configurazione richiesta supera la quota del progetto (CPU, memoria o storage). Sotto il campo **Disk size (GB)** può comparire il messaggio « Storage quota exceeded for this project ».

**Soluzione**:

1. Consulti il banner della quota nella parte superiore della procedura guidata.
2. Riduca l'**Instance preset**, la **Disk size (GB)** o il **Number of replicas**: il consumo è moltiplicato per il numero di repliche.
3. Se il progetto necessita di una quota aggiuntiva, contatti il supporto.

### Connessione rifiutata o timeout

**Causa**: l'accesso esterno è disattivato, l'indirizzo IP non è ancora stato assegnato, oppure il client utilizza un indirizzo o una porta errati.

**Soluzione**:

1. Nella pagina del cluster, verifichi che il riquadro **External Access** indichi **Enabled**. Altrimenti, lo attivi tramite **Edit**.
2. Verifichi che il campo **Host** contenga un indirizzo e non **Not defined**.
3. Utilizzi la porta `5432` e testi la connettività:
   ```bash
   pg_isready -h <host> -p 5432
   ```
4. Verifichi che nessun firewall in uscita della sua rete blocchi la porta `5432`.

### Autenticazione rifiutata (`password authentication failed`)

**Causa**: password errata o revocata da una rotazione, oppure utente senza diritti sul database di destinazione.

**Soluzione**:

1. Nella scheda **Users**, verifichi che l'utente esista e che abbia un accesso sul database utilizzato (colonna **Databases**).
2. Se necessario, aggiunga l'accesso tramite **Actions** → **Manage Access**.
3. Se la password è stata smarrita o è cambiata, ne generi una nuova tramite **Actions** → **Change Password**, quindi aggiorni le sue applicazioni.

### Permesso negato su una tabella (`permission denied`)

**Causa**: l'utente dispone del diritto **Read-only** sul database, oppure non ha accesso a tale database.

**Soluzione**: tramite **Actions** → **Manage Access**, assegni il diritto **Administrator (Admin)** sul database interessato, quindi si riconnetta.

### Prestazioni lente

**Causa**: le risorse assegnate sono insufficienti per il carico, oppure alcune query non sono ottimizzate.

**Soluzione**:

1. Attivi l'estensione `pg_stat_statements` sul database (**Actions** → **Manage extensions**) e individui le query più onerose:
   ```sql
   SELECT query, calls, mean_exec_time
   FROM pg_stat_statements
   ORDER BY mean_exec_time DESC
   LIMIT 10;
   ```
2. Aggiunga gli indici mancanti.
3. Se le risorse sono sature, passi a un preset superiore tramite **Edit**. Consulti [Modificare le risorse](./how-to/scale-resources.md).
4. Per regolare i parametri PostgreSQL (`shared_buffers`, `work_mem`, `max_connections`), contatti il supporto: questi parametri non sono proposti nella console.

### Disco pieno

**Causa**: il volume dei dati ha raggiunto l'**Allocated Size**.

**Soluzione**: aumenti la **Disk size (GB)** tramite **Edit**, entro il limite della quota di storage del progetto. Se necessario, elimini i dati obsoleti ed esegua `VACUUM` per recuperare spazio.
