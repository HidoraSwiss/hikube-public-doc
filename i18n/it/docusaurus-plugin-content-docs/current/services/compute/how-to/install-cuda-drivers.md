---
title: "Come installare CUDA e i driver GPU"
---

# Come installare CUDA e i driver GPU

Le VM Hikube con GPU non dispongono di driver NVIDIA preinstallati. Questa guida descrive l'installazione dei driver NVIDIA e del toolkit CUDA su una VM Ubuntu 24.04.

## Prerequisiti

- Una VM Hikube con almeno una GPU (scelta al passaggio **Configuration** della procedura guidata, vedere [Assegnare una GPU a una VM](../../gpu/how-to/provision-gpu-vm.md))
- Immagine **Ubuntu 24.04** (i comandi sono adattati a questa versione)
- Un disco di sistema di almeno **50 GB**: il toolkit CUDA e i framework occupano diverse decine di GB
- Un accesso **SSH** alla VM
- Diritti **root** o **sudo**

:::warning Nessun driver preinstallato
Le immagini Hikube non contengono i driver GPU NVIDIA. Li installi manualmente o tramite cloud-init dopo la creazione della VM.
:::

## Passaggi

### 1. Connettersi alla VM

Copi il comando del blocco **SSH Connection** della pagina di dettaglio e aggiunga la sua chiave:

```bash
ssh -i ~/.ssh/hikube-vm ubuntu@<ip-pubblico>
```

### 2. Verificare la presenza della GPU

```bash
lspci | grep -i nvidia
```

**Risultato atteso:**

```
06:00.0 3D controller: NVIDIA Corporation ...
```

Se non compare alcuna GPU, verifichi nella pagina di dettaglio della VM che la sezione **Resources & Characteristics** elenchi la GPU in **GPUs**.

### 3. Installare i driver NVIDIA e CUDA

```bash
# Repository NVIDIA
wget https://developer.download.nvidia.com/compute/cuda/repos/ubuntu2404/x86_64/cuda-keyring_1.1-1_all.deb
sudo dpkg -i cuda-keyring_1.1-1_all.deb
sudo apt-get update

# Toolkit CUDA e driver
sudo apt-get install -y cuda-toolkit nvidia-driver-560
```

:::tip Riavvio necessario
È necessario un riavvio per caricare i moduli kernel NVIDIA.
:::

```bash
sudo reboot
```

Può anche avviare **Restart** dalla sezione **Actions** della pagina di dettaglio. Si riconnetta quando la VM è tornata allo stato **Running**.

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
|=========================================+======================+======================|
|   0  NVIDIA L40S                    Off | 00000000:06:00.0 Off |                    0 |
| N/A   30C    P8              20W / 350W |      0MiB / 46068MiB |      0%      Default |
+-----------------------------------------+----------------------+----------------------+
```

Verifichi la versione di CUDA:

```bash
nvcc --version
```

### 5. Configurare le variabili d'ambiente (facoltativo)

```bash
echo 'export PATH=/usr/local/cuda/bin:$PATH' >> ~/.bashrc
echo 'export LD_LIBRARY_PATH=/usr/local/cuda/lib64:$LD_LIBRARY_PATH' >> ~/.bashrc
source ~/.bashrc
```

### 6. Eseguire un test con PyTorch

```bash
pip3 install torch --index-url https://download.pytorch.org/whl/cu124
```

```bash
python3 -c "
import torch
print(f'CUDA disponibile: {torch.cuda.is_available()}')
print(f'GPU rilevata: {torch.cuda.get_device_name(0)}')
print(f'Memoria GPU: {torch.cuda.get_device_properties(0).total_memory / 1e9:.1f} GB')
"
```

**Risultato atteso:**

```
CUDA disponibile: True
GPU rilevata: NVIDIA L40S
Memoria GPU: 46.1 GB
```

## Verifica

```bash
python3 -c "
import torch
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
Per installare i driver fin dalla creazione, incolli questo script in **Cloud-Init script (User Data)** al passaggio **Network** della procedura guidata:

```yaml title="user-data.yaml"
#cloud-config
package_update: true
runcmd:
  - wget -q https://developer.download.nvidia.com/compute/cuda/repos/ubuntu2404/x86_64/cuda-keyring_1.1-1_all.deb
  - dpkg -i cuda-keyring_1.1-1_all.deb
  - apt-get update
  - apt-get install -y cuda-toolkit nvidia-driver-560
power_state:
  mode: reboot
  condition: true
```

Vedere [Configurare cloud-init](./configure-cloud-init.md).
:::

## Per approfondire

- [GPU: panoramica](../../gpu/overview.md)
- [Risoluzione dei problemi GPU](../../gpu/troubleshooting.md)
- [Configurare cloud-init](./configure-cloud-init.md)
