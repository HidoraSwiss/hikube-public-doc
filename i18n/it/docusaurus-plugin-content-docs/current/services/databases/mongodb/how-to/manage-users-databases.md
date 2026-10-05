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
2. Inserisca lo **Username**: minuscole, cifre e trattini, iniziando con una lettera (ad esempio `report-reader`).
3. Definisca almeno un ruolo:
   - **Global Role (Optional)**: lasci **No global role** per limitare l'utente a determinati database;
   - **Specific Access (Databases)**: faccia clic su **Add**, inserisca il **Database name** (ad esempio `analytics`) e scelga i **Rights** **Administrator (Admin)** o **Read-only**.
4. Faccia clic su **Create user**.

Se non è definito alcun ruolo, la console mostra «Please assign at least one role (global or specific) to the user.» e il pulsante resta inattivo.

La schermata «Generated password» mostra la password generata.

:::warning
Copi subito questa password e la conservi in un luogo sicuro: non verrà più mostrata dopo aver lasciato questa schermata.
:::

Faccia quindi clic su **Done**.

### 2. Modificare i diritti di un utente

1. Apra il menu **Actions** dell'utente e scelga **Manage Access**.
2. Aggiunga accessi con **Add**, modifichi i **Rights** o rimuova una riga. Deve restare almeno un ruolo.
3. Faccia clic su **Save**.

Il nome utente non può essere modificato.

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
mongosh "mongodb://<host>:27017/analytics" --username report-reader --authenticationDatabase admin
```

```javascript
// Deve riuscire
db.runCommand({ connectionStatus: 1 })
db.events.find().limit(1)

// Deve fallire per un utente in sola lettura
db.events.insertOne({ test: true })
```

## Verifica

L'elenco degli utenti mostra, per ciascuno, il suo **Role** e i **Databases** accessibili con il relativo diritto (ad esempio `analytics (Read-only)`).

## Per approfondire

- [Concetti MongoDB](../concepts.md): ruoli e regole di denominazione
- [Modificare le risorse](./scale-resources.md)
