---
title: "Come gestire utenti e database"
sidebar_position: 1
---

# Come gestire utenti e database

Questa guida spiega come creare utenti, concedere loro l'accesso a database e rinnovare le loro password su un cluster MariaDB, dalla [console Hikube](https://console.hikube.cloud).

## Prerequisiti

- Un cluster **MariaDB** nello stato **Ready** nel suo progetto (consulti l'[avvio rapido](../quick-start.md))
- Un client **`mysql`** o **`mariadb`** per testare le connessioni

Tutte le operazioni si eseguono dalla pagina del cluster: **DB & Messaging** → **MariaDB** → nome del cluster, sezione **Users**.

:::note
La console MariaDB non ha una scheda dedicata ai database: un database si crea concedendo a un utente un accesso sul suo nome.
:::

## Passaggi

### 1. Creare un utente

1. Nella sezione **Users**, faccia clic su **Create a user**.
2. Inserisca lo **Username**: lettere minuscole, cifre e trattini, che inizi con una lettera (ad esempio `report-reader`).
3. Lasci **Global Role (Optional)** su **No global role**.
4. Sotto **Specific Access (Databases)**, faccia clic su **Add** per ogni database:
   - **Database name**: ad esempio `analytics` (lettere minuscole, cifre e trattini; nessun trattino basso);
   - **Rights**: **Administrator (Admin)** o **Read-only**.
5. Faccia clic su **Create user**.

La schermata « Generated password » mostra la password generata.

:::warning
Copi subito questa password e la conservi in un luogo sicuro: non verrà più mostrata dopo aver lasciato questa schermata.
:::

Faccia quindi clic su **Done**.

### 2. Creare un database

Conceda a un utente un accesso sul nome del nuovo database (passaggio 1 per un nuovo utente, passaggio 3 per un utente esistente). Il database viene creato se non esiste ancora.

### 3. Modificare i diritti di un utente

1. Apra il menu **Actions** dell'utente e scelga **Manage Access**.
2. Aggiunga accessi con **Add**, modifichi i **Rights** o rimuova una riga.
3. Faccia clic su **Save**.

Il nome utente non può essere modificato.

### 4. Rinnovare la password di un utente

1. Apra il menu **Actions** dell'utente e scelga **Change Password**.
2. Nella finestra **Rotate password**, faccia clic su **Perform rotation**.
3. Copi la nuova password, quindi faccia clic su **Done**.

:::warning
La rotazione revoca immediatamente la vecchia password. Aggiorni subito le sue applicazioni per evitare un'interruzione.
:::

### 5. Eliminare un utente

Apra il menu **Actions** dell'utente, scelga **Delete user**, inserisca il suo nome esatto, quindi faccia clic su **Permanently delete**.

### 6. Testare la connessione

```bash
mysql -h <host> -P 3306 -u report-reader -p analytics
```

```sql
-- Deve riuscire
SELECT CURRENT_USER(), DATABASE();
SHOW GRANTS;

-- Deve fallire per un utente in sola lettura
CREATE TABLE test (id INT);
```

## Verifica

L'elenco degli utenti mostra, per ciascuno, il suo **Role** e i **Databases** accessibili con il diritto associato (ad esempio `analytics (Read-only)`).

## Per approfondire

- [Concetti MariaDB](../concepts.md): ruoli e regole di denominazione
- [Modificare le risorse](./scale-resources.md)
