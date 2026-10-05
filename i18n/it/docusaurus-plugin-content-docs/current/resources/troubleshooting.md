---
sidebar_position: 1
title: Risoluzione dei problemi generale
---

# Risoluzione dei problemi generale Hikube

Questa guida tratta i problemi più comuni riscontrati su Hikube. Per un problema specifico di un servizio, consulti anche la pagina **Risoluzione dei problemi** di quel servizio.

---

## 1. Accesso alla console

### «No organization»

**Sintomo:** dopo l'accesso, la console mostra **No organization**.

**Soluzioni:**
- se la sua organizzazione è stata appena creata, faccia clic su **Refresh**;
- altrimenti, il suo account non è associato ad alcuna organizzazione: [contatti il supporto](mailto:support@hidora.io).

### «Service Unavailable»

**Sintomo:** la console mostra **Service Unavailable**.

**Soluzioni:**
- la piattaforma è in manutenzione o momentaneamente irraggiungibile: attenda qualche istante, quindi faccia clic su **Retry**;
- se il problema persiste, contatti il supporto da questa pagina: gli **Error details** vengono allegati alla richiesta.

### Un progetto non è visibile

I progetti visualizzati dipendono dall'organizzazione selezionata e dai suoi diritti. Verifichi la **Current Organization** nel menu del profilo (**Change organization** se ne ha più di una), quindi chieda a un amministratore dell'organizzazione di concederle l'accesso al progetto.

---

## 2. Creazione di una risorsa

### «Quota exceeded»

**Sintomo:** la procedura guidata di creazione blocca la convalida e segnala un superamento della quota.

**Soluzioni:**
- riduca la dimensione richiesta (tipo di istanza, preset, storage, numero massimo di nodi);
- liberi le risorse inutilizzate nel progetto;
- chieda a un amministratore di aumentare le quota del progetto (impostazioni del progetto → **Quotas**).

:::note Kubernetes
Per un cluster Kubernetes, la quota è calcolata sul **numero massimo** di nodi di ogni gruppo, auto-scaling compreso.
:::

### «Project quotas are unavailable right now»

La console non riesce a leggere le quota del progetto e blocca la creazione per sicurezza. Ricarichi la pagina; se il messaggio persiste, contatti il supporto.

### Risorsa bloccata in «Creating»

**Sintomo:** una risorsa resta nello stato **Creating** ben oltre il tempo abituale (alcuni minuti).

**Soluzioni:**
- ricarichi la pagina di dettaglio;
- se lo stato non cambia, oppure passa a **Error** / **Failed**, contatti il supporto indicando il progetto e il nome della risorsa.

---

## 3. Kubernetes

### Il download del kubeconfig non riesce

**Sintomo:** il pulsante **Kubeconfig** mostra **Download failed**.

**Soluzione:** probabilmente il cluster non è ancora pronto. Attenda che passi allo stato **Ready**, quindi riprovi.

### `kubectl` non riesce a raggiungere il cluster

```bash
# Verificare il file utilizzato
echo $KUBECONFIG
kubectl config view --minify

# Testare la connessione
kubectl cluster-info
```

**Soluzioni:**
- verifichi che `KUBECONFIG` punti al file `kubeconfig-<nome-del-cluster>.yaml` scaricato dalla console;
- se il cluster è stato ricreato, scarichi di nuovo il relativo kubeconfig.

### Pod in errore nel cluster

I comandi seguenti si eseguono **nel suo cluster Kubernetes**, con il relativo kubeconfig:

```bash
kubectl get pods -A
kubectl describe pod <nome-del-pod> -n <namespace>
kubectl logs <nome-del-pod> -n <namespace> --previous
```

| Stato | Causa frequente | Indicazione |
|------|-----------------|-------|
| `CrashLoopBackOff` | Errore applicativo, memoria insufficiente | Legga i log del container precedente; aumenti i limiti di memoria |
| `Pending` | Risorse insufficienti sui nodi | Aumenti il massimo del gruppo di nodi nella console o scelga un tipo di istanza più grande |
| `ImagePullBackOff` | Immagine non trovata o registry privato | Verifichi il nome dell'immagine e le credenziali del registry |
| `OOMKilled` | Limite di memoria raggiunto | Aumenti `resources.limits.memory` del container |

Vedere: [Kubernetes - Risoluzione dei problemi](../services/kubernetes/troubleshooting.md)

---

## 4. Macchine virtuali

### Impossibile connettersi in SSH

**Soluzioni:**
- verifichi che la VM sia nello stato **Running** in **VM Instances**;
- verifichi che sia assegnato un IP pubblico e che la porta 22 sia autorizzata nella configurazione di rete della VM;
- verifichi di utilizzare la chiave privata corrispondente alla chiave pubblica fornita alla creazione.

Vedere: [Macchine virtuali - Risoluzione dei problemi](../services/compute/troubleshooting.md)

---

## 5. Database e messaggistica

### Connessione rifiutata dall'esterno

**Soluzioni:**
- verifichi che l'**External access** sia attivato sul cluster (**Edit**);
- utilizzi l'indirizzo visualizzato nel campo **Host** della pagina di dettaglio. Finché non è assegnato, la connessione esterna non è possibile;
- verifichi l'utente e la password visualizzati nella console.

### Password rifiutata

Verifichi di utilizzare la password dell'utente interessato, visualizzata nella pagina di dettaglio del cluster. Per Redis e RabbitMQ, se ha effettuato una rotazione della password, aggiorni le sue applicazioni.

Vedere: [PostgreSQL](../services/databases/postgresql/troubleshooting.md), [MariaDB](../services/databases/mariadb/troubleshooting.md), [MongoDB](../services/databases/mongodb/troubleshooting.md), [Redis](../services/databases/redis/troubleshooting.md), [RabbitMQ](../services/messaging/rabbitmq/troubleshooting.md)

---

## 6. Storage

### Impossibile eliminare un bucket

Un bucket che contiene ancora oggetti, o che è ancora in uso, non può essere eliminato. Lo svuoti con il suo client S3, quindi riprovi.

### Accesso S3 negato (`AccessDenied`)

Verifichi che la chiave di accesso utilizzata appartenga a un utente del bucket, con i diritti adeguati (sola lettura o lettura/scrittura).

Vedere: [Bucket - Risoluzione dei problemi](../services/storage/buckets/troubleshooting.md), [Dischi - Risoluzione dei problemi](../services/storage/disks/troubleshooting.md)

---

## Contattare il supporto

Se il problema persiste: menu del profilo → **Contact support** (il contesto tecnico della pagina viene allegato), oppure **support@hidora.io**. Indichi l'organizzazione, il progetto e il nome delle risorse interessate.
