---
sidebar_position: 3
title: Avvio rapido
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
| **Preset** | `Small (1 CPU, 512Mi)` | Non modificabile dopo la creazione |
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
2. **Role**: **Administrator** o **Read-only**.
3. Faccia clic su **Add**.

### Summary

Rilegga il riepilogo (**Version**, **Preset**, **Data volume**, **Replicas**, **External exposure**, **Sharding**, **Users to create**, **Estimated cost**), quindi faccia clic su **Create cluster**.

---

## Passo 3: Verificare lo stato

Il passaggio **Finish** conferma la creazione («Creation complete!»). Faccia clic su **Finish** per aprire la pagina del cluster.

| Stato | Significato |
|--------|---------------|
| **Creating** | Il cluster è in fase di provisioning |
| **Ready** / **Running** | Il cluster è operativo |
| **Error** / **Failed** | Il provisioning non è riuscito |

**Risultato atteso:** dopo alcuni minuti, lo stato passa a **Ready**. La pagina mostra la **MongoDB Version**, le **Replicas**, la **Allocated Size** e il **Preset**, nonché il riquadro **Network and Connection** (**Host**, **External Access**, **Sharding**).

---

## Passo 4: Recuperare le credenziali e concedere l'accesso a un database

### Credenziali

Il passaggio **Finish** della procedura guidata mostra, in **User Credentials**, la **Password** di ogni utente e, quando l'accesso esterno è attivato, una **Internal Connection String** nella forma `mongodb://app-user:<password>@<host>`.

:::warning
Copi subito queste password: non verranno più mostrate. In caso di smarrimento, ne generi una nuova dalla sezione **Users** (**Actions** → **Change Password**).
:::

### Accesso a un database applicativo

Il ruolo scelto nella procedura guidata si applica al database `admin`. Per dare accesso a un database applicativo:

1. Nella sezione **Users**, apra il menu **Actions** di `app-user` e scelga **Manage Access**.
2. In **Specific Access (Databases)**, faccia clic su **Add**.
3. Inserisca il **Database name**, ad esempio `myapp` (minuscole, cifre e trattini), e scelga i **Rights** **Administrator (Admin)**.
4. Faccia clic su **Save**.

---

## Passo 5: Connessione e test

```bash
mongosh "mongodb://<host>:27017/myapp" --username app-user --authenticationDatabase admin
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

---

## Passo 6: Risoluzione rapida dei problemi

### Il campo Host mostra «Not defined»

L'**External access** è disattivato, oppure l'indirizzo pubblico non è ancora stato assegnato. Se necessario, lo attivi tramite **Edit**, quindi attenda qualche istante.

Su un cluster senza sharding, il campo resta attualmente su **Not defined** anche con l'accesso esterno attivato: ciascun membro riceve il proprio indirizzo pubblico, che la console non mostra. [Contatti il supporto](mailto:support@hidora.io) per ottenerlo. Si connetta quindi a questo indirizzo senza il parametro `replicaSet`: i membri si annunciano con nomi interni, che non si risolvono dall'esterno.

### `Authentication failed`

Verifichi il nome utente, la password e il database di autenticazione (`--authenticationDatabase admin`). Se la password è stata smarrita, esegua una rotazione dalla sezione **Users**.

### `not authorized on myapp`

L'utente non ha accesso al database `myapp`. Lo aggiunga tramite **Manage Access**.

### Il cluster resta in Error

[Contatti il supporto](mailto:support@hidora.io) indicando il nome del progetto e del cluster.

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
