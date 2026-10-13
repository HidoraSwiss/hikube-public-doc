---
title: Console Hikube v1.3.1
authors: [hikube]
tags: [release]
---

La console accompagna l'API v1.5.1: i moduli propongono le taglie servite dalla piattaforma. I dischi di una VM esistente non si sostituiscono più dalla pagina di modifica, e le schermate PostgreSQL seguono le nuove regole dei database.

<!-- truncate -->

## Aggiunto

- **Database e Kubernetes** — Gli elenchi di taglie provengono dalla piattaforma, con le loro risorse, ad esempio «u1.medium — 1 CPU / 4Gi». Per il control plane Kubernetes, la console propone `s1.small` e `s1.medium`. Se l'elenco non può essere caricato, un messaggio lo indica invece di mostrare un elenco superato.

- **Kubernetes** — La pagina di modifica di un cluster mostra, in sola lettura, la taglia di ciascuno dei quattro componenti del control plane.

- **Risorse forzate** — Quando le risorse di un'istanza sono fissate al di fuori della sua taglia, il modulo lo indica con la nota «(override)» e una spiegazione.

## Modificato

Queste modifiche cambiano un comportamento esistente della console.

- **Database e Kubernetes** — Alla creazione, nessuna taglia è preselezionata: dovete sceglierne una. In modifica, la taglia attuale resta visualizzata e viene rinviata così com'è, anche se non figura più nell'elenco.

- **Redis** — L'anteprima della quota conta le tre sentinelle del cluster, alla taglia scelta.

- **Istanze VM** — Nella pagina di modifica di una VM, i dischi che possiede già sono mostrati in sola lettura. Il disco di sistema non ha più alcuna azione, con la spiegazione «The system disk of an existing VM cannot be replaced: the VM boots from it.» Un disco dati propone solo **Detach disk**. La scelta **New** / **Existing** resta disponibile per i dischi aggiunti nel modulo.

- **Dischi** — L'eliminazione di un disco scollegato che la VM usa ancora è rifiutata con un messaggio chiaro: «This disk was detached, but its VM still uses it until its next restart. Restart the VM, then try again.» Anche l'eliminazione di un disco collegato mostra un messaggio esplicito invece di un errore tecnico.

- **PostgreSQL** — I database di sistema non sono più proposti nelle procedure guidate per gli utenti, e la loro creazione è rifiutata. Nell'elenco dei database, **Manage extensions** e **Delete** sono disattivati su un database di sistema. Un ruolo esistente su un database di sistema appare bloccato in **Manage Access**, con un avviso: potete rimuoverlo, non modificarlo.

- **PostgreSQL** — I nomi di database seguono la regola della piattaforma: lettere minuscole, cifre, trattini bassi e trattini, al massimo 54 caratteri, iniziando con una lettera o un trattino basso, ma non con `pg_`. I trattini non vengono più rimossi durante la digitazione.

## Corretto

- **PostgreSQL** — Nella pagina **Create a user**, il nome utente conserva i trattini bassi: `u_app` non diventa più `uapp`.

- **PostgreSQL** — La procedura guidata di creazione non preseleziona più il database di sistema `postgres` per gli utenti. Senza database applicativo, l'utente viene creato senza diritti. Se la piattaforma rifiuta un utente, l'ultimo passaggio mostra «User not created» e il motivo, invece di una falsa password.

- **Kubernetes e database** — Un cluster la cui taglia non figura nell'elenco si salva di nuovo: la modifica di un componente aggiuntivo o di un'altra opzione non è più bloccata.

## Sicurezza

- **Istanze VM** — Nella pagina di modifica di una VM, la scelta **New** / **Existing** permetteva di sostituire o scollegare il disco di sistema di una VM in servizio. Questa scelta non è più proposta per i dischi esistenti, e la piattaforma ora rifiuta questa modifica.
