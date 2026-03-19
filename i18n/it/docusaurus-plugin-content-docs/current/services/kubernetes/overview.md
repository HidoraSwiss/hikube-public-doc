---
sidebar_position: 1
title: Panoramica
---

<!--- Presentazione del Kubernetes Gestito su Hikube
- Schema architettura (replica, control plane, worker, infra, addon, versioning k8s)
- Composizione dei diversi elementi di configurazione del k8s gestito
- Spiegazione del funzionamento:
  - control plane
  - worker/nodeGroup
    - Esempio
  - storageclass
  - versioning
  - addons-->

# Presentazione del Kubernetes Gestito su Hikube

Hikube offre un servizio di **Kubernetes gestito** progettato per fornire un'infrastruttura altamente disponibile, sicura e performante.
Il piano di controllo e interamente gestito dalla piattaforma, mentre i **nodi worker** vengono distribuiti nel vostro tenant sotto forma di macchine virtuali.

---

## 🏗️ Schema di Architettura

### **Panoramica**

I cluster Kubernetes Hikube si basano su un'**infrastruttura multi-datacenter** (3 siti svizzeri) che garantisce la replica, la tolleranza ai guasti e la continuità del servizio.

- **Piano di controllo (Control Plane)**: ospitato è gestito da Hikube
  Composto da:
  - `kube-apiserver`
  - `etcd`
  - `kube-scheduler`
  - `kube-controller-manager`
- **Nodi worker**: macchine virtuali nel vostro tenant
- **Rete**: CNI con supporto `LoadBalancer`, `Ingress` e policy di rete (`NetworkPolicy`)
- **Archiviazione**: volumi persistenti replicati sui 3 datacenter
- **Add-on**: integrazione cert-manager, FluxCD, monitoring, ecc.
- **Versioning Kubernetes**: supporto multi-versione con aggiornamenti progressivi

---

## ⚙️ Composizione e Configurazione del Cluster

I cluster sono interamente dichiarativi e configurabili tramite API o manifesto YAML.
I principali elementi di configurazione includono:

| Elemento | Descrizione |
|----------|-------------|
| **nodeGroups** | Gruppi di nodi omogenei (dimensione, ruolo, GPU, ecc.) |
| **storageClass** | Definisce il tipo di persistenza e la replica |
| **addons** | Insieme delle funzionalità opzionali attivabili |
| **version** | Versione del server Kubernetes utilizzata |
| **network** | Gestione del CNI, LoadBalancer e Ingress |

---

## ⚙️ Funzionamento Dettagliato

### 🧠 **Control Plane**

- Gestito da Hikube, senza manutenzione necessaria lato cliente
- Componenti critici replicati su più siti
- Gestione dell'alta disponibilità, del monitoring e degli aggiornamenti automatici
- Accesso tramite l'API standard Kubernetes (`kubectl`, client SDK, ecc.)

### 🧩 **Worker Nodes / NodeGroups**

I **NodeGroups** permettono di adattare le risorse alle vostre esigenze. Ogni gruppo può essere configurato con un tipo di istanza, dei ruoli e uno scaling automatico.

#### Esempio di NodeGroup

```yaml
nodeGroups:
  web:
    minReplicas: 2
    maxReplicas: 10
    instanceType: "s1.large"
    roles: ["ingress-nginx"]
```

#### Caratteristiche principali

- **Autoscaling**: parametri `minReplicas` e `maxReplicas`
- **Supporto GPU**: collegamento dinamico di GPU NVIDIA
- **Tipi di istanza**: `S1` (standard), `U1` (universal), `M1` (memory-optimized)

---

## 💾 Archiviazione Persistente

### **Classe di archiviazione: `replicated`**

- Replica automatica sui **3 datacenter svizzeri**
- Provisioning dinamico dei volumi persistenti (PVC)
- Tolleranza ai guasti e alta disponibilità nativa

Esempio di utilizzo:

```yaml
storageClassName: replicated
resources:
  requests:
    storage: 20Gi
```

---

## 🔢 Versioning Kubernetes

- I cluster possono essere creati con una **versione Kubernetes specifica**
- Hikube garantisce gli aggiornamenti minori e correttivi in modo controllato
- Il cliente mantiene la possibilità di pianificare gli upgrade maggiori

Esempio:

```yaml
version: "1.30.3"
```

---

## 🧩 Add-on Integrati

### **Cert-Manager**

- Gestione automatizzata dei certificati SSL/TLS
- Supporto Let's Encrypt e autorita private
- Rinnovo automatico

### **Ingress NGINX**

- Controller di ingress integrato
- Supporto wildcard, SNI e metriche Prometheus

### **Flux CD (GitOps)**

- Sincronizzazione continua con i vostri repository Git
- Distribuzione automatizzata e rollback

### **Monitoring Stack**

- **Node Exporter**, **FluentBit**, **Kube-State-Metrics**
- Integrazione completa con Grafana e Prometheus del tenant

---

## 🚀 Esempi di Casi d'Uso

### **Applicazioni Web**

```yaml
nodeGroups:
  web:
    minReplicas: 2
    maxReplicas: 10
    instanceType: "s1.large"
    roles: ["ingress-nginx"]
```

### **Workload ML/AI**

```yaml
nodeGroups:
  ml:
    minReplicas: 1
    maxReplicas: 5
    instanceType: "u1.xlarge"
    gpus:
      - name: "nvidia.com/AD102GL_L40S"
```

### **Applicazioni Critiche**

```yaml
nodeGroups:
  production:
    minReplicas: 3
    maxReplicas: 20
    instanceType: "m1.large"
```

---

## 📚 Risorse

- **[Concetti e Architettura](./concepts.md)** → Comprendere come viene distribuito un cluster Kubernetes Hikube
- **[Avvio rapido](./quick-start.md)** → Create il vostro primo cluster Hikube
- **[Riferimento API](./api-reference.md)** → Documentazione completa della configurazione

---

## 💡 Punti Chiave

- **Piano di controllo gestito**: nessuna manutenzione dei master necessaria
- **Nodi nel vostro tenant**: controllo completo sui worker
- **Scaling automatico**: adeguamento dinamico in base al carico
- **Multi-datacenter**: alta disponibilità nativa e replica
- **Compatibilita totale**: API Kubernetes standard supportata
