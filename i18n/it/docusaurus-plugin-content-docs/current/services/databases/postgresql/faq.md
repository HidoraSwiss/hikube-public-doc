---
sidebar_position: 6
title: "FAQ — PostgreSQL"
sidebar_label: FAQ
description: "Domande frequenti su PostgreSQL in Hikube: preset, repliche, indirizzo di connessione, password persa, nomi rifiutati, estensioni e backup."
---

# FAQ — PostgreSQL

### Quali preset di istanza sono disponibili?

L'**Instance preset** stabilisce la CPU e la memoria di ogni nodo del cluster. I preset riprendono le taglie delle [macchine virtuali](../../compute/overview.md) delle serie `u1`, `s1` e `m1`: un preset ha le stesse risorse della VM con lo stesso nome. Fa fede l'elenco mostrato dalla procedura guidata:

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

Il preset può essere cambiato dopo la creazione tramite **Edit**. La definizione di valori CPU/memoria liberi non è proposta nella console; contatti il supporto.

### Quante repliche scegliere?

- **1 (Standalone)**: sviluppo e test. Un guasto dell'istanza rende il database non disponibile fino al suo riavvio.
- **2 (High Availability)**: uno standby pronto a subentrare in caso di guasto del primary.
- **3 (Max High Availability)**: consigliato per la produzione critica.

Il numero di repliche non può essere modificato dopo la creazione; contatti il supporto se deve cambiarlo.

### Dove si trova l'indirizzo di connessione?

Nella pagina del cluster, riquadro **Connection and Databases**, campo **Host**. Vi compare un indirizzo solo se l'**External Access** è attivato; altrimenti il campo mostra **Not defined**. La porta è `5432`.

### Come connettersi da una VM o da un cluster Kubernetes dello stesso progetto senza accesso esterno?

Senza accesso esterno, il cluster resta raggiungibile dalle VM e dai cluster Kubernetes del progetto tramite un indirizzo interno al progetto, che la console non mostra. [Contatti il supporto](mailto:support@hidora.io) per ottenerlo.

### Ho smarrito la password di un utente. Come recuperarla?

Le password vengono mostrate una sola volta e non possono essere rilette. Ne generi una nuova: scheda **Users** → **Actions** → **Change Password** → **Perform rotation**. La vecchia password viene revocata immediatamente.

### Perché il mio nome utente viene rifiutato?

I nomi utente PostgreSQL contano da 3 a 16 caratteri, in lettere minuscole, cifre e trattini bassi (`_`), e iniziano con una lettera o un trattino basso. Il trattino (`-`) non è accettato. I nomi `postgres`, `admin`, `root`, `owner`, `superuser`, `streaming_replica` e tutti quelli che iniziano con `pg_` sono riservati.

### Perché il nome del mio database viene rifiutato?

Un nome di database conta da 1 a 54 caratteri: lettere minuscole, cifre, trattini bassi (`_`) e trattini (`-`). Inizia con una lettera o un trattino basso, ma non con `pg_`. I database di sistema `postgres`, `template0` e `template1` non possono essere creati.

### Perché un diritto sul database `postgres` è bloccato?

`postgres`, `template0` e `template1` sono database di sistema, riservati alla piattaforma: su di essi non può più essere attribuito né modificato alcun diritto. La procedura guidata di creazione del cluster preselezionava in passato il database `postgres` per gli utenti; i diritti attribuiti in questo modo vengono conservati. In **Manage Access**, una riga di questo tipo viene mostrata bloccata, con un avviso: la rimuova, quindi dia all'utente accesso a un database applicativo.

### Come aggiungere estensioni PostgreSQL?

Alla creazione di un database (scheda **Databases** → **Create**, sezione **PostgreSQL Extensions**) o in seguito, tramite **Actions** → **Manage extensions**. Le estensioni proposte includono in particolare `pg_stat_statements`, `pgcrypto`, `uuid-ossp`, `pg_trgm`, `hstore`, `citext`, `postgres_fdw`, `pgaudit` e `vector` (pgvector).

### È possibile creare più database e utenti?

Sì. Aggiunga tutti i database necessari nella scheda **Databases** e tutti gli utenti necessari nella scheda **Users**. Ogni utente può avere un diritto diverso su ogni database (**Administrator (Admin)** o **Read-only**).

### È possibile modificare i parametri PostgreSQL (`max_connections`, `shared_buffers`…)?

Questi parametri non sono proposti nella console; contatti il supporto.

### I backup sono disponibili?

La configurazione dei backup e il ripristino non sono proposti nella console; contatti il supporto. Consulti [Configurare i backup](./how-to/configure-backups.md).
