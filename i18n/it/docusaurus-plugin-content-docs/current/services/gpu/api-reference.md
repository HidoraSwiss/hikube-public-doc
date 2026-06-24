---
sidebar_position: 3
title: Riferimento API
---

# Riferimento API - GPU

Questo riferimento dettaglia l'utilizzo delle GPU su Hikube, sia con macchine virtuali (`VMInstance`) che con cluster Kubernetes gestiti (`Kubernetes`).

---

## 🎮 GPU disponibili

Le GPU sono collegate tramite il loro **nome di risorsa** (`nvidia.com/<modello>`). I modelli disponibili su Hikube:

| GPU | Nome di risorsa | Architettura | Memoria | Uso tipico |
|-----|------------------|--------------|---------|---------------|
| **L40S** | `nvidia.com/AD102GL_L40S` | Ada Lovelace | 48 GB GDDR6 | Inferenza, sviluppo, rendering |
| **A100 PCIe 80 GB** | `nvidia.com/GA100_A100_PCIE_80GB` | Ampere | 80 GB HBM2e | Addestramento ML |
| **A100 SXM4 80 GB** | `nvidia.com/GA100_A100_SXM4_80GB` | Ampere | 80 GB HBM2e | Addestramento ML (multi-GPU NVLink) |
| **RTX PRO 6000 Blackwell** | `nvidia.com/GB202GL_RTX_PRO_6000_BLACKWELL_SERVER_EDITION` | Blackwell | 96 GB GDDR7 | LLM, calcolo intensivo |

:::note Disponibilità
L'hardware GPU disponibile varia in base alla zona. Verificate le risorse allocabili lato piattaforma prima di pianificare un workload. Il driver NVIDIA richiede **almeno 4 GiB di RAM** sulla VM o sul worker.
:::

---

## 🖥️ GPU con Macchine Virtuali

