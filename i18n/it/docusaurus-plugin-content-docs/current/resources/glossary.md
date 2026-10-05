---
sidebar_position: 3
title: Glossario
---

# Glossario Hikube

Qui trova le definizioni dei termini e dei concetti utilizzati nella documentazione Hikube.

---

| **Termine** | **Definizione** | **Documentazione** |
|-----------|---------------|-------------------|
| **Accesso esterno** | Opzione dei database e di RabbitMQ che assegna un IP pubblico al cluster; l'indirizzo viene visualizzato nel campo **Host** della pagina di dettaglio. | [PostgreSQL - Concetti](../services/databases/postgresql/concepts.md) |
| **Add-on / Estensione** | Componente attivabile su un cluster Kubernetes dal passaggio **Addons** della procedura guidata (cert-manager, Ingress NGINX, monitoring, ecc.). | [Kubernetes - Concetti](../services/kubernetes/concepts.md) |
| **AMQP** | Advanced Message Queuing Protocol. Protocollo di messaggistica standard utilizzato in particolare da RabbitMQ per la comunicazione tra applicazioni. | [RabbitMQ - Panoramica](../services/messaging/rabbitmq/overview.md) |
| **ClickHouse Keeper** | Servizio di consenso distribuito integrato in ClickHouse, utilizzato per il coordinamento dei nodi del cluster (alternativa a ZooKeeper). | [ClickHouse - Panoramica](../services/databases/clickhouse/overview.md) |
| **Cloud-init** | Strumento di inizializzazione automatica delle macchine virtuali al primo avvio: utenti, pacchetti, script, rete. Lo script si inserisce nella procedura guidata di creazione della VM. | [Configurare cloud-init](../services/compute/how-to/configure-cloud-init.md) |
| **CNI (Container Network Interface)** | Standard che definisce la gestione della rete per i container in un cluster Kubernetes. Hikube utilizza Cilium come CNI. | [Kubernetes - Panoramica](../services/kubernetes/overview.md) |
| **Console** | Interfaccia web di Hikube, [console.hikube.cloud](https://console.hikube.cloud), da cui si gestiscono tutte le risorse. | [Concetti chiave](../getting-started/concepts.md) |
| **Control Plane** | Insieme dei componenti che gestiscono lo stato del cluster Kubernetes (API server, scheduler, controller manager). La sua dimensione e il numero di istanze si scelgono alla creazione del cluster. | [Kubernetes - Concetti](../services/kubernetes/concepts.md) |
| **Disco** | Volume di storage a blocchi persistente collegato a una macchina virtuale (disco di sistema o di dati), gestito in **Infrastructure** → **Disks**. | [Dischi - Panoramica](../services/storage/disks/overview.md) |
| **Golden Image** | Immagine di base preconfigurata per le macchine virtuali, ottimizzata per un determinato sistema operativo (Ubuntu, Rocky Linux, Windows Server, ecc.). | [Macchine virtuali - Panoramica](../services/compute/overview.md) |
| **Gruppo di nodi** | Insieme di nodi worker di un cluster Kubernetes che condividono un tipo di istanza, limiti di auto-scaling (minimo/massimo) e, se previsto, una GPU. | [Gestire i gruppi di nodi](../services/kubernetes/how-to/manage-node-groups.md) |
| **Ingress / IngressClass** | Risorsa Kubernetes che gestisce l'accesso HTTP/HTTPS esterno verso i servizi del cluster. IngressClass definisce il controller utilizzato. | [Ingress NGINX](../services/kubernetes/plugins/ingress-nginx.md) |
| **JetStream** | Sistema di streaming e persistenza integrato in NATS, che consente l'archiviazione durevole dei messaggi, il replay e la consegna garantita. | [NATS - Panoramica](../services/messaging/nats/overview.md) |
| **Kubeconfig** | File di accesso a un cluster Kubernetes (URL del server, certificati). Quello del suo cluster si scarica dalla relativa pagina di dettaglio nella console (pulsante **Kubeconfig**). | [Kubernetes - Avvio rapido](../services/kubernetes/quick-start.md) |
| **Organizzazione** | Entità che rappresenta la sua azienda in Hikube. Raggruppa i suoi utenti e i suoi progetti; viene creata da Hidora. | [Concetti chiave](../getting-started/concepts.md) |
| **Preset** | Profilo di risorse predefinito (da `nano` a `2xlarge`) proposto nelle procedure guidate dei database per dimensionare CPU e memoria. | [PostgreSQL - Concetti](../services/databases/postgresql/concepts.md) |
| **Progetto** | Spazio isolato all'interno di un'organizzazione, che raggruppa risorse e dispone di quota (CPU, memoria, storage). In precedenza chiamato **tenant**. | [Concetti chiave](../getting-started/concepts.md) |
| **PVC (PersistentVolumeClaim)** | Richiesta di storage persistente in un cluster Kubernetes. Consente ai pod di conservare i dati oltre il proprio ciclo di vita. | [Kubernetes - Concetti](../services/kubernetes/concepts.md) |
| **Quorum Queues** | Tipo di coda RabbitMQ basato sul consenso Raft, che offre una replica forte e tolleranza ai guasti per i messaggi critici. | [RabbitMQ - Panoramica](../services/messaging/rabbitmq/overview.md) |
| **Quota** | Limite di CPU, memoria o storage di un progetto. Le procedure guidate mostrano l'impatto di ogni creazione sulla quota. | [Concetti chiave](../getting-started/concepts.md#quota) |
| **Sentinel** | Componente Redis che sorveglia lo stato del cluster, rileva i guasti del master e orchestra automaticamente il failover verso una replica. | [Redis - Panoramica](../services/databases/redis/overview.md) |
| **Shard / Replica** | Uno **shard** è una partizione orizzontale dei dati (MongoDB, ClickHouse). Una **replica** è una copia dei dati per l'alta disponibilità. | [MongoDB - Concetti](../services/databases/mongodb/concepts.md) |
| **StorageClass** | Tipo di storage dei volumi persistenti in un cluster Kubernetes. `replicated` replica i dati su più datacenter. | [Kubernetes - Concetti](../services/kubernetes/concepts.md) |
| **Tipo di istanza** | Modello di CPU e memoria di una VM o di un nodo Kubernetes (serie `s1`, `u1`, `m1`). | [Macchine virtuali - Concetti](../services/compute/concepts.md) |
| **VPC** | Rete privata virtuale di un progetto, suddivisa in sottoreti, che collega tra loro le sue VM. Gestita in **Infrastructure** → **Networking**. | [Rete - Panoramica](../services/networking/overview.md) |
