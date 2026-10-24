---
title: Hikube API v1.6.0
authors: [hikube]
tags: [release]
---

L'API si arricchisce di un servizio di backup e ripristino per PostgreSQL, MariaDB, VM e dischi, con il ripristino PostgreSQL a un istante preciso. I database gestiti possono essere riavviati, e una VM restituisce ora separatamente il proprio indirizzo interno e il proprio indirizzo pubblico. Le richieste `PATCH` diventano veri aggiornamenti parziali: un campo assente dal corpo mantiene il suo valore.

<!-- truncate -->

## Aggiunto

- **Backup** — Un nuovo servizio esegue il backup e il ripristino dei cluster PostgreSQL e MariaDB, delle VM e dei dischi. Gli altri servizi (MongoDB, Redis, RabbitMQ, Kubernetes, bucket) non sono supportati: una richiesta che li riguarda viene rifiutata con il codice `180107`.

- **Backup: destinazioni** — Una destinazione associa un bucket del progetto, l'utente del bucket di cui usa le credenziali e una conservazione in giorni. Gli archivi vengono scritti nel vostro bucket e ne occupano lo storage: non c'è né uno storage fornito dalla piattaforma né una quota di backup separata. Su un bucket bloccato (WORM), la conservazione non può essere più breve del blocco (`180218`). Una destinazione non può essere eliminata finché un piano, un backup in corso o un ripristino la usa. La sua eliminazione non tocca gli archivi già scritti nel bucket.

- **Backup: piani e backup su richiesta** — Un piano programma un backup ricorrente con un'espressione cron a cinque campi, oppure con `@hourly`, `@daily`, `@weekly`, `@monthly` e `@yearly`. L'orario è interpretato in UTC, e il campo `nextRunAt` indica la prossima esecuzione. Una programmazione più frequente di una volta all'ora viene rifiutata (`180106`), così come `@every` e i prefissi di fuso orario (`180105`). Un backup può anche essere avviato su richiesta, poi annullato finché non è terminato.

- **Backup: archivi** — Ogni archivio indica se è ripristinabile. Se non lo è, `notRestorableCause` ne dà il motivo come valore chiuso (`not_ready`, `destination_removed`, `destination_tearing_down`, `destination_replaced`, `destination_unverified`, `stored_archive_gone`), e `notRestorableReason` la frase da mostrare. Una destinazione ricreata con lo stesso nome non rende ripristinabili gli archivi scritti prima della sua creazione. Superata la loro conservazione, gli archivi vengono rimossi automaticamente. L'archivio ripristinabile più recente di ogni applicazione viene sempre conservato, qualunque sia la sua età.

- **Backup: eliminazione di un archivio** — Per PostgreSQL e MariaDB, eliminare un archivio rimuove solo la sua scheda: i dati restano nel vostro bucket. Per una VM o un disco, i dati vengono distrutti in modo irreversibile. La richiesta deve allora contenere `confirm_destructive=true`, e la risposta lo indica in `archiveDeleted`. Un archivio bloccato da un bucket WORM non può essere eliminato prima della fine del blocco (`180217`).

- **Backup: ripristino** — Un archivio si ripristina sull'applicazione di origine oppure, per PostgreSQL e MariaDB, su un'altra applicazione dello stesso tipo. Ogni ripristino che sovrascrive dati richiede `confirmDestructive`. Un archivio PostgreSQL si ripristina solo su un database della stessa versione principale (`180224`). Durante un ripristino, l'applicazione rifiuta i backup su richiesta (`180205`).

- **Backup: ripristino PostgreSQL a un istante** — Un archivio PostgreSQL si ripristina nello stato esatto del backup (`restorePoint: backup`, predefinito), nello stato archiviato più recente (`latest`) o a un istante scelto (`recoveryTime`). La finestra di ripristino di ogni archivio (`recoveryWindow`) indica i limiti da rispettare, al microsecondo. Rinviateli così come sono, senza ricalcolarli. Un istante fuori dalla finestra viene rifiutato (`180214`).

