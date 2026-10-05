---
title: "Come assegnare una GPU a una VM"
---

# Come assegnare una GPU a una VM

Hikube consente di collegare una o più GPU NVIDIA a una macchina virtuale, alla creazione o in seguito. Questa guida spiega come scegliere la GPU, aggiungerla dalla console e verificare che sia utilizzabile.

## Prerequisiti

- Un account Hikube e un progetto con quote sufficienti (consigliati 8 vCPU e 32 GB di memoria per GPU)
- Una chiave SSH pubblica
- Familiarità con le [macchine virtuali](../../compute/overview.md) Hikube

## Passaggi

### 1. Scegliere il modello di GPU

| Modello | Memoria | Casi d'uso |
|--------|---------|-------------|
| **NVIDIA L40S** | 48 GB | Inferenza, sviluppo, prototipazione |
| **NVIDIA A100 80GB** | 80 GB | Addestramento ML, fine-tuning |
| **NVIDIA H100 80GB** | 80 GB | Addestramento e inferenza di grandi modelli |
| **NVIDIA RTX 6000 Pro** | 96 GB | LLM, calcolo intensivo |

:::tip Quale GPU scegliere?
Inizi con una **L40S** per lo sviluppo e la prototipazione. Passi a una **A100** o a una **H100** per l'addestramento e riservi la **RTX 6000 Pro** ai modelli che richiedono più memoria.
:::

### 2. Aggiungere la GPU alla creazione della VM

1. Apra **Infrastructure** > **VM Instances** > **Create an Instance**.
2. Passaggio **Configuration**:
   - in **Resources (CPU / RAM)**, scelga un formato adeguato, ad esempio **Universal (U)** > **2XLARGE** (8 vCPU, 32 GB) per una GPU;
   - in **Hardware Acceleration (GPU)**, faccia clic sulla scheda del modello desiderato. Usi **+** per aggiungere altre GPU dello stesso modello, oppure faccia clic su un'altra scheda per combinare più modelli.
3. Passaggio **Storage**: scelga l'immagine (ad esempio **ubuntu** 24.04) e almeno **50 GB**.
4. Passaggio **Network**: aggiunga la sua chiave SSH e le porte necessarie (ad esempio `8888` per Jupyter, tramite **Custom port...**).
5. Passaggio **Summary**: controlli la riga **Hardware Acceleration (GPU)** e il costo stimato, quindi faccia clic su **Create instance**.

:::warning Più GPU su una VM
Tutte le GPU di una VM devono essere libere sullo stesso server fisico. In caso contrario, la creazione non riesce con **The following GPUs are not available: …**. Riduca allora il numero di GPU o scelga un altro modello. Dimensioni il formato di conseguenza: un `u1.8xlarge` (32 vCPU, 128 GB) è adatto a 4 GPU.
:::

### 3. Aggiungere o cambiare una GPU su una VM esistente

1. Apra la pagina di dettaglio della VM e faccia clic su **Edit**.
2. In **Resources (CPU / RAM)**, regoli la selezione **Hardware Acceleration (GPU)** (aggiunta, rimozione, cambio di modello). Adatti il formato se necessario.
3. Faccia clic su **Save**. La console mostra **Restart required**: la VM viene riavviata con la nuova configurazione.

### 4. Installare i driver

Le immagini Hikube non contengono i driver NVIDIA. Segua [Installare CUDA e i driver GPU](../../compute/how-to/install-cuda-drivers.md), oppure incolli lo script cloud-init di quella guida in **Cloud-Init script (User Data)** al momento della creazione.

## Verifica

1. **Nella console**: la pagina di dettaglio mostra lo stato **Running** e la GPU in **GPUs** (sezione **Resources & Characteristics**), con il suo nome tecnico: `l40s`, `a100-80gb`, `h100-80gb` o `rtx-6000-pro`.
2. **Nella VM**:

```bash
ssh -i ~/.ssh/id_ed25519 ubuntu@<ip-pubblico>
lspci | grep -i nvidia
nvidia-smi --query-gpu=name,memory.total,driver_version --format=csv
```

**Risultato atteso** (dopo l'installazione dei driver):

```
name, memory.total [MiB], driver_version
NVIDIA L40S, 46068 MiB, 560.xx.xx
```

:::note Arresto di una VM con GPU
**Stop** sulla VM libera le sue GPU. All'avvio successivo, se una GPU è stata assegnata a un altro carico di lavoro, la console apre **Select an alternative GPU**: scelga un modello in **Available GPU**, quindi **Update and Start**.
:::

## Per approfondire

- [Assegnare una GPU su Kubernetes](./provision-gpu-kubernetes.md)
- [Installare CUDA e i driver GPU](../../compute/how-to/install-cuda-drivers.md)
- [Risoluzione dei problemi GPU](../troubleshooting.md)
