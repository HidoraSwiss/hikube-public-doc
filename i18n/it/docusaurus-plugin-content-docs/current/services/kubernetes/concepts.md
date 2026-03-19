---
sidebar_position: 2
title: Concetti
---

# Concetti — Kubernetes

## Architettura

Lo schema seguente illustra la struttura e le interazioni principali del **cluster Kubernetes Hikube**, includendo l'alta disponibilità del piano di controllo, la gestione dei nodi, la persistenza dei dati e la replica inter-regioni.

<div class="only-light">
  <img src="/img/hikube-kubernetes-architecture.svg" alt="Logo chiaro"/>
</div>
<div class="only-dark">
  <img src="/img/hikube-kubernetes-architecture-dark.svg" alt="Logo scuro"/>
</div>

---

### Componenti principali del cluster

#### Etcd Cluster

- Contiene più istanze di **etcd** replicate tra loro.
- Assicura la **coerenza dello storage di stato del cluster Kubernetes** (informazioni su pod, servizi, configurazioni, ecc.).
- La replica interna tra i nodi `etcd` garantisce la **tolleranza ai guasti**.

#### Control Plane

- Composto dall'API Server, dallo Scheduler e dal Controller Manager.
- Ruolo:
  - **Pianifica i workload** (pod, deployment, ecc.) sui nodi disponibili.
  - **Interagisce con etcd** per leggere/scrivere lo stato del cluster.

#### Node Groups

- Ogni gruppo contiene più **nodi di lavoro (worker nodes)**.
- I workload (pod) vengono distribuiti su questi nodi.
- I nodi comunicano con il Control Plane per ricevere i loro compiti.
- Leggono e scrivono i loro dati nei **Persistent Volume (PV)** Kubernetes.

#### Kubernetes PV Data

- Rappresenta lo **storage persistente** utilizzato dai pod.
- I dati dei workload vengono **scritti e letti da questo storage**.
- Questo livello è integrato nella replica Hikube per garantire la disponibilità dei dati.

---

### Livello di replica Hikube

#### Hikube Replication Data Layer

- Serve da interfaccia tra Kubernetes e i **sistemi di storage regionali**.
- Replica automaticamente i dati dei PV verso più regioni per:
  - l'**alta disponibilità**,
  - la **resilienza ai guasti regionali**,
  - e la **continuità di servizio**.

#### Storage regionali

- **Region 1** → Geneva Data Storage
- **Region 2** → Gland Data Storage
- **Region 3** → Lucerne Data Storage

Ogni regione dispone del proprio backend di storage, tutti sincronizzati tramite il livello Hikube.

---

### Flussi di comunicazione

1. I **nodi etcd** si sincronizzano tra loro per mantenere uno stato globale coerente.
2. Il **Control Plane** legge/scrive in etcd per memorizzare lo stato del cluster.
3. Il **Control Plane** pianifica i workload sui **Node Groups**.
4. I **Node Groups** interagiscono con i **PV Kubernetes** per memorizzare o recuperare dati.
5. I **PV Data** vengono replicati attraverso il **Hikube Replication Data Layer** verso le **3 regioni**.

---

### Riepilogo funzionale

| Livello | Funzione principale | Tecnologia |
|---------|---------------------|------------|
| Etcd Cluster | Storage dello stato del cluster | etcd |
| Control Plane | Gestione e pianificazione dei workload | Kubernetes |
| Node Groups | Esecuzione dei workload | kubelet, container runtime |
| PV Data | Storage persistente | Kubernetes Persistent Volumes |
| Hikube Data Layer | Replica e sincronizzazione multi-regione | Hikube |
| Data Storage | Storage fisico regionale | Geneva / Gland / Lucerne |

---

### Obiettivo globale

Questa architettura assicura:

- **Alta disponibilità** del cluster Kubernetes.
- **Resilienza geografica** grazie alla replica inter-regione.
- **Integrità dei dati** tramite etcd e lo storage persistente.
- **Scalabilità** orizzontale con i Node Groups.

---

## Control Plane

Il campo `controlPlane` definisce la configurazione del piano di controllo del cluster Kubernetes gestito.
Specifica le risorse allocate a ogni componente chiave (API Server, Scheduler, Controller Manager, Konnectivity) e il numero di repliche per l'alta disponibilità.

```yaml title="control-plane.yaml"
controlPlane:
  apiServer:
    resources:
      cpu: 2
      memory: 4Gi
    resourcesPreset: small
  controllerManager:
    resources:
      cpu: 2
      memory: 2Gi
    resourcesPreset: small
  konnectivity:
    server:
      resources:
        cpu: 1
        memory: 1Gi
      resourcesPreset: nano
  scheduler:
    resources:
      cpu: 1
      memory: 512Mi
    resourcesPreset: micro
  replicas: 3
```

---

### `apiServer` (Object)

