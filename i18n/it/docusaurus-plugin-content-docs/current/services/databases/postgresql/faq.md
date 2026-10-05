---
sidebar_position: 6
title: FAQ
---

# FAQ — PostgreSQL

### Quali preset di istanza sono disponibili?

L'**Instance preset** stabilisce la CPU e la memoria di ogni nodo del cluster. Fa fede l'elenco mostrato dalla procedura guidata; a titolo indicativo:

| **Preset** | **CPU** | **Memoria** |
|------------|---------|-------------|
| `nano`     | 250m    | 128Mi       |
| `micro`    | 500m    | 256Mi       |
| `small`    | 1       | 512Mi       |
| `medium`   | 1       | 1Gi         |
| `large`    | 2       | 2Gi         |
| `xlarge`   | 4       | 4Gi         |
| `2xlarge`  | 8       | 8Gi         |

Il preset può essere cambiato dopo la creazione tramite **Edit**. La definizione di valori CPU/memoria liberi non è proposta nella console; contatti il supporto.

### Quante repliche scegliere?

- **1 (Standalone)**: sviluppo e test. Un guasto dell'istanza rende il database non disponibile fino al suo riavvio.
- **2 (High Availability)**: uno standby pronto a subentrare in caso di guasto del primary.
- **3 (Max High Availability)**: consigliato per la produzione critica.

Il numero di repliche non può essere modificato dopo la creazione; contatti il supporto se deve cambiarlo.

### Dove si trova l'indirizzo di connessione?

Nella pagina del cluster, riquadro **Connection and Databases**, campo **Host**. Vi compare un indirizzo solo se l'**External Access** è attivato; altrimenti il campo mostra **Not defined**. La porta è `5432`.

### Come connettersi da una VM o da un cluster Kubernetes dello stesso progetto senza accesso esterno?

Senza accesso esterno, il cluster resta raggiungibile dalle VM del progetto tramite un indirizzo interno al progetto, che la console non mostra. [Contatti il supporto](mailto:support@hidora.io) per ottenerlo.

### Ho smarrito la password di un utente. Come recuperarla?

Le password vengono mostrate una sola volta e non possono essere rilette. Ne generi una nuova: scheda **Users** → **Actions** → **Change Password** → **Perform rotation**. La vecchia password viene revocata immediatamente.

### Perché il mio nome utente viene rifiutato?

I nomi utente PostgreSQL contano da 3 a 16 caratteri, in lettere minuscole, cifre e trattini bassi (`_`), e iniziano con una lettera o un trattino basso. Il trattino (`-`) non è accettato. I nomi `postgres`, `admin`, `root`, `owner`, `superuser`, `streaming_replica`, `cnpg_pooler_pgbouncer` e tutti quelli che iniziano con `pg_` sono riservati.

### Come aggiungere estensioni PostgreSQL?

Alla creazione di un database (scheda **Databases** → **Create**, sezione **PostgreSQL Extensions**) o in seguito, tramite **Actions** → **Manage extensions**. Le estensioni proposte includono in particolare `pg_stat_statements`, `pgcrypto`, `uuid-ossp`, `pg_trgm`, `hstore`, `citext`, `postgres_fdw`, `pgaudit` e `vector` (pgvector).

### È possibile creare più database e utenti?

Sì. Aggiunga tutti i database necessari nella scheda **Databases** e tutti gli utenti necessari nella scheda **Users**. Ogni utente può avere un diritto diverso su ogni database (**Administrator (Admin)** o **Read-only**).

### È possibile modificare i parametri PostgreSQL (`max_connections`, `shared_buffers`…)?

Questi parametri non sono proposti nella console; contatti il supporto.

### I backup sono disponibili?

La configurazione dei backup e il ripristino non sono proposti nella console; contatti il supporto. Consulti [Configurare i backup](./how-to/configure-backups.md).
