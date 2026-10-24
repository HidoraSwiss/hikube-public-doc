---
title: "Come ripristinare un database PostgreSQL a un istante preciso"
sidebar_position: 4
description: "Ripristini un database PostgreSQL Hikube allo stato esatto di un backup, al suo stato più recente o a un istante preciso, grazie ai log delle transazioni archiviati in continuo."
---

# Come ripristinare un database PostgreSQL a un istante preciso

Un database PostgreSQL salvato archivia in continuo i suoi **log delle transazioni** verso la sua destinazione, tra due backup. Questa guida li utilizza per riportare un database a un istante preciso, ad esempio subito prima di un'eliminazione accidentale, dalla [console Hikube](https://console.hikube.cloud).

## Prerequisiti

- Un database PostgreSQL con almeno un archivio **Ready** e ripristinabile, creato **prima** dell'istante desiderato.
- Aver letto [Ripristinare un database PostgreSQL o MariaDB](./restore-database.md#prima-di-iniziare): valgono le stesse precauzioni.

## Che cosa può ripristinare

| Scelta in **Restore up to** | Risultato |
|-----------------------------|-----------|
| **State of the backup of …** (predefinito) | Lo stato esatto dell'archivio scelto. |
| **Most recent state** | L'archivio, poi tutti i log archiviati da allora, fino all'ultima scrittura nota. |
| Un istante sulla linea temporale, oppure una **Date** e un **Time (24 h)** | Lo stato del database subito prima della prima transazione successiva a questo istante. |

## Passaggi

### 1. Scegliere l'archivio

1. Apra **PostgreSQL**, il database, poi la sua scheda **Backups**.
2. Sulla riga dell'archivio più recente **precedente** all'istante desiderato, faccia clic su **Restore**.
3. Scelga il **Restore target**. Per esaminare i dati senza toccare il database in servizio, scelga **Another application** e un database vuoto della stessa versione.

### 2. Scegliere l'istante

La sezione **Restore up to** mostra una linea temporale. Regoli la **Scale** (**1 h**, **6 h**, **1 day**, **7 days**) e navighi con **Previous backup** / **Next backup**.

- Faccia clic sulla linea temporale, oppure inserisca una **Date** e un **Time (24 h)** in ora locale. La console mostra i limiti della finestra: **Restorable from … to …**.
- Un istante fuori dalla finestra viene riportato al limite più vicino, e la console lo indica (**Before the first backup: moved to …**, **Not archived yet: moved to …**).
- **Back to the most recent** seleziona lo stato più recente.

L'etichetta del pulsante riprende la sua scelta: **Restore the state at …**, **Restore the most recent state**, **Restore the state of the backup of …**.

### 3. Confermare

Inserisca il nome richiesto, poi faccia clic sul pulsante di ripristino.

## Comprendere la finestra

```mermaid
flowchart LR
    A["Inizio del backup"] --> B["Fine del backup<br/>(primo istante ripristinabile)"]
    B --> C["Istanti ripristinabili"]
    C --> D["Ultima transazione archiviata<br/>(non inclusa)"]
    D --> E["Non ancora archiviato"]
```

- **Primo istante**: la fine del backup, non il suo inizio. Il database è coerente solo una volta terminato il backup.
- **Ultimo istante**: subito prima dell'ultima transazione archiviata. Un ripristino si ferma sulla prima transazione che **segue** l'istante richiesto; dopo l'ultima transazione non ce ne sono più, e l'istante non può essere raggiunto. Per includere quest'ultima scrittura, scelga **Most recent state**.
- **Non ancora archiviato**: i log partono verso la destinazione con qualche minuto di ritardo; gli ultimissimi minuti non sono ancora ripristinabili.
- **Nessuna scrittura**: se nulla è stato scritto dopo il backup, lo stato più recente è quello del backup, e la console lo indica (**Same as the most recent state**).

## Casi particolari

| Messaggio | Significato | Che cosa fare |
|-----------|-------------|---------------|
| **Last write unknown** | Non è stato possibile leggere i log archiviati: la finestra mostrata è solo una stima. | Riprovi più tardi, oppure ripristini lo stato del backup. |
| «log archiving is not working on this database» | Nessun istante successivo al backup può essere garantito. | Ripristini lo stato del backup; contatti il supporto se l'archiviazione non riprende. |
| Istanti non proposti **From … on** (altro ramo della cronologia) | Un ripristino sul posto precedente ha creato un nuovo ramo della cronologia; oltre questa data, il ripristino partirebbe da un archivio dell'altro ramo. | Scelga un istante più vecchio, oppure un archivio del ramo desiderato. |
| **No transaction after this point** | L'istante è successivo all'ultima scrittura archiviata. | Scelga **Most recent state**: lo stato ottenuto è lo stesso. |

## Verifica

- Il ripristino è **Succeeded**; la colonna **Recovery point** della sezione **Restores** mostra l'istante ripristinato, **State of the backup** o **Most recent state**.
- Si connetta al database e verifichi che il dato desiderato sia presente e che le modifiche successive all'istante scelto non lo siano.

## Per approfondire

- [Concetti: ripristino a un istante preciso](../concepts.md#ripristino-a-un-istante-preciso-postgresql)
- [Risoluzione dei problemi](../troubleshooting.md#un-ripristino-viene-rifiutato)