L'`apiServer` è il componente centrale del piano di controllo Kubernetes.
Gestisce tutte le richieste verso l'API Kubernetes e assicura la comunicazione tra i componenti interni del cluster.

| Campo | Tipo | Obbligatorio | Descrizione |
|-------|------|--------------|-------------|
| `resources` | Object | Sì | Definisce le risorse CPU e memoria allocate all'API Server |
| `resources.cpu` | string | No | Numero di vCPU assegnati (es: `2`) |
| `resources.memory` | string | No | Quantità di memoria allocata (es: `4Gi`) |
| `resourcesPreset` | string | Sì | Profilo di risorse predefinito (`nano`, `micro`, `small`, `medium`, `large`, `xlarge`, `2xlarge`) |

### `controllerManager` (Object)

Il `controllerManager` esegue i **loop di controllo** Kubernetes (reconciliation loops).
Assicura la creazione, l'aggiornamento e l'eliminazione delle risorse (pod, servizi, ecc.) in funzione dello stato desiderato del cluster.

| Campo | Tipo | Obbligatorio | Descrizione |
|-------|------|--------------|-------------|
| `resources` | Object | Sì | Specifica le risorse CPU/memoria per il Controller Manager |
| `resources.cpu` | string | No | Numero di vCPU riservati |
| `resources.memory` | string | No | Quantità di memoria allocata |
| `resourcesPreset` | string | Sì | Dimensione predefinita (`nano`, `micro`, `small`, `medium`, ecc.) |

### `konnectivity` (Object)

Il servizio **Konnectivity** gestisce la comunicazione sicura tra il piano di controllo e i nodi (agenti).
Sostituisce il vecchio `kube-proxy` per le connessioni in uscita dei nodi e ottimizza la connettività di rete.

| Campo | Tipo | Obbligatorio | Descrizione |
|-------|------|--------------|-------------|
| `server.resources` | Object | Sì | Specifica le risorse CPU/memoria del server Konnectivity |
| `server.resources.cpu` | string | No | Numero di vCPU |
| `server.resources.memory` | string | No | Quantità di memoria |
| `server.resourcesPreset` | string | Sì | Profilo predefinito (`nano`, `micro`, `small`, `medium`, ecc.) |

### `scheduler` (Object)

Lo `scheduler` determina su quale nodo ogni pod deve essere eseguito in funzione dei vincoli di risorse, affinità e topologie.

| Campo | Tipo | Obbligatorio | Descrizione |
|-------|------|--------------|-------------|
| `resources` | Object | Sì | Definisce le risorse allocate allo Scheduler |
| `resources.cpu` | string | No | Numero di vCPU |
| `resources.memory` | string | No | Quantità di memoria |
| `resourcesPreset` | string | Sì | Dimensione predefinita (`nano`, `micro`, `small`, `medium`, ecc.) |

### `replicas` (integer)

Il campo `replicas` definisce il **numero di istanze del piano di controllo**.
Un numero dispari di repliche (generalmente `3`) è raccomandato per garantire l'alta disponibilità e il quorum in `etcd`.

---

### Tipi di resourcesPreset

```yaml
resourcesPreset: "nano"     # 0.1 CPU, 128 MiB RAM
resourcesPreset: "micro"    # 0.25 CPU, 256 MiB RAM
resourcesPreset: "small"    # 0.5 CPU, 512 MiB RAM
resourcesPreset: "medium"   # 0.5 CPU, 1 GiB RAM
resourcesPreset: "large"    # 1 CPU, 2 GiB RAM
resourcesPreset: "xlarge"   # 2 CPU, 4 GiB RAM
resourcesPreset: "2xlarge"  # 4 CPU, 8 GiB RAM
```

:::tip Buone pratiche Control Plane
- Definire sempre `replicas: 3` per la ridondanza.
- Utilizzare `resourcesPreset` coerenti tra i componenti.
- Adattare le risorse in funzione del carico (cluster di produzione → `medium` o `large`).
- Non sottodimensionare `apiServer`, è il componente più sollecitato.
:::

---

## Node Groups

Il campo `nodeGroup` definisce la configurazione di un gruppo di nodi (worker) all'interno del cluster Kubernetes.
Permette di specificare il tipo di istanza, le risorse, il numero di repliche, così come i ruoli e le GPU associate.

```yaml title="node-group.yaml"
nodeGroup:
  <name>:
    ephemeralStorage:
      size: 100Gi
    gpus:
      - name: nvidia.com/AD102GL_L40S
    instanceType: m5.large
    maxReplicas: 5
    minReplicas: 2
    resources:
      cpu: 4
      memory: 16Gi
    roles:
      - ingress-nginx
```

---

### `ephemeralStorage` (Object)

Definisce la configurazione dello **storage effimero** associato ai nodi del gruppo.
Questo storage è utilizzato per i dati temporanei, le cache o i file di log.

### `gpus` (Array)

