---
title: Console Hikube v1.4.4
authors: [hikube]
tags: [release]
---

La console accompagna l'API v1.6.4. Una risorsa eliminata resta visualizzata finché la sua eliminazione non è terminata, e il disco di sistema di una VM si cambia da una vista dedicata. Una VM bloccata all'avvio può ora essere arrestata, e la mappa della topologia della dashboard si carica più velocemente.

<!-- truncate -->

## Aggiunto

- **Istanze VM: cambiare il disco di sistema** — Una vista dedicata consente di sostituire il disco di sistema di una VM arrestata con un disco esistente non collegato, oppure con un nuovo disco vuoto. Un riepilogo ricorda che il vecchio disco viene scollegato e conservato, poi viene richiesta una conferma. Su una VM accesa, la vista invita ad arrestarla prima e propone di farlo. Vi si accede dalla scheda della VM e dalla sua modifica.

## Modificato

Queste modifiche cambiano un comportamento esistente della console.

- **Tutte le risorse** — Una risorsa eliminata resta nell'elenco con lo stato **Deleting** finché non scompare. Le sue azioni di modifica sono disattivate, e il motivo viene indicato. Creare una risorsa con il nome di una risorsa ancora in corso di eliminazione mostra un messaggio dedicato: riprovate una volta terminata l'eliminazione.

- **Istanze VM** — Subito dopo una modifica, o qualche secondo dopo un arresto, l'avvio può essere temporaneamente rifiutato. La console mostra **Change still being applied** e riprova da sola; un pulsante **Retry** compare se l'attesa si prolunga.

- **Istanze VM** — Una VM bloccata all'avvio o in errore, ad esempio per mancanza di quota, può essere arrestata dalla sua scheda, dall'elenco delle VM e dalla vista del disco di sistema. Il motivo del blocco compare nella scheda.

- **Dashboard** — La mappa della topologia carica le subnet di tutte le VPC del progetto con una sola richiesta, e limita il numero di VM mostrate per subnet.

## Corretto

- **Istanze VM** — Nell'elenco delle VM, la colonna **Network** mostra per primo l'indirizzo pubblico di una VM, contrassegnato con “public”, oppure **No public IP**. Prima mostrava “Public IP: Yes” sopra tutti gli indirizzi, compresi quelli privati.

- **Dischi** — Il colore dello stato distingue di nuovo un disco **Ready** da un disco **In Use**.

- **Immagini** — Una scheda di immagine ISO si apre con un clic.

- **Navigazione** — Tornare su una pagina ripristina la sua posizione di scorrimento.