Su una VM, la GPU è collegata in **passthrough PCI** (allocazione esclusiva) tramite il campo `gpus` di una risorsa [`VMInstance`](../compute/api-reference.md). Il disco è definito separatamente da una risorsa [`VMDisk`](../compute/api-reference.md#vmdisk).

```yaml title="vm-gpu.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: VMInstance
metadata:
  name: vm-gpu
spec:
  runStrategy: Always
  instanceProfile: ubuntu
  instanceType: u1.xlarge
  gpus:
    - name: "nvidia.com/AD102GL_L40S"
  disks:
    - name: vm-gpu-disk
```

:::warning Errori frequenti
- La risorsa si chiama **`VMInstance`** (non `VirtualMachine`).
- Lo stato si controlla tramite **`runStrategy: Always`** (non `running: true`).
- Il disco **non** è un campo `systemDisk` integrato: create una risorsa `VMDisk` e referenziatela in `disks` (lista di oggetti `{name}`).
:::

### Parametri GPU per VM

| **Parametro** | **Tipo** | **Descrizione** | **Richiesto** |
|---------------|----------|-----------------|------------|
| `gpus` | `[]object` | Lista delle GPU da collegare | no |
| `gpus[].name` | `string` | Nome della risorsa GPU (`nvidia.com/...`) | sì (se `gpus` definito) |

### Esempio VM GPU completo

```yaml title="ai-workstation.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: VMDisk
metadata:
  name: ai-workstation-disk
spec:
  source:
    image:
      name: ubuntu-2404
  storage: 200Gi
  storageClass: replicated
---
apiVersion: apps.cozystack.io/v1alpha1
kind: VMInstance
metadata:
  name: ai-workstation
spec:
  runStrategy: Always
  instanceProfile: ubuntu
  instanceType: u1.2xlarge  # 8 vCPU, 32 GB RAM
  gpus:
    - name: "nvidia.com/GA100_A100_PCIE_80GB"
  disks:
    - name: ai-workstation-disk
  external: true
  externalMethod: PortList
  externalPorts:
    - 22
    - 8888  # Jupyter
  cloudInit: |
    #cloud-config
    users:
      - name: ubuntu
        sudo: ALL=(ALL) NOPASSWD:ALL
    packages:
      - python3-pip
      - build-essential
    runcmd:
      # Driver NVIDIA + CUDA (vedi la guida dedicata per la versione esatta)
      - wget https://developer.download.nvidia.com/compute/cuda/repos/ubuntu2404/x86_64/cuda-keyring_1.1-1_all.deb
      - dpkg -i cuda-keyring_1.1-1_all.deb
      - apt-get update
      - apt-get install -y cuda-toolkit nvidia-driver-570
      # PyTorch con CUDA
      - pip3 install torch torchvision
```

### Multi-GPU su VM

```yaml
spec:
  instanceType: u1.8xlarge  # 32 vCPU, 128 GB RAM
  gpus:
    - name: "nvidia.com/GA100_A100_SXM4_80GB"
    - name: "nvidia.com/GA100_A100_SXM4_80GB"
    - name: "nvidia.com/GA100_A100_SXM4_80GB"
    - name: "nvidia.com/GA100_A100_SXM4_80GB"
```

---

## ☸️ GPU con Kubernetes

Su un cluster Kubernetes gestito, le GPU sono collegate ai **node group**, e l'addon **`gpuOperator`** deve essere attivato per esporre le GPU ai pod.

```yaml title="cluster-gpu.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Kubernetes
metadata:
  name: cluster-gpu
spec:
  controlPlane:
    replicas: 2

  nodeGroups:
    gpu-workers:
      minReplicas: 1
      maxReplicas: 5
      instanceType: "u1.xlarge"
      ephemeralStorage: 100Gi
      gpus:
        - name: "nvidia.com/AD102GL_L40S"

  addons:
    # Richiesto: installa i driver NVIDIA e il device plugin
    gpuOperator:
      enabled: true
```

:::warning Addon `gpuOperator` richiesto
Senza `gpuOperator: enabled: true`, le GPU dei worker non sono esposte ai pod (`nvidia.com/gpu` resta a 0).
:::

### Parametri GPU per NodeGroup

| **Parametro** | **Tipo** | **Descrizione** | **Richiesto** |
|---------------|----------|-----------------|------------|
| `nodeGroups.<name>.gpus` | `[]object` | GPU collegate ai worker del gruppo | no |
| `gpus[].name` | `string` | Nome della risorsa GPU (`nvidia.com/...`) | sì (se `gpus` definito) |
| `addons.gpuOperator.enabled` | `boolean` | Attiva il NVIDIA GPU Operator | sì (per utilizzare le GPU) |

### Configurazione Multi-GPU per worker

```yaml
nodeGroups:
  gpu-intensive:
    minReplicas: 1
    maxReplicas: 2
    instanceType: "u1.4xlarge"  # 16 vCPU, 64 GB RAM
    gpus:
      - name: "nvidia.com/GA100_A100_SXM4_80GB"
      - name: "nvidia.com/GA100_A100_SXM4_80GB"
      - name: "nvidia.com/GA100_A100_SXM4_80GB"
      - name: "nvidia.com/GA100_A100_SXM4_80GB"
```

### Utilizzo nei Pod

Una volta attivo il `gpuOperator`, i pod riservano le GPU tramite la risorsa `nvidia.com/gpu`:

```yaml title="ml-training.yaml"
apiVersion: v1
kind: Pod
metadata:
  name: ml-training
spec:
  containers:
  - name: trainer
    image: pytorch/pytorch:2.4.1-cuda12.4-cudnn9-runtime
    resources:
      limits:
        nvidia.com/gpu: 1
      requests:
        nvidia.com/gpu: 1
    command: ["python", "train.py"]
```

---

## 📋 VM GPU vs Kubernetes GPU

| **Aspetto** | **VM GPU** | **Kubernetes GPU** |
|------------|------------|-------------------|
| **Allocazione** | 1 GPU = 1 VM (passthrough esclusivo) | 1+ GPU per worker |
| **Isolamento** | Completo a livello VM | Namespace / Pod |
| **Scaling** | Verticale (più GPU) | Orizzontale + Verticale (autoscaling) |
| **Gestione** | Manuale tramite `VMInstance` | Orchestrata da Kubernetes |
| **Condivisione** | No | Sì (tra pod) |
| **Overhead** | Minimo | Overhead di orchestrazione |

**VM GPU**: applicazioni non containerizzate, accesso diretto alla GPU, sviluppo/prototipazione, rendering/CAD.

**Kubernetes GPU**: workload containerizzati, autoscaling, job paralleli/distribuiti, pipeline ML/AI.

---

## ✅ Verifica

### VM GPU

```bash
virtctl ssh ubuntu@vm-gpu
nvidia-smi
nvidia-smi --query-gpu=name,memory.total,utilization.gpu --format=csv
```

### Kubernetes GPU

```bash
# GPU esposte sui nodi (richiede gpuOperator attivo)
kubectl get nodes -o custom-columns=NAME:.metadata.name,GPU:.status.allocatable.'nvidia\.com/gpu'

# Verificare dall'interno di un pod
kubectl exec -it <pod-name> -- nvidia-smi
```

---

## 💡 Buone Pratiche

- **L40S** per l'inferenza e lo sviluppo, **A100** per l'addestramento ML, **RTX PRO 6000 (Blackwell)** per i workload più esigenti.
- Testate con un L40S prima di riservare le GPU più costose.
- Dimensionate CPU/RAM in funzione della GPU (≈ 8–16 vCPU per GPU) e prevedete ≥ 4 GiB di RAM.
- Su VM: installate i driver NVIDIA tramite cloud-init (vedi [Installare i driver CUDA](../compute/how-to/install-cuda-drivers.md)).
- Su Kubernetes: attivate sempre l'addon `gpuOperator`.
- Utilizzate la `storageClass` `replicated` in produzione.