- **Backup: ripristino di una VM** — I dischi attuali della VM vengono sostituiti da quelli dell'archivio. Con `originalDisks: discard` (predefinito), il loro contenuto precedente viene eliminato una volta riuscito il ripristino. Con `keep`, viene conservato in un disco separato, scollegato, chiamato `<disco>-orig-<id>`. Un ripristino che fallisce o viene annullato non elimina nulla. Prima di passare a `succeeded`, il ripristino verifica che ogni disco dell'archivio sia stato riscritto. Un ripristino di VM che non termina può essere annullato. Un disco non si ripristina su se stesso finché esiste (`180225`): ripristinate un backup della VM a cui è collegato. Una VM o un disco eliminato e ricreato con lo stesso nome dopo il backup viene rifiutato (`180222`).

- **Database gestiti** — I cluster PostgreSQL, MariaDB, MongoDB, RabbitMQ e Redis possono essere riavviati (`POST .../clusters/{name}/restart`). PostgreSQL riavvia le sue istanze una dopo l'altra. Gli altri servizi riavviano tutte le loro istanze, il che interrompe brevemente il servizio. I dati vengono conservati.

- **Redis** — Il nuovo campo `restartRequired` indica che una modifica dell'autenticazione o una rotazione della password attende un riavvio del cluster per essere applicata.

- **Compute** — Il campo `network.internalIp` fornisce l'indirizzo della VM sulla rete del suo progetto, con o senza IP pubblico. È raggiungibile dalle altre risorse del progetto, fatto salvo il firewall del sistema guest. Viene restituito dalla lettura e dall'elenco delle VM, ed è vuoto finché la VM è ferma. Il campo `network.publicIp` fornisce l'indirizzo pubblico, quando `publicIpv4` è attivato. Può appartenere a un intervallo privato: non deducetelo dal suo intervallo.

- **Aggiornamenti parziali** — Ogni richiesta di aggiornamento accetta un campo facoltativo `updateMask`. Se non lo inviate, viene dedotto dalle chiavi del corpo JSON. Un percorso che non indica alcun campo modificabile, o una singola chiave di una raccolta (come `nodeGroups.workers`), viene rifiutato con il codice `10006`. La specifica OpenAPI elenca i percorsi modificabili di ogni risorsa.

- **Codici di errore** — Ogni nuovo rifiuto ha il proprio codice. Tutti sono restituiti con HTTP 400, tranne `10005`, restituito con 403 o 400 a seconda della regola.

| Codice | Servizio | Significato |
| --- | --- | --- |
| `10005` | Tutti | Rifiuto di una regola della piattaforma: il messaggio indica il campo rifiutato, `details` la regola e il suo motivo |
| `10006` | Tutti | `updateMask` non valido: percorso sconosciuto, o chiave di una raccolta |
| `20115` | Compute | Lo UserData di una VM Windows è generato dalla piattaforma e non può essere modificato |
| `40202` | Progetti | La quota richiesta supera ciò che resta all'organizzazione |
| `80205` / `110205` / `120205` / `140205` / `150205` | PostgreSQL / MariaDB / Redis / RabbitMQ / MongoDB | Il cluster è ancora in creazione: nulla da riavviare per ora |
| `120206` | Redis | Rotazione della password rifiutata: l'autenticazione è disattivata |
| `120207` | Redis | Rotazione della password rifiutata: l'autenticazione è appena stata attivata, riprovate tra qualche secondo |
| da `180001` a `180227` | Backup | Rifiuti del servizio di backup, ciascuno con un messaggio che dice cosa fare. L'elenco completo è nella specifica OpenAPI |

## Modificato

Queste modifiche cambiano un comportamento esistente. Verificatele se chiamate l'API dai vostri strumenti.

