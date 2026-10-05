---
title: "Comment installer CUDA et les drivers GPU"
---

# Comment installer CUDA et les drivers GPU

Les VM Hikube avec GPU ne disposent pas de drivers NVIDIA préinstallés. Ce guide détaille l'installation des drivers NVIDIA et du toolkit CUDA sur une VM Ubuntu 24.04.

## Prérequis

- Une VM Hikube avec au moins un GPU (choisi à l'étape **Configuration** de l'assistant, voir [Provisionner un GPU sur une VM](../../gpu/how-to/provision-gpu-vm.md))
- Image **Ubuntu 24.04** (les commandes sont adaptées à cette version)
- Un disque système d'au moins **50 Go** : le toolkit CUDA et les frameworks occupent plusieurs dizaines de Go
- Un accès **SSH** à la VM
- Droits **root** ou **sudo**

:::warning Pas de drivers préinstallés
Les images Hikube ne contiennent pas les drivers GPU NVIDIA. Installez-les manuellement ou via cloud-init après la création de la VM.
:::

## Étapes

### 1. Se connecter à la VM

Copiez la commande du bloc **Connexion SSH** de la page de détail et ajoutez votre clé :

```bash
ssh -i ~/.ssh/hikube-vm ubuntu@<ip-publique>
```

### 2. Vérifier la présence du GPU

```bash
lspci | grep -i nvidia
```

**Résultat attendu :**

```
06:00.0 3D controller: NVIDIA Corporation ...
```

Si aucun GPU n'apparaît, vérifiez sur la page de détail de la VM que la section **Ressources & Caractéristiques** liste bien le GPU sous **GPUs**.

### 3. Installer les drivers NVIDIA et CUDA

```bash
# Dépôt NVIDIA
wget https://developer.download.nvidia.com/compute/cuda/repos/ubuntu2404/x86_64/cuda-keyring_1.1-1_all.deb
sudo dpkg -i cuda-keyring_1.1-1_all.deb
sudo apt-get update

# Toolkit CUDA et driver
sudo apt-get install -y cuda-toolkit nvidia-driver-560
```

:::tip Redémarrage requis
Un redémarrage est nécessaire pour charger les modules noyau NVIDIA.
:::

```bash
sudo reboot
```

Vous pouvez aussi lancer **Redémarrer** depuis la section **Actions** de la page de détail. Reconnectez-vous quand la VM est revenue au statut **Actif**.

### 4. Vérifier l'installation des drivers

```bash
nvidia-smi
```

**Résultat attendu :**

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

Vérifiez la version de CUDA :

```bash
nvcc --version
```

### 5. Configurer les variables d'environnement (optionnel)

```bash
echo 'export PATH=/usr/local/cuda/bin:$PATH' >> ~/.bashrc
echo 'export LD_LIBRARY_PATH=/usr/local/cuda/lib64:$LD_LIBRARY_PATH' >> ~/.bashrc
source ~/.bashrc
```

### 6. Tester avec PyTorch

```bash
pip3 install torch --index-url https://download.pytorch.org/whl/cu124
```

```bash
python3 -c "
import torch
print(f'CUDA disponible : {torch.cuda.is_available()}')
print(f'GPU détecté : {torch.cuda.get_device_name(0)}')
print(f'Mémoire GPU : {torch.cuda.get_device_properties(0).total_memory / 1e9:.1f} Go')
"
```

**Résultat attendu :**

```
CUDA disponible : True
GPU détecté : NVIDIA L40S
Mémoire GPU : 46.1 Go
```

## Vérification

```bash
python3 -c "
import torch
x = torch.randn(1000, 1000, device='cuda')
y = torch.randn(1000, 1000, device='cuda')
z = torch.mm(x, y)
print(f'Calcul GPU réussi, taille du résultat : {z.shape}')
"
```

**Résultat attendu :**

```
Calcul GPU réussi, taille du résultat : torch.Size([1000, 1000])
```

:::tip Automatiser l'installation via cloud-init
Pour installer les drivers dès la création, collez ce script dans **Script Cloud-Init (User Data)** à l'étape **Réseau** de l'assistant :

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

Voir [Configurer cloud-init](./configure-cloud-init.md).
:::

## Pour aller plus loin

- [GPU : vue d'ensemble](../../gpu/overview.md)
- [Dépannage GPU](../../gpu/troubleshooting.md)
- [Configurer cloud-init](./configure-cloud-init.md)
