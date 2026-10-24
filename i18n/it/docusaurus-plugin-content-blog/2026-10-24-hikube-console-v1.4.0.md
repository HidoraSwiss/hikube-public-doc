---
title: Console Hikube v1.4.0
authors: [hikube]
tags: [release]
---

La console accompagna l'API v1.6.0 con una nuova schermata **Backups**: destinazioni, programmazioni, backup su richiesta, archivi e ripristini delle VM, dei dischi e dei database PostgreSQL e MariaDB. Le impostazioni del progetto gestiscono le sue chiavi API, i database gestiti si riavviano dalla loro scheda, e le schede delle VM e dei database separano gli indirizzi interni da quelli esterni.

<!-- truncate -->

## Aggiunto

- **Backup** — Nel menu del progetto compare la voce **Backups**, con quattro schede:
  - **Destinations**: un bucket S3 del progetto, l'utente di cui la destinazione usa le credenziali e una durata di conservazione. Una destinazione su un bucket WORM mostra la durata del suo blocco;
  - **Protection**: ogni applicazione del progetto, con il suo stato (**Scheduled**, **Covered**, **Unprotected**) e il suo ultimo backup. Il filtro **Unprotected** elenca quelle senza alcun backup, e il pulsante **Schedule** ne crea uno;
  - **Activity**: i backup e i ripristini, con stato, durata e messaggio;
  - **Archives**: tutti gli archivi del progetto.

- **Backup nelle schede delle risorse** — Le schede delle istanze VM, dei dischi e dei cluster PostgreSQL e MariaDB hanno una scheda **Backups**. Propone **Back up now**, la programmazione dell'applicazione, lo stato delle esecuzioni in corso, i suoi archivi e i suoi ripristini. La scheda segnala una risorsa non protetta o un ultimo backup non riuscito.

- **Programmazione** — Un backup si programma ogni ora, ogni giorno o ogni settimana, oppure con un'espressione cron. L'orario è in UTC, e la console mostra la prossima esecuzione. Un avviso ricorda che l'orario si sposta di un'ora al cambio dell'ora. Un cluster PostgreSQL può essere salvato verso una sola destinazione: la console lo spiega quando esiste già un piano.

- **Ripristino** — **Restore** propone la destinazione del ripristino: **In place** oppure, per PostgreSQL e MariaDB, **Another application**. Un ripristino che sovrascrive dati chiede di digitare il nome della destinazione. Per una VM, scegliete cosa diventano i suoi dischi attuali: **Discard them** una volta riuscito il ripristino, oppure **Keep them** come dischi separati. I backup e i ripristini di VM in corso mostrano il loro avanzamento.

- **Ripristino PostgreSQL a un istante** — Il campo **Restore up to** propone lo stato esatto del backup, il **Most recent state**, oppure un istante scelto su una linea temporale, con una scala da un'ora a sette giorni, o inserito come data e ora. Un istante fuori dal periodo ripristinabile viene riportato al limite più vicino, e la console lo segnala.

- **Archivi** — Un archivio che non può essere ripristinato dice perché: archivio non ancora pronto, destinazione eliminata, in corso di eliminazione o ricreata nel frattempo, dati cancellati a fine conservazione. Più archivi di un'applicazione si eliminano in una volta: la conferma chiede di digitarne il numero. La console precisa se l'eliminazione distrugge i dati (VM e dischi) o lascia l'archivio nel vostro bucket (database). Gli archivi bloccati da un bucket WORM vengono esclusi, con la data di fine del blocco.

- **Annullamento** — Un backup in corso e il ripristino di una VM possono essere annullati. Quando l'annullamento non è ancora possibile o resta da completare, la console lo dice e propone **Retry**.

- **Chiavi API** — Nelle impostazioni del progetto compare, per i suoi amministratori, una scheda **API keys**. **Create a key** chiede un nome, un **Access level** (**Read**, **Use**, **Admin** o **Super admin**, mai al di sopra del vostro) e una **Validity** da 1 giorno a 1 anno. La chiave viene mostrata una sola volta, con un esempio di chiamata. L'elenco indica livello, creazione, scadenza (**Expires soon** negli ultimi 7 giorni, poi **Expired**) e ultimo utilizzo di ogni chiave. **Renew** crea una nuova chiave con lo stesso nome e lo stesso livello, poi propone di revocare quella vecchia. La revoca si conferma con il nome della chiave. Vedere [Autenticazione](/api/authentication/).

- **Database gestiti** — Nella scheda dei cluster PostgreSQL, MariaDB, MongoDB, RabbitMQ e Redis compare un pulsante **Restart**. La conferma precisa l'interruzione: riavvio progressivo per PostgreSQL, breve interruzione per gli altri. I dati vengono conservati.

- **Redis** — Un banner **Restart required** viene mostrato finché una modifica dell'autenticazione o una rotazione della password attende un riavvio, con un pulsante **Restart now**. Dopo una tale modifica, la console propone di riavviare subito o più tardi.

- **Indirizzi** — Le schede delle istanze VM e dei cluster PostgreSQL, MariaDB, MongoDB, Redis e RabbitMQ presentano i loro indirizzi in due zone. **Internal**: raggiungibile dalle risorse del progetto, con l'indirizzo della VM sulla rete del progetto, etichettato **mgmt**, o l'indirizzo interno del database e la sua porta. **External**: raggiungibile da Internet, con l'IP pubblico della VM o l'indirizzo esterno del database. Una VM senza IP pubblico mostra finalmente il proprio indirizzo, e un database senza accesso esterno il proprio indirizzo interno. Quando l'accesso esterno è disattivato, la zona lo indica invece di mostrare «Not defined».

## Modificato

Queste modifiche cambiano un comportamento esistente della console.

- **Istanze VM** — Il comando SSH proposto punta all'IP pubblico, altrimenti all'indirizzo **mgmt**. L'IP pubblico è quello restituito dalla piattaforma, anche quando appartiene a un intervallo privato.

- **Progetti** — I campi di quota lasciati vuoti mantengono il valore attuale. Una quota a 0, negativa o decimale viene rifiutata. Quando una quota supera ciò che resta all'organizzazione, il campo interessato lo indica, con il valore massimo possibile.

- **Progetti** — Il rifiuto di una quota inferiore al consumo mostra i suoi valori nelle unità della console: vCPU e GiB. I campi memoria e storage del modulo mostrano «GiB» in inglese.

## Corretto

- **Istanze VM** — Rimuovere l'ultimo VPC di una VM lo scollega davvero. Finora il VPC restava collegato.

- **PostgreSQL** — Rimuovere tutti i permessi di un utente non rimuove più il suo privilegio di replica.

- **Kubernetes** — Svuotare una sovrascrittura Cilium, CoreDNS, Vertical Pod Autoscaler o di un addon la rimuove ora dal cluster.

- **Redis** — I testi che annunciavano una revoca immediata della password precedente sono corretti: la nuova password si applica dopo il riavvio del cluster.