- **Aggiornamenti parziali** — Un `PATCH` modifica ormai solo i campi presenti nel corpo: un campo assente mantiene il valore registrato. I campi che erano obbligatori nell'aggiornamento, come `version`, `instanceType` o `disks`, non lo sono più: `{"external": true}` basta per attivare l'accesso esterno di un database. Un corpo vuoto (`{}`) non modifica nulla e restituisce la risorsa così come è registrata. Le altre regole:
  - una lista inviata vuota viene svuotata: `gpus`, `sshKeys`, `network.vpcs`, `allowedInboundPorts`, i gruppi di un utente IAM, le estensioni di un database PostgreSQL, i permessi di un utente;
  - un sotto-oggetto inviato vuoto, come `"config": {}`, indica tutti i suoi campi, che vengono riportati al valore predefinito. Per modificare un solo campo, inviate solo quel campo;
  - `null` equivale a un campo assente, tranne per una sovrascrittura di configurazione libera (Cilium, CoreDNS, Vertical Pod Autoscaler e sovrascritture degli addon di un cluster Kubernetes), dove `null` rimuove la sovrascrittura;
  - una sovrascrittura di configurazione libera inviata sostituisce quella registrata, invece di aggiungersi a essa;
  - un campo inviato viene validato con le regole della creazione, anche a zero: `replicas: 0` viene rifiutato, mentre prima valeva «nessuna modifica», e una quota di progetto a 0 viene rifiutata (da `40103` a `40105`).

- **Compute** — `userData: ""` rimuove lo UserData di una VM Linux. Su una VM Windows, uno UserData inviato nell'aggiornamento viene rifiutato (`20115`), e una stringa vuota viene ignorata.

- **Compute** — La lista `network.ips` non contiene più l'indirizzo interno della VM, restituito a parte in `internalIp`. L'indirizzo pubblico vi figura sempre, e anche in `publicIp`.

- **Unità** — Le dimensioni dell'API (dischi, memoria, storage, quote) sono espresse in GiB: 1 GiB vale 1 024 MiB. La specifica e i messaggi di errore dicevano «GB», e un client che calcolava in GB sottostimava la dimensione reale. Nel dettaglio `quotaFloor` del rifiuto `40201`, `unit` vale ora `" GiB"` invece di `"Gi"`.

- **Rifiuti delle regole della piattaforma** — Una richiesta rifiutata da una regola della piattaforma riceve il codice `10005`, con il campo in causa. Finora riceveva il codice di un altro errore, ad esempio `40002` («il progetto esiste già»).

- **Redis** — La rotazione della password genera una nuova password di 32 caratteri, applicata dopo un riavvio del cluster. Viene rifiutata se l'autenticazione è disattivata (`120206`).

## Corretto

- **Aggiornamenti parziali** — Un aggiornamento non reimposta più i campi che non menziona. Finora, un corpo senza questi campi:
  - disattivava l'IP pubblico di una VM e riscriveva la sua politica di riavvio;
  - disattivava gli addon di un cluster Kubernetes assenti dal corpo;
  - disattivava l'accesso esterno di un cluster MariaDB, RabbitMQ o Redis, e l'autenticazione di un cluster Redis;
  - disattivava lo sharding di un cluster MongoDB e azzerava il quorum di un cluster PostgreSQL;
  - azzerava il limite di connessioni di un utente MariaDB e il privilegio di replica di un utente PostgreSQL;
  - rimuoveva un utente RabbitMQ da tutti i suoi vhost.

- **Progetti** — Una quota di progetto che supera ciò che resta all'organizzazione viene rifiutata con il codice `40202` e la quota in causa. Prima veniva rifiutata con il codice `40001` (progetto non trovato) o `40002` (progetto già esistente).

- **Messaggi di errore** — Il nome di un tipo di risorsa non perde più la prima lettera nei messaggi di errore.

- **IAM** — Le modifiche di un utente creato tramite l'API (nome, gruppi) e la sua eliminazione vengono ora applicate al suo account di accesso, ritrovato tramite il suo indirizzo e-mail. Finora lo era solo la sua creazione.

- **Elenchi** — Gli elenchi di risorse, in particolare quello delle VM, rispondono più rapidamente. Un elenco di VM poteva richiedere diversi secondi.

## Sicurezza

- **Redis** — La rotazione della password di un cluster Redis restituiva la password precedente invece di generarne una nuova. Se avete eseguito una rotazione prima di questa versione, ripetetela, poi riavviate il cluster.

:::warning Limite noto
Un backup programmato può avviarsi durante il ripristino sul posto di un cluster PostgreSQL e farlo fallire. Prima di un tale ripristino, verificate il `nextRunAt` dei piani dell'applicazione: se un'esecuzione è prevista nei prossimi 30 minuti, attendete che termini.
:::
