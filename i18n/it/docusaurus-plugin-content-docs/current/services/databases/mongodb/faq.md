---
sidebar_position: 6
title: "FAQ — MongoDB"
sidebar_label: FAQ
description: "Domande frequenti su MongoDB in Hikube: versione, numero di repliche, sharding, indirizzo di connessione, permessi degli utenti, password e backup."
---

# FAQ — MongoDB

### Quale versione scegliere?

La procedura guidata propone **6.0**, **7.0** e **8.0** (predefinita). Per un nuovo progetto scelga la più recente. Per una migrazione, parta dalla versione del suo ambiente attuale, quindi aggiorni una versione alla volta da **Edit**. Una versione non può essere riportata indietro.

### Quante repliche scegliere?

- **1 (Standalone)**: sviluppo e test, senza tolleranza ai guasti.
- **3 (Max High Availability)**: consigliato in produzione; il cluster resta disponibile se un membro si guasta.
- **5 (Ultra High Availability)**: tollera la perdita di due membri.

Il numero di repliche non può essere modificato dopo la creazione.

### Quando attivare lo sharding?

Quando il volume di dati o il throughput di scrittura supera ciò che un singolo replica set può assorbire. Lo sharding si decide alla creazione e moltiplica le risorse consumate (2 shard, server di configurazione e router Mongos). Per la maggior parte delle applicazioni è sufficiente un replica set. Si veda [Configurare lo sharding](./how-to/configure-sharding.md).

### Quali preset sono disponibili?

Il **Preset** stabilisce la CPU e la memoria di ogni nodo. I preset riprendono le taglie delle [macchine virtuali](../../compute/overview.md) delle serie `u1`, `s1` e `m1`: un preset ha le stesse risorse della VM con lo stesso nome.

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

Fa fede l'elenco mostrato dalla procedura guidata. Il preset non può essere modificato dopo la creazione.

### Dove si trova l'indirizzo di connessione?

Nel riquadro **Network and Connection** della pagina del cluster, quando l'**External Access** è attivato: campo **Host** per un cluster con sharding, elenco **Replica set rs0 members** e **External connection string** per un replica set. La porta è `27017`. Su un replica set, si connetta a un membro con `directConnection=true`, senza il parametro `replicaSet`. Senza accesso esterno, il campo mostra **Not defined**: il cluster resta raggiungibile dalle VM e dai cluster Kubernetes del progetto tramite un indirizzo interno, che la console non mostra; [contatti il supporto](mailto:support@hidora.io) per ottenerlo.

### Perché l'utente creato nella procedura guidata non ha accesso al mio database?

Il **Role** scelto nella procedura guidata si applica al **Database** indicato per questo utente, e solo a esso. Conceda l'accesso agli altri database tramite **Manage Access**. Si veda [Gestire utenti e database](./how-to/manage-users-databases.md).

Gli utenti creati prima della console v1.3.0 hanno ricevuto il loro ruolo sul database di sistema `admin`. In **Manage Access**, rimuova la riga `admin`, mostrata in errore, e aggiunga il loro database applicativo.

### Perché non riesco a salvare un utente?

Un utente MongoDB deve avere almeno un accesso a un database: altrimenti la console mostra «Please grant access to at least one database.». I database di sistema `admin`, `local` e `config` sono rifiutati. Verifichi anche le regole di denominazione: solo minuscole, cifre e trattini, senza trattino basso; da 3 a 16 caratteri per un nome utente.

### Ho smarrito la password di un utente. Come recuperarla?

Non può essere riletta. Ne generi una nuova: **Actions** → **Change Password** → **Perform rotation**. La vecchia password viene revocata immediatamente.

### I backup sono disponibili?

La configurazione dei backup e il ripristino non sono disponibili nella console; [contatti il supporto](mailto:support@hidora.io). In qualsiasi momento può eseguire un'esportazione logica con `mongodump`:

```bash
mongodump --uri "mongodb://<utente>@<host>:27017/myapp?authSource=admin" --out ./dump-$(date +%F)
```
