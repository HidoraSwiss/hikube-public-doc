---
sidebar_position: 2
title: "Concetti — Backup"
sidebar_label: Concetti
description: "Comprenda i backup Hikube: destinazioni, conservazione, bucket bloccati, pianificazioni in UTC, esecuzioni, archivi ripristinabili, ripristino sul posto o verso un altro database, PITR PostgreSQL."
---

# Concetti — Backup

## Terminologia

| Termine | Descrizione |
|---------|-------------|
| **Destinazione** | Un bucket S3 del progetto, l'utente del bucket di cui utilizza le credenziali e una durata di conservazione in giorni. Ogni backup viene scritto in una destinazione. |
| **Conservazione** | Durata per la quale un archivio viene conservato, da 1 a 3 650 giorni. Trascorso questo periodo, l'archivio viene eliminato automaticamente. |
| **Pianificazione** (piano) | Backup ricorrente di una risorsa verso una destinazione, secondo un orario. |
| **Esecuzione** | Un backup in corso, avviato da una pianificazione o **su richiesta**. Un'esecuzione riuscita produce un archivio. |
| **Archivio** | Copia conservata dello stato di una risorsa in un dato momento, da cui si ripristina. |
| **Ripristino** | Riscrittura di una risorsa a partire da un archivio. |
| **Risorsa di origine** | Il database, la VM o il disco da cui è stato preso l'archivio. |
| **Target** | La risorsa in cui scrive un ripristino: la risorsa di origine stessa (ripristino **sul posto**), oppure un altro database dello stesso tipo. |

---

## Risorse coperte

| Tipo | Ripristino sul posto | Ripristino verso un'altra risorsa | Ripristino a un istante preciso | Eliminare un archivio cancella i dati |
|------|:---:|:---:|:---:|:---:|
| PostgreSQL | Sì | Sì, verso un database PostgreSQL della stessa versione principale | Sì | No |
| MariaDB | Sì | Sì, verso un altro database MariaDB | No | No |
| Macchina virtuale | Sì | No | No | Sì |
| Disco | Solo se il disco è stato eliminato | No | No | Sì |

Gli altri servizi (MongoDB, Redis, RabbitMQ, cluster Kubernetes, bucket) non sono coperti.

### Una VM porta con sé i suoi dischi

L'archivio di una macchina virtuale contiene **tutti i dischi** della VM. Questi dischi non hanno quindi bisogno di una pianificazione propria: nella scheda **Backups** di un tale disco, la console indica **Backed up with another resource**, e in **Backups** > **Protection** lo stato **Covered**. L'archivio della VM compare anche nell'elenco degli archivi del disco.

Ripristinare questo archivio riscrive la VM **e** tutti i suoi dischi: non è possibile ripristinarne solo una parte.

---

## Destinazioni

Una destinazione si crea in **Backups** > **Destinations** > **Create a destination**. Comprende:

| Elemento | Regola |
|----------|--------|
| **Name** | Da 1 a 40 caratteri: minuscole, cifre e trattini, senza iniziare né terminare con un trattino. Unico nel progetto. |
| **Bucket** | Un bucket S3 dello **stesso progetto**. Occorre crearne uno prima della prima destinazione. |
| **Credentials** | Un utente del bucket. La console propone di **crearne uno dedicato** (consigliato: le sue credenziali servono solo ai backup e si revocano senza toccare il resto) o di riutilizzarne uno. |
| **Retention** | Numero intero di giorni, da 1 a 3 650. 30 giorni per impostazione predefinita nella console. |

Una destinazione serve a tutte le risorse coperte del progetto. Dopo la creazione si modifica solo la conservazione; per cambiare bucket, crei un'altra destinazione.

### Stati di una destinazione

| Stato | Significato |
|-------|-------------|
| **Provisioning** | La destinazione è in fase di predisposizione o di eliminazione. |
| **Ready** | La destinazione accetta pianificazioni, backup e ripristini. |
| **Error** | Il bucket o il suo utente non è più leggibile, oppure un'eliminazione non è andata a buon fine. Il messaggio ne indica la causa. |
| **Unknown** | Non è stato possibile leggere lo stato; riprovi tra qualche istante. |

Solo una destinazione **Ready** accetta una pianificazione, un backup o un ripristino. Credenziali semplicemente errate non vengono rilevate alla creazione: per i database, l'errore compare al primo backup.

### Conservazione

