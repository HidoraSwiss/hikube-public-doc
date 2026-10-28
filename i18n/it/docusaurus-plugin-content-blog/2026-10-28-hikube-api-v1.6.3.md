---
title: Hikube API v1.6.3
authors: [hikube]
tags: [release]
---

Questa versione indica perché una risorsa non è pronta, grazie al nuovo campo `statusDetail`, e fornisce lo stato del control plane di un cluster Kubernetes. Ogni servizio indica il proprio preset predefinito. Corregge inoltre l'aggiunta di chiavi SSH su una VM Windows, che ne sostituiva la password, e la rotazione delle credenziali di un utente di bucket. Le aggiunte non tolgono nulla al contratto esistente.

**Cambio di comportamento**: la rotazione della password di un utente MariaDB o RabbitMQ viene ora rifiutata, perché non veniva mai applicata (vedere *Sicurezza*).

<!-- truncate -->

## Aggiunto

- **Stato dettagliato** — I progetti, le VPC, i bucket, i cluster Kubernetes e i cluster PostgreSQL, MariaDB, MongoDB, Redis e RabbitMQ restituiscono un campo `statusDetail`, che indica la causa dietro `status`. Il suo campo `reason` assume uno dei valori `install_failed` (non è stato possibile creare la risorsa), `update_failed` (non è stato possibile applicare l'ultima modifica; la risorsa può ancora funzionare con la configurazione precedente), `workloads_not_ready` (la risorsa è applicata, ma alcuni dei suoi componenti non sono in funzione) e, solo per un cluster Kubernetes, `quota_exceeded` (dei nodi non possono avviarsi perché la quota del progetto è esaurita) o `node_failed` (un nodo è in errore). `reason` è vuoto quando non c'è nulla da segnalare. `message` fornisce una frase in inglese da mostrare e `since` il momento da cui la causa si applica. Basate le vostre decisioni su `reason`: il testo di `message` può cambiare. Potranno aggiungersi altri valori: trattate un valore sconosciuto come un errore generico.

- **Kubernetes: stato del control plane** — `GET /kubernetes/v1alpha1/projects/{project_id}/clusters/{name}/control-plane/status` restituisce lo stato del control plane di un cluster: `healthy`, `degraded` o `critical`, con il relativo motivo, ad esempio `replicas_not_ready`, `out_of_memory` o `memory_near_limit`. La risposta descrive ogni replica (stato, riavvii e causa dell'ultimo, memoria e CPU utilizzate rispetto al limite), oltre allo stato dell'etcd del cluster. Questo stato si legge su richiesta: non fa parte della risorsa del cluster.

- **Preset predefiniti** — `GET /{service}/v1alpha1/presets` restituisce anche `default`, il preset da proporre quando nulla orienta la scelta, per Kubernetes, PostgreSQL, MariaDB, MongoDB, Redis e RabbitMQ. È sempre uno dei preset dell'elenco. L'API non applica questo valore predefinito di propria iniziativa: una creazione senza preset continua a essere rifiutata.

- **Codici di errore** — Sono restituiti con HTTP 400. Il formato degli errori è descritto in [Errori](/api/errors/).

| Codice | Servizio | Significato |
| --- | --- | --- |
| `70209` | Kubernetes | La quota del progetto non lascia spazio per portare a termine la modifica della dimensione o delle repliche del control plane: aumentate la quota |
| `110206` | MariaDB | Rotazione della password di un utente non ancora disponibile: la nuova password non verrebbe applicata |
| `110207` | MariaDB | Cluster appena creato: riprovate la creazione dell'utente tra qualche secondo |
| `140206` | RabbitMQ | Rotazione della password di un utente non ancora disponibile: la nuova password non verrebbe applicata |

## Modificato

Queste modifiche cambiano un comportamento esistente. Verificatele se chiamate l'API dai vostri strumenti.

- **Kubernetes** — Una modifica della dimensione o del numero di repliche del control plane viene verificata prima di essere applicata. Durante la sostituzione progressiva, il control plane riserva più risorse sulla quota del progetto. Se la quota non lo consente, l'aggiornamento viene rifiutato con il codice `70209` e nulla viene modificato. Il messaggio indica, per ogni risorsa, di quanto aumentare la quota, e `details.quotaShortfall` fornisce la stessa informazione in formato JSON.

- **MariaDB e RabbitMQ** — `POST .../clusters/{cluster}/users/{user}/rotate-password` viene rifiutato con il codice `110206` (MariaDB) o `140206` (RabbitMQ), senza toccare la password. La rotazione sarà riattivata quando potrà essere applicata.

- **MariaDB** — La password di un nuovo utente viene registrata prima della creazione del suo account, il che garantisce che la password restituita sia proprio quella dell'account. Su un cluster appena creato, la creazione di un utente può essere rifiutata con il codice `110207`: riprovate qualche secondo più tardi.

## Corretto

- **Compute** — Su una VM Windows, aggiungere o rimuovere una chiave SSH non sostituisce più la password di amministratore impostata alla creazione. Le chiavi si applicano al prossimo avvio della VM (riavvio, oppure arresto e poi avvio), come segnala `restartRequired` nella risposta dell'aggiornamento. Una chiave aggiunta da Windows viene mantenuta. Il ricaricamento dello UserData (`reload-userdata`) ripristina la password della creazione invece di perderla.

- **Bucket** — La creazione di un utente di bucket e la rotazione delle sue credenziali non falliscono più dopo un'attesa di circa due minuti quando le chiavi tardano a essere emesse. Una rotazione restituisce sempre chiavi diverse dalle precedenti.

- **Database gestiti** — L'indirizzo (`host`) di un database esposto non appare più vuoto negli aggiornamenti in tempo reale della console. Le risposte dell'API non erano interessate.

## Sicurezza

- **MariaDB e RabbitMQ** — La rotazione della password di un utente restituiva una nuova password che non veniva mai applicata: la vecchia restava valida. Se avete effettuato una rotazione prima di questa versione, la password dell'account è ancora quella vecchia. Se la ritenete compromessa, contattate il supporto.

- **Bucket** — Una rotazione delle credenziali di un utente di bucket poteva restituire le vecchie chiavi come se fossero nuove, senza revocarle. Se una rotazione effettuata prima di questa versione vi ha restituito le stesse chiavi di prima, ripetetela.

:::warning VM Windows create prima di questa versione
Perché le modifiche alle chiavi SSH si applichino al riavvio, ricaricate una volta lo UserData della VM. Questo ricaricamento ripristina la password di amministratore impostata alla creazione: se l'avete cambiata in Windows, cambiatela di nuovo in seguito.
:::
