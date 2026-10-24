---
title: "Come ripristinare un database PostgreSQL o MariaDB"
sidebar_position: 3
description: "Ripristini un archivio PostgreSQL o MariaDB Hikube sul database di origine o su un altro database del progetto, con le precauzioni da prendere prima e le verifiche da fare dopo."
---

# Come ripristinare un database PostgreSQL o MariaDB

Questa guida ripristina un archivio di database dalla [console Hikube](https://console.hikube.cloud), sul database di origine oppure su un altro database del progetto. Per riportare un database PostgreSQL a un istante preciso, vedere [Ripristinare a un istante preciso](./restore-point-in-time.md).

## Prerequisiti

- Un archivio **Ready** e ripristinabile del database (vedere [Gestire gli archivi](./manage-archives.md)).
- Per ripristinare verso un altro database: un database **esistente** dello stesso tipo nel progetto. Per PostgreSQL, deve avere la **stessa versione principale** del database salvato.

## Prima di iniziare

:::warning Un ripristino sovrascrive i dati
Ripristinare sul database di origine ne sostituisce il contenuto attuale. È irreversibile. Per recuperare alcuni dati senza toccare il database in servizio, ripristini piuttosto verso un database vuoto creato per l'occasione.
:::

- **Verifichi le pianificazioni del database** (PostgreSQL). Un backup su richiesta viene rifiutato durante un ripristino, ma un backup **pianificato** può avviarsi durante quest'ultimo e farlo fallire. Se la prossima esecuzione (**Next**) di una pianificazione del database cade nei 30 minuti successivi, attenda che sia terminata prima di avviare un ripristino sul posto.
- **Un ripristino alla volta**: un secondo ripristino dello stesso database viene rifiutato finché il primo non è terminato.

## Ripristinare

1. Apra il database (**PostgreSQL** o **MariaDB**), poi la sua scheda **Backups**. Può anche partire da **Backups** > **Archives**, che elenca gli archivi di tutto il progetto.
2. Sulla riga dell'archivio, faccia clic su **Restore**.
3. Scelga il **Restore target**:
   - **In place**: sovrascrive il contenuto attuale del database;
   - **Another application**: scelga un database esistente del progetto, il cui contenuto attuale verrà sovrascritto.
4. Solo PostgreSQL: scelga lo stato da ripristinare in **Restore up to** (per impostazione predefinita, lo stato del backup; vedere [Ripristinare a un istante preciso](./restore-point-in-time.md)).
5. Inserisca il nome richiesto per confermare, poi faccia clic sul pulsante di ripristino.

La console mostra **Restore of "…" started.** Il ripristino compare nella sezione **Restores** della scheda **Backups** e in **Backups** > **Activity**.

### Che cosa succede al database target

| Tipo | Effetto del ripristino |
|------|------------------------|
| **PostgreSQL** | Il database target viene interamente ricostruito a partire dall'archivio. I suoi dati precedenti scompaiono. |
| **MariaDB** | L'esportazione dell'archivio viene rieseguita nel database target: ogni tabella che contiene sostituisce la tabella con lo stesso nome; le tabelle e i database che non contiene vengono conservati. |

### Il database di origine non esiste più

Se il database salvato è stato eliminato, la console mostra **“…” no longer exists: pick another application.** Crei un database dello stesso tipo (e della stessa versione principale per PostgreSQL), poi vi ripristini l'archivio.

Se dopo il backup è stato creato un nuovo database con lo stesso nome, viene trattato come un altro database: il ripristino è accettato dopo conferma.

## Seguire il ripristino

Il ripristino passa per **Pending**, **In progress**, poi **Succeeded** o **Failed**. Un ripristino di database che non va a buon fine non riesce da solo dopo 30 minuti; non può essere annullato prima.

Se un ripristino PostgreSQL non è riuscito, il database può restare non disponibile. Un backup su richiesta viene allora rifiutato finché il database non è di nuovo pronto: rilanci un ripristino, è questo che lo rimette in funzione.

## Verifica

- Il ripristino è **Succeeded** nella sezione **Restores**.
- Si connetta al database e controlli i suoi dati, ad esempio:

  ```sql
  -- PostgreSQL
  SELECT count(*) FROM ma_table;
  ```

  ```sql
  -- MariaDB
  SELECT COUNT(*) FROM ma_table;
  ```

- Dopo un ripristino PostgreSQL sul posto, avvii un backup su richiesta: gli archivi creati prima del ripristino appartengono al vecchio ramo della cronologia del database (vedere [Concetti](../concepts.md#rami-della-cronologia)). Questo primo backup può non riuscire; lo rilanci una volta (vedere [Risoluzione dei problemi](../troubleshooting.md#il-primo-backup-di-un-database-postgresql-non-riesce)).

## Per approfondire

- [Ripristinare a un istante preciso](./restore-point-in-time.md)
- [Risoluzione dei problemi: un ripristino viene rifiutato](../troubleshooting.md#un-ripristino-viene-rifiutato)
