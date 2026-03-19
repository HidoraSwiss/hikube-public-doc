---
sidebar_position: 3
title: Riferimento API
---

# Riferimento API - GPU

Questo riferimento dettaglia le API per utilizzare le GPU su Hikube, sia con macchine virtuali che con cluster Kubernetes.

---

## 🖥️ GPU con Macchine Virtuali

### **API VirtualMachine**

```yaml
apiVersion: apps.cozystack.io/v1alpha1
kind: VirtualMachine
metadata:
  name: vm-gpu
spec:
  running: true
  instanceProfile: ubuntu
  instanceType: u1.xlarge
  gpus:
    - name: "nvidia.com/AD102GL_L40S"
```

#### **Parametri GPU per VM**

| **Parametro** | **Tipo** | **Descrizione** | **Richiesto** |
|---------------|----------|-----------------|------------|
| `gpus` | `[]GPU` | Lista delle GPU da collegare | ✅ |
| `gpus[].name` | `string` | Tipo di GPU NVIDIA | ✅ |

#### **Tipi di GPU Disponibili**

```yaml
# GPU per inferenza e sviluppo
gpus:
  - name: "nvidia.com/AD102GL_L40S"

# GPU per addestramento ML
gpus:
  - name: "nvidia.com/GA100_A100_PCIE_80GB"

# GPU per LLM e calcolo exascale
gpus:
  - name: "nvidia.com/H100_94GB"
```

#### **Specifiche Hardware**

| **GPU** | **Architettura** | **Memoria** | **Prestazioni** |
|---------|------------------|-------------|-----------------|
| **L40S** | Ada Lovelace | 48 GB GDDR6 | 362 TOPS (INT8) |
| **A100** | Ampere | 80 GB HBM2e | 312 TOPS (INT8) |
| **H100** | Hopper | 80 GB HBM3 | 1979 TOPS (INT8) |

#### **Esempio VM GPU Completo**

```yaml
apiVersion: apps.cozystack.io/v1alpha1
kind: VirtualMachine
metadata:
  name: ai-workstation
spec:
  running: true
  instanceProfile: ubuntu
  instanceType: u1.2xlarge  # 8 vCPU, 32 GB RAM
  gpus:
    - name: "nvidia.com/GA100_A100_PCIE_80GB"
  systemDisk:
    size: 200Gi
    storageClass: replicated
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
      # Driver NVIDIA
      - wget https://developer.download.nvidia.com/compute/cuda/repos/ubuntu2204/x86_64/cuda-keyring_1.0-1_all.deb
      - dpkg -i cuda-keyring_1.0-1_all.deb
      - apt-get update
      - apt-get install -y cuda-toolkit nvidia-driver-535

      # PyTorch con CUDA
      - pip3 install torch torchvision --index-url https://download.pytorch.org/whl/cu121
```

---

## ☸️ GPU con Kubernetes

### **API Kubernetes con GPU Worker**

```yaml
apiVersion: apps.cozystack.io/v1alpha1
kind: Kubernetes
metadata:
  name: cluster-gpu
spec:
  controlPlane:
    replicas: 1

  nodeGroups:
    gpu-workers:
      minReplicas: 1
      maxReplicas: 5
      instanceType: "u1.xlarge"
      ephemeralStorage: 100Gi
      gpus:
        - name: "nvidia.com/AD102GL_L40S"
```

#### **Parametri GPU per NodeGroup**

| **Parametro** | **Tipo** | **Descrizione** | **Richiesto** |
|---------------|----------|-----------------|------------|
| `nodeGroups.<name>.gpus` | `[]GPU` | GPU per i worker | ❌ |
| `gpus[].name` | `string` | Tipo di GPU NVIDIA | ✅ |

#### **Configurazione Multi-GPU**

```yaml
nodeGroups:
  gpu-intensive:
    minReplicas: 1
    maxReplicas: 2
    instanceType: "u1.4xlarge"  # 16 vCPU, 64 GB RAM
    gpus:
      - name: "nvidia.com/GA100_A100_PCIE_80GB"
      - name: "nvidia.com/GA100_A100_PCIE_80GB"
      - name: "nvidia.com/GA100_A100_PCIE_80GB"
      - name: "nvidia.com/GA100_A100_PCIE_80GB"
```

#### **Utilizzo nei Pod**

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: ml-training
spec:
  containers:
  - name: trainer
    image: pytorch/pytorch:2.0.1-cuda11.7-cudnn8-runtime
    resources:
      limits:
        nvidia.com/gpu: 1
      requests:
        nvidia.com/gpu: 1
    command:
      - python
      - train.py
