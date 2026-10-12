---
title: "Come gestire utenti e database"
sidebar_position: 1
---

# Come gestire utenti e database

Questa guida spiega come creare utenti MongoDB, dare loro accesso ai database e rinnovarne le password dalla [console Hikube](https://console.hikube.cloud).

## Prerequisiti

- Un cluster **MongoDB** nello stato **Ready** nel suo progetto (si veda l'[avvio rapido](../quick-start.md))
- La shell **`mongosh`** per testare le connessioni

Tutte le operazioni si svolgono dalla pagina del cluster: **DB & Messaging** → **MongoDB** → nome del cluster, sezione **Users**.

:::note
La console MongoDB non ha una scheda dedicata ai database: i diritti si definiscono per utente, database per database. Come sempre con MongoDB, un database viene creato fisicamente non appena vi si scrive il primo documento.
:::

## Passaggi

### 1. Creare un utente

1. Nella sezione **Users**, faccia clic su **Create a user**.
2. Inserisca lo **Username**: da 3 a 16 caratteri, minuscole, cifre e trattini, iniziando con una lettera e terminando con una lettera o una cifra (ad esempio `report-reader`).
3. In **Specific Access (Databases)**, faccia clic su **Add** per ogni database:
   - **Database name**: ad esempio `analytics` (minuscole, cifre e trattini; i database di sistema `admin`, `local` e `config` sono rifiutati);
   - **Rights**: **Administrator (Admin)** o **Read-only**.
4. Faccia clic su **Create user**.

Un utente MongoDB deve avere almeno un accesso: senza accesso, la console mostra «Please grant access to at least one database.» e il pulsante resta inattivo. Non esiste un ruolo globale: l'utente ha accesso solo ai database elencati.

La schermata «User created successfully!» mostra la password generata.

:::warning
Copi subito questa password e la conservi in un luogo sicuro: non verrà più mostrata dopo aver lasciato questa schermata.
:::

Faccia quindi clic su **Done and return to cluster**.

:::tip
Gli utenti dichiarati nella procedura guidata di creazione del cluster ricevono il loro ruolo sul **Database** indicato al passaggio **Users**.
:::

### 2. Modificare i diritti di un utente

1. Apra il menu **Actions** dell'utente e scelga **Manage Access**.
2. Aggiunga accessi con **Add**, modifichi i **Rights** o rimuova una riga. Deve restare almeno un accesso.
3. Faccia clic su **Save**. Il messaggio «Access updated» conferma il salvataggio.

Il nome utente non può essere modificato.

:::warning Utenti creati prima della console v1.3.0
Gli utenti dichiarati nella procedura guidata di creazione del cluster prima della console v1.3.0 hanno ricevuto un ruolo sul database di sistema `admin`. In **Manage Access**, questa riga appare in errore e impedisce il salvataggio: la rimuova, aggiunga se necessario il database applicativo dell'utente, quindi faccia clic su **Save**.
:::

### 3. Rinnovare la password di un utente

1. Apra il menu **Actions** dell'utente e scelga **Change Password**.
2. Nella finestra **Rotate password**, faccia clic su **Perform rotation**.
3. Copi la nuova password, quindi faccia clic su **Done**.

:::warning
La rotazione revoca immediatamente la vecchia password. Aggiorni subito le sue applicazioni per evitare un'interruzione.
:::

### 4. Eliminare un utente

Apra il menu **Actions** dell'utente, scelga **Delete user**, inserisca il suo nome esatto, quindi faccia clic su **Permanently delete**.

### 5. Testare la connessione

```bash
mongosh "mongodb://<host>:27017/analytics?directConnection=true&authSource=admin" --username report-reader
```

Su un replica set, `<host>` è l'indirizzo di uno dei **Replica set rs0 members** elencati nel riquadro **Network and Connection**.

```javascript
// Deve riuscire
db.runCommand({ connectionStatus: 1 })
db.events.find().limit(1)

// Deve fallire per un utente in sola lettura
db.events.insertOne({ test: true })
```

## Verifica

La colonna **Databases** dell'elenco degli utenti mostra, per ciascuno, i database accessibili con il relativo ruolo (ad esempio `analytics (Read-only)` o `analytics (Administrator)`).

## Per approfondire

- [Concetti MongoDB](../concepts.md): ruoli e regole di denominazione
- [Modificare le risorse](./scale-resources.md)
