---
sidebar_position: 6
title: FAQ
---

# FAQ — MongoDB

### Quale versione scegliere?

La procedura guidata propone **6.0**, **7.0** e **8.0** (predefinita). Per un nuovo progetto scelga la più recente. Per una migrazione, parta dalla versione del suo ambiente attuale, quindi aggiorni una versione alla volta da **Edit**.

### Quante repliche scegliere?

- **1 (Standalone)**: sviluppo e test, senza tolleranza ai guasti.
- **3 (Max High Availability)**: consigliato in produzione; il cluster resta disponibile se un membro si guasta.
- **5 (Ultra High Availability)**: tollera la perdita di due membri.

Il numero di repliche non può essere modificato dopo la creazione.

### Quando attivare lo sharding?

Quando il volume di dati o il throughput di scrittura supera ciò che un singolo replica set può assorbire. Lo sharding si decide alla creazione e moltiplica le risorse consumate (2 shard, server di configurazione e router Mongos). Per la maggior parte delle applicazioni è sufficiente un replica set. Si veda [Configurare lo sharding](./how-to/configure-sharding.md).

### Quali preset sono disponibili?

| **Preset** | **CPU** | **Memoria** |
|------------|---------|-------------|
| `nano`     | 250m    | 128Mi       |
| `micro`    | 500m    | 256Mi       |
| `small`    | 1       | 512Mi       |
| `medium`   | 1       | 1Gi         |
| `large`    | 2       | 2Gi         |
| `xlarge`   | 4       | 4Gi         |
| `2xlarge`  | 8       | 8Gi         |

Fa fede l'elenco mostrato dalla procedura guidata. Il preset non può essere modificato dopo la creazione.

### Dove si trova l'indirizzo di connessione?

Nel riquadro **Network and Connection** della pagina del cluster, campo **Host**, quando l'**External Access** è attivato. La porta è `27017`. Senza accesso esterno, il campo mostra **Not defined**: il cluster resta raggiungibile dalle VM e dai cluster Kubernetes del progetto tramite un indirizzo interno, che la console non mostra; [contatti il supporto](mailto:support@hidora.io) per ottenerlo.

### Perché l'utente creato nella procedura guidata non ha accesso al mio database?

Il **Role** scelto nella procedura guidata di creazione del cluster si applica al database `admin`. Conceda poi l'accesso ai suoi database applicativi tramite **Manage Access**. Si veda [Gestire utenti e database](./how-to/manage-users-databases.md).

### Perché non riesco a salvare un utente?

Un utente MongoDB deve avere almeno un ruolo: un **Global Role** o uno **Specific Access** su un database. Verifichi anche le regole di denominazione: solo minuscole, cifre e trattini, senza trattino basso.

### Ho smarrito la password di un utente. Come recuperarla?

Non può essere riletta. Ne generi una nuova: **Actions** → **Change Password** → **Perform rotation**. La vecchia password viene revocata immediatamente.

### I backup sono disponibili?

La configurazione dei backup e il ripristino non sono disponibili nella console; [contatti il supporto](mailto:support@hidora.io). In qualsiasi momento può eseguire un'esportazione logica con `mongodump`:

```bash
mongodump --uri "mongodb://<utente>@<host>:27017/myapp?authSource=admin" --out ./dump-$(date +%F)
```
