---
sidebar_position: 6
title: FAQ
---

# FAQ — Kubernetes

### Quali sono i tipi di istanze disponibili?

Hikube propone tre gamme di istanze per i nodi Kubernetes:

| Gamma | Prefisso | Rapporto vCPU:RAM | Uso raccomandato |
|-------|----------|-------------------|------------------|
| **Standard** | `s1` | 1:2 | Workload generali, server web |
| **Universal** | `u1` | 1:4 | Applicazioni aziendali, database |
| **Memory** | `m1` | 1:8 | Cache, analytics, elaborazione in memoria |

Ogni gamma è disponibile in dimensioni che vanno da `small` a `8xlarge`. Ad esempio: `s1.small`, `u1.large`, `m1.2xlarge`.

---

### Come funziona la `storageClass` in un cluster Kubernetes?

La storageClass scelta nel manifesto del cluster viene **replicata all'interno del cluster tenant**. Quando i vostri workload creano dei PVC nel cluster, l'archiviazione viene provisionata con questa storageClass lato infrastruttura.

Le storageClass disponibili sono: `local`, `replicated` e `replicated-async`.

| Caratteristica | `local` | `replicated` / `replicated-async` |
|----------------|---------|-------------------------------------|
| **Replica** | Un solo datacenter | Multi-datacenter (sincrona o asincrona) |
| **Prestazioni** | Più veloce (latenza bassa) | Leggermente più lento |
| **Alta disponibilità** | No (livello archiviazione) | Si |

:::tip
La raccomandazione predefinita per Kubernetes e **`replicated`**, che garantisce la durabilita dei dati a livello di archiviazione.
:::

:::note
**Limitazione attuale**: una sola storageClass può essere passata al cluster tenant. Un miglioramento e in corso per permettere di passare tutte le storageClass e lasciare al cliente la scelta in base alle proprie esigenze.
:::

---

### Quali addon sono disponibili?

I seguenti addon possono essere attivati sul vostro cluster:

| Addon | Descrizione |
|-------|-------------|
| `certManager` | Gestione automatica dei certificati TLS (Let's Encrypt) |
| `ingressNginx` | Controller Ingress NGINX per il routing HTTP/HTTPS |
| `fluxcd` | Distribuzione GitOps continua |
| `monitoringAgents` | Agenti di monitoring (metriche, log) |
| `gpuOperator` | Operatore NVIDIA GPU per workload GPU |

Ogni addon si attiva nel manifesto del cluster:

```yaml title="cluster.yaml"
spec:
  addons:
    certManager:
      enabled: true
    ingressNginx:
      enabled: true
```

---

### Come recuperare il mio kubeconfig?

Il kubeconfig e memorizzato in un Secret Kubernetes generato automaticamente durante la creazione del cluster:

```bash
kubectl get tenantsecret <cluster-name>-admin-kubeconfig -o jsonpath='{.data.super-admin\.conf}' | base64 -d > kubeconfig.yaml
```

Potete poi utilizzarlo:

```bash
export KUBECONFIG=kubeconfig.yaml
kubectl get nodes
```

---

### Come scalare i nodeGroup?

Lo scaling e controllato dai parametri `minReplicas` e `maxReplicas` di ogni nodeGroup. L'autoscaler regola automaticamente il numero di nodi tra questi due limiti in base al carico.

Per modificare i limiti, aggiornate il vostro manifesto e applicatelo:

```yaml title="cluster.yaml"
spec:
  nodeGroups:
    workers:
      minReplicas: 3
      maxReplicas: 15
      instanceType: "s1.large"
```

```bash
kubectl apply -f cluster.yaml
```

---

### Come aggiungere nodi GPU al mio cluster?

Aggiungete un nodeGroup dedicato con il campo `gpus` specificando il modello di GPU desiderato:

```yaml title="cluster-gpu.yaml"
spec:
  nodeGroups:
    gpu-workers:
      minReplicas: 1
      maxReplicas: 4
      instanceType: "u1.2xlarge"
      gpus:
        - name: "nvidia.com/AD102GL_L40S"
  addons:
    gpuOperator:
      enabled: true
```

:::warning
- Non dimenticate di attivare l'addon `gpuOperator` affinche i driver NVIDIA vengano installati automaticamente sui nodi GPU.
- Ogni nodo del nodeGroup GPU consuma **1 GPU fisico**. Un nodeGroup con `minReplicas: 4` necessità di 4 GPU disponibili, con un impatto diretto sulla fatturazione.
:::
