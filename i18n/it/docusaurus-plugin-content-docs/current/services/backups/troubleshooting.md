---
sidebar_position: 7
title: "Risoluzione dei problemi — Backup"
sidebar_label: Risoluzione dei problemi
description: "Risolvere i problemi comuni dei backup Hikube: destinazione in errore, pianificazione rifiutata, backup non riuscito, archivio non ripristinabile, ripristino rifiutato, e significato dei codici 180xxx."
---

# Risoluzione dei problemi — Backup

### La destinazione è in errore

**Causa**: il bucket o il suo utente non è più leggibile (eliminato, o credenziali revocate), oppure un'eliminazione della destinazione non è andata a buon fine.

**Soluzione**:

1. Legga il messaggio della destinazione nella scheda **Destinations**.
2. Verifichi in **S3 Buckets** che il bucket e l'utente esistano ancora.
3. Se un'eliminazione non è andata a buon fine, il messaggio indica che cosa non è stato possibile liberare: elimini di nuovo la destinazione.
4. Se il problema persiste, contatti il [supporto](mailto:support@hidora.io) indicando il nome della destinazione.

---

### La destinazione resta in Provisioning

**Causa**: la predisposizione non è terminata.

**Soluzione**: attenda qualche istante, l'elenco si aggiorna da solo. Se lo stato non passa a **Ready** dopo qualche minuto, contatti il [supporto](mailto:support@hidora.io).

---

### La conservazione viene rifiutata

**Causa**: il valore non è un numero intero di giorni tra 1 e 3 650, oppure è più breve del blocco di un bucket WORM.

**Soluzione**: su un bucket WORM, inserisca almeno 365 giorni; la console indica il minimo esatto.

---

### La pianificazione viene rifiutata

| Causa | Soluzione |
|-------|-----------|
| L'espressione cron non ha cinque campi, oppure utilizza `@every`, `CRON_TZ=` o `TZ=` | Utilizzi un'espressione a cinque campi in UTC, oppure un'impostazione predefinita. |
| L'orario si attiva più di una volta all'ora | Distanzi le esecuzioni di almeno un'ora. |
| **No destination ready in this project** | Crei una destinazione, oppure attenda che sia **Ready**. |
| La destinazione è in fase di eliminazione | Scelga un'altra destinazione. |
| Un database PostgreSQL è già salvato verso un'altra destinazione | Utilizzi la stessa destinazione delle sue pianificazioni esistenti. |
| Il nome del piano esiste già, oppure non rispetta le regole | Scelga un altro nome: minuscole, cifre e trattini, al massimo 40 caratteri. |

---

### La pianificazione è in errore

**Causa**: l'orario non è più valido, oppure la risorsa o la destinazione è stata eliminata. Il messaggio della pianificazione indica quale.

**Soluzione**: elimini la pianificazione e ne crei una nuova con una destinazione **Ready**.

---

### Un backup non riesce

**Soluzione**:

1. Apra **Backups** > **Activity** e legga il **Message** dell'esecuzione.
2. Verifichi che la destinazione sia **Ready** e che l'utente del bucket abbia ancora accesso al bucket.
3. Verifichi che ci sia ancora spazio nel bucket e nella quota di storage a oggetti del progetto.
4. Rilanci con **Back up now**.
5. Se l'errore si ripete, contatti il [supporto](mailto:support@hidora.io) indicando il nome dell'esecuzione.

---

### Il primo backup di un database PostgreSQL non riesce

**Causa**: al suo primissimo backup, e al primo dopo un ripristino sul posto, il database viene riconfigurato per l'archiviazione dei suoi log e si riavvia brevemente. Questo backup può non riuscire.

**Soluzione**: rilanci il backup con **Back up now**; i successivi riescono.

---

### Un backup su richiesta viene rifiutato

| Causa | Soluzione |
|-------|-----------|
| È in corso un ripristino della risorsa | Attenda la fine del ripristino. |
| Il database PostgreSQL non è ancora pronto dopo un ripristino non riuscito | Attenda che il database sia pronto, oppure lo ripristini di nuovo: è questo che lo rimette in funzione. |
| La destinazione non è **Ready**, oppure è in fase di eliminazione | Scelga un'altra destinazione. |
| Un database PostgreSQL è già salvato verso un'altra destinazione | Scelga la destinazione delle sue pianificazioni. |

