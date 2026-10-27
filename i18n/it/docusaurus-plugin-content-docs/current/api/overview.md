---
sidebar_position: 1
title: Panoramica
---

import NavigationFooter from '@site/src/components/NavigationFooter';
import {HikubeApiUrl} from '@site/src/components/HikubeApi';

# API pubblica Hikube

L'**API pubblica Hikube** permette di gestire le risorse di un progetto da uno script, da una pipeline CI/CD o da uno strumento di automazione, senza passare dalla [console Hikube](https://console.hikube.cloud). Espone, in REST e JSON, le operazioni che la console esegue sulle macchine virtuali, sui dischi, sui bucket, sui cluster Kubernetes, sulla rete e sui database.

L'API completa la console; non la sostituisce. La gestione dell'account, dell'organizzazione, dei progetti e dei membri resta nella console.

:::warning Anteprima
L'API pubblica è in **anteprima** (`v1alpha1`). I percorsi, i campi e i comportamenti possono ancora evolvere, e l'URL pubblico definitivo resta da confermare. Non costruisca ancora automazioni critiche su questa versione senza prevedere di seguirne l'evoluzione.
:::

---

## Cosa copre l'API

| Ambito | Prefisso dei percorsi | Operazioni |
|---------|---------------------|------------|
| Macchine virtuali | `/instance/v1alpha1` | Creare, elencare, consultare, modificare, eliminare; avviare, arrestare, riavviare; ricaricare il cloud-init. Cataloghi: immagini (`/cloud-images`) e tipi di istanza (`/instance-types`) |
| Dischi | `/disk/v1alpha1` | Creare, elencare, consultare, ingrandire, eliminare |
| Bucket S3 | `/bucket/v1alpha1` | Creare, elencare, consultare, eliminare; gestire gli utenti di un bucket e ruotarne le chiavi |
| Kubernetes | `/kubernetes/v1alpha1` | Creare, elencare, consultare, modificare, eliminare un cluster; scaricarne il kubeconfig. Cataloghi: versioni, preset |
| Rete | `/network/v1alpha1` | VPC e sottoreti: creare, elencare, consultare, eliminare |
| PostgreSQL | `/postgres/v1alpha1` | Cluster (compreso il riavvio), database, utenti (compresa la rotazione della password). Cataloghi: preset, estensioni |
| MariaDB | `/mariadb/v1alpha1` | Cluster (compreso il riavvio), database, utenti (compresa la rotazione della password). Catalogo: preset |
| MongoDB | `/mongodb/v1alpha1` | Cluster (compreso il riavvio), database, utenti (compresa la rotazione della password). Catalogo: preset |
| Redis | `/redis/v1alpha1` | Cluster (compreso il riavvio), rotazione della password. Catalogo: preset |
| RabbitMQ | `/rabbitmq/v1alpha1` | Cluster (compreso il riavvio), utenti, vhost. Catalogo: preset |
| Backup | `/backup/v1alpha1` | Destinazioni, pianificazioni (`plans`), backup su richiesta e relativo monitoraggio (`jobs`), archivi (`backups`), ripristini (`restores`), compreso il ripristino PostgreSQL a un istante preciso; annullare un backup o un ripristino in corso. Per le VM, i dischi e i database PostgreSQL e MariaDB |
| GPU | `/gpu/v1alpha1` | Catalogo delle GPU disponibili (l'assegnazione avviene sulla VM o sul gruppo di nodi) |
| Tariffe | `/billing/v1alpha1` | Listini prezzi (VM, database, Kubernetes, licenze, GPU, rete, storage a blocchi e a oggetti) |

L'elenco completo delle operazioni, con i relativi parametri e risposte, si trova nel [riferimento dell'API](/api/reference/hikube-api/).

### Cosa l'API non copre

- **Account, organizzazione, progetti, membri e ruoli**: riservati alla console.
- **Chiavi API**: una chiave non può creare né revocare chiavi (vedere [Autenticazione](./authentication.md)).
- **Flusso di eventi in tempo reale** della console.
- **Servizi assenti dalla console** (ClickHouse, Kafka, NATS): su richiesta al supporto.

Un'operazione assente dal riferimento non può essere chiamata con una chiave API, anche se la console la propone.

---

## URL di base

Tutte le richieste partono dal seguente URL di base:

<HikubeApiUrl />

I percorsi del riferimento si aggiungono a questo URL. Gli esempi della documentazione lo leggono dalla variabile `HIKUBE_API`:

```bash
curl -sS "$HIKUBE_API/disk/v1alpha1/projects/$PROJECT_ID/disks" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY"
```

---

## Versioni

Ogni servizio porta la propria versione nel percorso: `/disk/v1alpha1/...`, `/postgres/v1alpha1/...`. Tutti i servizi sono oggi in `v1alpha1`, cioè in anteprima: una versione `v1alpha1` può cambiare in modo incompatibile. Le evoluzioni sono annunciate nel [changelog](/blog).

---

## Organizzazione e progetto

Su Hikube, un'**organizzazione** raggruppa dei **progetti**, e ogni risorsa (VM, disco, database…) appartiene a un progetto. Nell'API, il progetto figura nel percorso di ogni operazione:

```text
/<servizio>/v1alpha1/projects/{projectId}/<risorse>/{name}
```

