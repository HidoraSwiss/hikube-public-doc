---
title: Console Hikube v1.3.0
authors: [hikube]
tags: [release]
---

La console accompagna l'API v1.5.0: non propone più le modifiche che la piattaforma rifiuterebbe, spiega cosa comportano lo scollegamento di un disco e l'eliminazione di un bucket, e mostra i membri di un replica set MongoDB esposto.

<!-- truncate -->

## Aggiunto

- **MongoDB** — La scheda di un replica set con accesso esterno elenca i suoi membri, ciascuno con un indirizzo copiabile, invece di mostrare «Not defined». Propone una stringa di connessione diretta a un membro. Questo membro può essere un secondario, che non accetta scritture.

- **Kubernetes** — Mentre l'ambiente Kubernetes di un progetto è in preparazione, la creazione del suo primo cluster viene ritentata automaticamente, senza perdere la configurazione inserita. Un banner segnala l'attesa, con un pulsante **Cancel**. Se l'ambiente non può essere preparato, un messaggio lo indica e la console non riprova.

- **Progetti** — Le impostazioni del progetto mostrano il suo identificativo, con un pulsante di copia. L'identificativo dell'organizzazione, in **My Account**, si copia allo stesso modo.

- **Stati** — La scheda di un VPC mostra il suo stato. Un progetto la cui ultima modifica non è stata applicata ha un badge **Error** nel selettore di progetto. I filtri di stato dei VPC e dei cluster Kubernetes propongono **Ready** ed **Error**.

- **Istanze VM** — Dopo **Reload UserData**, la console indica che è necessario un riavvio per applicarlo e che le chiavi host SSH verranno rigenerate. Viene proposto un pulsante **Restart**.

- **Istanze VM** — Quando un VPC è collegato a una VM Debian o Ubuntu, un avviso ricorda che l'interfaccia va configurata nel sistema operativo. Vedere [Come collegare una VM a un VPC](/services/networking/how-to/attach-vm-to-vpc/).

- **Progetti** — Se la creazione di un progetto non riesce, il messaggio di errore mostra un riferimento della richiesta da comunicare al supporto.

## Modificato

Queste modifiche cambiano un comportamento esistente della console.

- **Kubernetes** — Il pulsante **Kubeconfig** è riservato agli amministratori del progetto. Per gli altri membri è disattivato, con la nota «Reserved for project administrators.»

- **Database** — La modifica di un cluster PostgreSQL, MariaDB, MongoDB o RabbitMQ propone solo la versione attuale e quelle superiori. La dimensione del disco non può più scendere sotto quella attuale. Un avviso segnala che un cambio di versione o di preset riavvia le istanze e che una versione aggiornata non può più essere abbassata.

- **MariaDB e MongoDB** — La procedura guidata di creazione chiede il database applicativo di ogni utente. I database di sistema vengono rifiutati: `mysql`, `information_schema`, `performance_schema` e `sys` per MariaDB, `admin`, `local` e `config` per MongoDB. Il campo «Ruolo globale», che non ha mai funzionato, è stato rimosso.

- **Database e RabbitMQ** — I nomi di utente, database e vhost seguono le regole dell'API: lettere minuscole, cifre e trattini, iniziando con una lettera. Gli errori di validazione sono tradotti. PostgreSQL non è interessato.

- **Istanze VM** — Rimuovere un disco da una VM lo scollega senza eliminarlo. La conferma si intitola ora «Detach», senza digitare il nome. Precisa che il disco resta in **Disks** con i suoi dati e che lo scollegamento ha effetto solo al prossimo riavvio della VM.

- **Istanze VM** — La dimensione minima del disco di sistema dipende dall'immagine scelta: 40 GB per Oracle Linux, 28 GB per Windows Server, 20 GB per le altre immagini. Scegliendo un'immagine più esigente, la dimensione sale al suo minimo.

- **Storage S3** — La conferma di eliminazione di un bucket indica cosa succede agli oggetti. Senza WORM, il bucket e tutti i suoi oggetti vengono eliminati, anche se non è vuoto. Con WORM, il bucket esce dalla console, ma i suoi oggetti vengono conservati e restano bloccati per 365 giorni dalla loro scrittura, in modalità COMPLIANCE. La procedura guidata di creazione indica questa conservazione.

- **Kubernetes** — Il campo «Ephemeral storage size» dei gruppi di nodi diventa «Node disk size»: questo disco è persistente. Il componente Monitoring Agents non propone più una configurazione Helm, che non applicava. I link di aiuto dei componenti portano a questa documentazione.

- **Istanze VM** — Gli indicatori vCPU e RAM, che non rappresentavano alcuna misura reale, sono stati rimossi dalla scheda della VM e dalla scelta del tipo di istanza. La scheda mostra la serie reale del tipo di istanza: Standard (S), Universal (U) o Memory (M).

## Corretto

- **Storage S3** — La console non mostra più il nome della risorsa al posto del nome S3 del bucket. Mostra il nome reale (`bucket-…`) oppure indica che sarà disponibile tra pochi istanti. Se avete configurato un client S3 con il nome mostrato alla creazione di un utente e riceve «Access Denied», riprendete il nome S3 dalla scheda del bucket.

- **Storage S3** — Deselezionare «Read-only» su un utente di bucket lo porta davvero in lettura-scrittura.

- **Istanze VM** — Il salvataggio di una VM con un disco esistente che non rispetta le regole di un disco nuovo (nome di oltre 16 caratteri, dimensione sotto i 20 GB) non fallisce più senza messaggio. Quando un salvataggio viene rifiutato, la console ne indica il motivo.

- **Istanze VM** — Il blocco di connessione SSH mostra l'utente predefinito restituito dall'API: `Hikube` per Windows, `opc` per Oracle Linux. Quando è sconosciuto, la console lo indica invece di indovinarne uno.

- **Istanze VM** — La scelta di un disco **Existing** durante la modifica di una VM non propone più i dischi di sistema né i dischi collegati a un'altra VM.

- **Kubernetes** — La prima personalizzazione Helm di Cilium, CoreDNS o Vertical Pod Autoscaler inserita durante la modifica di un cluster viene ora salvata. Il costo orario segue la lingua della console («CHF/h»).

- **PostgreSQL** — La modifica di un cluster propone gli stessi numeri di repliche della creazione (1, 2 o 3). Per un cluster con 2 repliche, questa scelta non appare più vuota.

- **Database** — **Manage Access** mostra un proprio messaggio di conferma, e la colonna **Databases** degli utenti MariaDB e MongoDB indica il ruolo su ogni database. Le etichette inglesi delle schermate PostgreSQL, MariaDB, MongoDB e Redis non usano più il vocabolario di RabbitMQ.

- **Navigazione** — Il percorso di navigazione mostra il nome di una risorsa così com'è, anche quando corrisponde a una parola dell'interfaccia: un cluster chiamato `postgres` non appare più come «PostgreSQL».

- **Istanze VM** — La scheda «Custom image» della procedura guidata spiega come usarla: creare prima un disco, poi sceglierlo.

## Sicurezza

- **MariaDB e MongoDB** — La procedura guidata di creazione di un cluster assegnava a ogni utente un ruolo sul database di sistema (`mysql` per MariaDB, `admin` per MongoDB). Non è più così. Per gli utenti creati prima di questa versione, aprite **Manage Access**: la riga del database di sistema vi appare in errore. Rimuovetela.
