---
title: "Come consultare ed eliminare gli archivi"
sidebar_position: 7
description: "Consulti gli archivi di backup Hikube di una risorsa o di tutto il progetto, capisca perché un archivio non è ripristinabile ed elimini degli archivi."
---

# Come consultare ed eliminare gli archivi

Questa guida mostra dove trovare gli archivi di backup nella [console Hikube](https://console.hikube.cloud), come sapere se sono ripristinabili e come eliminarli.

## Consultare gli archivi

- **Per una risorsa**: scheda **Backups** del database, della VM o del disco. L'elenco di un disco contiene anche gli archivi della VM a cui è collegato.
- **Per tutto il progetto**: **Backups** > **Archives**. Questa vista elenca anche gli archivi delle risorse eliminate (**Application deleted**), da cui possono essere ricreate.

Per ogni archivio, la console mostra l'**Archive**, la sua **Date**, la sua **Duration**, il suo **Status**, la sua **Origin** (il nome della pianificazione, oppure **On demand**) e la sua **Destination**. La colonna **Size** resta vuota: oggi la dimensione degli archivi non viene misurata.

## Sapere se un archivio è ripristinabile

Un archivio **Ready** si ripristina con il pulsante **Restore**. Quando non può esserlo, la console mostra **Cannot be restored:** seguito dal motivo:

| Motivo | Che cosa fare |
|--------|---------------|
| L'archivio non è pronto | Attenda la fine della scrittura, oppure scelga un altro archivio se il backup non è riuscito. |
| La sua destinazione è stata eliminata | L'archivio non tornerà ripristinabile, nemmeno ricreando una destinazione con lo stesso nome. Scelga un archivio più recente. |
| La sua destinazione è in fase di eliminazione | Scelga un altro archivio. |
| La destinazione con questo nome è stata ricreata dopo il backup | Non è più la destinazione in cui l'archivio è stato scritto. Scelga un archivio creato in seguito. |
| Non è stato possibile leggere le destinazioni | Riprovi tra qualche istante. |
| I dati dell'archivio non sono più conservati | VM e dischi: l'archivio è stato cancellato, ad esempio al termine della conservazione. Scelga un altro archivio. |

## Eliminare un archivio

1. Sulla riga dell'archivio, faccia clic su **Delete**.
2. Confermi:
   - **PostgreSQL, MariaDB**: la voce viene rimossa; **l'archivio resta nel suo bucket**. Per liberare spazio, svuoti lei stesso il bucket.
   - **VM, disco**: **l'archivio conservato viene distrutto insieme alla voce**. È irreversibile: inserisca il nome dell'archivio per confermare.

Per eliminare più archivi di una stessa risorsa, li selezioni e faccia clic su **Delete N archives**. La console chiede di inserire il numero di archivi selezionati per confermare.

Un'eliminazione viene rifiutata in due casi:

- l'archivio è in lettura da parte di un ripristino: attenda la fine del ripristino;
- l'archivio si trova su una destinazione **WORM** e il suo blocco è ancora attivo: la console mostra **"…" is locked** con la data di fine del blocco. Fino ad allora resta ripristinabile. Un'eliminazione multipla esclude questi archivi.

## Conservazione automatica

Non è necessario eliminare gli archivi a mano: ognuno viene eliminato automaticamente al termine della sua conservazione, insieme alla riga dell'esecuzione corrispondente. L'ultimo archivio ripristinabile di una risorsa viene sempre conservato, anche se ha superato la sua conservazione. Vedere [Concetti: conservazione](../concepts.md#conservazione).

## Per approfondire

- [Creare e gestire una destinazione](./create-destination.md)
- [Ripristinare un database](./restore-database.md)
- [Ripristinare una VM o un disco](./restore-vm-or-disk.md)
