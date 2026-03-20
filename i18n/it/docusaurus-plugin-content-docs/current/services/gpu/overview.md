---
sidebar_position: 1
title: Panoramica dei GPU
---

# GPU su Hikube

Hikube propone l'accesso agli acceleratori **NVIDIA** tramite GPU Passthrough, permettendo l'esecuzione di workload che necessitano di accelerazione hardware. Le GPU sono disponibili per due tipi di workload: macchine virtuali e pod Kubernetes.

---

## 🎯 Tipi di Utilizzo

### **GPU con Macchine Virtuali**

Le GPU possono essere collegate direttamente alle macchine virtuali tramite GPU passthrough VFIO-PCI, offrendo un accesso completo ed esclusivo all'acceleratore.

**Casi d'uso:**

- Applicazioni che necessitano un controllo completo della GPU
- Workload legacy o specializzati
- Ambienti di sviluppo isolati
- Applicazioni grafiche (rendering, CAD)

### **GPU con Kubernetes**

Le GPU possono essere allocate ai worker Kubernetes e poi assegnate ai pod tramite le resource requests/limits.

**Casi d'uso:**

- Workload containerizzati di IA/ML
- Scaling automatico delle applicazioni GPU
- Condivisione delle risorse GPU tra applicazioni
- Orchestrazione complessa di job paralleli

---

## 🖥️ Hardware Disponibile

Hikube propone tre tipi di GPU NVIDIA:

### **NVIDIA L40S**

- **Architettura**: Ada Lovelace
- **Memoria**: 48 GB GDDR6 con ECC
- **Prestazioni**: 362 TOPS (INT8), 91.6 TFLOPs (FP32)
- **Uso tipico**: IA generativa, inferenza, rendering tempo reale

### **NVIDIA A100**

- **Architettura**: Ampere
- **Memoria**: 80 GB HBM2e con ECC
- **Prestazioni**: 312 TOPS (INT8), 624 TFLOPs (Tensor)
- **Uso tipico**: Addestramento ML, calcolo ad alte prestazioni

### **NVIDIA H100**

- **Architettura**: Hopper
- **Memoria**: 80 GB HBM3 con ECC
- **Prestazioni**: 1979 TOPS (INT8), 989 TFLOPs (Tensor)
- **Uso tipico**: LLM, transformer, calcolo exascale

---

## 🏗️ Architettura

### **Allocazione GPU con VM**

```mermaid
flowchart TD
    subgraph HIKUBE["Infrastructure Hikube"]
        subgraph NODE["Nœud Physique"]
            GPU1["🎮 GPU L40S"]
            GPU2["🎮 GPU A100"]
            GPU3["🎮 GPU H100"]
        end

        subgraph VM1["VM Instance"]
            APP1["Application GPU"]
        end
    end

    GPU1 --> VM1
    VM1 --> APP1

    style GPU1 fill:#90EE90
    style VM1 fill:#FFE4B5
    style APP1 fill:#ADD8E6
```

### **Allocazione GPU con Kubernetes**

```mermaid
flowchart TD
    subgraph CLUSTER["Cluster Kubernetes"]
        subgraph WORKER["Worker Node"]
            GPU1["🎮 GPU L40S"]
            GPU2["🎮 GPU A100"]
            KUBELET["kubelet"]
        end

        subgraph POD1["Pod"]
            CONTAINER1["Container GPU"]
        end

        subgraph POD2["Pod"]
            CONTAINER2["Container GPU"]
        end
    end

    GPU1 --> KUBELET
    GPU2 --> KUBELET
    KUBELET --> POD1
    KUBELET --> POD2
    POD1 --> CONTAINER1
    POD2 --> CONTAINER2

    style GPU1 fill:#90EE90
    style GPU2 fill:#90EE90
    style POD1 fill:#FFE4B5
    style POD2 fill:#FFE4B5
```

---

## ⚙️ Configurazione

### **GPU su VM**

```yaml
apiVersion: apps.cozystack.io/v1alpha1
kind: VirtualMachine
spec:
  instanceType: "u1.xlarge"
  gpus:
    - name: "nvidia.com/AD102GL_L40S"
```

### **GPU su Kubernetes Worker**

```yaml
apiVersion: apps.cozystack.io/v1alpha1
kind: Kubernetes
spec:
  nodeGroups:
    gpu-workers:
      instanceType: "u1.xlarge"
      gpus:
        - name: "nvidia.com/AD102GL_L40S"
```

### **GPU in Pod Kubernetes**

```yaml
apiVersion: v1
kind: Pod
spec:
  containers:
  - name: gpu-app
    image: nvidia/cuda:12.0-runtime-ubuntu20.04
    resources:
      limits:
        nvidia.com/gpu: 1
```

---

## 📋 Confronto degli Approcci

| **Aspetto** | **GPU su VM** | **GPU su Kubernetes** |
|------------|----------------|------------------------|
| **Isolamento** | Completo (1 GPU = 1 VM) | Condiviso (orchestrato) |
| **Prestazioni** | Native (passthrough) | Native (device plugin) |
| **Gestione** | Manuale | Automatizzata |
| **Scaling** | Solo verticale | Orizzontale + Verticale |
| **Condivisione** | No | Si (tra pod) |
| **Complessità** | Semplice | Complessa |

---

## 🚀 Prossimi Passi

### **Per le Macchine Virtuali**

- [Creare una VM GPU](./quick-start.md) → Guida pratica
- [Riferimento API](./api-reference.md) → Configurazione completa

### **Per Kubernetes**

- [Cluster GPU](../kubernetes/overview.md) → Worker con GPU
  - [Configurazione avanzata](../kubernetes/api-reference.md) → NodeGroup GPU
