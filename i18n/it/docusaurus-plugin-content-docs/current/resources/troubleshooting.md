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

### Risorsa bloccata in «Creating» o nello stato «Error»

**Sintomo:** una risorsa resta nello stato **Creating** ben oltre il tempo abituale (alcuni minuti), oppure passa allo stato **Error**.

Un progetto, un VPC o un'applicazione gestita (cluster Kubernetes, database…) passa allo stato **Error** quando la piattaforma non è riuscita ad applicarne l'ultima modifica. La risorsa può continuare a funzionare con la configurazione precedente. Un progetto in errore riporta un badge **Error** nel selettore di progetto.

**Soluzioni:**
- ricarichi la pagina di dettaglio;
- se lo stato non cambia, oppure passa a **Error** / **Failed**, contatti il supporto indicando il progetto e il nome della risorsa.

---

## 3. Kubernetes

### La creazione del primo cluster attende «Preparing the Kubernetes environment»

**Sintomo:** dopo **Create cluster**, la procedura guidata mostra «Preparing the project's Kubernetes environment; creation will resume automatically.»

**Soluzione:** per il primo cluster di un progetto, la piattaforma prepara innanzitutto l'ambiente Kubernetes del progetto, operazione che richiede alcuni minuti. Attenda: la console rilancia da sola la creazione, senza perdere la configurazione inserita (il pulsante **Cancel** interrompe l'attesa). Se un messaggio le chiede di contattare il supporto, non riprovi e lo contatti.

### Il download del kubeconfig non riesce

**Sintomo:** dopo un clic su **Kubeconfig**, la console mostra **Error**: «Could not download the kubeconfig file.»

**Soluzione:** probabilmente il cluster non è ancora pronto. Attenda che passi allo stato **Ready**, quindi riprovi.

### Il pulsante Kubeconfig è disattivato

**Sintomo:** il pulsante **Kubeconfig** è disattivato, con la dicitura «Reserved for project administrators.», oppure la console mostra «The kubeconfig grants administrator access to the cluster: it is reserved for project administrators.»

**Soluzione:** il kubeconfig conferisce un accesso amministratore al cluster; il suo download è riservato agli amministratori del progetto. Si rivolga a un amministratore del progetto.

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
- verifichi di utilizzare la chiave privata corrispondente alla chiave pubblica fornita alla creazione;
- si connetta con l'utente indicato nel blocco **SSH Connection** della pagina di dettaglio della VM (ad esempio `debian` per Debian, `opc` per Oracle Linux). Se la console indica che l'utente predefinito non è disponibile, utilizzi l'account configurato nella sua immagine.

Vedere: [Macchine virtuali - Risoluzione dei problemi](../services/compute/troubleshooting.md)

---

## 5. Database e messaggistica

### Connessione rifiutata dall'esterno

**Soluzioni:**
- verifichi che l'**External access** sia attivato sul cluster (**Edit**);
- utilizzi l'indirizzo visualizzato nella zona **External** della pagina di dettaglio. Finché non è assegnato («Waiting for allocation…»), la connessione esterna non è possibile. Per un replica set MongoDB, la zona elenca l'indirizzo di ogni membro: si connetta a un membro con `directConnection=true`;
- da una VM o da un cluster Kubernetes dello stesso progetto, l'accesso esterno non è necessario: utilizzi l'host della zona **Internal**;
- verifichi l'utente e la password visualizzati nella console.

### Password rifiutata

Verifichi di utilizzare la password dell'utente interessato, visualizzata nella pagina di dettaglio del cluster. Per Redis e RabbitMQ, se ha effettuato una rotazione della password, aggiorni le sue applicazioni.

### La modifica di un cluster viene rifiutata

La versione di un database non può essere abbassata e la dimensione del suo disco non può essere ridotta. Per PostgreSQL, MariaDB, MongoDB e RabbitMQ, la console propone solo la versione attuale e le versioni superiori, e mostra ad esempio «The disk size cannot be reduced: 20 GB minimum.» Un cambio di versione o di preset riavvia le istanze del cluster: lo pianifichi al di fuori dei periodi di forte attività.

Vedere: [PostgreSQL](../services/databases/postgresql/troubleshooting.md), [MariaDB](../services/databases/mariadb/troubleshooting.md), [MongoDB](../services/databases/mongodb/troubleshooting.md), [Redis](../services/databases/redis/troubleshooting.md), [RabbitMQ](../services/messaging/rabbitmq/troubleshooting.md)

---

## 6. Storage

### Eliminare un bucket senza perdere dati

L'eliminazione di un bucket senza WORM è definitiva e comporta la perdita di tutti i suoi oggetti, anche se non è vuoto. Copi prima i dati da conservare con il suo client S3 (ad esempio `aws s3 sync`). Se l'eliminazione non riesce, riprovi, quindi contatti il supporto.

Un bucket bloccato (WORM) viene rimosso dalla console, ma i suoi oggetti non vengono eliminati: ogni oggetto resta bloccato 365 giorni dopo la sua scrittura (modalità COMPLIANCE).

### Accesso S3 negato (`AccessDenied`)

Verifichi che la chiave di accesso utilizzata appartenga a un utente del bucket, con i diritti adeguati (sola lettura o lettura/scrittura).

Verifichi anche il nome del bucket configurato nel suo client S3: utilizzi il nome S3 reale (`bucket-…`), visualizzato nel campo **Bucket name** della pagina del bucket, e non il nome inserito alla creazione.

### Impossibile ridurre la dimensione di un disco

La dimensione di un disco può essere aumentata dal menu **Disks** (vedere [Ridimensionare un disco](../services/storage/disks/how-to/resize.md)), mai ridotta. La pagina di modifica di una VM non cambia la dimensione dei suoi dischi: quelli che la VM possiede già vi sono in sola lettura. Per disporre di un disco più piccolo, crei un nuovo disco e vi copi i suoi dati.

### Un disco non può essere eliminato

**Sintomo:** la console rifiuta l'eliminazione di un disco.

**Soluzioni:**
- il disco è ancora collegato a una VM: lo scolleghi dalla pagina **Edit** della VM (**Detach disk**), oppure elimini la VM. Il disco di sistema di una VM non si scollega: può essere eliminato solo dopo l'eliminazione della VM;
- il disco è stato scollegato, ma la sua VM lo usa ancora: la console mostra «This disk was detached, but its VM still uses it until its next restart. Restart the VM, then try again.» Riavvii la VM, poi ripeta l'eliminazione.

Vedere: [Bucket - Risoluzione dei problemi](../services/storage/buckets/troubleshooting.md), [Dischi - Risoluzione dei problemi](../services/storage/disks/troubleshooting.md)

---

## Contattare il supporto

Se il problema persiste: menu del profilo → **Contact support** (il contesto tecnico della pagina viene allegato), oppure **support@hidora.io**. Indichi l'organizzazione, il progetto e il nome delle risorse interessate.
