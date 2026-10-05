---
sidebar_position: 2
title: Concetti
---

# Concetti — Kubernetes

## Terminologia

| Termine | Definizione |
|-------|------------|
| **Progetto** | Spazio isolato della sua organizzazione, dotato di quota (CPU, memoria, storage), in cui vengono creati il cluster e i suoi nodi. In precedenza chiamato «tenant». |
| **Cluster** | Cluster Kubernetes gestito: un control plane gestito da Hikube e uno o più gruppi di nodi. |
| **Control plane** | Componenti che gestiscono il cluster (API Server, Scheduler, Controller Manager, etcd), ospitati da Hikube. |
| **Gruppo di nodi** | Insieme di nodi worker omogenei (stesso tipo di istanza, stesso storage), con i propri limiti di auto-scaling. La pagina di dettaglio del cluster li mostra sotto **Node Pools**. |
| **Addon** | Componente facoltativo installato e mantenuto dalla piattaforma nel cluster (Cert-Manager, Ingress NGINX, ecc.). |
| **Kubeconfig** | File di accesso al cluster, scaricato dalla pagina di dettaglio del cluster nella console. |

## Architettura

Lo schema seguente illustra la struttura e le interazioni principali del **cluster Kubernetes Hikube**, compresi l'alta disponibilità del piano di controllo, la gestione dei nodi, la persistenza dei dati e la replica tra regioni.

<div class="only-light">
  <img src="/img/hikube-kubernetes-architecture.svg" alt="Schema dell’architettura di un cluster Kubernetes Hikube"/>
</div>
<div class="only-dark">
  <img src="/img/hikube-kubernetes-architecture-dark.svg" alt="Schema dell’architettura di un cluster Kubernetes Hikube"/>
</div>

---

### Componenti principali del cluster

#### Etcd Cluster

- Contiene più istanze di **etcd** replicate tra loro.
- Garantisce la **coerenza dello storage dello stato del cluster Kubernetes** (informazioni su pod, service, configurazioni, ecc.).
- La replica interna tra i nodi `etcd` garantisce la **tolleranza ai guasti**.

#### Control Plane

- Composto da API Server, Scheduler e Controller Manager.
- Ruolo:
  - **Pianifica i workload** (pod, deployment, ecc.) sui nodi disponibili.
  - **Interagisce con etcd** per leggere/scrivere lo stato del cluster.

#### Node Groups

- Ogni gruppo contiene più **nodi di lavoro (worker node)**.
- I workload (pod) vengono distribuiti su questi nodi.
- I nodi comunicano con il Control Plane per ricevere i propri compiti.
- Leggono e scrivono i propri dati nei **Persistent Volume (PV)** Kubernetes.

#### Kubernetes PV Data

- Rappresenta lo **storage persistente** utilizzato dai pod.
- I dati dei workload vengono **scritti e letti da questo storage**.
- Questo livello è integrato nella replica Hikube per garantire la disponibilità dei dati.

---

### Livello di replica Hikube

#### Hikube Replication Data Layer

- Funge da interfaccia tra Kubernetes e i **sistemi di storage regionali**.
- Replica automaticamente i dati dei PV verso più regioni per:
  - l'**alta disponibilità**,
  - la **resilienza ai guasti regionali**,
  - e la **continuità del servizio**.

#### Storage regionali

- **Region 1** → Geneva Data Storage
- **Region 2** → Gland Data Storage
- **Region 3** → Lucerne Data Storage

Ogni regione dispone del proprio backend di storage, tutti sincronizzati tramite il livello Hikube.

---

### Flusso di comunicazione

1. I **nodi etcd** si sincronizzano tra loro per mantenere uno stato globale coerente.
2. Il **Control Plane** legge/scrive in etcd per memorizzare lo stato del cluster.
3. Il **Control Plane** pianifica i workload sui **Node Groups**.
4. I **Node Groups** interagiscono con i **PV Kubernetes** per memorizzare o recuperare dati.
5. I **PV Data** vengono replicati attraverso l'**Hikube Replication Data Layer** verso le **3 regioni**.

---

### Riepilogo funzionale

| Livello | Funzione principale | Tecnologia |
|--------|---------------------|-------------|
| Etcd Cluster | Storage dello stato del cluster | etcd |
| Control Plane | Gestione e pianificazione dei workload | Kubernetes |
| Node Groups | Esecuzione dei workload | kubelet, container runtime |
| PV Data | Storage persistente | Kubernetes Persistent Volumes |
| Hikube Data Layer | Replica e sincronizzazione multi-regione | Hikube |
| Data Storage | Storage fisico regionale | Geneva / Gland / Lucerne |

---

### Obiettivo globale

Questa architettura garantisce:

- **Alta disponibilità** del cluster Kubernetes.
- **Resilienza geografica** grazie alla replica tra regioni.
- **Integrità dei dati** tramite etcd e lo storage persistente.
- **Scalabilità** orizzontale con i Node Groups.

---


## Control Plane

Il control plane si dimensiona nel passaggio **General** della procedura guidata di creazione, con due campi.

### Control Plane Instance Size

