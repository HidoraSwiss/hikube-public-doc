---
sidebar_position: 6
title: FAQ
---

# FAQ — MariaDB

### Le mie applicazioni MySQL sono compatibili?

Sì. **MariaDB** è un fork open source di MySQL, compatibile con il protocollo e la sintassi MySQL. I client `mysql`, `mysqldump` e i connettori MySQL (JDBC, PDO, `mysql2`, ecc.) funzionano senza modifiche. In precedenza, questo servizio era presentato in questa documentazione con il nome « MySQL ».

### Quale versione scegliere?

La procedura guidata propone le versioni **10.6**, **10.11**, **11.4** e **11.8**. Scelga la più recente per un nuovo progetto, oppure la versione più vicina al suo ambiente attuale per una migrazione. La versione può essere cambiata dopo la creazione tramite **Edit**.

### Quali preset sono disponibili?

Il **Preset** stabilisce la CPU e la memoria di ogni nodo. Fa fede l'elenco mostrato dalla procedura guidata; a titolo indicativo:

| **Preset** | **CPU** | **Memoria** |
|------------|---------|-------------|
| `nano`     | 250m    | 128Mi       |
| `micro`    | 500m    | 256Mi       |
| `small`    | 1       | 512Mi       |
| `medium`   | 1       | 1Gi         |
| `large`    | 2       | 2Gi         |
| `xlarge`   | 4       | 4Gi         |
| `2xlarge`  | 8       | 8Gi         |

:::warning
Il preset non può essere modificato dopo la creazione. Lo dimensioni di conseguenza, oppure contatti il supporto per cambiarlo.
:::

### Come funziona la replica?

Il primary scrive le sue modifiche nel binary log, che le repliche rieseguono. In caso di guasto del primary, la piattaforma promuove automaticamente una replica. Per beneficiarne, scelga **3 (Max High Availability)** o **5 (Ultra High Availability)** repliche alla creazione: questo numero non è più modificabile in seguito.

### Dove si trova l'indirizzo di connessione?

Nel riquadro **Connection and network** della pagina del cluster, campo **Host**, quando l'**External Access** è attivato. La porta è `3306`. Senza accesso esterno, il campo mostra **Not defined**: il cluster resta raggiungibile dalle VM del progetto tramite un indirizzo interno, che la console non mostra; [contatti il supporto](mailto:support@hidora.io) per ottenerlo.

### Come creare un database?

Conceda a un utente un accesso sul nome del database (**Manage Access** → **Specific Access (Databases)** → **Add**). Il database viene creato se non esiste. Consulti [Gestire utenti e database](./how-to/manage-users-databases.md).

### Perché l'utente creato nella procedura guidata non ha accesso al mio database?

Il **Role** scelto nella procedura guidata di creazione del cluster si applica al database di sistema `mysql`. Conceda poi l'accesso ai suoi database applicativi tramite **Manage Access**.

### Ho smarrito la password di un utente. Come recuperarla?

Non può essere riletta. Ne generi una nuova: **Actions** → **Change Password** → **Perform rotation**. La vecchia password viene revocata immediatamente.

### È possibile limitare il numero di connessioni per utente o modificare i parametri del server?

Queste impostazioni non sono proposte nella console; contatti il supporto.

### I backup sono disponibili?

La configurazione dei backup e il ripristino non sono proposti nella console; contatti il supporto. Consulti [Configurare i backup](./how-to/configure-backups.md).