- Per **MariaDB, le VM e i dischi**, ogni archivio mantiene la conservazione in vigore al momento in cui è stato scritto. Modificare la conservazione di una destinazione cambia solo gli archivi successivi.
- Per **PostgreSQL**, la conservazione si applica a tutta la cronologia del database: ridurla può eliminare archivi già scritti, a partire dal backup successivo.
- Un archivio la cui conservazione è scaduta viene eliminato automaticamente, insieme alla riga dell'esecuzione che lo ha prodotto. L'**ultimo archivio ripristinabile** di una risorsa viene sempre conservato, qualunque sia la sua età. Un archivio in lettura da parte di un ripristino non viene mai eliminato.
- Un archivio di VM o di disco giunto al termine della conservazione diventa non ripristinabile dalla sua scadenza, ancor prima di essere rimosso dall'elenco.

### Bucket bloccato (WORM)

Quando il bucket di una destinazione è stato creato con il blocco degli oggetti, la console mostra **WORM · 365 d** accanto alla destinazione. Conseguenze:

- ogni archivio è bloccato per 365 giorni dopo la sua scrittura: nessuno può eliminarlo prima, nemmeno il supporto. La console mostra **Locked (WORM) until** sull'archivio;
- la conservazione della destinazione non può essere inferiore alla durata del blocco (365 giorni);
- un archivio bloccato resta ripristinabile per tutta la durata del blocco.

### PostgreSQL: una sola destinazione

Un database PostgreSQL archivia i suoi log delle transazioni in continuo, tra due backup, verso **una sola** destinazione. Due destinazioni sullo stesso database si dividerebbero questo flusso: nessuna delle due conterrebbe una cronologia completa, e quindi ripristinabile. Hikube rifiuta quindi di salvare un database PostgreSQL verso una seconda destinazione, sia tramite pianificazione sia su richiesta.

Per conservare archivi con ritmi diversi (ad esempio giornalieri e mensili), utilizzi più pianificazioni verso la **stessa** destinazione. Per MariaDB, le VM e i dischi, sono possibili più destinazioni.

---

## Pianificazioni

Una pianificazione associa una risorsa, una destinazione e un orario. Il nome, la risorsa e la destinazione sono fissati alla creazione; si modifica solo l'orario.

| Elemento | Regola |
|----------|--------|
| **Plan name** | Da 1 a 40 caratteri: minuscole, cifre e trattini, senza iniziare né terminare con un trattino. Unico nel progetto. |
| **Orario** | Un'impostazione predefinita (**Hourly**, **Daily**, **Weekly**) o un'espressione cron a cinque campi. |
| **Frequenza massima** | Un'esecuzione all'ora. |

### Orari e fuso orario

L'orario di una pianificazione è **registrato in UTC**.

- Con la scheda **Preset**, sceglie un'ora **locale**; la console la converte in UTC al momento del salvataggio.
- Con la scheda **Cron expression**, inserisce direttamente un'espressione **in UTC**, ad esempio `30 1 * * *` per le 01:30 UTC ogni giorno. `@hourly`, `@daily`, `@weekly`, `@monthly` e `@yearly` sono accettati; gli intervalli (`@every`) e i prefissi di fuso orario (`CRON_TZ=`, `TZ=`) sono rifiutati.
- Poiché l'orario è fisso in UTC, un backup pianificato **si sposta di un'ora in ora locale** a ogni cambio dell'ora legale. La console lo indica e mostra la **Next run** in ora locale.

### Stati di una pianificazione

| Stato | Significato |
|-------|-------------|
| **Ready** | L'orario è valido, la risorsa e la destinazione esistono. |
| **Error** | L'orario non è valido, oppure la risorsa o la destinazione non esiste più. Il messaggio indica quale. |
| **Unknown** | Non è stato possibile leggere lo stato. |

Eliminare una pianificazione ferma le esecuzioni future e **conserva gli archivi** già creati. La cronologia delle esecuzioni di questa pianificazione scompare con essa.

---

## Esecuzioni

Un'esecuzione passa per gli stati **Pending**, **In progress**, poi **Succeeded** o **Failed**. Un'esecuzione che lei ha annullato viene mostrata come **Cancelled**.

- Per una VM o un disco, la console mostra la percentuale di **dati trasferiti**. Questo valore misura i dati letti, non lo spazio occupato nel bucket: i blocchi già presenti in un archivio precedente non vengono riscritti.
- Per PostgreSQL e MariaDB, non è disponibile alcun avanzamento.

---

## Archivi