Preset di risorse applicato all'insieme dei componenti del control plane (API Server, Controller Manager, Scheduler). L'elenco è fornito dalla piattaforma e ogni opzione mostra la propria CPU e la propria memoria. Il preset **Small** è selezionato per impostazione predefinita.

| Preset | Uso consigliato (guida della console) |
|--------|--------------------------------------|
| **Small** | Carichi leggeri, sviluppo o test. Ottimizzazione dei costi. |
| **Medium** | Uso standard con un carico moderato. Buon equilibrio prestazioni/costo. |
| **Large** | Usi intensivi o traffico elevato. Prestazioni massime. |

La piattaforma propone anche preset più piccoli (`nano`, `micro`) e più grandi (`xlarge`, `2xlarge`).

:::note
Il dimensionamento componente per componente (risorse dedicate all'API Server, allo Scheduler, ecc.) non è disponibile nella console; contatti il supporto.
:::

### Control Plane High Availability

Numero di istanze del control plane: **1**, **3 (HA)** o **5 (HA)**. Il valore predefinito è 3.
Un numero dispari di istanze garantisce il quorum di `etcd`; utilizzi almeno 3 istanze in produzione.

Sotto il campo, la console mostra l'impronta conteggiata nella quota del progetto, ad esempio «→ 3 × Small = … CPU · … GiB counted against the quota».

:::warning
La dimensione e il numero di istanze del control plane non sono modificabili nella console dopo la creazione del cluster. Per cambiarli, contatti il supporto.
:::

---

## Gruppi di nodi

I gruppi di nodi si configurano nel passaggio **Nodes** della procedura guidata (titolo **Worker Node Groups**). Un cluster contiene almeno un gruppo; **Add node group** ne crea uno nuovo. Ogni gruppo è una scheda comprimibile che riassume il modello, i limiti e lo storage.

| Campo | Descrizione | Valore predefinito |
|-------|-------------|-------------------|
| **Group name** | Da 3 a 16 caratteri: lettere minuscole, cifre e trattini; inizia con una lettera, termina con una lettera o una cifra | `worker-pool-1`, `worker-pool-2`… |
| **Ephemeral storage size** | Spazio su disco assegnato ai pod su ogni nodo, in GB (minimo 5 GB) | 20 GB |
| **Minimum nodes** | Numero di nodi sempre presenti. 0 è accettato | 1 |
| **Maximum nodes** | Tetto dell'auto-scaling (tra 1 e 100, maggiore o uguale al minimo; 50 al massimo consigliato) | 3 |
| **Instance type** | Modello dei nodi, scelto per serie e poi per dimensione | nessuno (scelta obbligatoria) |
| **Exposed on the internet (Public IP)** | I nodi del gruppo ospitano il controller Ingress NGINX e ricevono il traffico in ingresso | attivato per il primo gruppo |
| **GPU** | Modello e numero di GPU collegate a ogni nodo del gruppo | nessuno |

:::note
Il primo gruppo di nodi è sempre esposto su internet e non può essere eliminato. I gruppi aggiunti in seguito non sono esposti per impostazione predefinita.
:::

### Tipi di istanza

Il selettore propone tre serie. L'elenco esatto dei modelli disponibili è fornito dalla piattaforma.

#### Serie Standard (S) — rapporto 1:2

Uso economico, per sviluppo e test.

| Modello | vCPU | RAM |
|---------|------|-----|
| `s1.small` | 1 | 2 GB |
| `s1.medium` | 2 | 4 GB |
| `s1.large` | 4 | 8 GB |
| `s1.xlarge` | 8 | 16 GB |
| `s1.3large` | 12 | 24 GB |
| `s1.2xlarge` | 16 | 32 GB |
| `s1.3xlarge` | 24 | 48 GB |
| `s1.4xlarge` | 32 | 64 GB |
| `s1.8xlarge` | 64 | 128 GB |

#### Serie Universal (U) — rapporto 1:4

Uso generale: server web, applicazioni.

| Modello | vCPU | RAM |
|---------|------|-----|
| `u1.medium` | 1 | 4 GB |
| `u1.large` | 2 | 8 GB |
| `u1.xlarge` | 4 | 16 GB |
| `u1.2xlarge` | 8 | 32 GB |
| `u1.4xlarge` | 16 | 64 GB |
| `u1.8xlarge` | 32 | 128 GB |

#### Serie Memory (M) — rapporto 1:8

Ottimizzata per la memoria: database, cache.

| Modello | vCPU | RAM |
|---------|------|-----|
| `m1.large` | 2 | 16 GB |
| `m1.xlarge` | 4 | 32 GB |
| `m1.2xlarge` | 8 | 64 GB |
| `m1.4xlarge` | 16 | 128 GB |
| `m1.8xlarge` | 32 | 256 GB |

### GPU

La sezione **GPU** di un gruppo compare solo se sono disponibili GPU per il suo progetto. Vi si scelgono uno o più modelli e il relativo numero; queste GPU vengono collegate a **ogni** nodo del gruppo.

Regole applicate dalla console:

- non appena un gruppo dispone di GPU, l'addon **GPU Operator** viene attivato e non può più essere deselezionato;
- un gruppo creato senza GPU non può riceverne: aggiunga un nuovo gruppo di nodi per disporre di GPU;
- un gruppo creato con GPU può cambiare modello o numero, ma deve mantenere almeno una GPU.

:::warning
La prenotazione delle GPU è calcolata sul numero massimo di nodi del gruppo: un gruppo con al massimo 4 nodi e 1 GPU per nodo prenota 4 GPU.
:::

### Opzioni non disponibili

I ruoli di nodo personalizzati (diversi dall'esposizione su internet) e la sovrascrittura delle risorse CPU/memoria di un modello non sono disponibili nella console; contatti il supporto.

:::tip Buone pratiche per i gruppi di nodi
- Regoli il minimo e il massimo di nodi in base alle esigenze di crescita del carico.
- Scelga una serie coerente con il carico di lavoro (S per l'uso generale, U per l'equilibrio, M per la memoria).
- Preveda uno storage effimero sufficiente per immagini, log e cache.
- Separi i ruoli per gruppo: un gruppo esposto per il traffico in ingresso, gruppi interni per il calcolo.
:::

---

## Addon

Gli addon si scelgono nel passaggio **Addons** della procedura guidata (titolo **Extensions and Addons**), quindi si modificano dalla pagina di modifica del cluster.

### Addon del cluster

Si attivano o si disattivano tramite una casella di controllo.

| Addon | Descrizione | Attivato per impostazione predefinita |
|-------|-------------|-------------------|
| [Cert-Manager](./plugins/cert-manager.md) | Gestione automatica dei certificati SSL/TLS | Sì |
| [Ingress NGINX](./plugins/ingress-nginx.md) | Controller Ingress basato su NGINX | Sì |
| [Gateway API](./plugins/gateway-api.md) | Installa le CRD Kubernetes Gateway API (canale experimental) | No |
| [GPU Operator](./plugins/gpu-operator.md) | Gestione delle GPU NVIDIA nel cluster | No (imposto se un gruppo dispone di GPU) |
| [HAMi](./plugins/hami.md) | Condivisione di una stessa GPU tra più pod | No |
| [Flux CD](./plugins/fluxcd.md) | Distribuzione continua GitOps | No |
| [Monitoring Agents](./plugins/monitoring-agents.md) | Agenti di monitoraggio per log e metriche | Sì |
| [Ouroboros](./plugins/ouroboros.md) | Corregge il NAT hairpin di Ingress NGINX con il PROXY protocol | No |
| [Velero](./plugins/velero.md) | Backup e ripristino | No |

Dipendenze verificate dalla console:

- **HAMi** richiede l'addon **GPU Operator**;
- **Ouroboros** richiede l'addon **Ingress NGINX**.

### Configurazione avanzata

[Cilium](./plugins/cilium.md), [CoreDNS](./plugins/coredns.md) e [Vertical Pod Autoscaler](./plugins/verticalpodautoscaler.md) sono sempre presenti nel cluster. Non si possono disattivare: è possibile soltanto espanderne il blocco per sovrascriverne la configurazione.

### Sovrascrittura dei valori Helm

Ogni addon (tranne Gateway API) accetta un campo **Helm Configuration (YAML) — optional**. Il valore YAML viene trasmesso direttamente al chart Helm dell'addon e ne sovrascrive i valori predefiniti. Deve essere un dizionario YAML (`chiave: valore`); la console rifiuta un YAML non valido. L'icona di collegamento accanto al nome dell'addon apre la documentazione del chart.

---

## Accesso al cluster

Una volta pronto il cluster, il pulsante **Kubeconfig** della sezione **Actions** della pagina di dettaglio scarica il file `kubeconfig-<nome-del-cluster>.yaml`. Questo file conferisce un accesso amministratore al cluster con `kubectl`, `helm` o qualsiasi client Kubernetes. Il certificato client che contiene è valido un anno a partire dalla creazione del cluster. Vedere [Accesso e strumenti](./how-to/toolbox.md).

L'indirizzo dell'API del cluster è definito dal campo **API Endpoint (Host)** del passaggio **General**. È facoltativo: se lasciato vuoto, viene generato automaticamente dalla piattaforma e si risolve senza alcun intervento da parte sua. Se inserisce un nome di dominio proprio, il certificato del server API lo copre, ma il record DNS va creato presso il suo provider DNS: chieda al [supporto](mailto:support@hidora.io) l'indirizzo verso cui farlo puntare.

---

## Ciclo di vita e quota

- **Stato**: un cluster appena creato compare nell'elenco **Kubernetes Clusters** con lo stato **Creating**, poi **Ready** quando è operativo.
- **Quota**: gli indicatori **Project Quotas** della procedura guidata conteggiano il control plane e ogni gruppo di nodi **al suo numero massimo di nodi**. La creazione è bloccata se il progetto non dispone di quota sufficiente.
- **Modifica**: il pulsante **Edit** consente di cambiare la versione, l'endpoint API, i gruppi di nodi e gli addon. Il nome del cluster non è modificabile.
- **Eliminazione**: il pulsante **Delete** elimina il cluster dopo la conferma del suo nome.
