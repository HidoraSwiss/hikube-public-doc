---
title: "How to install CUDA and GPU drivers"
---

# How to install CUDA and GPU drivers

Hikube VMs with an attached GPU do not come with pre-installed NVIDIA drivers. This guide details the installation of NVIDIA drivers and the CUDA toolkit on an Ubuntu VM to leverage the GPU.

## Prerequisites

- A Hikube **VMInstance** with an attached GPU (see the [GPU API reference](../../gpu/api-reference.md))
- VM based on **Ubuntu 24.04** (commands are tailored for this version)
- **SSH** or **console** access to the VM
- **root** or **sudo** privileges

:::warning No pre-installed drivers
Hikube golden images do not include NVIDIA GPU drivers. You must install them manually or via cloud-init after creating the VM.
:::

## Steps

### 1. Connect to the VM

```bash
virtctl ssh -i ~/.ssh/id_ed25519 ubuntu@my-gpu-vm
```

Or via direct SSH if the VM is exposed:

```bash
ssh -i ~/.ssh/hikube-vm ubuntu@<IP-EXTERNE>
```

### 2. Verify the GPU is detected

Before installing the drivers, verify that the GPU is properly detected by the system:

```bash
lspci | grep -i nvidia
```

**Expected output:**

```
06:00.0 3D controller: NVIDIA Corporation ...
```

If no GPU appears, verify that your VMInstance has a GPU attached in its configuration.

### 3. Install NVIDIA drivers and CUDA

Add the NVIDIA repository and install the drivers:

```bash
# Télécharger et installer le keyring NVIDIA
wget https://developer.download.nvidia.com/compute/cuda/repos/ubuntu2404/x86_64/cuda-keyring_1.1-1_all.deb
sudo dpkg -i cuda-keyring_1.1-1_all.deb

# Mettre à jour les paquets
sudo apt-get update

# Installer le toolkit CUDA et le driver
sudo apt-get install -y cuda-toolkit nvidia-driver-560
```

:::tip Reboot required
A reboot is required after installing the drivers to load the NVIDIA kernel modules.
:::

Reboot the VM:

```bash
sudo reboot
```

Reconnect after the reboot (wait approximately 1 minute):

```bash
virtctl ssh -i ~/.ssh/id_ed25519 ubuntu@my-gpu-vm
```

### 4. Verify the driver installation

```bash
nvidia-smi
```

**Expected output:**

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

Check the CUDA version:

```bash
nvcc --version
```

### 5. Configure environment variables (optional)

Add CUDA to PATH for permanent access:

```bash
echo 'export PATH=/usr/local/cuda/bin:$PATH' >> ~/.bashrc
echo 'export LD_LIBRARY_PATH=/usr/local/cuda/lib64:$LD_LIBRARY_PATH' >> ~/.bashrc
source ~/.bashrc
```

### 6. Test with PyTorch

Install PyTorch with CUDA support to validate that the GPU is fully functional:

```bash
pip3 install torch --index-url https://download.pytorch.org/whl/cu124
```

Test GPU detection:

```bash
python3 -c "
import torch
print(f'CUDA disponible : {torch.cuda.is_available()}')
print(f'GPU détecté : {torch.cuda.get_device_name(0)}')
print(f'Mémoire GPU : {torch.cuda.get_device_properties(0).total_mem / 1e9:.1f} Go')
"
```

**Expected output:**

```
CUDA disponible : True
GPU détecté : NVIDIA L40S
Mémoire GPU : 46.1 Go
```

## Verification

Run a simple computation on the GPU to confirm proper operation:

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

**Expected output:**

```
Calcul GPU réussi, taille du résultat : torch.Size([1000, 1000])
```

:::tip Automate installation via cloud-init
To automate GPU driver installation at startup, use the `cloudInit` parameter of the VMInstance. See the guide [How to configure cloud-init](./configure-cloud-init.md) for a complete example.
:::

## Going further

- [API Reference](../api-reference.md)
- [GPU API Reference](../../gpu/api-reference.md)
- [How to configure cloud-init](./configure-cloud-init.md)