---

### Un archivio non è ripristinabile

Vedere [Sapere se un archivio è ripristinabile](./how-to/manage-archives.md#sapere-se-un-archivio-è-ripristinabile).

---

### Un ripristino viene rifiutato

| Causa | Soluzione |
|-------|-----------|
| È già in corso un ripristino di questa risorsa | Attenda che termini. |
| Il database di origine non esiste più | Scelga un altro database come target. |
| La VM o il disco (o uno dei dischi della VM) è stato ricreato con lo stesso nome dopo il backup | Elimini la risorsa ricreata, poi ripristini: il ripristino la ricrea dall'archivio. |
| Disco salvato da solo, ripristinato su sé stesso mentre esiste | Ripristini un archivio della VM a cui è collegato il disco. |
| Versioni principali di PostgreSQL diverse | Ripristini verso un database PostgreSQL della stessa versione principale del database salvato. |
| **No transaction after this point** | Ripristini lo stato più recente: lo stato ottenuto è lo stesso. |
| Istante fuori dalla finestra di ripristino | Scelga un istante entro i limiti mostrati. |
| Il ripristino partirebbe da un altro ramo della cronologia | Scelga un istante più vecchio, oppure un archivio del ramo desiderato. |
| Non è possibile garantire ciò che il ripristino restituirebbe | Riprovi più tardi. |
| L'archiviazione dei log non funziona sul database | Ripristini lo stato del backup, senza istante. |

---

### Il ripristino della VM non termina

**Causa**: un trasferimento è bloccato. Un ripristino di VM non si ferma da solo.

**Soluzione**: lo annulli con **Cancel restore** (vedere [Annullare un backup o un ripristino](./how-to/cancel-backup-or-restore.md)), poi rilanci un ripristino. Se la VM resta arrestata, è questo nuovo ripristino a rimetterla in funzione.

---

### Il ripristino della VM non è riuscito indicando un disco

**Causa**: un disco dell'archivio non è stato riscritto. Il messaggio indica che cosa contiene questo disco.

**Soluzione**: rilanci il ripristino. I dischi messi da parte sono stati conservati con il nome `<disco>-orig-<identificativo>`: li elimini da **Disks** una volta che il ripristino è riuscito.

---

### Nell'elenco dei dischi compaiono dischi `-orig-`

**Causa**: un ripristino di VM con **Keep them**, oppure un ripristino non riuscito o annullato, ha conservato il vecchio contenuto dei dischi.

**Soluzione**: questi dischi sono fatturati come tutti gli altri. Ne recuperi ciò che le è utile, poi li elimini da **Disks**. La sezione **Restores** indica quale ripristino li ha creati.

---

### Un archivio non può essere eliminato

| Causa | Soluzione |
|-------|-----------|
| **"…" is locked** (destinazione WORM) | Attenda la data di fine del blocco mostrata. |
| Un ripristino sta leggendo questo archivio | Attenda la fine del ripristino. |

---

### La destinazione non può essere eliminata

**Causa**: **This destination is still used by a plan, a run or a restore.**

**Soluzione**: elimini le pianificazioni che la utilizzano e attenda la fine dei backup e dei ripristini in corso.

---

## Codici di rifiuto

Ogni rifiuto del servizio di backup riporta un codice a sei cifre che inizia con `180`. Se contatta il supporto, lo indichi insieme al messaggio.

| Codice | Significato | Che cosa fare |
|--------|-------------|---------------|
| 180001 | Destinazione non trovata | Verifichi il nome della destinazione. |
| 180002 | Pianificazione non trovata | Verifichi il nome della pianificazione. |
| 180003 | Esecuzione non trovata | Potrebbe essere stata eliminata con la sua pianificazione o al termine della sua conservazione. |
| 180004 | Archivio non trovato | Potrebbe essere stato eliminato, o rimosso al termine della sua conservazione. |
| 180005 | Ripristino non trovato | Verifichi il nome del ripristino. |
| 180006 | Esiste già una destinazione con questo nome | Scelga un altro nome. |
| 180007 | Esiste già una pianificazione con questo nome | Scelga un altro nome. |
| 180008 | Conflitto con una modifica simultanea | Riprovi. |
| 180009 | Servizio temporaneamente non disponibile | Riprovi tra qualche istante. |
| 180010 | La predisposizione non è riuscita | Riprovi; contatti il supporto se l'errore persiste. |
| 180011 | Bucket non trovato nel progetto | Scelga un bucket dello stesso progetto. |
| 180012 | Utente non trovato su questo bucket | Scelga un utente di questo bucket, oppure ne crei uno. |
| 180013 | Risorsa non trovata | Verifichi che il database, la VM o il disco esista. |
| 180014 | Eliminazione della destinazione incompleta | La elimini di nuovo. |
| 180015 | Annullamento incompleto | Annulli di nuovo per terminare. |
| 180101 | Nome della destinazione non valido | Minuscole, cifre e trattini, al massimo 40 caratteri. |
| 180102 | Nome della pianificazione non valido | Minuscole, cifre e trattini, al massimo 40 caratteri. |
| 180103 | Conservazione fuori dai limiti | Da 1 a 3 650 giorni. |
| 180105 | Orario illeggibile, intervallo o fuso orario | Espressione cron a cinque campi oppure `@hourly`, `@daily`, `@weekly`, `@monthly`, `@yearly`, in UTC. |
| 180106 | Orario troppo frequente | Al massimo un'esecuzione all'ora. |
| 180107 | Tipo di risorsa non coperto | Si salvano solo PostgreSQL, MariaDB, le VM e i dischi. |
| 180109 | Conferma mancante | Confermi l'operazione distruttiva. |
| 180200 | Destinazione non pronta | Attenda che sia **Ready**. |
| 180201 | Destinazione ancora in uso | Elimini prima le sue pianificazioni; attenda la fine delle operazioni in corso. |
| 180204 | Archivio non ripristinabile | Il messaggio ne indica il motivo. |
| 180205 | Ripristino in corso su questa risorsa | Attenda che termini. |
| 180206 | Il target non è dello stesso tipo dell'archivio | Scelga un database dello stesso tipo. |
| 180207 | Istante preciso o stato più recente richiesto al di fuori di PostgreSQL | Riservato a PostgreSQL. |
| 180208 | Ripristino verso un'altra risorsa impossibile per una VM o un disco | Ripristini sulla risorsa di origine. |
| 180209 | Destinazione in fase di eliminazione | Scelga un'altra destinazione. |
| 180210 | Archivio in lettura da parte di un ripristino | Attenda la fine del ripristino. |
| 180211 | La risorsa di origine non esiste più | Scelga un altro database come target. |
| 180212 | Database PostgreSQL già salvato verso un'altra destinazione | Utilizzi la stessa destinazione. |
| 180213 | Nessun disco di origine da conservare | **Keep them** si applica solo a una VM ripristinata su sé stessa. |
| 180214 | Istante fuori dalla finestra di ripristino | Scelga un istante entro i limiti mostrati. |
| 180215 | Archiviazione dei log interrotta | Ripristini lo stato del backup. |
| 180216 | Backup non annullabile | Attenda che termini. |
| 180217 | Archivio bloccato da un bucket WORM | Attenda la fine del blocco. |
| 180218 | Conservazione più breve del blocco del bucket | Almeno 365 giorni. |
| 180219 | Nessuna transazione dopo l'istante richiesto | Ripristini lo stato più recente: è lo stesso. |
| 180220 | Non è possibile verificare ora lo stato dell'archivio | Riprovi più tardi. |
| 180221 | Il ripristino partirebbe da un altro ramo della cronologia | Scelga un istante più vecchio o un altro archivio. |
| 180222 | La VM o uno dei suoi dischi è stato ricreato dopo il backup | Elimini prima la risorsa ricreata. |
| 180223 | Ripristino non annullabile | Attenda che termini da solo. |
| 180224 | Versioni principali di PostgreSQL diverse | Ripristini verso un database della stessa versione principale. |
| 180225 | Un disco non si ripristina su sé stesso | Ripristini un archivio della VM a cui è collegato. |
| 180226 | Database PostgreSQL non ancora pronto dopo un ripristino | Attenda che sia pronto, oppure lo ripristini di nuovo. |
| 180227 | Per ora non c'è nulla da annullare | Annulli di nuovo tra qualche secondo. |
