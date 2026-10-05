---
title: "Come assegnare una GPU su Kubernetes"
---

# Come assegnare una GPU su Kubernetes

Hikube consente di aggiungere gruppi di nodi dotati di GPU NVIDIA ai suoi cluster Kubernetes gestiti. Questa guida spiega come configurare tale gruppo nella console, quindi distribuire pod che utilizzano la GPU.

## Prerequisiti

- Un account Hikube e un progetto con quote sufficienti
- [kubectl](https://kubernetes.io/docs/tasks/tools/#kubectl) installato sulla sua postazione
- Familiarità con il [Kubernetes gestito](../../kubernetes/overview.md) di Hikube

## Passaggi

### 1. Aggiungere un gruppo di nodi GPU

**Nuovo cluster**: apra **Infrastructure** > **Kubernetes** > **Create cluster**, compili il passaggio **General**, quindi passi al passaggio **Nodes**.

**Cluster esistente**: apra il cluster, faccia clic su **Edit** e vada in **Node groups**.

Quindi:

1. Faccia clic su **Add node group**.
2. **Group name**: ad esempio `gpu-workers`.
3. **Instance type**: scelga la serie e la dimensione, ad esempio **Universal (U)** > **2XLARGE** (8 vCPU, 32 GB).
4. **Ephemeral storage size**: preveda spazio sufficiente per le immagini di container CUDA, ad esempio `100` GB.
5. **Minimum nodes** e **Maximum nodes**: ad esempio `1` e `3`.
6. Sezione **GPU**: faccia clic sulla scheda del modello desiderato (ad esempio **NVIDIA L40S**); **+** e **−** regolano il numero di GPU **per nodo**.

:::tip Separare CPU e GPU
Mantenga un gruppo di nodi senza GPU per i carichi di lavoro tradizionali e riservi il gruppo GPU ai pod che ne hanno bisogno: ogni gruppo si dimensiona in modo indipendente.
:::

:::warning Gruppi esistenti
Un gruppo creato **senza** GPU non può riceverne (**This node group was created without GPUs and cannot get any.**). Un gruppo creato **con** GPU può cambiare modello o numero, ma deve mantenere almeno una GPU. Per cambiare categoria, aggiunga un nuovo gruppo di nodi.
:::

### 2. Verificare gli addon

Al passaggio **Addons** (sezione **Extensions & Addons** in modifica), **GPU Operator** è selezionato e bloccato (**Required when a node group has GPUs**): installa i driver NVIDIA e il device plugin sui nodi GPU.

Attivi anche **HAMi** se desidera condividere una stessa GPU tra più pod.

### 3. Distribuire

Al passaggio **Summary**, il gruppo GPU mostra il modello e la quantità (ad esempio `l40s (x1)`). Faccia clic su **Create cluster** (o su **Save** per un cluster esistente).

Attenda che il cluster sia **Ready** o **Running** nell'elenco dei cluster.

### 4. Recuperare il kubeconfig del cluster

Nella pagina di dettaglio del cluster, faccia clic su **Kubeconfig**. La console scarica `kubeconfig-<nome-del-cluster>.yaml`.

```bash
export KUBECONFIG=~/Downloads/kubeconfig-<nome-del-cluster>.yaml
kubectl get nodes
```

### 5. Verificare le GPU sui nodi

Una volta avviati i pod del GPU Operator (qualche minuto dopo l'arrivo dei nodi):

```bash
kubectl get nodes -o custom-columns=NAME:.metadata.name,GPU:.status.allocatable.'nvidia\.com/gpu'
```

**Risultato atteso:** i nodi del gruppo GPU mostrano `1` (o il numero di GPU per nodo scelto), gli altri `<none>`.

### 6. Distribuire un pod con GPU

```yaml title="gpu-pod.yaml"
apiVersion: v1
kind: Pod
metadata:
  name: gpu-test
spec:
  restartPolicy: Never
  containers:
  - name: cuda-test
    image: nvidia/cuda:12.4.1-base-ubuntu22.04
    command: ["nvidia-smi"]
    resources:
      limits:
        nvidia.com/gpu: 1
```

```bash
kubectl apply -f gpu-pod.yaml
kubectl wait --for=jsonpath='{.status.phase}'=Succeeded pod/gpu-test --timeout=300s
kubectl logs gpu-test
```

**Risultato atteso:** la tabella `nvidia-smi` elenca la GPU (ad esempio `NVIDIA L40S`).

### 7. Indirizzare un modello di GPU

Se i suoi gruppi utilizzano modelli diversi, li indirizzi con l'etichetta applicata dal GPU Operator (rilevamento delle funzionalità GPU):

```bash
kubectl get nodes -L nvidia.com/gpu.product
```

```yaml title="inference-deployment.yaml"
apiVersion: apps/v1
kind: Deployment
metadata:
  name: model-serving
spec:
  replicas: 2
  selector:
    matchLabels:
      app: model-serving
  template:
    metadata:
      labels:
        app: model-serving
    spec:
      nodeSelector:
        nvidia.com/gpu.product: <valore mostrato dal comando precedente>
      containers:
      - name: inference
        image: my-model:latest
        resources:
          limits:
            nvidia.com/gpu: 1
```

## Verifica

```bash
# GPU allocabili per nodo
kubectl get nodes -o custom-columns=NAME:.metadata.name,GPU:.status.allocatable.'nvidia\.com/gpu'

# GPU già assegnate su un nodo
kubectl describe node <nome-del-nodo> | grep -A 8 "Allocated resources"

# Pod del GPU Operator
kubectl get pods -A | grep -i gpu-operator
```

## Per approfondire

- [Plugin GPU Operator](../../kubernetes/plugins/gpu-operator.md)
- [Gestire i gruppi di nodi](../../kubernetes/how-to/manage-node-groups.md)
- [Configurare l'autoscaling](../../kubernetes/how-to/configure-autoscaling.md)
- [Assegnare una GPU a una VM](./provision-gpu-vm.md)
