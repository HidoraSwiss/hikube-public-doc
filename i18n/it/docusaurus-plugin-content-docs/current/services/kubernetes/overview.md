---
sidebar_position: 1
title: Panoramica
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# Presentazione del Kubernetes gestito su Hikube

Hikube propone un servizio di **Kubernetes gestito** progettato per offrire un'infrastruttura ad alta disponibilità, sicura e performante.
Il piano di controllo è interamente gestito dalla piattaforma, mentre i **nodi worker** vengono distribuiti nel suo progetto sotto forma di macchine virtuali.

I cluster si creano, si modificano e si eliminano dalla [console Hikube](https://console.hikube.cloud), menu **Infrastructure** > **Kubernetes**. Una volta pronto il cluster, se ne scarica il kubeconfig dalla console e si lavora nel cluster con i propri strumenti abituali (`kubectl`, `helm`, client SDK, ecc.).

---

## Architettura

I cluster Kubernetes Hikube si basano su un'**infrastruttura multi-datacenter** (3 siti svizzeri) che garantisce la replica, la tolleranza ai guasti e la continuità del servizio.

- **Piano di controllo (Control Plane)**: ospitato e gestito da Hikube. È composto da:
  - `kube-apiserver`
  - `etcd`
  - `kube-scheduler`
  - `kube-controller-manager`
- **Nodi worker**: macchine virtuali nel suo progetto, raggruppate in gruppi di nodi
- **Rete**: CNI Cilium, supporto dei Service `LoadBalancer`, degli `Ingress` e delle `NetworkPolicy`
- **Storage**: volumi persistenti replicati sui 3 datacenter
- **Addon**: Cert-Manager, Ingress NGINX, Flux CD, agenti di monitoring, Velero, GPU Operator, ecc.
- **Versioni Kubernetes**: la versione si sceglie tra quelle proposte dalla piattaforma

---

## Che cosa si configura nella console

La procedura guidata **Create cluster** raggruppa la configurazione in quattro passaggi:

| Passaggio | Che cosa si definisce |
|-------|------------------------|
| **General** | Nome del cluster, versione di Kubernetes, endpoint API (facoltativo), dimensione e numero di istanze del control plane |
| **Nodes** | Uno o più gruppi di nodi: nome, tipo di istanza, storage effimero, numero minimo e massimo di nodi, esposizione su internet, GPU |
| **Addons** | Attivazione degli addon del cluster e sovrascrittura facoltativa dei relativi valori Helm |
| **Summary** | Riepilogo prima della distribuzione |

Il dettaglio di ogni campo è descritto nei [concetti](./concepts.md) e nell'[avvio rapido](./quick-start.md).

---

## Funzionamento dettagliato

### Control Plane

- Gestito da Hikube, senza alcuna manutenzione da parte sua
- Dimensionato tramite un preset (**Control Plane Instance Size**) e un numero di istanze (**Control Plane High Availability**: 1, 3 o 5)
- Accesso tramite l'API standard Kubernetes (`kubectl`, client SDK, ecc.) con il kubeconfig scaricato dalla console

### Gruppi di nodi

I **gruppi di nodi** consentono di adattare le risorse ai suoi workload. Ogni gruppo ha il proprio tipo di istanza e i propri limiti di auto-scaling.

- **Auto-scaling**: numero minimo e massimo di nodi per gruppo
- **Supporto GPU**: collegamento di GPU NVIDIA ai nodi di un gruppo, scelte nella procedura guidata
- **Tipi di istanza**: serie Standard (S), Universal (U) e Memory (M)

---

## Storage persistente

I volumi persistenti (PVC) creati nel cluster utilizzano la classe di storage **`replicated`**:

- Replica automatica sui **3 datacenter svizzeri**
- Provisioning dinamico dei volumi persistenti
- Tolleranza ai guasti e alta disponibilità nativa

Esempio di PVC da distribuire nel cluster:

```yaml title="pvc.yaml"
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: my-data
spec:
  accessModes:
    - ReadWriteOnce
  storageClassName: replicated
  resources:
    requests:
      storage: 20Gi
```

---

## Versioni Kubernetes

- La versione si sceglie alla creazione del cluster, tra quelle proposte dalla piattaforma (la più recente è preselezionata)
- L'aggiornamento si effettua dalla pagina di modifica del cluster (vedere [Come aggiornare un cluster](./how-to/upgrade-cluster.md))

---

## Addon integrati

### Cert-Manager

- Gestione automatizzata dei certificati SSL/TLS
- Supporto di Let's Encrypt e di autorità private
- Rinnovo automatico

### Ingress NGINX

- Controller Ingress integrato, esposto tramite un Service `LoadBalancer`
- Distribuito sui gruppi di nodi esposti su internet

### Flux CD (GitOps)

- Sincronizzazione continua con i suoi repository Git
- Distribuzione automatizzata e rollback

### Monitoring Agents

- Raccolta delle metriche e dei log del cluster (VictoriaMetrics Agent, Fluent Bit, kube-state-metrics, node exporter)

L'elenco completo si trova nella sezione [Plugin](./plugins/cilium.md).

---

## Esempi di casi d'uso

| Caso d'uso | Gruppo di nodi consigliato |
|-------------|---------------------------|
| **Applicazioni web** | Serie Standard (S), da 2 a 10 nodi, gruppo esposto su internet per ospitare l'Ingress |
| **Workload ML/IA** | Serie Universal (U) con GPU, addon GPU Operator attivato |
| **Applicazioni critiche** | Almeno 3 nodi minimi, control plane in alta disponibilità (3 istanze) |

---

## Risorse

- **[Concetti e architettura](./concepts.md)**: comprendere come viene distribuito un cluster Kubernetes Hikube
- **[Avvio rapido](./quick-start.md)**: creare il primo cluster dalla console

---

## Punti chiave

- **Piano di controllo gestito**: nessuna manutenzione dei master richiesta
- **Nodi nel suo progetto**: controllo completo sui worker
- **Auto-scaling**: adeguamento dinamico in base al carico
- **Multi-datacenter**: alta disponibilità nativa e replica
- **Compatibilità totale**: API Kubernetes standard

<NavigationFooter
  nextSteps={[
    {label: "Concetti", href: "../concepts"},
    {label: "Avvio rapido", href: "../quick-start"},
  ]}
/>
