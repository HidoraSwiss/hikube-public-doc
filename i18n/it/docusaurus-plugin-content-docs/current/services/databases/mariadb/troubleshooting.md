---
sidebar_position: 7
title: Risoluzione dei problemi
---

# Risoluzione dei problemi — MariaDB

### Il cluster resta nello stato « Creating »

**Causa**: il provisioning dei nodi e dei relativi volumi è in corso. Può richiedere diversi minuti, di più con 3 o 5 repliche.

**Soluzione**:

1. Attenda qualche minuto e aggiorni la pagina del cluster.
2. Se lo stato non cambia dopo una quindicina di minuti, oppure passa a **Error** o **Failed**, [contatti il supporto](mailto:support@hidora.io) indicando il progetto e il nome del cluster.

### Connessione rifiutata o timeout

**Causa**: l'accesso esterno è disattivato, l'indirizzo IP non è ancora stato assegnato, oppure il client utilizza un indirizzo o una porta errati.

**Soluzione**:

1. Nel riquadro **Connection and network**, verifichi che l'**External Access** sia **Enabled** e che il campo **Host** contenga un indirizzo.
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

**Causa**: il nome del database o dell'utente non rispetta le regole di denominazione.

**Soluzione**: utilizzi solo lettere minuscole, cifre e trattini, iniziando con una lettera e terminando con una lettera o una cifra. I trattini bassi (`_`) e le lettere maiuscole non sono accettati. Consulti [Concetti MariaDB](./concepts.md#regole-di-denominazione).

### Spazio su disco esaurito

**Causa**: il volume dei dati (inclusi i binary log) ha raggiunto l'**Allocated Size**.

**Soluzione**:

1. Misuri lo spazio utilizzato per database:
   ```sql
   SELECT table_schema, ROUND(SUM(data_length + index_length) / 1024 / 1024, 1) AS size_mb
   FROM information_schema.tables
   GROUP BY table_schema;
   ```
2. Aumenti la **Disk size (GB)** tramite **Edit**, entro il limite della quota di storage del progetto. Consulti [Modificare le risorse](./how-to/scale-resources.md).
3. Elimini i dati obsoleti, quindi ottimizzi le tabelle interessate (`OPTIMIZE TABLE`).

### Replica non sincronizzata

**Causa**: una replica non riesce più a seguire il primary (carico di scrittura elevato, risorse insufficienti, incidente infrastrutturale).

**Soluzione**: la risincronizzazione di una replica non è proposta nella console. [Contatti il supporto](mailto:support@hidora.io) indicando il progetto e il nome del cluster.
