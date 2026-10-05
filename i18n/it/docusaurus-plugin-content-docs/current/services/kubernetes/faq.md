---
sidebar_position: 6
title: FAQ
---

# FAQ — Kubernetes

### Come si crea un cluster Kubernetes?

Nella [console Hikube](https://console.hikube.cloud), apra **Infrastructure** > **Kubernetes** e faccia clic su **Create cluster**. La procedura guidata comprende quattro passaggi: **General**, **Nodes**, **Addons** e **Summary**. L'[avvio rapido](./quick-start.md) descrive ogni passaggio in dettaglio.

---

### Quali tipi di istanza sono disponibili?

Hikube propone tre serie di istanze per i nodi Kubernetes:

| Serie | Prefisso | Rapporto vCPU:RAM | Uso consigliato |
|-------|---------|----------------|------------------|
| **Standard (S)** | `s1` | 1:2 | Uso economico, sviluppo, test |
| **Universal (U)** | `u1` | 1:4 | Uso generale: server web, applicazioni |
| **Memory (M)** | `m1` | 1:8 | Database, cache, elaborazioni in memoria |

Ogni serie è disponibile in più dimensioni, ad esempio `s1.small`, `u1.large`, `m1.2xlarge`. L'elenco completo si trova nei [concetti](./concepts.md#tipi-di-istanza).

---

### Quale classe di storage utilizzare nel cluster?

I volumi persistenti dei suoi workload utilizzano la classe di storage **`replicated`**, replicata su più datacenter:

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
      storage: 10Gi
```

La scelta di un'altra classe di storage per il cluster non è disponibile nella console; contatti il supporto.

---

### Quali addon sono disponibili?

Il passaggio **Addons** della procedura guidata propone:

| Addon | Descrizione | Attivato per impostazione predefinita |
|-------|-------------|-------------------|
| **Cert-Manager** | Gestione automatica dei certificati SSL/TLS | Sì |
| **Ingress NGINX** | Controller Ingress basato su NGINX | Sì |
| **Gateway API** | CRD Kubernetes Gateway API | No |
| **GPU Operator** | Gestione delle GPU NVIDIA | No (imposto se un gruppo dispone di GPU) |
| **HAMi** | Condivisione di una GPU tra più pod (richiede GPU Operator) | No |
| **Flux CD** | Distribuzione continua GitOps | No |
| **Monitoring Agents** | Agenti di monitoraggio per log e metriche | Sì |
| **Ouroboros** | Correzione del NAT hairpin di Ingress NGINX (richiede Ingress NGINX) | No |
| **Velero** | Backup e ripristino | No |

**Cilium**, **CoreDNS** e **Vertical Pod Autoscaler** sono sempre presenti; la loro configurazione si sovrascrive nella sezione **Advanced Configuration**. Gli addon si attivano alla creazione oppure da **Edit** > **Extensions & Addons**. Vedere la sezione Plugin, a partire da [Cilium](./plugins/cilium.md).

---

### Come si recupera il kubeconfig?

Apra la pagina di dettaglio del cluster nella console e faccia clic su **Kubeconfig** nella sezione **Actions**. Il browser scarica il file `kubeconfig-<nome-del-cluster>.yaml`:

```bash
export KUBECONFIG=~/Downloads/kubeconfig-<nome-del-cluster>.yaml
kubectl get nodes
```

Vedere [Accesso e strumenti](./how-to/toolbox.md).

---

### Come si scalano i gruppi di nodi?

Lo scaling è controllato dai campi **Minimum nodes** e **Maximum nodes** di ogni gruppo. L'autoscaler regola automaticamente il numero di nodi entro questi due limiti in base al carico.

Per modificare i limiti: **Edit** > **Node groups**, espanda il gruppo, cambi i valori, quindi **Save**. Vedere [Come configurare l'autoscaling](./how-to/configure-autoscaling.md).

---

### Come si aggiungono nodi GPU al cluster?

Aggiunga un nuovo gruppo di nodi (**Edit** > **Add node group**) e scelga il modello e il numero di GPU nella relativa sezione **GPU**. La console attiva quindi automaticamente l'addon **GPU Operator**, che installa i driver NVIDIA.

:::warning
- Le GPU scelte vengono collegate a **ogni** nodo del gruppo e la prenotazione è calcolata sul numero massimo di nodi: un gruppo con al massimo 4 nodi e 1 GPU per nodo prenota 4 GPU, con un impatto diretto sulla fatturazione.
- Un gruppo esistente creato senza GPU non può riceverne: crei un nuovo gruppo.
:::

Vedere [Come aggiungere e modificare un gruppo di nodi](./how-to/manage-node-groups.md).

---

### È possibile modificare il control plane dopo la creazione?

No. La **Control Plane Instance Size** e la **Control Plane High Availability** non sono modificabili nella console dopo la creazione; contatti il supporto. La versione di Kubernetes, l'endpoint API, i gruppi di nodi e gli addon restano modificabili.
