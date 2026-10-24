---
sidebar_position: 3
title: "Distribuire MongoDB in 5 minuti"
sidebar_label: Avvio rapido
description: "Create un replica set MongoDB dalla console Hikube, date a un utente l'accesso a un database applicativo e connettetevi con mongosh."
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# Distribuire MongoDB in 5 minuti

Questa guida la accompagna nella creazione del suo primo cluster **MongoDB** dalla [console Hikube](https://console.hikube.cloud), fino alla prima connessione con `mongosh`.

---

## Obiettivi

Al termine di questa guida, avrà:

- Un cluster **MongoDB** (replica set) distribuito nel suo progetto Hikube
- Un utente con i diritti su un database applicativo
- Una connessione funzionante con `mongosh`

---

## Prerequisiti

- Un **account Hikube** e un **progetto** con quote sufficienti (CPU, memoria, storage)
- La shell **`mongosh`** installata sul suo computer, se desidera testare una connessione da Internet

---

## Passo 1: Creare il cluster

1. Acceda alla [console Hikube](https://console.hikube.cloud) e selezioni il suo progetto.
2. Nel menu laterale, apra **DB & Messaging** → **MongoDB**. Viene visualizzata la pagina **MongoDB Clusters**.
3. Faccia clic su **Create a cluster**. Si apre la procedura guidata **Create a MongoDB cluster**.

---

## Passo 2: Configurare e confermare

La procedura guidata comprende cinque passaggi: **General**, **Configuration**, **Users**, **Summary** e **Finish**.

### General

Inserisca il **Cluster Name**, ad esempio `demo-mongo` (da 3 a 16 caratteri: minuscole, cifre e trattini; inizia con una lettera, termina con una lettera o una cifra).

### Configuration

| Campo | Valore consigliato per questa guida | Nota |
|-------|----------------------------------|----------|
| **MongoDB Version** | `8.0` | Versioni proposte: 6.0, 7.0, 8.0 |
| **Preset** | `s1.small — 1 CPU / 2Gi` | Nessun preset è preselezionato; non modificabile dopo la creazione |
| **Disk size (GB)** | `10` | Capacità di storage per nodo |
| **Number of replicas** | `3 (Max High Availability)` | `1` per un semplice test; non modificabile dopo la creazione |
| **External access** | Attivato | Necessario per connettersi dal suo computer |
| **Sharding (Distributed Topology)** | Disattivato | Si veda [Configurare lo sharding](./how-to/configure-sharding.md) |

Il banner nella parte superiore della procedura guidata mostra l'**Estimated Cost** e l'impatto sulle quote del progetto.

:::note
Attivi l'**External access** solo se ne ha bisogno: espone il database sulla rete Internet pubblica.
:::

### Users

Aggiunga almeno un utente:

1. **Username**: ad esempio `app-user` (minuscole, cifre e trattini).
2. **Database**: il database applicativo su cui si applica il ruolo dell'utente, ad esempio `myapp` (minuscole, cifre e trattini). Viene creato se non esiste. I database di sistema `admin`, `local` e `config` sono rifiutati.
3. **Role**: **Administrator** per questa guida, oppure **Read-only**.
4. Faccia clic su **Add**.

### Summary

Rilegga il riepilogo (**Version**, **Preset**, **Data volume**, **Replicas**, **External exposure**, **Sharding**, **Users to create**, **Estimated cost**), quindi faccia clic su **Create cluster**.

---

## Passo 3: Verificare lo stato

Il passaggio **Finish** conferma la creazione («Creation complete!»). Faccia clic su **Finish** per aprire la pagina del cluster.

| Stato | Significato |
|--------|---------------|
| **Creating** | Il cluster è in fase di provisioning |
| **Ready** | Il cluster è operativo |
| **Error** | La piattaforma non è riuscita ad applicare la creazione o l'ultima modifica del cluster |

**Risultato atteso:** dopo alcuni minuti, lo stato passa a **Ready**. La pagina mostra la **MongoDB Version**, le **Replicas**, la **Allocated Size** e il **Preset**, nonché il riquadro **Network and Connection**: le zone di indirizzi **Internal** ed **External**, e lo **Sharding**. Per un replica set con accesso esterno, la zona **External** elenca un indirizzo per membro (**member 1**, **member 2**…), ciascuno con un pulsante di copia.

---

## Passo 4: Recuperare le credenziali e concedere l'accesso a un database

### Credenziali

Il passaggio **Finish** della procedura guidata mostra, in **User Credentials**, la **Password** di ogni utente e, quando l'accesso esterno è attivato, una **Internal Connection String**: `mongodb://app-user:<password>@<host>` per un cluster con sharding, `mongodb://app-user:<password>@<membro>:27017/?directConnection=true&authSource=admin` per un replica set.

:::warning
Copi subito queste password: non verranno più mostrate. In caso di smarrimento, ne generi una nuova dalla sezione **Users** (**Actions** → **Change Password**).
:::

### Accesso al database applicativo

L'utente dispone del ruolo scelto sul database indicato al passaggio **Users**: nella sezione **Users** della pagina del cluster, la colonna **Databases** mostra `myapp (Administrator)`. Per dargli accesso ad altri database, apra il menu **Actions** dell'utente e scelga **Manage Access** (si veda [Gestire utenti e database](./how-to/manage-users-databases.md)).

---

## Passo 5: Connessione e test

Dalla sua postazione, su un replica set, si connetta direttamente a un membro: copi uno degli indirizzi della zona **External**, oppure la **External connection string** del riquadro **Network and Connection**.

```bash
mongosh "mongodb://<membro>:27017/myapp?directConnection=true&authSource=admin" --username app-user
```

Su un cluster con sharding, utilizzi l'indirizzo della zona **External**: `mongosh "mongodb://<host>:27017/myapp?authSource=admin" --username app-user`.

Da una VM o da un cluster Kubernetes del progetto, utilizzi l'host della zona **Internal**, senza accesso esterno. Su un replica set, aggiunga `replicaSet=rs0`, come ricorda la console: il driver trova allora da solo il primario.

```bash
mongosh "mongodb://<host-interno>:27017/myapp?replicaSet=rs0&authSource=admin" --username app-user
```

La connessione non è cifrata (nessun TLS): non aggiunga `--tls`.

Inserisca la password, quindi verifichi la connessione:

```javascript
db.runCommand({ ping: 1 })
db.test.insertOne({ message: "Bonjour Hikube" })
db.test.find()
```

**Risultato atteso:**

```console
{ ok: 1 }
[ { _id: ObjectId('...'), message: 'Bonjour Hikube' } ]
```

:::note
Il membro raggiunto può essere un secondario, che non accetta scritture: `insertOne` risponde allora `not primary`. Lo verifichi con `db.hello().isWritablePrimary`, quindi si riconnetta a un altro membro dell'elenco per scrivere. Un secondario serve le letture con `readPreference=secondaryPreferred`.
:::

---

## Passo 6: Risoluzione rapida dei problemi

### La zona External mostra «Disabled» o «Waiting for allocation…»

«Disabled»: l'**External access** è disattivato. Lo attivi tramite **Edit** se deve connettersi da Internet; dal progetto, utilizzi l'host della zona **Internal**. «Waiting for allocation…»: l'indirizzo pubblico non è ancora stato assegnato, attenda qualche istante.

Su un replica set con accesso esterno, ciascun membro riceve il proprio indirizzo pubblico: la zona **External** li elenca non appena sono assegnati. Si connetta a uno di essi con `directConnection=true`, senza il parametro `replicaSet`: i membri si annunciano con nomi interni al cluster, che non si risolvono dall'esterno.

### L'host interno non si risolve da una VM

Copi il nome completo della zona **Internal**, senza abbreviarlo. Su Debian 13, il nome non si risolve senza configurazione: vedere [Raggiungere un servizio gestito del progetto](../../compute/how-to/configure-network.md#raggiungere-un-servizio-gestito-del-progetto).

### `Authentication failed`

Verifichi il nome utente, la password e il database di autenticazione (`authSource=admin` o `--authenticationDatabase admin`). Se la password è stata smarrita, esegua una rotazione dalla sezione **Users**.

### `not authorized on myapp`

L'utente non ha accesso al database `myapp`. Lo aggiunga tramite **Manage Access**.

### Il cluster passa in Error

La piattaforma non è riuscita ad applicare la creazione o l'ultima modifica del cluster. [Contatti il supporto](mailto:support@hidora.io) indicando il nome del progetto e del cluster.

---

## Passo 7: Pulizia

1. Apra la pagina del cluster (**DB & Messaging** → **MongoDB** → nome del cluster).
2. Faccia clic su **Delete cluster**.
3. Inserisca il nome esatto del cluster nel campo **Resource name to confirm**, quindi faccia clic su **Permanently delete**.

:::warning
Questa azione elimina il cluster MongoDB e tutti i dati associati. È **irreversibile**.
:::

---

## Riepilogo

Dalla console ha creato:

- Un cluster **MongoDB** replicato nel suo progetto
- Un utente e i relativi diritti su un database applicativo
- Un accesso esterno e una connessione `mongosh`

<NavigationFooter
  nextSteps={[
    {label: "Gestire utenti e database", href: "../how-to/manage-users-databases"},
    {label: "FAQ", href: "../faq"},
  ]}
  seeAlso={[
    {label: "Tutti i database", href: "../../"},
  ]}
/>
