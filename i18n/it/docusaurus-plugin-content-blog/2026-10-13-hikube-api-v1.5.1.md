---
title: Hikube API v1.5.1
authors: [hikube]
tags: [release]
---

I database gestiti, RabbitMQ e il control plane Kubernetes si dimensionano ora con le taglie delle macchine virtuali, e le applicazioni gestite sono fatturate 10 CHF per vCPU e per GiB. Questa versione protegge anche il disco di sistema delle VM in servizio e allinea le regole dei database PostgreSQL.

<!-- truncate -->

## Aggiunto

- **Database gestiti e RabbitMQ** — Il campo `preset` accetta le taglie delle macchine virtuali, delle serie `u1`, `s1` e `m1`. Una taglia ha le stesse risorse di una VM con lo stesso nome: `u1.medium` corrisponde a 1 vCPU e 4 GiB. Le 17 taglie offerte vanno da `s1.small` (1 vCPU / 2 GiB) a `m1.8xlarge` (32 vCPU / 256 GiB). L'operazione `presets` di ogni servizio le elenca con le loro risorse.

- **Kubernetes** — Il control plane si dimensiona in `u1.small` (1 vCPU / 2 GiB) o in `u1.2xmedium` (2 vCPU / 4 GiB). La taglia si applica ai suoi quattro componenti, e la risposta indica la taglia di ciascuno.

- **Risorse** — La risposta di un database, di RabbitMQ o di un cluster Kubernetes indica le risorse effettive della sua taglia (`resources`: CPU e memoria).

- **Codici di errore** — Due nuovi rifiuti, restituiti con HTTP 400:

| Codice | Servizio | Significato |
| --- | --- | --- |
| `20208` | Compute | Il disco di sistema di una VM esistente non può essere né sostituito, né scollegato, né spostato |
| `30201` | Dischi | Il disco è scollegato, ma la VM lo usa ancora fino al prossimo riavvio: non può ancora essere eliminato |

## Modificato

Queste modifiche cambiano un comportamento esistente. Verificatele se chiamate l'API dai vostri strumenti.

- **Taglie dei database e di RabbitMQ** — I vecchi nomi (`small`, `medium`, `large`…) restano accettati per il momento, con risorse invariate. Ogni richiesta che ne usa uno riceve un'intestazione `Warning` che indica la taglia equivalente da usare. Un nome delle serie `u1`, `s1` o `m1` indica sempre la taglia di VM: `u1.small`, ad esempio, è rifiutato per un database.

- **Kubernetes** — Un control plane più piccolo di `small` è rifiutato alla creazione e in caso di cambio di taglia (codice `70111`): `nano`, `micro` e i loro equivalenti. Un cluster esistente di questa taglia resta modificabile finché la sua taglia non cambia.

- **Prezzi** — Un'applicazione gestita costa 10 CHF al mese per vCPU e per GiB di memoria: `s1.small` costa 30 CHF, `u1.medium` 50 CHF. Il control plane Kubernetes resta al forfait di 32 CHF al mese, qualunque sia la sua taglia. Un database che mantiene un vecchio nome di taglia non ha prezzo di catalogo finché non passa a una taglia dell'elenco.

- **Quote** — La quota conta ora le tre sentinelle di un cluster Redis, alla taglia del cluster, oltre ai quattro componenti del control plane Kubernetes. Le sentinelle non sono fatturate.

- **PostgreSQL** — I database di sistema `postgres`, `template0` e `template1` non possono più ricevere un ruolo, né essere creati, modificati o eliminati (codice `80105`). Un utente che detiene già un ruolo su uno di essi lo conserva finché quel ruolo non cambia.

- **PostgreSQL** — Un nome di database può contenere lettere minuscole, cifre, trattini bassi (`_`) e trattini. Inizia con una lettera o un trattino basso, non inizia con `pg_`, e conta al massimo 54 caratteri. I nomi da 55 a 63 caratteri, finora accettati, sono rifiutati (codice `80105`).

- **Compute** — Un aggiornamento di VM che sostituisce, rimuove o sposta il suo disco di sistema è rifiutato (codice `20208`). Per cambiare disco di sistema, eliminate la VM, poi ricreatela a partire dal disco desiderato.

- **Dischi** — L'eliminazione di un disco ancora in uso è rifiutata: disco collegato o elencato in una VM (codice `30007`), oppure disco scollegato che la VM usa fino al prossimo riavvio (codice `30201`). Riavviate la VM, poi riprovate.

## Corretto

- **Kubernetes** — Un aggiornamento che non cambia il control plane, come l'attivazione di un componente aggiuntivo, non lo modifica più e non ne sostituisce più i componenti.

- **Kubernetes, PostgreSQL e Redis** — Un cluster la cui taglia non figura nell'elenco resta modificabile: la sua taglia è restituita così com'è e non è più rifiutata finché non cambia.

- **PostgreSQL** — I nomi di database con un trattino basso, come `app_db`, sono accettati.

## Sicurezza

- **Compute e dischi** — Una modifica di VM poteva sostituire o scollegare il disco di sistema di una VM in servizio, e quel disco poteva poi essere eliminato mentre la VM lo usava ancora. L'API ora rifiuta entrambe le operazioni.