Elenca le **GPU** disponibili sui nodi del gruppo, utilizzate per carichi di lavoro che richiedono potenza di calcolo (IA, ML, ecc.).

| Campo | Tipo | Obbligatorio | Descrizione |
|-------|------|--------------|-------------|
| `name` | string | Sì | Nome della GPU o tipo di scheda (`nvidia.com/AD102GL_L40S` o `nvidia.com/GA100_A100_PCIE_80GB`) |

### `instanceType` (string)

Specifica il **tipo di istanza** utilizzato per i nodi.

#### Serie S (Standard) — Rapporto 1:2

Ottimizzata per workload generali con CPU condivisa e burstable.

```yaml
instanceType: "s1.small"     # 1 vCPU, 2 GB RAM
instanceType: "s1.medium"    # 2 vCPU, 4 GB RAM
instanceType: "s1.large"     # 4 vCPU, 8 GB RAM
instanceType: "s1.xlarge"    # 8 vCPU, 16 GB RAM
instanceType: "s1.3large"    # 12 vCPU, 24 GB RAM
instanceType: "s1.2xlarge"   # 16 vCPU, 32 GB RAM
instanceType: "s1.3xlarge"   # 24 vCPU, 48 GB RAM
instanceType: "s1.4xlarge"   # 32 vCPU, 64 GB RAM
instanceType: "s1.8xlarge"   # 64 vCPU, 128 GB RAM
```

#### Serie U (Universal) — Rapporto 1:4

Ottimizzata per workload bilanciati con più memoria.

```yaml
instanceType: "u1.medium"    # 1 vCPU, 4 GB RAM
instanceType: "u1.large"     # 2 vCPU, 8 GB RAM
instanceType: "u1.xlarge"    # 4 vCPU, 16 GB RAM
instanceType: "u1.2xlarge"   # 8 vCPU, 32 GB RAM
instanceType: "u1.4xlarge"   # 16 vCPU, 64 GB RAM
instanceType: "u1.8xlarge"   # 32 vCPU, 128 GB RAM
```

#### Serie M (Memory Optimized) — Rapporto 1:8

Ottimizzata per applicazioni che richiedono molta memoria.

```yaml
instanceType: "m1.large"     # 2 vCPU, 16 GB RAM
instanceType: "m1.xlarge"    # 4 vCPU, 32 GB RAM
instanceType: "m1.2xlarge"   # 8 vCPU, 64 GB RAM
instanceType: "m1.4xlarge"   # 16 vCPU, 128 GB RAM
instanceType: "m1.8xlarge"   # 32 vCPU, 256 GB RAM
```

### `maxReplicas` / `minReplicas` (integer)

- `maxReplicas`: numero **massimo** di nodi che possono essere distribuiti (limita l'autoscaling).
- `minReplicas`: numero **minimo** di nodi garantiti in questo gruppo.

### `resources` (Object)

Definisce le **risorse allocate** a ogni nodo del gruppo (CPU e memoria).

| Campo | Tipo | Obbligatorio | Descrizione |
|-------|------|--------------|-------------|
| `cpu` | string | No | Numero di vCPU assegnati per nodo (es: `4`) |
| `memory` | string | No | Quantità di memoria allocata per nodo (es: `16Gi`) |

### `roles` (Array)

Elenca i **ruoli** assegnati ai nodi del gruppo (es: `ingress-nginx`).

---

### Esempi di Node Groups

#### Node Group Generale

```yaml title="node-group-general.yaml"
nodeGroups:
  general:
    minReplicas: 2
    maxReplicas: 10
    instanceType: "s1.large"
    ephemeralStorage: 50Gi
    roles:
      - ingress-nginx
```

#### Node Group Compute Intensivo

```yaml title="node-group-compute.yaml"
nodeGroups:
  compute:
    minReplicas: 0
    maxReplicas: 5
    instanceType: "u1.4xlarge"  # 16 vCPU, 64 GB RAM
    ephemeralStorage: 100Gi
    roles: []
```

#### Node Group Memory Optimized

```yaml title="node-group-memory.yaml"
nodeGroups:
  memory-intensive:
    minReplicas: 1
    maxReplicas: 3
    instanceType: "m1.xlarge"   # 4 vCPU, 32 GB RAM
    ephemeralStorage: 30Gi
    resources:
      cpu: "6"       # Override: 6 vCPU invece di 4
      memory: "48Gi" # Override: 48 GB invece di 32
```

:::tip Buone pratiche Node Groups
- Regolare `minReplicas` e `maxReplicas` in funzione delle esigenze di scalabilità.
- Utilizzare `instanceType` coerenti con il carico di lavoro.
- Definire uno storage effimero sufficiente per i carichi temporanei (log, cache).
- Specificare chiaramente i ruoli per segmentare le funzioni dei nodi (es: separazione `worker` / `ingress`).
:::
