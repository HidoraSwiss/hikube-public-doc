---
title: Hikube API v1.5.0
authors: [hikube]
tags: [release]
---

L'API restituisce ora l'indirizzo interno dei database gestiti, i membri di un replica set MongoDB esposto e la conservazione dei bucket WORM. Rifiuta già alla richiesta le modifiche che la piattaforma non può applicare, come una versione inferiore o uno storage ridotto, e riserva il kubeconfig agli amministratori del progetto.

<!-- truncate -->

## Aggiunto

- **Database gestiti** — Il nuovo campo `internalHost` fornisce l'indirizzo interno di ogni cluster PostgreSQL, MariaDB, MongoDB, Redis e RabbitMQ, anche senza accesso esterno. È raggiungibile dalle VM e dai cluster Kubernetes dello stesso progetto, sulla porta predefinita del motore. Se una VM Debian non risolve questo indirizzo, seguite [Come risolvere il DNS .local nelle VM](/services/compute/how-to/fix-dns-local/).

- **MongoDB** — Un replica set con accesso esterno restituisce l'indirizzo di ciascun membro in `hosts` e il nome del replica set in `replicaSet`. Il campo `host` resta vuoto per un replica set, che non ha un punto di ingresso unico. Dall'esterno, collegatevi a un membro con `directConnection=true`.

- **Storage S3** — Un bucket bloccato (WORM) restituisce la propria conservazione in `retention`: durata in giorni, modalità (`compliance`) e conservazione degli oggetti all'eliminazione del bucket.

- **Compute** — Il campo `restartRequired` di una VM indica che una modifica attende un riavvio per essere applicata, ad esempio uno UserData ricaricato o un disco scollegato.

- **Specifica OpenAPI** — Le descrizioni dei campi riportano le regole che l'API applica realmente: lunghezza e formato dei nomi, nome dell'immagine atteso, ruoli consentiti. La specifica descrive anche il corpo degli errori (`requestId`, `code`, `message`, `details`) e l'elenco completo dei codici di errore.

- **Codici di errore** — Ogni nuovo rifiuto ha il proprio codice. Tutti sono restituiti con HTTP 400.

| Codice | Servizio | Significato |
| --- | --- | --- |
| `30200` | Dischi | Un disco non può essere ridotto |
| `70205` | Kubernetes | L'ambiente Kubernetes del progetto è in preparazione: riprovate tra qualche minuto |
| `70206` | Kubernetes | Ritorno a una versione inferiore rifiutato |
| `70207` | Kubernetes | La configurazione del progetto non consente di creare un cluster: non riprovate, contattate il supporto |
| `70208` | Kubernetes | La preparazione dell'ambiente Kubernetes del progetto non è riuscita: non riprovate, contattate il supporto |
| `80203` / `80204` | PostgreSQL | Versione inferiore rifiutata / storage che non può essere ridotto |
| `110203` / `110204` | MariaDB | Versione inferiore rifiutata / storage che non può essere ridotto |
| `120203` / `120204` | Redis | Versione inferiore rifiutata / storage che non può essere ridotto |
| `140203` / `140204` | RabbitMQ | Versione inferiore rifiutata / storage che non può essere ridotto |
| `150203` / `150204` | MongoDB | Versione inferiore rifiutata / storage che non può essere ridotto |

## Modificato

Queste modifiche cambiano un comportamento esistente. Verificatele se chiamate l'API dai vostri strumenti.

- **Database gestiti e Kubernetes** — Un aggiornamento che chiede una versione inferiore, o uno storage più piccolo di quello attuale, viene rifiutato prima di raggiungere la piattaforma. Finora veniva accettato, poi falliva sulla piattaforma, e la risorsa restava bloccata in creazione. Per Kubernetes viene controllata solo la versione: ridurre il disco dei nodi resta possibile, perché i nodi vengono sostituiti. Se la vostra ultima modifica non è riuscita, tornare ai valori in servizio resta consentito.

- **Dischi** — Un disco non può più essere ridotto, né direttamente né tramite l'aggiornamento della VM che lo utilizza (codice `30200`).

- **Stato delle risorse** — Un VPC, un progetto o un'applicazione gestita la cui ultima modifica non è stata applicata passa allo stato `error`. Queste risorse restavano prima in `provisioning` senza limite di tempo. Una risorsa la cui modifica non è riuscita può continuare a funzionare con la configurazione precedente.

- **Kubernetes** — Il kubeconfig di un cluster concede un accesso da amministratore: il suo download è ora riservato agli amministratori del progetto. Gli altri membri ricevono un errore 403.

- **Compute** — Il ruolo `use` di un progetto può ora avviare, arrestare e riavviare le VM. Queste azioni richiedevano prima il ruolo di amministratore.

- **Kubernetes** — La creazione del primo cluster di un progetto non parte più prima che l'ambiente Kubernetes del progetto sia pronto. Durante quei pochi minuti l'API risponde `70205` e non crea nulla. Inviate di nuovo la stessa richiesta più tardi. Un cluster successivo può ricevere brevemente questo codice durante una modifica del progetto, ad esempio un cambio di quota.

- **MariaDB e MongoDB** — I database di sistema non possono più essere destinatari di un ruolo né essere creati: `mysql`, `information_schema`, `performance_schema` e `sys` per MariaDB, `admin`, `local` e `config` per MongoDB. Se un utente esistente ha ancora un ruolo su un database di sistema, rimuovetelo al suo prossimo aggiornamento, altrimenti questo verrà rifiutato.

- **Autorizzazioni** — Un progetto inesistente e un progetto esistente ma vietato ricevono ora lo stesso errore 403, con lo stesso codice e lo stesso messaggio. Questi casi restituivano prima 400 o 404 a seconda della risorsa.

- **Progetti** — Il nome di progetto `super` è riservato.

## Corretto

- **Kubernetes** — Il primo cluster di un progetto non resta più una ventina di minuti in errore all'avvio, e i suoi componenti aggiuntivi non restano più in errore.

- **Compute** — L'aggiornamento di una VM non restituisce più un errore 500 quando uno dei suoi dischi esistenti è più piccolo del minimo di creazione (20 GB). Un rifiuto relativo a un disco viene restituito con il proprio codice e il disco interessato (`disks[1]: …`). I dischi trattati prima di quello rifiutato restano modificati.

- **Compute** — Lo stesso indirizzo IP non compare più più volte nell'elenco degli indirizzi di una VM.

- **Database e dischi** — Un volume di 1 TiB o più viene riportato con la sua dimensione reale (`1024` per 1 TiB) invece di `1`.

- **MariaDB** — Un server MariaDB singolo con accesso esterno restituisce il proprio indirizzo esterno in `host`.

- **Storage S3** — Un utente di bucket in sola lettura può tornare in lettura-scrittura. La risposta restituisce l'utente così come è registrato. Inviate sempre `readonly` in modo esplicito: `"config": {}` lo porta in lettura-scrittura.

- **Piattaforma** — Una richiesta che provoca un errore interno riceve una risposta 500 e non interrompe più il servizio per le altre richieste.

## Sicurezza

- **Kubernetes** — Un membro del progetto senza ruolo di amministratore poteva scaricare il kubeconfig, che concede un accesso da amministratore al cluster. Questo download è ora riservato agli amministratori del progetto.

- **Autorizzazioni** — Le risposte di errore non permettono più di sapere se esiste un progetto a cui non avete accesso.

- **Eventi in tempo reale** — L'accesso al flusso di eventi viene verificato per ogni tipo di risorsa richiesto, quote comprese. Una richiesta che non indica alcun tipo viene rifiutata (400).