### Stati di un archivio

| Stato | Significato |
|-------|-------------|
| **Pending** | L'archivio è in fase di scrittura. |
| **Ready** | L'archivio è completo. |
| **Failed** | Il backup non è andato a buon fine; l'archivio non è ripristinabile. |

### Archivio ripristinabile o no

Un archivio **Ready** è ripristinabile solo se la sua destinazione esiste ancora, non è in fase di eliminazione ed è proprio quella in cui l'archivio è stato scritto. Quando non è così, la console ne mostra il motivo:

| Motivo mostrato | Che cosa fare |
|-----------------|---------------|
| L'archivio non è pronto | Attendere la fine della scrittura, oppure utilizzare un altro archivio se il backup non è riuscito. |
| La sua destinazione è stata eliminata | L'archivio non torna ripristinabile, nemmeno ricreando una destinazione con lo stesso nome. Utilizzi un archivio più recente. |
| La sua destinazione è in fase di eliminazione | Utilizzi un altro archivio. |
| La destinazione con questo nome è stata ricreata dopo il backup | Non è più la destinazione in cui l'archivio è stato scritto, anche se punta allo stesso bucket. Utilizzi un archivio creato in seguito. |
| Non è stato possibile leggere le destinazioni | Riprovi tra qualche istante. |
| I dati dell'archivio non sono più conservati | VM e dischi: l'archivio è stato cancellato, ad esempio al termine della conservazione. |

Ripristinabile significa che il ripristino sarà accettato; Hikube non rilegge il contenuto del bucket per verificarlo.

### Eliminare un archivio

| Tipo | Effetto | Conferma |
|------|---------|----------|
| PostgreSQL, MariaDB | Rimuove l'archivio dall'elenco; i suoi dati **restano nel suo bucket**. | Semplice |
| Macchina virtuale, disco | Rimuove l'archivio **e ne cancella i dati**. È irreversibile. | Inserimento del nome dell'archivio |

Un archivio in lettura da parte di un ripristino non può essere eliminato. Nemmeno un archivio bloccato da un bucket WORM, fino al termine del suo blocco.

---

## Ripristini

### Ripristino sul posto o verso un altro database

- **Sul posto**: l'archivio viene ripristinato sulla sua risorsa di origine, il cui contenuto attuale viene sovrascritto. La console chiede di inserire il nome della risorsa per confermare.
- **Verso un altro database** (solo PostgreSQL e MariaDB): l'archivio viene ripristinato in un altro database **esistente** del progetto, dello stesso tipo. Per ottenere una copia, crei prima un database vuoto, poi vi ripristini l'archivio.
  - **PostgreSQL**: il database target viene interamente sostituito dal contenuto dell'archivio. Deve avere la **stessa versione principale** di PostgreSQL del database salvato.
  - **MariaDB**: l'archivio è un'esportazione rieseguita nel database target. Ogni tabella che contiene sostituisce la tabella con lo stesso nome; le tabelle e i database che non contiene vengono conservati.

Un solo ripristino alla volta per risorsa. Durante un ripristino, nessun backup su richiesta di questa risorsa viene accettato.

### Risorsa di origine eliminata o ricreata

| Situazione | PostgreSQL, MariaDB | VM, disco |
|------------|---------------------|-----------|
| La risorsa di origine è stata eliminata | Scelga un altro database come target. | Il ripristino **ricrea** la risorsa a partire dall'archivio. |
| Una nuova risorsa porta il nome di quella di origine, creata dopo il backup | Viene trattata come un altro database: il ripristino è accettato dopo conferma. | Rifiutato: elimini prima la risorsa ricreata, poi ripristini. |

### Ripristino di una VM: i dischi sostituiti

Ripristinare una VM sul posto sostituisce ciascuno dei suoi dischi con la sua copia presente nell'archivio. La scelta **This machine's current disks** decide la sorte di ciò che contenevano finora:

- **Discard them** (predefinito): il loro vecchio contenuto viene eliminato una volta che il ripristino è riuscito ed è stato verificato.
- **Keep them**: il loro vecchio contenuto diventa un disco a sé, chiamato `<disco>-orig-<identificativo>`, scollegato da qualsiasi VM, elencato in **Disks** e fatturato come qualsiasi disco finché lei non lo elimina.

Un ripristino che non riesce o che viene annullato non elimina **nulla**, anche con **Discard them**: i vecchi dischi vengono allora conservati con lo stesso nome `<disco>-orig-<identificativo>`, e il messaggio del ripristino lo indica. Li elimini quando non le servono più.

