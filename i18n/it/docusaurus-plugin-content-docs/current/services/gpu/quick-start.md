---
sidebar_position: 3
title: Avvio rapido
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# Creare una VM con GPU

Questa guida crea una VM Ubuntu con una GPU NVIDIA dalla [console Hikube](https://console.hikube.cloud), quindi verifica che la GPU sia utilizzabile. Per GPU in un cluster Kubernetes, vedere [Assegnare una GPU su Kubernetes](./how-to/provision-gpu-kubernetes.md).

---

## Prerequisiti

- Un account Hikube e un **progetto** (vedere [Avvio rapido Hikube](../../getting-started/quick-start.md)).
- Quote disponibili: almeno 8 vCPU, 32 GB di memoria e 50 GB di storage.
- Una chiave SSH pubblica (`cat ~/.ssh/id_ed25519.pub`).

---

## Passo 1: Aprire la procedura guidata di creazione

1. Nel menu laterale, apra **Infrastructure** > **VM Instances**.
2. Faccia clic su **Create an Instance**.
3. Passaggio **General**: inserisca il nome nel campo **Instance name**, ad esempio `vm-gpu01`, quindi **Next**.

---

## Passo 2: Configurare e confermare

### Configuration: formato e GPU

1. In **Resources (CPU / RAM)**, scelga **Universal (U)** > **2XLARGE** (8 vCPU, 32 GB).
2. In **Hardware Acceleration (GPU)**, faccia clic sulla scheda **NVIDIA L40S** (o su un altro modello disponibile). Compare il badge **1 GPU total**. I pulsanti **+** e **−** della scheda regolano il numero di GPU.
3. Faccia clic su **Next**.

I modelli contrassegnati come **Unavailable** non possono essere selezionati per il momento.

### Storage

1. In **Operating System**, selezioni **ubuntu** nella versione **24.04**.
2. Porti **Size (GB)** a `50`: i driver, CUDA e i framework ML occupano diverse decine di GB.
3. Faccia clic su **Next**.

### Network

1. Lasci **Public IPv4 Address** attivato e **SSH (22)** selezionato in **Allowed Ports**.
2. Aggiunga la sua chiave in **Authorized SSH keys**.
3. Facoltativo: attivi **Cloud-Init script (User Data)** per installare i driver automaticamente (script in [Installare CUDA](../compute/how-to/install-cuda-drivers.md)).
4. Faccia clic su **Next**.

### Summary

Il **Summary** mostra una riga **Hardware Acceleration (GPU)** con il modello e la quantità. Verifichi il costo stimato, quindi faccia clic su **Create instance**.

---

## Passo 3: Verificare lo stato

Nell'elenco **VM Instances**, attenda lo stato **Running**. Nella pagina di dettaglio, la sezione **Resources & Characteristics** elenca la GPU in **GPUs**.

**Risultato atteso:** stato **Running** e un badge per GPU in **GPUs**, nella sezione **Resources & Characteristics**. Il badge riporta il nome tecnico del modello (ad esempio `l40s` per una NVIDIA L40S).

---

## Passo 4: Recuperare le informazioni di connessione

Copi il comando del blocco **SSH Connection** (sezione **Network & Security** della pagina di dettaglio), ad esempio `ssh ubuntu@203.0.113.20`.

---

## Passo 5: Connessione e test

```bash
ssh -i ~/.ssh/id_ed25519 ubuntu@203.0.113.20

# La GPU è visibile sul bus PCI
lspci | grep -i nvidia
```

**Risultato atteso:**

```
06:00.0 3D controller: NVIDIA Corporation ...
```

Installi quindi i driver NVIDIA e CUDA seguendo [Installare CUDA e i driver GPU](../compute/how-to/install-cuda-drivers.md), poi:

```bash
nvidia-smi
```

**Risultato atteso:** la tabella `nvidia-smi` elenca la GPU (ad esempio `NVIDIA L40S`) con la sua memoria.

---

## Passo 6: Risoluzione rapida dei problemi

| Sintomo | Azione |
|----------|--------|
| La sezione **Hardware Acceleration (GPU)** non compare | La piattaforma non offre alcuna GPU al momento: contatti il [supporto](mailto:support@hidora.io). |
| Tutte le schede sono **Unavailable** | Nessuna GPU libera: riprovi più tardi o contatti il supporto. |
| **The following GPUs are not available: …** durante la creazione | Le GPU richieste non sono libere contemporaneamente su uno stesso server: riduca il numero di GPU o cambi modello. |
| `lspci` non mostra alcuna GPU NVIDIA | Verifichi nella pagina di dettaglio che la GPU sia elencata; altrimenti la aggiunga tramite **Edit**. |
| `nvidia-smi: command not found` | I driver non sono installati: vedere [Installare CUDA](../compute/how-to/install-cuda-drivers.md). |

Altri casi nella [risoluzione dei problemi GPU](./troubleshooting.md).

---

## Passo 7: Pulizia

1. Nella pagina di dettaglio della VM, faccia clic su **Delete**.
2. Inserisca il nome della VM e faccia clic su **Permanently delete**.
3. Il disco di sistema resta nel menu **Disks**: lo elimini da questo menu se non le serve più.

:::tip Arrestare anziché eliminare?
**Stop** sulla VM libera la GPU, che può essere assegnata a un altro carico di lavoro: al riavvio potrebbe essere necessario scegliere un altro modello. Elimini la VM se non le serve più, la arresti se intende riavviarla.
:::

---

## Passi successivi

- [Assegnare una GPU su Kubernetes](./how-to/provision-gpu-kubernetes.md)
- [Concetti GPU](./concepts.md)
- [FAQ](./faq.md)

<NavigationFooter
  nextSteps={[
    {label: "Guide pratiche", href: "../how-to/provision-gpu-vm"},
    {label: "FAQ", href: "../faq"},
  ]}
  seeAlso={[
    {label: "Risorse di calcolo", href: "../../compute/"},
  ]}
/>
