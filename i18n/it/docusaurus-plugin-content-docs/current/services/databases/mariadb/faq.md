---
sidebar_position: 6
title: "FAQ — MariaDB"
sidebar_label: FAQ
description: "Domande frequenti su MariaDB in Hikube: compatibilità MySQL, scelta della versione, replica, creazione di un database, accesso degli utenti, password persa."
---

# FAQ — MariaDB

### Le mie applicazioni MySQL sono compatibili?

Sì. **MariaDB** è un fork open source di MySQL, compatibile con il protocollo e la sintassi MySQL. I client `mysql`, `mysqldump` e i connettori MySQL (JDBC, PDO, `mysql2`, ecc.) funzionano senza modifiche. In precedenza, questo servizio era presentato in questa documentazione con il nome « MySQL ».

### Quale versione scegliere?

La procedura guidata propone le versioni **10.6**, **10.11**, **11.4** e **11.8**. Scelga la più recente per un nuovo progetto, oppure la versione più vicina al suo ambiente attuale per una migrazione. La versione può essere aggiornata dopo la creazione tramite **Edit**; non può essere riportata indietro.

### Quali preset sono disponibili?

Il **Preset** stabilisce la CPU e la memoria di ogni nodo. I preset riprendono le taglie delle [macchine virtuali](../../compute/overview.md) delle serie `u1`, `s1` e `m1`: un preset ha le stesse risorse della VM con lo stesso nome. Fa fede l'elenco mostrato dalla procedura guidata:

| **Preset** | **CPU** | **Memoria** |
|------------|---------|-------------|
| `u1.medium` | 1 | 4Gi |
| `u1.large` | 2 | 8Gi |
| `u1.xlarge` | 4 | 16Gi |
| `u1.2xlarge` | 8 | 32Gi |
| `u1.4xlarge` | 16 | 64Gi |
| `u1.8xlarge` | 32 | 128Gi |
| `s1.small` | 1 | 2Gi |
| `s1.medium` | 2 | 4Gi |
| `s1.large` | 4 | 8Gi |
| `s1.xlarge` | 8 | 16Gi |
| `s1.2xlarge` | 16 | 32Gi |
| `s1.4xlarge` | 32 | 64Gi |
| `m1.large` | 2 | 16Gi |
| `m1.xlarge` | 4 | 32Gi |
| `m1.2xlarge` | 8 | 64Gi |
| `m1.4xlarge` | 16 | 128Gi |
| `m1.8xlarge` | 32 | 256Gi |

:::warning
Il preset non può essere modificato dopo la creazione. Lo dimensioni di conseguenza, oppure contatti il supporto per cambiarlo.
:::

### Come funziona la replica?

Il primary scrive le sue modifiche nel binary log, che le repliche rieseguono. In caso di guasto del primary, la piattaforma promuove automaticamente una replica. Per beneficiarne, scelga **3 (Max High Availability)** o **5 (Ultra High Availability)** repliche alla creazione: questo numero non è più modificabile in seguito.

### Dove si trova l'indirizzo di connessione?

Nel riquadro **Connection and network** della pagina del cluster. La zona **Internal** mostra sempre l'host interno, raggiungibile dalle VM e dai cluster Kubernetes del progetto; la zona **External** mostra l'indirizzo pubblico quando l'**External Access** è attivato, **Disabled** altrimenti. La porta è `3306`.

### Come creare un database?

Conceda a un utente un accesso sul nome del database (**Manage Access** → **Specific Access (Databases)** → **Add**), oppure lo indichi come **Database** di un utente al passaggio **Users** della procedura guidata di creazione del cluster. Il database viene creato se non esiste. I nomi dei database di sistema (`mysql`, `information_schema`, `performance_schema`, `sys`) sono rifiutati. Consulti [Gestire utenti e database](./how-to/manage-users-databases.md).

### Perché l'utente creato nella procedura guidata non ha accesso al mio database?

Il **Role** scelto nella procedura guidata si applica al **Database** indicato per questo utente, e solo a esso. Conceda l'accesso agli altri database tramite **Manage Access**.

Gli utenti creati prima della console v1.3.0 hanno ricevuto il loro ruolo sul database di sistema `mysql`. In **Manage Access**, rimuova la riga `mysql`, mostrata in errore, e aggiunga il loro database applicativo.

### Ho smarrito la password di un utente. Come recuperarla?

Non può essere riletta. Ne generi una nuova: **Actions** → **Change Password** → **Perform rotation**. La vecchia password viene revocata immediatamente.

### È possibile limitare il numero di connessioni per utente o modificare i parametri del server?

Queste impostazioni non sono proposte nella console; contatti il supporto.

### I backup sono disponibili?

Sì, dalla scheda **Backups** della pagina del cluster: pianificazione, backup su richiesta e ripristino. Consulti [Configurare i backup](./how-to/configure-backups.md) e il [servizio di backup](../../backups/overview.md).
