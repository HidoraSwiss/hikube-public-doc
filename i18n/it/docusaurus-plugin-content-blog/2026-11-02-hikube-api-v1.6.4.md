---
title: Hikube API v1.6.4
authors: [hikube]
tags: [release]
---

Questa versione mantiene visibile una risorsa in corso di eliminazione, pagina gli elenchi di istanze e dischi, ed elenca con una sola chiamata le subnet di un intero progetto. Protegge inoltre il disco di sistema di una VM accesa, e rifiuta fin da subito un disco che la quota di storage del progetto non può contenere. Le aggiunte non tolgono nulla al contratto esistente.

**Cambio di comportamento**: una risorsa eliminata non scompare più immediatamente dall'API. Resta leggibile con lo stato `deleting` fino alla sua eliminazione effettiva (vedere *Modificato*).

<!-- truncate -->

## Aggiunto

- **Rete: subnet di un progetto** — `GET /network/v1alpha1/projects/{project_id}/subnets` restituisce con una sola chiamata le subnet di tutte le VPC del progetto, invece di una chiamata per VPC.

- **Compute e dischi: paginazione** — `GET .../instances` e `GET .../disks` accettano `pageSize` (al massimo 500; un valore maggiore viene servito come 500) e `pageToken`, il `nextPageToken` della risposta precedente. Gli elementi sono ordinati per nome, e `totalCount` indica su ogni pagina la dimensione dell'intera collezione. `nextPageToken` è vuoto nell'ultima pagina. Senza questi parametri, l'elenco viene restituito per intero, come prima.

- **Codici di errore** — Sono restituiti con HTTP 400. Il formato degli errori è descritto in [Errori](/api/errors/).

| Codice | Servizio | Significato |
| --- | --- | --- |
| `10009` | Tutti | Richiesta di pagina non valida: `pageSize` negativo, oppure `pageToken` che non proviene da questo elenco |
| `10010` | Tutti | La risorsa è in corso di eliminazione: si può leggere, ma non più modificare, e il suo nome non può essere riutilizzato prima che sia scomparsa |
| `20208` | Compute | Il disco di sistema di una VM si sostituisce, si scollega e si sposta solo a VM arrestata: arrestatela prima |
| `20209` | Compute | La VM non può ancora avviarsi: la sua ultima modifica è in corso di applicazione (circa 30 secondi). Riprovate |
| `20210` | Compute | I dischi che la creazione o la modifica aggiunge o ingrandisce non rientrano nella quota di storage rimanente del progetto |
| `30202` | Dischi | Il disco da creare, o la sua nuova dimensione, non rientra nella quota di storage rimanente del progetto |

## Modificato

Queste modifiche cambiano un comportamento esistente. Verificatele se chiamate l'API dai vostri strumenti.

- **Tutte le risorse** — Dopo la sua eliminazione, una risorsa resta leggibile ed elencata con lo stato `deleting`, finché non è realmente scomparsa; un `GET` risponde allora 404. Nel frattempo, ogni modifica della risorsa o delle sue sotto-risorse, e ogni creazione con lo stesso nome, vengono rifiutate con il codice `10010`. Una nuova richiesta di eliminazione resta accettata. Prima, la risorsa restituiva 404 non appena veniva richiesta l'eliminazione, anche se esisteva ancora. In tempo reale, la console riceve `status_changed` con `deleting`, poi `deleted`.

- **Compute** — Il disco di sistema di una VM (`disks[0]`) può essere sostituito, scollegato o spostato solo se la VM è arrestata (`stopped`). Altrimenti, la modifica viene rifiutata con il codice `20208` e nulla viene modificato.

- **Compute** — Subito dopo una modifica, l'avvio di una VM viene rifiutato con il codice `20209` finché la modifica non è applicata, ossia per circa 30 secondi. Avviarla prima poteva far partire la VM con la sua configurazione precedente, ad esempio su un disco di sistema appena sostituito. Questo rifiuto può verificarsi anche qualche secondo dopo l'arresto di una VM: riprovate.

- **Dischi e compute** — Un disco da creare o da ingrandire viene verificato rispetto alla quota di storage rimanente del progetto. Se non rientra, la richiesta viene rifiutata con il codice `30202` (dischi) o `20210` (creazione o modifica di una VM), e nulla viene creato. `details.storageQuota` indica la dimensione richiesta e lo spazio rimanente. Prima, il disco veniva accettato, poi restava bloccato per mancanza di spazio.

- **Quote** — Per un progetto che ha dei sottoprogetti, la quota mostrata e verificata è quella che resta realmente al progetto, una volta dedotta la parte assegnata ai suoi sottoprogetti. È questa quota che si applica alle nuove risorse, al controllo della dimensione del control plane Kubernetes (`70209`) e agli aggiornamenti in tempo reale della console.

## Corretto

- **Compute** — Una VM arrestata resta arrestata quando la modificate o durante una manutenzione della piattaforma. Poteva riavviarsi da sola.

- **MariaDB** — La creazione di un utente veniva rifiutata con un errore di autorizzazione dalla v1.6.3. Ora funziona di nuovo.
