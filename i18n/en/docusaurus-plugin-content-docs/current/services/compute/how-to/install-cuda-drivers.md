---
title: "How to install CUDA and the GPU drivers"
---

# How to install CUDA and the GPU drivers

Hikube VMs with GPUs do not come with preinstalled NVIDIA drivers. This guide details how to install the NVIDIA drivers and the CUDA toolkit on an Ubuntu 24.04 VM.

## Prerequisites

- A Hikube VM with at least one GPU (chosen at the **Configuration** step of the wizard, see [Provision a GPU on a VM](../../gpu/how-to/provision-gpu-vm.md))
- **Ubuntu 24.04** image (the commands are tailored to this version)
- A system disk of at least **50 GB**: the CUDA toolkit and frameworks take up several tens of GB
- **SSH** access to the VM
- **root** or **sudo** privileges

:::warning No preinstalled drivers
Hikube images do not contain the NVIDIA GPU drivers. Install them manually or via cloud-init after creating the VM.
:::

## Steps

### 1. Connect to the VM

Copy the command from the **SSH Connection** block on the detail page and add your key:

```bash
ssh -i ~/.ssh/hikube-vm ubuntu@<public-ip>
```

### 2. Check that the GPU is present

```bash
lspci | grep -i nvidia
```

**Expected result:**

```
06:00.0 3D controller: NVIDIA Corporation ...
```

If no GPU appears, check on the VM detail page that the **Resources & Characteristics** section lists the GPU under **GPUs**.

### 3. Install the NVIDIA drivers and CUDA

```bash
# NVIDIA repository
wget https://developer.download.nvidia.com/compute/cuda/repos/ubuntu2404/x86_64/cuda-keyring_1.1-1_all.deb
sudo dpkg -i cuda-keyring_1.1-1_all.deb
sudo apt-get update

# CUDA toolkit and driver
sudo apt-get install -y cuda-toolkit nvidia-driver-560
```

:::tip Restart required
A restart is needed to load the NVIDIA kernel modules.
:::

```bash
sudo reboot
```

You can also run **Restart** from the **Actions** section of the detail page. Reconnect once the VM is back to **Running** status.

### 4. Check the driver installation

```bash
nvidia-smi
```

**Expected result:**

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

Check the CUDA version:

```bash
nvcc --version
```

### 5. Configure the environment variables (optional)

```bash
echo 'export PATH=/usr/local/cuda/bin:$PATH' >> ~/.bashrc
echo 'export LD_LIBRARY_PATH=/usr/local/cuda/lib64:$LD_LIBRARY_PATH' >> ~/.bashrc
source ~/.bashrc
```

### 6. Test with PyTorch

```bash
pip3 install torch --index-url https://download.pytorch.org/whl/cu124
```

```bash
python3 -c "
import torch
print(f'CUDA available: {torch.cuda.is_available()}')
print(f'GPU detected: {torch.cuda.get_device_name(0)}')
print(f'GPU memory: {torch.cuda.get_device_properties(0).total_memory / 1e9:.1f} GB')
"
```

**Expected result:**

```
CUDA available: True
GPU detected: NVIDIA L40S
GPU memory: 46.1 GB
```

## Verification

```bash
python3 -c "
import torch
x = torch.randn(1000, 1000, device='cuda')
y = torch.randn(1000, 1000, device='cuda')
z = torch.mm(x, y)
print(f'GPU computation succeeded, result size: {z.shape}')
"
```

**Expected result:**

```
GPU computation succeeded, result size: torch.Size([1000, 1000])
```

:::tip Automate the installation via cloud-init
To install the drivers from creation, paste this script into **Cloud-Init script (User Data)** at the **Network** step of the wizard:

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

See [Configure cloud-init](./configure-cloud-init.md).
:::

## Further reading

- [GPU: overview](../../gpu/overview.md)
- [GPU troubleshooting](../../gpu/troubleshooting.md)
- [Configure cloud-init](./configure-cloud-init.md)