- `projectId` è l'identificativo del progetto, un UUID (ad esempio `01928f6e-7b2c-7d4e-9a10-3f5b6c7d8e9f`). Non coincide con il nome del progetto visualizzato nella console.
- `name` è il nome che ha dato alla risorsa al momento della creazione: è questo che la identifica nei percorsi.

Una chiave API è associata a **un solo progetto**: qualsiasi richiesta destinata a un altro progetto viene rifiutata. Per automatizzare più progetti, utilizzi una chiave per progetto. Vedere [Trovare l'identificativo del progetto](./quick-start.md#project-id).

I cataloghi (immagini, tipi di istanza, versioni, preset, GPU, tariffe) non dipendono da alcun progetto: i loro percorsi non contengono `projectId`.

---

## Convenzioni

- **Formato**: i corpi di richiesta e di risposta sono in JSON (`Content-Type: application/json`), con nomi di campo in *camelCase* (`instanceType`, `asyncReplication`). Le date seguono la RFC 3339 (`2026-10-05T09:30:00Z`).
- **Verbi**: `GET` consulta, `POST` crea o avvia un'azione, `PATCH` modifica, `PUT` avvia un'azione su una VM (avviare, arrestare…), `DELETE` elimina.
- **Operazioni asincrone**: una creazione o una modifica restituisce subito la risorsa, con un campo `status` (`provisioning`, poi `ready`). Interroghi la risorsa con `GET` fino allo stato atteso prima di utilizzarla.
- **Modifiche**: un `PATCH` è un aggiornamento parziale, cambiano solo i campi inviati (vedere [Aggiornamenti parziali](#mises-a-jour-partielles)).
- **Errori**: un errore restituisce un codice HTTP e un corpo JSON con un codice numerico stabile (vedere [Errori](./errors.md)).

---

## Aggiornamenti parziali {#mises-a-jour-partielles}

Tutte le richieste `PATCH` seguono la stessa regola: **vengono modificati solo i campi inviati**. Non è necessario rileggere la risorsa e rinviarla per intero.

- **Campo assente**: un campo assente dal corpo, o inviato a `null`, mantiene il proprio valore. `{"external": true}` su un cluster Redis attiva l'accesso esterno e mantiene la versione, la dimensione e l'autenticazione.
- **Campo inviato**: il suo valore viene applicato così com'è, compreso un valore vuoto (`false`, `0`, `""`). Viene validato come alla creazione: una dimensione pari a `0` viene rifiutata.
- **Sotto-oggetto**: viene modificato campo per campo. `{"network": {"publicIpv4": true}}` su una VM non tocca né il firewall né i VPC. Inviato vuoto, invece, riporta **ciascuno dei suoi campi** al valore vuoto: `{"network": {}}` rimuove l'indirizzo pubblico, disattiva il firewall e scollega tutti i VPC.
- **Lista o mappa**: se inviata, sostituisce quella esistente, e `[]` o `{}` la svuota. `{"network": {"vpcs": []}}` scollega tutti i VPC di una VM; `{"config": {"databases": {}}}` rimuove tutti i diritti di un utente di database.
- **Configurazione libera** (override Helm di un cluster Kubernetes: `config.cni`, `config.dns`, `config.verticalPodAutoscaler`, `configOverride` degli addon): un oggetto inviato sostituisce l'override esistente, `{}` non cambia nulla e `null` lo rimuove.
- **Corpo vuoto**: `{}` non modifica nulla e restituisce la risorsa così come è registrata.
- **Campi non modificabili**: il nome e gli identificativi del percorso vengono ignorati se figurano nel corpo. Un campo fissato alla creazione (ad esempio la modalità di un cluster di database, standalone o replicato) può essere rinviato con il suo valore attuale; un altro valore viene rifiutato con un codice specifico del servizio. Un campo assente dalla richiesta di modifica (come `preset` su MariaDB o `image` su una VM) viene rifiutato come campo sconosciuto (`400`).

Ad esempio, per attivare l'accesso esterno di un cluster Redis senza cambiare nient'altro:

```bash
curl -sS -X PATCH "$HIKUBE_API/redis/v1alpha1/projects/$PROJECT_ID/clusters/democache" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"external": true}'
```

### Il campo `updateMask`

Ogni richiesta `PATCH` accetta un campo facoltativo `updateMask`: l'elenco, separato da virgole, dei percorsi da modificare, in *camelCase* (`external,authEnabled`). Senza di esso, i percorsi vengono dedotti dai campi presenti nel corpo, il che basta nella maggior parte dei casi.

Con `updateMask`, vengono modificati solo i percorsi elencati, con il valore del corpo. Un percorso elencato ma assente dal corpo assume il valore vuoto: `{"updateMask": "external"}` da solo **disattiva** l'accesso esterno. Un percorso che non designa alcun campo modificabile viene rifiutato con il codice `10006` (vedere [Errori](./errors.md)).

---

## Specifica OpenAPI

La specifica dell'API pubblica è scaricabile in formato OpenAPI 2.0 (Swagger): [`hikube-public.swagger.json`](pathname:///openapi/hikube-public.swagger.json). Permette di generare un client nel suo linguaggio. Descrive solo le operazioni che si possono chiamare con una chiave API.

<NavigationFooter
  nextSteps={[
    {label: "Autenticazione", href: "../authentication"},
    {label: "Avvio rapido", href: "../quick-start"},
  ]}
  seeAlso={[
    {label: "Riferimento dell'API", href: "../reference/hikube-api"},
    {label: "Errori", href: "../errors"},
  ]}
/>