```

#### **Job Multi-GPU**

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: distributed-training
spec:
  template:
    spec:
      containers:
      - name: trainer
        image: pytorch/pytorch:2.0.1-cuda11.7-cudnn8-runtime
        resources:
          limits:
            nvidia.com/gpu: 4
          requests:
            nvidia.com/gpu: 4
        env:
        - name: CUDA_VISIBLE_DEVICES
          value: "0,1,2,3"
      restartPolicy: Never
```

---

## 📋 Confronto degli Approcci

### **VM GPU vs Kubernetes GPU**

| **Aspetto** | **VM GPU** | **Kubernetes GPU** |
|------------|------------|-------------------|
| **Allocazione** | 1 GPU = 1 VM (esclusivo) | 1+ GPU per worker (condivisibile) |
| **Isolamento** | Completo a livello VM | Namespace/Pod |
| **Scaling** | Verticale (più GPU) | Orizzontale + Verticale |
| **Gestione** | Manuale tramite YAML | Orchestrata da K8s |
| **Condivisione** | No | Si (tra pod) |
| **Overhead** | Minimo | Overhead orchestrazione |

### **Quando utilizzare ciascun approccio**

#### **VM GPU raccomandata per:**

- Applicazioni legacy non containerizzate
- Necessità di accesso diretto e completo alla GPU
- Sviluppo e prototipazione
- Workload monolitici
- Applicazioni grafiche (rendering, CAD)

#### **Kubernetes GPU raccomandato per:**

- Applicazioni containerizzate
- Workload che necessitano scaling automatico
- Job paralleli e distribuiti
- Condivisione delle risorse GPU
- Pipeline ML/AI complesse

---

## 🔧 Configurazione Avanzata

### **Multi-GPU su VM**

```yaml
apiVersion: apps.cozystack.io/v1alpha1
kind: VirtualMachine
metadata:
  name: multi-gpu-vm
spec:
  instanceType: u1.8xlarge  # 32 vCPU, 128 GB RAM
  gpus:
    - name: "nvidia.com/H100_94GB"
    - name: "nvidia.com/H100_94GB"
    - name: "nvidia.com/H100_94GB"
    - name: "nvidia.com/H100_94GB"
```

### **NodeGroup specializzato GPU**

```yaml
nodeGroups:
  gpu-inference:
    minReplicas: 2
    maxReplicas: 10
    instanceType: "u1.large"
    gpus:
      - name: "nvidia.com/AD102GL_L40S"

  gpu-training:
    minReplicas: 1
    maxReplicas: 3
    instanceType: "u1.4xlarge"
    gpus:
      - name: "nvidia.com/GA100_A100_PCIE_80GB"
      - name: "nvidia.com/GA100_A100_PCIE_80GB"
```

### **Pod con GPU specifica**

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: specific-gpu-pod
spec:
  nodeSelector:
    gpu-type: "L40S"
  containers:
  - name: app
    image: nvidia/cuda:12.0-runtime-ubuntu20.04
    resources:
      limits:
        nvidia.com/gpu: 1
```

---

## ✅ Verifica e Monitoraggio

### **Verifica VM GPU**

```bash
# Accedere alla VM
virtctl ssh ubuntu@vm-gpu

# Verificare le GPU
nvidia-smi

# Test CUDA
nvidia-smi --query-gpu=name,memory.total,utilization.gpu --format=csv
```

### **Verifica Kubernetes GPU**

```bash
# Vedere le risorse GPU sui nodi
kubectl describe nodes

# Verificare l'allocazione GPU
kubectl get nodes -o custom-columns=NAME:.metadata.name,GPU:.status.allocatable.'nvidia\.com/gpu'

# Monitoraggio utilizzo GPU
kubectl top nodes
```

### **Monitoraggio GPU in un Pod**

```bash
# Exec in un pod con GPU
kubectl exec -it <pod-name> -- nvidia-smi

# Vedere le metriche GPU
kubectl exec -it <pod-name> -- nvidia-smi --query-gpu=utilization.gpu,memory.used,memory.total --format=csv -l 5
```

---

## 💡 Buone Pratiche

### **Per VM GPU:**

- Utilizzate la storage class `replicated` per la produzione
- Dimensionate CPU/RAM in base alla GPU (rapporto 8-16 vCPU per GPU)
- Installate i driver NVIDIA tramite cloud-init
- Fermate le VM quando inutilizzate per ottimizzare i costi

### **Per Kubernetes GPU:**

- Configurate resource limits appropriati
- Utilizzate nodeSelector o nodeAffinity per indirizzare GPU specifiche
- Implementate PodDisruptionBudget per i workload critici
- Monitorate l'utilizzo GPU con metriche personalizzate

### **Generale:**

- L40S per inferenza/sviluppo
- A100 per addestramento ML standard
- H100 per LLM e calcolo exascale
- Testate con L40S prima di passare a GPU più costose
