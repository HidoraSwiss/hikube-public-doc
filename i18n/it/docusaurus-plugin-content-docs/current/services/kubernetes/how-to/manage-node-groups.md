---
title: "Come aggiungere e modificare un node group"
---

# Come aggiungere e modificare un node group

I node group permettono di segmentare i nodi del vostro cluster Kubernetes in base alle esigenze dei vostri workload. Questa guida spiega come aggiungere, modificare e rimuovere node group nella vostra configurazione Hikube.

## Prerequisiti

- Un cluster Kubernetes Hikube distribuito (vedere l'[avvio rapido](../quick-start.md))
- `kubectl` configurato per interagire con l'API Hikube
- Il file YAML di configurazione del vostro cluster

## Fasi

### 1. Comprendere i tipi di istanze

Hikube propone tre serie di istanze adatte a diversi casi d'uso:

| Serie | Rapporto CPU:RAM | Caso d'uso |
|-------|------------------|------------|
| **S (Standard)** | 1:2 | Workload generali, applicazioni web |
| **U (Universal)** | 1:4 | Workload bilanciati, database |
| **M (Memory Optimized)** | 1:8 | Applicazioni ad alta intensita di memoria, cache |

**Dettaglio delle istanze disponibili:**

| Istanza | vCPU | RAM |
|---------|------|-----|
| `s1.small` | 1 | 2 GB |
| `s1.medium` | 2 | 4 GB |
| `s1.large` | 4 | 8 GB |
| `s1.xlarge` | 8 | 16 GB |
| `s1.2xlarge` | 16 | 32 GB |
| `s1.4xlarge` | 32 | 64 GB |
| `s1.8xlarge` | 64 | 128 GB |
| `u1.medium` | 1 | 4 GB |
| `u1.large` | 2 | 8 GB |
| `u1.xlarge` | 4 | 16 GB |
| `u1.2xlarge` | 8 | 32 GB |
| `u1.4xlarge` | 16 | 64 GB |
| `u1.8xlarge` | 32 | 128 GB |
| `m1.large` | 2 | 16 GB |
| `m1.xlarge` | 4 | 32 GB |
| `m1.2xlarge` | 8 | 64 GB |
| `m1.4xlarge` | 16 | 128 GB |
| `m1.8xlarge` | 32 | 256 GB |

### 2. Aggiungere un node group

Per aggiungere un nuovo node group, aggiungete una voce sotto `spec.nodeGroups` nel vostro file di configurazione del cluster:

```yaml title="cluster-with-compute.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Kubernetes
metadata:
  name: my-cluster
spec:
  controlPlane:
    replicas: 3

  nodeGroups:
    # Node group esistente
    general:
      minReplicas: 2
      maxReplicas: 5
      instanceType: "s1.large"
      ephemeralStorage: 50Gi
      roles:
        - ingress-nginx

    # Nuovo node group per il compute intensivo
    compute:
      minReplicas: 1
      maxReplicas: 10
      instanceType: "u1.4xlarge"
      ephemeralStorage: 100Gi
      roles: []
```

:::tip
Scegliete un nome descrittivo per i vostri node group (`compute`, `web`, `monitoring`, `gpu`) per facilitare la gestione del cluster.
:::

### 3. Modificare un node group esistente

Per modificare un node group, aggiornate i campi desiderati nel vostro file YAML. Ad esempio, per cambiare il tipo di istanza e aumentare l'archiviazione effimera:

```yaml title="cluster-updated.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Kubernetes
metadata:
  name: my-cluster
spec:
  controlPlane:
    replicas: 3

  nodeGroups:
    general:
      minReplicas: 2
      maxReplicas: 5
      instanceType: "u1.xlarge"       # Modificato: da s1.large a u1.xlarge
      ephemeralStorage: 100Gi          # Modificato: da 50Gi a 100Gi
      roles:
        - ingress-nginx
```

:::warning
Il cambio di `instanceType` provoca un rolling update dei nodi del gruppo. Assicuratevi che il vostro cluster disponga di capacità sufficiente per assorbire il carico durante l'aggiornamento.
:::

### 4. Rimuovere un node group

Per rimuovere un node group, eliminate semplicemente il suo blocco dalla configurazione e ri-applicate:

```yaml title="cluster-simplified.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Kubernetes
metadata:
  name: my-cluster
spec:
  controlPlane:
    replicas: 3

  nodeGroups:
    general:
      minReplicas: 2
      maxReplicas: 5
      instanceType: "s1.large"
      ephemeralStorage: 50Gi
      roles:
        - ingress-nginx
    # Il node group "compute" è stato rimosso
```

:::warning
Prima di rimuovere un node group, assicuratevi che i workload in esecuzione su di esso possano essere ripianificati su altri gruppi. Utilizzate `kubectl drain` sui nodi interessati se necessario.
:::

### 5. Applicare le modifiche

Applicate le modifiche con `kubectl`:

```bash
kubectl apply -f cluster-updated.yaml
```

## Verifica

Verificate che le modifiche siano state prese in carico:

```bash
# Verificare la configurazione del cluster
kubectl get kubernetes my-cluster -o yaml | grep -A 15 nodeGroups

# Osservare i nodi del cluster figlio
kubectl --kubeconfig=cluster-admin.yaml get nodes -w

# Verificare le macchine in corso di provisioning
kubectl get machines -l cluster.x-k8s.io/cluster-name=my-cluster
```

**Risultato atteso:**

```console
NAME                         STATUS   ROLES    AGE   VERSION
my-cluster-general-xxxxx     Ready    <none>   10m   v1.29.0
my-cluster-compute-yyyyy     Ready    <none>   2m    v1.29.0
```

## Per approfondire

- [Riferimento API](../api-reference.md) -- Dettaglio completo dei campi `nodeGroups`
- [Concetti](../concepts.md) -- Architettura dei node group Hikube
- [Come configurare l'autoscaling](./configure-autoscaling.md) -- Gestire lo scaling automatico dei node group
