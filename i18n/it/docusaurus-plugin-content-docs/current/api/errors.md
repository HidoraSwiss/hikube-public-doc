---
sidebar_position: 4
title: Errori
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# Errori dell'API

Una richiesta non riuscita restituisce un **codice HTTP** e un **corpo JSON** che contiene un **codice numerico** stabile. Basi la logica dei suoi script sul codice HTTP e su questo codice numerico, mai sul testo del messaggio, che può cambiare.

Questo formato vale per tutti gli errori, compresi i rifiuti di autenticazione e i superamenti del [limite di frequenza](#limites-de-debit).

---

## Formato

```json
{
  "requestId": "4bf92f3577b34da6a3ce929d0e0e4736",
  "code": 30101,
  "message": "invalid name: must start with a letter, end with a letter or digit, and contain only lowercase letters, digits, and hyphens",
  "details": []
}
```

| Campo | Tipo | Descrizione |
|-------|------|-------------|
| `requestId` | stringa | Identificativo della richiesta. Lo comunichi al supporto per qualsiasi richiesta di analisi |
| `code` | intero | Codice numerico dell'errore (vedere sotto). Assente quando l'errore non ha un codice dedicato |
| `message` | stringa | Descrizione leggibile, in inglese. Per un errore di validazione, indica il campo in questione |
| `details` | array | Informazioni complementari, il più delle volte vuoto. Ad esempio, l'elenco delle VM che utilizzano ancora un VPC, o i tipi di GPU non disponibili |

### Identificativo della richiesta {#identifiant-de-requete}

Ogni risposta, compresa una risposta `2xx`, contiene un'intestazione `x-request-id`. Il corpo di un errore contiene inoltre un `requestId`, che non ha sempre lo stesso valore dell'intestazione. Per qualsiasi richiesta di analisi al supporto, comunichi l'uno o l'altro, ed entrambi se li ha: conservi l'intestazione nei log dei suoi strumenti, permette di ritrovare anche una richiesta riuscita.

```bash
curl -sS -D - -o /dev/null "$HIKUBE_API/disk/v1alpha1/projects/$PROJECT_ID/disks" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY" | grep -i '^x-request-id'
```

---

## Codici HTTP

| Codice HTTP | Significato | Cosa fare |
|-----------|---------------|-----------|
| `400` | Richiesta non valida: campo mancante o malformato, valore fuori dai limiti, operazione impossibile nello stato attuale della risorsa | Corregga la richiesta in base a `message`; non riprovi in modo identico |
| `401` | Token utente non valido o scaduto (codice `10001`). Riguarda solo le sessioni della console, non le chiavi API | Con una chiave API, non invii l'intestazione `Authorization` |
| `403` | Accesso negato (codice `10002`), anche per una richiesta senza chiave | Vedere [Accesso negato](#acces-refuse) |
| `404` | Risorsa non trovata nel progetto | Verifichi il nome della risorsa nel percorso |
| `409` | Conflitto: una risorsa con questo nome esiste già, è ancora in uso, oppure è stata modificata contemporaneamente | Cambi nome, liberi la risorsa, oppure la rilegga prima di riprovare |
| `429` | Troppe richieste (codice `10008`) | Attenda il tempo indicato dall'intestazione `Retry-After`, poi riprovi. Vedere [Limiti di frequenza](#limites-de-debit) |
| `500` | Errore interno | Riprovi più tardi; se l'errore persiste, contatti il supporto con il `requestId` |
| `503` | Servizio momentaneamente non disponibile. Con il codice `10004`, non è stato possibile verificare la chiave: non viene considerata non valida | Riprovi con un intervallo crescente (ad esempio 1 s, 2 s, 4 s…) |

---

## Accesso negato {#acces-refuse}

Ogni rifiuto di accesso legato alla chiave restituisce la **stessa** risposta `403` con il codice `10002`, qualunque ne sia il motivo:

- nessuna chiave presentata (intestazione `X-Hikube-Api-Key` assente o vuota);
- chiave malformata, sconosciuta, revocata o scaduta;
- chiave di un progetto diverso da quello del percorso, o progetto inesistente;
- scope insufficiente (ad esempio una chiave `read` per una creazione);
- operazione non accessibile alle chiavi API (gestione dell'account, dell'organizzazione, dei progetti o delle chiavi).

Questa risposta uniforme è voluta: non rivela nulla sull'esistenza di un progetto o di una chiave. Per la diagnosi, verifichi nell'ordine la chiave (`HIKUBE_API_KEY`), l'identificativo del progetto (`PROJECT_ID`), poi lo scope necessario (vedere [Scope](./authentication.md#scopes)).

---

## Codici comuni

| Codice | HTTP | Significato |
|------|------|---------------|
| `10001` | 401 | Token utente non valido o scaduto. Una richiesta senza chiave né token riceve `10002`, non `10001` |
| `10002` | 403 | Accesso negato (vedere sopra) |
| `10004` | 503 | Non è stato possibile verificare la chiave per il momento. Non è un rifiuto: la chiave non è in causa, riprovi |
| `10008` | 429 | Troppe richieste: attenda il tempo di `Retry-After`, poi riprovi (vedere [Limiti di frequenza](#limites-de-debit)) |
| `10005` | 403 o 400 | Rifiuto da parte di una regola della piattaforma: il messaggio indica il campo rifiutato, `details` la regola e il suo motivo |
| `10006` | 400 | Un percorso di `updateMask` non designa alcun campo modificabile della richiesta `PATCH` (vedere [Aggiornamenti parziali](./overview.md#mises-a-jour-partielles)) |

Un client che annulla la propria richiesta o supera il proprio timeout riceve `499` o `504`, senza codice numerico.

---

## Limiti di frequenza {#limites-de-debit}

Le richieste sono limitate **per chiave API** e **per indirizzo IP**. I due limiti si applicano insieme: una richiesta viene rifiutata non appena uno dei due viene raggiunto. Valori attuali, soggetti a modifiche:

| Limite | Raffica | Frequenza sostenuta |
|--------|--------|---------------|
| Per chiave API | 120 richieste | 300 richieste al minuto |
| Per indirizzo IP | 300 richieste | 600 richieste al minuto |

La raffica è il numero di richieste accettate in una volta. Si ricostituisce poi al ritmo della frequenza sostenuta.

Ogni risposta contiene due intestazioni, che descrivono il limite più restrittivo per il chiamante:

| Intestazione | Descrizione |
|---------|-------------|
| `X-RateLimit-Limit` | Numero di richieste consentite da questo limite |
| `X-RateLimit-Remaining` | Numero di richieste ancora disponibili |

Oltre il limite, la richiesta viene rifiutata con `429` e il codice `10008`. La risposta contiene un'intestazione `Retry-After`, in secondi (oggi 5): attenda questo tempo, poi riprovi. Non riprovi subito, la richiesta verrebbe di nuovo rifiutata.

```json
{
  "requestId": "4bf92f3577b34da6a3ce929d0e0e4736",
  "code": 10008,
  "message": "Too many requests. Please slow down.",
  "details": []
}
```

Più strumenti che condividono una chiave o un indirizzo IP (ad esempio i job di una stessa pipeline dietro un gateway NAT) ne condividono anche il limite. Dia una chiave a ogni strumento, e distanzi le `GET` che seguono lo stato di una risorsa.

---

## Codici dei servizi

Ogni servizio ha il proprio intervallo di codici. Le ultime cifre seguono ovunque la stessa logica:

| Finale del codice | Categoria | Esempi |
|-------------|-----------|----------|
| da `001` a `099` | Stato della piattaforma: non trovato (`…001`), esiste già (`…002`), accesso negato (`…003`), non disponibile (`…005`), provisioning non riuscito (`…006`) | `30001` disco non trovato, `80002` cluster PostgreSQL già esistente |
| da `100` a `199` | Validazione della richiesta: identificativo di progetto non valido (`…100`), nome non valido (`…101`), poi un codice per campo | `20103` tipo di istanza sconosciuto, `70103` versione di Kubernetes non supportata |
| da `200` a `299` | Regola di business: operazione impossibile nello stato attuale | `20200` disco già collegato a un'altra VM, `20201` VM già avviata |

| Prefisso | Servizio |
|---------|---------|
| `20xxx` | Macchine virtuali |
| `30xxx` | Dischi |
| `50xxx` | Bucket |
| `60xxx` | Chiavi API |
| `70xxx` | Kubernetes |
| `80xxx` | PostgreSQL |
| `110xxx` | MariaDB |
| `120xxx` | Redis |
| `140xxx` | RabbitMQ |
| `150xxx` | MongoDB |
| `160xxx` | Rete |
| `170xxx` | Tariffe |
| `180xxx` | Backup |

Alcuni codici di business utili:

| Codice | HTTP | Significato |
|------|------|---------------|
| `20200` | 400 | Il disco è già collegato a un'altra VM |
| `20201` / `20202` | 400 | La VM è già avviata / già arrestata |
| `20204`, `20205`, `20207` | 400 | GPU richiesta non disponibile, in quantità insufficiente, o impossibile da riunire su uno stesso server |
| `20206` | 400 | Nessun indirizzo IPv4 pubblico disponibile |
| `30007` | 400 | Il disco è collegato a una VM: lo scolleghi prima di eliminarlo |
| `80201`, `110201`, `120201`, `140201`, `150201` | 400 | Passaggio da un'istanza singola a un cluster replicato (o viceversa) impossibile dopo la creazione |
| `80205`, `110205`, `120205`, `140205`, `150205` | 400 | Riavvio di un database ancora in fase di creazione: nulla da riavviare, riprovi quando il cluster è pronto |
| `160003` / `160012` | 409 | Il VPC / la sottorete è ancora utilizzato da VM, elencate in `details` |
| `160152` | 400 | L'intervallo di indirizzi si sovrappone a una sottorete esistente |
| `180200` | 400 | La destinazione di backup non è ancora pronta |
| `180205` | 400 | Un ripristino è già in corso per questa applicazione |
| `180214` | 400 | L'istante di ripristino richiesto è al di fuori della finestra di ripristino |

Il [riferimento dell'API](/api/reference/hikube-api/) indica i codici HTTP possibili per ogni operazione.

---

## Codici relativi alle chiavi API

Questi codici riguardano la gestione delle chiavi (creazione, elenco, revoca), riservata agli amministratori del progetto, dalla console o con la loro sessione utente (vedere [Ottenere una chiave](./authentication.md#obtenir)).

| Codice | HTTP | Significato |
|------|------|---------------|
| `60003` | 403 | Scope richiesto superiore ai diritti della persona che crea la chiave |
| `60005` | 503 | Limite di chiavi del progetto momentaneamente illeggibile; riprovi |
| `60006` | 404 | Chiave non trovata in questo progetto |
| `60007` | 503 | Registrazione momentaneamente impossibile. Nel caso di una revoca, questa potrebbe essere stata applicata: riprovi, l'operazione può essere ripetuta senza rischi |
| `60008` | 400 | Chiavi API non attivate in questo ambiente |
| `60009` | 400 | Numero massimo di chiavi attive raggiunto per il progetto |
| `60106` | 400 | Scope non valido (valori ammessi: `read`, `write`, `admin`, `superadmin`) |
| `60107` | 400 | Identificativo di chiave non valido (32 caratteri esadecimali minuscoli) |
| `60108` | 400 | Nome di chiave non valido (obbligatorio, massimo 255 caratteri, senza caratteri di controllo) |
| `60109` | 400 | Durata di validità non valida (valori ammessi: `1d`, `7d`, `30d`, `90d`, `180d`, `365d`) |

---

## Riprovare senza rischi

- Riprovi le risposte `503` e `10004` con un intervallo crescente e un numero limitato di tentativi.
- Dopo una `429`, attenda il tempo dell'intestazione `Retry-After` prima di riprovare.
- Non riprovi una `400` o una `403` in modo identico: la richiesta o la chiave deve prima essere corretta.
- Dopo una creazione non riuscita per timeout, consulti la risorsa con `GET` prima di ricrearla: potrebbe essere stata creata, e un nuovo tentativo restituirebbe `409`.

<NavigationFooter
  nextSteps={[
    {label: "FAQ dell'API", href: "../faq"},
  ]}
  seeAlso={[
    {label: "Autenticazione", href: "../authentication"},
    {label: "Riferimento dell'API", href: "../reference/hikube-api"},
  ]}
/>
