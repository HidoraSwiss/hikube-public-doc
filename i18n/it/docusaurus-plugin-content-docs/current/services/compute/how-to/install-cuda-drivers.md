---
title: "Come installare CUDA e i driver GPU"
---

# Come installare CUDA e i driver GPU

Le VM Hikube con una GPU collegata non dispongono di driver NVIDIA preinstallati. Questa guida descrive l'installazione dei driver NVIDIA e del toolkit CUDA su una VM Ubuntu per sfruttare la GPU.

## Prerequisiti

- Una **VMInstance** Hikube con una GPU collegata (vedere il [riferimento API GPU](../../gpu/api-reference.md))
- VM basata su **Ubuntu 24.04** (i comandi sono adattati per questa versione)
- Un accesso **SSH** o **console** alla VM
- Diritti **root** o **sudo**

:::warning Nessun driver preinstallato
Le golden image Hikube non contengono i driver GPU NVIDIA. Dovete installarli manualmente o tramite cloud-init dopo la creazione della VM.
:::

## Passi

### 1. Connettersi alla VM

```bash
virtctl ssh -i ~/.ssh/id_ed25519 ubuntu@my-gpu-vm
```

O tramite SSH diretto se la VM è esposta:

```bash
ssh -i ~/.ssh/hikube-vm ubuntu@<IP-ESTERNO>
```

### 2. Verificare la presenza della GPU

Prima di installare i driver, verificate che la GPU sia ben rilevata dal sistema:

```bash
lspci | grep -i nvidia
```

**Risultato atteso:**

```
06:00.0 3D controller: NVIDIA Corporation ...
```

Se nessuna GPU appare, verificate che la vostra VMInstance disponga di una GPU collegata nella sua configurazione.

### 3. Installare i driver NVIDIA e CUDA

Aggiungete il repository NVIDIA e installate i driver:

```bash
# Scaricare e installare il keyring NVIDIA
wget https://developer.download.nvidia.com/compute/cuda/repos/ubuntu2404/x86_64/cuda-keyring_1.1-1_all.deb
sudo dpkg -i cuda-keyring_1.1-1_all.deb

# Aggiornare i pacchetti
sudo apt-get update

# Installare il toolkit CUDA e il driver
sudo apt-get install -y cuda-toolkit nvidia-driver-560
```

:::tip Riavvio necessario
Un riavvio è necessario dopo l'installazione dei driver per caricare i moduli kernel NVIDIA.
:::

Riavviate la VM:

```bash
sudo reboot
```

Riconnettetevi dopo il riavvio (attendete circa 1 minuto):

```bash
virtctl ssh -i ~/.ssh/id_ed25519 ubuntu@my-gpu-vm
```

### 4. Verificare l'installazione dei driver

```bash
nvidia-smi
```

**Risultato atteso:**

```
+---------------------------------------------------------------------------------------+
| NVIDIA-SMI 560.xx.xx    Driver Version: 560.xx.xx    CUDA Version: 12.x              |
|-----------------------------------------+----------------------+----------------------+
| GPU  Name                 Persistence-M | Bus-Id        Disp.A | Volatile Uncorr. ECC |
| Fan  Temp   Perf          Pwr:Usage/Cap |         Memory-Usage | GPU-Util  Compute M. |
|=========================================+======================+======================|
|   0  NVIDIA L40S                    Off | 00000000:06:00.0 Off |                    0 |
| N/A   30C    P8              20W / 350W |      0MiB / 46068MiB |      0%      Default |
+-----------------------------------------+----------------------+----------------------+
```

Verificate la versione di CUDA:

```bash
nvcc --version
```

### 5. Configurare le variabili d'ambiente (opzionale)

Aggiungete CUDA al PATH per un accesso permanente:

```bash
echo 'export PATH=/usr/local/cuda/bin:$PATH' >> ~/.bashrc
echo 'export LD_LIBRARY_PATH=/usr/local/cuda/lib64:$LD_LIBRARY_PATH' >> ~/.bashrc
source ~/.bashrc
```

### 6. Testare con PyTorch

Installate PyTorch con il supporto CUDA per validare che la GPU sia pienamente funzionale:

```bash
pip3 install torch --index-url https://download.pytorch.org/whl/cu124
```

Testate il rilevamento della GPU:

```bash
python3 -c "
import torch
print(f'CUDA disponibile: {torch.cuda.is_available()}')
print(f'GPU rilevata: {torch.cuda.get_device_name(0)}')
print(f'Memoria GPU: {torch.cuda.get_device_properties(0).total_mem / 1e9:.1f} GB')
"
```

**Risultato atteso:**

```
CUDA disponibile: True
GPU rilevata: NVIDIA L40S
Memoria GPU: 46.1 GB
```

## Verifica

Lanciate un calcolo semplice sulla GPU per confermare il buon funzionamento:

```bash
python3 -c "
import torch
# Creare un tensore sulla GPU
x = torch.randn(1000, 1000, device='cuda')
y = torch.randn(1000, 1000, device='cuda')
z = torch.mm(x, y)
print(f'Calcolo GPU riuscito, dimensione del risultato: {z.shape}')
"
```

**Risultato atteso:**

```
Calcolo GPU riuscito, dimensione del risultato: torch.Size([1000, 1000])
```

:::tip Automatizzare l'installazione tramite cloud-init
Per automatizzare l'installazione dei driver GPU all'avvio, utilizzate il parametro `cloudInit` della VMInstance. Consultate la guida [Come configurare cloud-init](./configure-cloud-init.md) per un esempio completo.
:::

## Per approfondire

- [Riferimento API](../api-reference.md)
- [Riferimento API GPU](../../gpu/api-reference.md)
- [Come configurare cloud-init](./configure-cloud-init.md)
