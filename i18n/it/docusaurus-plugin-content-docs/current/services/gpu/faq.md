---
sidebar_position: 6
title: FAQ
---

# FAQ — GPU

### Dove si trova la pagina GPU nella console?

Non esiste: la GPU si sceglie nella procedura guidata della risorsa che la utilizza.

- **VM**: **VM Instances** > **Create an Instance**, passaggio **Configuration**, sezione **Hardware Acceleration (GPU)**; oppure **Edit** su una VM esistente.
- **Kubernetes**: **Kubernetes** > **Create cluster** (o **Edit**), passaggio **Nodes**, sezione **GPU** di un gruppo di nodi.

---

### Quali modelli di GPU sono disponibili?

| Modello | Memoria | Casi d'uso |
|--------|---------|-------------|
| **NVIDIA L40S** | 48 GB | Inferenza, rendering, prototipazione |
| **NVIDIA A100 80GB** | 80 GB | Addestramento ML, calcolo scientifico |
| **NVIDIA H100 80GB** | 80 GB | Addestramento e inferenza di grandi modelli |
| **NVIDIA RTX 6000 Pro** | 96 GB | LLM, calcolo intensivo |

Il selettore mostra tutti i modelli; quelli che non hanno più unità libere sono contrassegnati come **Unavailable**.

---

### Perché un modello è contrassegnato come Unavailable?

Tutte le sue unità sono assegnate ad altri carichi di lavoro. La console non indica il numero di unità libere. Riprovi più tardi, scelga un altro modello oppure contatti [sales@hidora.io](mailto:sales@hidora.io) per un'esigenza di capacità.

---

### Posso assegnare più GPU a una VM?

Sì: faccia clic su una scheda, quindi usi **+** per aggiungere GPU dello stesso modello, oppure selezioni più modelli. Tutte devono essere libere su uno stesso server fisico; altrimenti la creazione non riesce con **The following GPUs are not available: …**.

---

### Qual è la differenza tra GPU in VM e GPU in Kubernetes?

| Aspetto | GPU in VM | GPU in Kubernetes |
|--------|----------|-------------------|
| **Accesso** | GPU dedicata alla VM | GPU assegnata ai pod dallo scheduler |
| **Driver** | Da installare nel sistema operativo (cloud-init o manualmente) | Installati dall'addon GPU Operator |
| **Condivisione** | No | Sì, con l'addon HAMi |
| **Casi d'uso** | Workstation, sviluppo CUDA | Carichi di lavoro containerizzati, batch, inferenza |

---

### Quale rapporto CPU/GPU è consigliato?

Preveda **da 8 a 16 vCPU per GPU**, preferibilmente nella serie **Universal (U)**:

| Configurazione | Istanza | vCPU | RAM |
|--------------|----------|------|-----|
| 1 GPU | `u1.2xlarge` | 8 | 32 GB |
| 1 GPU (intensivo) | `u1.4xlarge` | 16 | 64 GB |
| Multi-GPU | `u1.8xlarge` | 32 | 128 GB |

---

### Come vengono installati i driver NVIDIA?

**In VM**: da lei, nel sistema operativo. Segua [Installare CUDA e i driver GPU](../compute/how-to/install-cuda-drivers.md), che fornisce anche uno script cloud-init da incollare in **Cloud-Init script (User Data)**.

**In Kubernetes**: dall'addon **GPU Operator**, attivato automaticamente non appena un gruppo di nodi dispone di GPU.

---

### Che cosa succede quando arresto una VM con GPU?

La GPU viene liberata e può essere assegnata a un altro carico di lavoro. La console la avvisa nella conferma di arresto. All'avvio, se la GPU non è più disponibile, la finestra **Select an alternative GPU** Le propone un altro modello.

---

### Posso aggiungere GPU a un gruppo di nodi Kubernetes esistente?

Non a un gruppo creato senza GPU: aggiunga un nuovo gruppo di nodi con GPU. Un gruppo creato con GPU può cambiare modello o numero, mantenendo almeno una GPU.

---

### Come richiedere una GPU in un pod Kubernetes?

```yaml title="pod-gpu.yaml"
apiVersion: v1
kind: Pod
metadata:
  name: gpu-workload
spec:
  containers:
    - name: cuda-app
      image: nvidia/cuda:12.4.1-base-ubuntu22.04
      command: ["sleep", "infinity"]
      resources:
        limits:
          nvidia.com/gpu: 1
```

:::note
Senza l'addon HAMi, un pod non può richiedere una frazione di GPU: il valore di `nvidia.com/gpu` è un numero intero di GPU fisiche.
:::

---

### Come verificare che la GPU sia rilevata?

**In VM**:

```bash
lspci | grep -i nvidia   # la GPU è visibile
nvidia-smi               # i driver sono installati
```

**In Kubernetes** (con il kubeconfig del cluster, pulsante **Kubeconfig** della pagina del cluster):

```bash
kubectl get nodes -o custom-columns=NAME:.metadata.name,GPU:.status.allocatable.'nvidia\.com/gpu'
kubectl exec -it <pod> -- nvidia-smi
```
