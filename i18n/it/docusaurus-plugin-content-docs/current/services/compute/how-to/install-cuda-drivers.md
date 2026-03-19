---
title: Come installare CUDA e i driver GPU
---

# Comment installer CUDA et les drivers GPU

Les VMs Hikube avec un GPU attaché ne disposent pas de drivers NVIDIA pré-installés. Ce guide détaille l'installation des drivers NVIDIA et du toolkit CUDA sur une VM Ubuntu pour exploiter le GPU.

## Prerequisitiiti

- Une **VMInstance** Hikube avec un GPU attaché (voir la [référence API GPU](../../gpu/api-reference.md))
- VM basée sur **Ubuntu 24.04** (les commandes sont adaptées pour cette version)
- Un accès **SSH** ou **console** à la VM
- Droits **root** ou **sudo**

:::warning Pas de drivers pré-installés
Les golden images Hikube ne contiennent pas les drivers GPU NVIDIA. Vous devez les installer manuellement ou via cloud-init après la création de la VM.
:::

## Passi

### 1. Se connecter à la VM

```bash
virtctl ssh -i ~/.ssh/id_ed25519 ubuntu@my-gpu-vm
```

Ou via SSH direct si la VM est exposée :

```bash
ssh -i ~/.ssh/hikube-vm ubuntu@<IP-EXTERNE>
```

### 2. Vérifier la présence du GPU

Avant d'installer les drivers, vérifiez que le GPU est bien détecté par le système :

```bash
lspci | grep -i nvidia
```

**Risultato atteso :**

```
06:00.0 3D controller: NVIDIA Corporation ...
```

Si aucun GPU n'apparait, vérifiez que votre VMInstance dispose bien d'un GPU attaché dans sa configuration.

### 3. Installer les drivers NVIDIA et CUDA

Ajoutez le dépot NVIDIA et installez les drivers :

```bash
# Télécharger et installer le keyring NVIDIA
wget https://developer.download.nvidia.com/compute/cuda/repos/ubuntu2404/x86_64/cuda-keyring_1.1-1_all.deb
sudo dpkg -i cuda-keyring_1.1-1_all.deb

# Mettre à jour les paquets
sudo apt-get update

# Installer le toolkit CUDA et le driver
sudo apt-get install -y cuda-toolkit nvidia-driver-560
```

:::tip Redémarrage requis
Un redémarrage est nécessaire après l'installation des drivers pour charger les modules noyau NVIDIA.
:::

Redémarrez la VM :

```bash
sudo reboot
```

Reconnectez-vous après le redémarrage (attendez environ 1 minute) :

```bash
virtctl ssh -i ~/.ssh/id_ed25519 ubuntu@my-gpu-vm
```

### 4. Vérifier l'installation des drivers

```bash
nvidia-smi
```

**Risultato atteso :**

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

Vérifiez la version de CUDA :

```bash
nvcc --version
```

### 5. Configurer les variables d'environnement (optionnel)

Ajoutez CUDA au PATH pour un accès permanent :

```bash
echo 'export PATH=/usr/local/cuda/bin:$PATH' >> ~/.bashrc
echo 'export LD_LIBRARY_PATH=/usr/local/cuda/lib64:$LD_LIBRARY_PATH' >> ~/.bashrc
source ~/.bashrc
```

### 6. Tester avec PyTorch

Installez PyTorch avec le support CUDA pour valider que le GPU est pleinement fonctionnel :

```bash
pip3 install torch --index-url https://download.pytorch.org/whl/cu124
```

Testez la détection du GPU :

```bash
python3 -c "
import torch
print(f'CUDA disponible : {torch.cuda.is_available()}')
print(f'GPU détecté : {torch.cuda.get_device_name(0)}')
print(f'Mémoire GPU : {torch.cuda.get_device_properties(0).total_mem / 1e9:.1f} Go')
"
```

**Risultato atteso :**

```
CUDA disponible : True
GPU détecté : NVIDIA L40S
Mémoire GPU : 46.1 Go
```

## Verifica

Lancez un calcul simple sur le GPU pour confirmer le bon fonctionnement :

```bash
python3 -c "
import torch
# Créer un tenseur sur le GPU
x = torch.randn(1000, 1000, device='cuda')
y = torch.randn(1000, 1000, device='cuda')
z = torch.mm(x, y)
print(f'Calcul GPU réussi, taille du résultat : {z.shape}')
"
```

**Risultato atteso :**

```
Calcul GPU réussi, taille du résultat : torch.Size([1000, 1000])
```

:::tip Automatiser l'installation via cloud-init
Pour automatiser l'installation des drivers GPU au démarrage, utilisez le paramètre `cloudInit` de la VMInstance. Consultez le guide [Comment configurer cloud-init](./configure-cloud-init.md) pour un exemple complet.
:::

## Per approfondire

- [Référence API](../api-reference.md)
- [Référence API GPU](../../gpu/api-reference.md)
- [Comment configurer cloud-init](./configure-cloud-init.md)
