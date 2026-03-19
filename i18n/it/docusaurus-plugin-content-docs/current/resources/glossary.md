---
sidebar_position: 3
title: Glossario
---

# Glossario Hikube

Trovate qui le definizioni dei termini e dei concetti utilizzati nella documentazione Hikube.

---

| **Termine** | **Definizione** | **Documentazione** |
|-----------|---------------|-------------------|
| **Add-on / Plugin** | Estensione attivabile su un cluster Kubernetes (cert-manager, ingress-nginx, monitoring, ecc.) che aggiunge funzionalità senza configurazione manuale. | [Kubernetes API Reference](../services/kubernetes/api-reference.md) |
| **AMQP** | Advanced Message Queuing Protocol. Protocollo di messaggistica standard utilizzato in particolare da RabbitMQ per la comunicazione tra applicazioni. | [RabbitMQ Overview](../services/messaging/rabbitmq/overview.md) |
| **ClickHouse Keeper** | Servizio di consenso distribuito integrato in ClickHouse, utilizzato per il coordinamento dei nodi del cluster (alternativa a ZooKeeper). | [ClickHouse Overview](../services/databases/clickhouse/overview.md) |
| **Cloud-init** | Strumento di inizializzazione automatica delle macchine virtuali al primo avvio. Permette di configurare utenti, pacchetti, script e rete tramite un file YAML. | [Compute API Reference](../services/compute/api-reference.md) |
| **CNI (Container Network Interface)** | Standard che definisce la gestione della rete per i contenitori in un cluster Kubernetes. Hikube utilizza Cilium come CNI predefinito. | [Kubernetes Overview](../services/kubernetes/overview.md) |
| **Control Plane** | Insieme dei componenti che gestiscono lo stato del cluster Kubernetes (API server, scheduler, controller manager). Il numero di repliche determina l'alta disponibilità. | [Kubernetes API Reference](../services/kubernetes/api-reference.md) |
| **Golden Image** | Immagine di base preconfigurata per le macchine virtuali, ottimizzata per un sistema operativo specifico (Ubuntu, Rocky Linux, ecc.). | [Compute Overview](../services/compute/overview.md) |
| **Ingress / IngressClass** | Risorsa Kubernetes che gestisce l'accesso HTTP/HTTPS esterno verso i servizi del cluster. IngressClass definisce il controller utilizzato (nginx, traefik, ecc.). | [Kubernetes API Reference](../services/kubernetes/api-reference.md) |
| **JetStream** | Sistema di streaming e persistenza integrato in NATS, che permette l'archiviazione duratura dei messaggi, il replay e la consegna garantita. | [NATS Overview](../services/messaging/nats/overview.md) |
| **Kubeconfig** | File di configurazione contenente le informazioni di accesso a un cluster Kubernetes (URL del server, certificati, token). Necessario per utilizzare `kubectl`. | [Kubernetes Quick Start](../services/kubernetes/quick-start.md) |
| **Namespace** | Spazio logico all'interno di un cluster Kubernetes che permette di isolare e organizzare le risorse. Ogni tenant dispone di namespace dedicati. | [Concetti chiave](../getting-started/concepts.md) |
| **NodeGroup** | Gruppo di nodi worker in un cluster Kubernetes, con caratteristiche comuni (tipo di istanza, scaling min/max, ruoli). Permette di adattare le risorse ai diversi workload. | [Kubernetes API Reference](../services/kubernetes/api-reference.md) |
| **Operator** | Pattern Kubernetes che automatizza la gestione di applicazioni complesse. Hikube utilizza operatori specializzati: Spotahome (Redis), CloudNativePG (PostgreSQL), ecc. | [Redis Overview](../services/databases/redis/overview.md) |
| **PVC (PersistentVolumeClaim)** | Richiesta di archiviazione persistente in Kubernetes. Permette ai pod di conservare i dati oltre il loro ciclo di vita. La dimensione è definita dal parametro `size`. | [Kubernetes Quick Start](../services/kubernetes/quick-start.md) |
| **Quorum Queues** | Tipo di coda RabbitMQ basato sul consenso Raft, che offre una replica forte e tolleranza ai guasti per i messaggi critici. | [RabbitMQ Overview](../services/messaging/rabbitmq/overview.md) |
| **ResourcesPreset** | Profilo di risorse predefinito (nano, micro, small, medium, large, xlarge, 2xlarge) che semplifica l'allocazione CPU/memoria dei servizi gestiti. | [Redis API Reference](../services/databases/redis/api-reference.md) |
| **Sentinel** | Componente Redis che monitora permanentemente lo stato del cluster, rileva i guasti del master e orchestra automaticamente il failover verso una replica. | [Redis Overview](../services/databases/redis/overview.md) |
| **Shard / Replica** | Uno **shard** è una partizione orizzontale dei dati (utilizzato da ClickHouse). Una **replica** è una copia dei dati per l'alta disponibilità e la tolleranza ai guasti. | [ClickHouse Overview](../services/databases/clickhouse/overview.md) |
| **StorageClass** | Definisce il tipo di archiviazione utilizzato per i volumi persistenti. `replicated` offre una replica dei dati su più datacenter per l'alta disponibilità. | [Kubernetes API Reference](../services/kubernetes/api-reference.md) |
| **Tenant / Sotto-tenant** | Ambiente isolato e sicuro all'interno di Hikube. Un tenant può contenere sotto-tenant per separare gli ambienti (produzione, staging, sviluppo). | [Concetti chiave](../getting-started/concepts.md) |