Prima di passare a **Succeeded**, un ripristino di VM o di disco verifica che ogni disco dell'archivio sia stato effettivamente riscritto. Durante questa verifica (qualche secondo), resta **In progress**. Se un disco non è stato ripristinato, il ripristino passa a **Failed** indicandone il nome; rilanciare il ripristino può riuscire.

### Un disco non si ripristina su sé stesso

L'archivio di un disco salvato da solo non può essere ripristinato su questo disco finché esiste. Per tornare a uno stato precedente di un disco collegato a una VM, ripristini un archivio **della VM**: riscrive tutti i suoi dischi. Un disco eliminato, invece, viene ricreato dal ripristino del suo archivio.

### Annullamento

| Operazione | Annullabile | Note |
|------------|-------------|------|
| Backup non ancora avviato | Sì, tutti i tipi | |
| Backup PostgreSQL | Finché attende di partire | Un backup PostgreSQL iniziato non si interrompe: termina o non riesce da solo. |
| Backup MariaDB | Sì | |
| Backup di VM o di disco | Sì | Nei primi secondi, durante la copia della configurazione, l'annullamento viene rifiutato: riprovi qualche secondo dopo. |
| Ripristino PostgreSQL o MariaDB | No | Un ripristino di database che non va a buon fine non riesce da solo dopo 30 minuti. |
| Ripristino di VM o di disco | Sì | Nulla viene annullato a ritroso: la VM può restare arrestata e i suoi dischi messi da parte. Un nuovo ripristino la ripristina. |

Un backup annullato viene mostrato come **Cancelled** nell'attività, non come un errore, e non produce alcun archivio.

---

## Ripristino a un istante preciso (PostgreSQL)

Un database PostgreSQL salvato archivia in continuo i suoi **log delle transazioni** verso la sua destinazione. Un ripristino può quindi riportare il database:

| Scelta | Risultato |
|--------|-----------|
| **State of the backup** (predefinito) | Lo stato esatto dell'archivio scelto. |
| **Most recent state** | L'archivio, poi tutti i log archiviati da allora: lo stato più recente noto. |
| **Un istante** | Lo stato del database subito prima della prima transazione successiva all'istante scelto. |

### Finestra di ripristino

Ogni archivio PostgreSQL ha una **finestra** di istanti raggiungibili, che la console mostra su una linea temporale:

- inizia alla **fine** del backup (non al suo inizio: il database è coerente solo una volta terminato il backup);
- termina **prima dell'ultima transazione** presente nei log archiviati. Un istante successivo all'ultima transazione non può essere raggiunto, perché il ripristino si ferma sulla prima transazione che lo segue: scelga allora **Most recent state**, che include quest'ultima transazione;
- i log vengono archiviati con un leggero ritardo: gli ultimissimi minuti non sono ancora ripristinabili.

### Rami della cronologia

Ripristinare un database PostgreSQL **sul posto** avvia un nuovo **ramo** della sua cronologia. Gli archivi creati prima di questo ripristino appartengono al vecchio ramo. Se, a partire da un archivio, lo stato più recente o un dato istante dovesse partire da un archivio di un altro ramo, non restituirebbe i dati dell'archivio scelto: la console non propone questi istanti, e il ripristino viene rifiutato. Scelga un istante più vecchio, oppure un archivio del ramo desiderato.

---

## Ciclo di vita

| Azione | Comportamento |
|--------|---------------|
| Creare una destinazione | **Provisioning**, poi **Ready**. |
| Modificare la conservazione | Vedere [Conservazione](#conservazione). Impossibile al di sotto della durata del blocco di un bucket WORM. |
| Eliminare una destinazione | Rifiutato finché una pianificazione, un backup o un ripristino la utilizza. Gli archivi restano nel bucket ma non sono più ripristinabili; per PostgreSQL, la loro conservazione smette di essere applicata. |
| Eliminare una pianificazione | Le esecuzioni future si fermano; gli archivi vengono conservati. |
| Eliminare un archivio | Vedere [Eliminare un archivio](#eliminare-un-archivio). |
| Eliminare una risorsa salvata | I suoi archivi vengono conservati e restano ripristinabili. |

---

## Per approfondire

- [Panoramica](./overview.md)
- [Avvio rapido](./quick-start.md)
- [Ripristinare un database a un istante preciso](./how-to/restore-point-in-time.md)
