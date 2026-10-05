---
title: "Come gestire utenti e database"
sidebar_position: 1
---

# Come gestire utenti e database

Questa guida spiega come creare database, attivare estensioni, creare utenti, gestire i loro diritti e rinnovare le loro password su un cluster PostgreSQL, dalla [console Hikube](https://console.hikube.cloud).

## Prerequisiti

- Un cluster **PostgreSQL** nello stato **Ready** nel suo progetto (consulti l'[avvio rapido](../quick-start.md))
- Il client **`psql`** per testare le connessioni

Tutte le operazioni si eseguono dalla pagina del cluster: **DB & Messaging** → **PostgreSQL** → nome del cluster. La pagina comprende due schede, **Databases** e **Users**.

## Passaggi

### 1. Creare un database

1. Nella scheda **Databases**, faccia clic su **Create**.
2. Inserisca il **Database name** (lettere minuscole, cifre e trattini bassi, al massimo 63 caratteri), ad esempio `analytics`.
3. In **PostgreSQL Extensions**, selezioni le estensioni da attivare alla creazione.
4. Faccia clic su **Create**.

Il database compare nell'elenco, con le sue estensioni. Figura anche nel riquadro **Connection and Databases**, sotto **Initial Databases**.

:::tip
Può anche dichiarare dei database già alla creazione del cluster, nel passaggio **Databases** della procedura guidata. Il database **`postgres`** viene sempre creato automaticamente.
:::

### 2. Gestire le estensioni di un database

1. Nella scheda **Databases**, apra il menu **Actions** del database.
2. Scelga **Manage extensions**.
3. Selezioni o deselezioni le estensioni, quindi faccia clic su **Save**.

L'elenco proposto corrisponde alle estensioni disponibili sulla piattaforma, in particolare `pg_stat_statements`, `pgcrypto`, `uuid-ossp`, `pg_trgm`, `hstore`, `citext`, `postgres_fdw`, `pgaudit` e `vector` (pgvector).

### 3. Creare un utente

1. Nella scheda **Users**, faccia clic su **Create a user**.
2. Inserisca lo **Username**: da 3 a 16 caratteri, lettere minuscole, cifre e trattini bassi, che inizi con una lettera o un trattino basso (ad esempio `report_reader`).
3. In **Databases**, faccia clic su **Add access** per ogni database a cui l'utente deve accedere:
   - **Database name**: selezioni il database;
   - **Rights**: **Administrator (Admin)** (lettura e scrittura) o **Read-only**.
4. Faccia clic su **Create user**.

La schermata « User created successfully! » mostra la password generata.

:::warning
Copi subito questa password e la conservi in un luogo sicuro: non verrà più mostrata dopo aver lasciato questa schermata.
:::

Faccia quindi clic su **Done and return to cluster**.

### 4. Modificare i diritti di un utente

1. Nella scheda **Users**, apra il menu **Actions** dell'utente.
2. Scelga **Manage Access**.
3. Aggiunga accessi con **Add**, modifichi i **Rights** o rimuova una riga.
4. Faccia clic su **Save**.

Il nome utente non può essere modificato.

### 5. Rinnovare la password di un utente

1. Apra il menu **Actions** dell'utente e scelga **Change Password**.
2. Nella finestra **Rotate password**, faccia clic su **Perform rotation**.
3. Copi la nuova password mostrata, quindi faccia clic su **Done**.

:::warning
La rotazione revoca immediatamente la vecchia password. Aggiorni subito le sue applicazioni per evitare un'interruzione.
:::

### 6. Eliminare un database o un utente

- Database: menu **Actions** → **Delete database**.
- Utente: menu **Actions** → **Delete user**.

Confermi inserendo il nome esatto dell'elemento, quindi faccia clic su **Permanently delete**. L'eliminazione di un database ne cancella i dati.

### 7. Testare la connessione

```bash
# Utente in sola lettura
psql "host=<host> port=5432 dbname=analytics user=report_reader sslmode=require"
```

```sql
-- Deve riuscire
SELECT current_user, current_database();

-- Deve fallire per un utente in sola lettura
CREATE TABLE test (id int);
```

## Verifica

- La scheda **Databases** elenca i suoi database e le relative estensioni.
- La scheda **Users** elenca i suoi utenti con, per ciascuno, i database accessibili e il diritto associato (ad esempio `analytics (Read-only)`).

## Per approfondire

- [Concetti PostgreSQL](../concepts.md): diritti, regole di denominazione
- [Modificare le risorse](./scale-resources.md): preset, disco, accesso esterno
