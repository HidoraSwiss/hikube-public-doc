---
sidebar_position: 6
title: FAQ
---

# FAQ — GPU

### Quali modelli di GPU sono disponibili?

Hikube propone tre famiglie di GPU NVIDIA:

| GPU | Architettura | Memoria | Caso d'uso |
|-----|-------------|---------|-------------|
| **L40S** | Ada Lovelace | 48 GB GDDR6 | Inferenza, rendering grafico |
| **A100** | Ampere | 80 GB HBM2e | Addestramento ML, calcolo scientifico |
| **H100** | Hopper | 80 GB HBM3 | LLM, calcolo exascale |

Gli identificativi da utilizzare nei manifest:

```yaml
gpus:
  - name: "nvidia.com/AD102GL_L40S"       # L40S
  - name: "nvidia.com/GA100_A100_PCIE_80GB" # A100
  - name: "nvidia.com/H100_94GB"           # H100
```

---

### Qual è la differenza tra GPU in VM e GPU in Kubernetes?

| Aspetto | GPU in VM | GPU in Kubernetes |
|--------|----------|-------------------|
| **Modalità di accesso** | PCI passthrough esclusivo | Device plugin condiviso |
| **Isolamento** | GPU dedicata alla VM | Scheduling orchestrato da K8s |
| **Installazione driver** | Manuale (cloud-init) | Automatica (GPU Operator) |
| **Caso d'uso** | Workstation dedicata, sviluppo CUDA | Workload containerizzati, batch |

In VM, la GPU è direttamente collegata tramite PCI passthrough: la VM ha un accesso esclusivo all'hardware. In Kubernetes, il GPU Operator gestisce i driver e lo scheduling permette di condividere le risorse GPU tra più pod.

---

### Quale rapporto CPU/GPU è raccomandato?

Per un utilizzo ottimale, prevedete **da 8 a 16 vCPU per GPU**. Le istanze della gamma **Universal (u1)** con un rapporto 1:4 sono raccomandate:

| Configurazione | Istanza | vCPU | RAM |
|--------------|----------|------|-----|
| 1 GPU | `u1.2xlarge` | 8 | 32 GB |
| 1 GPU (intensivo) | `u1.4xlarge` | 16 | 64 GB |
| Multi-GPU | `u1.8xlarge` | 32 | 128 GB |

---

### Come sono installati i driver NVIDIA?

L'installazione dipende dalla modalità di utilizzo:

**In VM**: installate manualmente tramite cloud-init all'avvio:

```yaml title="vm-gpu.yaml"
spec:
  cloudInit: |
    #cloud-config
    runcmd:
      - apt-get update
      - apt-get install -y linux-headers-$(uname -r)
      - apt-get install -y nvidia-driver-550 nvidia-utils-550
```

**In Kubernetes**: attivate l'addon GPU Operator che installa automaticamente i driver sui nodi GPU:

```yaml title="cluster-gpu.yaml"
spec:
  addons:
    gpuOperator:
      enabled: true
```

---

### Come verificare che la GPU sia rilevata?

**In VM**:

```bash
nvidia-smi
```

Questo comando visualizza le GPU rilevate, il loro utilizzo di memoria e i processi attivi.

**In Kubernetes**:

```bash
kubectl get nodes -o json | jq '.items[].status.allocatable["nvidia.com/gpu"]'
```

Potete anche verificare dall'interno di un pod:

```bash
kubectl exec -it <pod-name> -- nvidia-smi
```

---

### Come richiedere una GPU in un pod Kubernetes?

Specificate la risorsa `nvidia.com/gpu` nei limiti del container:

```yaml title="pod-gpu.yaml"
apiVersion: v1
kind: Pod
metadata:
  name: gpu-workload
spec:
  containers:
    - name: cuda-app
      image: nvidia/cuda:12.0-base
      resources:
        limits:
          nvidia.com/gpu: 1
```

:::note
Il numero di GPU richiesto in `limits` deve corrispondere alle GPU fisiche disponibili sui nodi. Un pod non può richiedere una frazione di GPU.
:::
