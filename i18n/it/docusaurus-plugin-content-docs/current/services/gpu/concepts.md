---
sidebar_position: 2
title: Concetti
---

# Concetti — GPU

## Architettura

Hikube permette di collegare GPU NVIDIA direttamente alle macchine virtuali e ai cluster Kubernetes. L'allocazione GPU è gestita dal **NVIDIA GPU Operator** lato Kubernetes, e dal **passthrough PCI** lato macchine virtuali (KubeVirt).

```mermaid
graph TB
    subgraph "Hikube Platform"
        subgraph "GPU fisiche"
            G1[NVIDIA L40S]
            G2[NVIDIA A100]
            G3[NVIDIA RTX PRO 6000<br/>Blackwell]
        end

        subgraph "Allocazione VM"
            VMI[VMInstance]
            PT[PCI Passthrough]
        end

        subgraph "Allocazione Kubernetes"
            K8S[Cluster Kubernetes]
            DP[Device Plugin]
            GO[GPU Operator]
        end
    end

    G1 --> PT
    G2 --> PT
    G3 --> PT
    PT --> VMI

    G1 --> DP
    G2 --> DP
    G3 --> DP
    GO --> DP
    DP --> K8S
```

---

## Terminologia

| Termine | Descrizione |
|-------|-------------|
| **GPU Operator** | NVIDIA GPU Operator — gestisce automaticamente i driver, il device plugin e il runtime GPU sui nodi Kubernetes. |
| **Device Plugin** | Plugin Kubernetes che espone le GPU come risorse pianificabili (`nvidia.com/<model>`). |
| **PCI Passthrough** | Tecnica che assegna una GPU fisica direttamente a una VM, offrendo prestazioni native. |
| **CUDA** | Piattaforma di calcolo parallelo NVIDIA, utilizzata per l'accelerazione GPU (ML, HPC, rendering). |
| **Instance Type** | Profilo di risorse CPU/RAM della VM. Dimensionato in funzione del numero di GPU (8-16 vCPU per GPU raccomandato). |

---

## Tipi di GPU disponibili

| GPU | Architettura | Memoria | Caso d'uso |
|-----|-------------|---------|-------------|
| **L40S** | Ada Lovelace | 48 GB GDDR6 | Inferenza, sviluppo, prototipazione |
| **A100 (PCIe / SXM4)** | Ampere | 80 GB HBM2e | Addestramento ML, fine-tuning |
| **RTX PRO 6000 Blackwell** | Blackwell | 96 GB GDDR7 | LLM, calcolo intensivo, addestramento distribuito |

### Identificativi GPU nei manifest

| GPU | Valore `gpus[].name` |
|-----|----------------------|
| L40S | `nvidia.com/AD102GL_L40S` |
| A100 PCIe 80 GB | `nvidia.com/GA100_A100_PCIE_80GB` |
| A100 SXM4 80 GB | `nvidia.com/GA100_A100_SXM4_80GB` |
| RTX PRO 6000 Blackwell | `nvidia.com/GB202GL_RTX_PRO_6000_BLACKWELL_SERVER_EDITION` |

---

## GPU su macchine virtuali

Le GPU sono collegate alle VM tramite **PCI passthrough**:

- La GPU fisica è dedicata alla VM (prestazioni native)
- Dichiarata in `spec.gpus[]` del manifest `VMInstance`
- Multi-GPU possibile (ripetere le voci in `gpus[]`)
- I driver NVIDIA devono essere installati nella VM

:::tip Rapporto CPU/GPU raccomandato
Prevedete **da 8 a 16 vCPU per GPU**. Per una singola GPU, un `u1.2xlarge` (8 vCPU, 32 GB RAM) è un buon punto di partenza.
:::

---

## GPU su Kubernetes

Le GPU sono esposte ai pod tramite il **NVIDIA Device Plugin**:

- Il GPU Operator deve essere attivato sul cluster (`addons.gpuOperator.enabled: true`)
- I pod richiedono una GPU tramite `resources.limits` (`nvidia.com/gpu: 1`)
- Lo scheduler Kubernetes posiziona il pod su un nodo che dispone della GPU richiesta
- I nodi GPU sono configurati nei **node group** con il campo `gpus[]`

```mermaid
graph LR
    subgraph "Node Group GPU"
        N1[Worker Node]
        GPU[NVIDIA L40S]
        DP[Device Plugin]
    end

    subgraph "Pod"
        C[Container]
        RL[resources.limits:<br/>nvidia.com/gpu: 1]
    end

    GPU --> DP
    DP -->|expose| N1
    N1 -->|schedule| C
```

---

## Confronto VM vs Kubernetes

| Criterio | GPU su VM | GPU su Kubernetes |
|---------|-----------|-------------------|
| **Isolamento** | GPU dedicata (passthrough) | GPU condivisa tramite device plugin |
| **Prestazioni** | Prestazioni native | Prestazioni native |
| **Flessibilità** | OS completo, driver manuali | Container, scaling automatico |
| **Multi-GPU** | Tramite `spec.gpus[]` | Tramite `resources.limits` |
| **Caso d'uso** | Workstation, ambienti interattivi | Pipeline ML, inferenza su larga scala |

---

## Limiti e quote

| Parametro | Valore |
|-----------|--------|
| GPU per VM | Multipli (secondo disponibilità) |
| GPU per pod Kubernetes | Multipli (tramite `resources.limits`) |
| Tipi di GPU | L40S, A100 (PCIe/SXM4), RTX PRO 6000 Blackwell |
| Memoria GPU max | 96 GB (RTX PRO 6000 Blackwell) |

---

## Per approfondire

- [Panoramica](./overview.md): presentazione del servizio GPU
- [Riferimento API](./api-reference.md): configurazione GPU dettagliata
