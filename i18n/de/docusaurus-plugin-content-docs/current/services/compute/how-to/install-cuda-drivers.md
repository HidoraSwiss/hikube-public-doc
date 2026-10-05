---
title: "CUDA und die GPU-Treiber installieren"
---

# CUDA und die GPU-Treiber installieren

Hikube-VMs mit GPU verfügen über keine vorinstallierten NVIDIA-Treiber. Diese Anleitung beschreibt die Installation der NVIDIA-Treiber und des CUDA-Toolkits auf einer Ubuntu-24.04-VM.

## Voraussetzungen

- Eine Hikube-VM mit mindestens einer GPU (im Schritt **Configuration** des Assistenten gewählt, siehe [Eine GPU für eine VM bereitstellen](../../gpu/how-to/provision-gpu-vm.md))
- Image **Ubuntu 24.04** (die Befehle sind auf diese Version abgestimmt)
- Eine System-Disk mit mindestens **50 GB**: Das CUDA-Toolkit und die Frameworks belegen mehrere Dutzend GB
- Ein **SSH**-Zugang zur VM
- **root**- oder **sudo**-Rechte

:::warning Keine vorinstallierten Treiber
Die Hikube-Images enthalten keine NVIDIA-GPU-Treiber. Installieren Sie sie nach der Erstellung der VM manuell oder über cloud-init.
:::

## Schritte

### 1. Sich mit der VM verbinden

Kopieren Sie den Befehl aus dem Block **SSH Connection** der Detailseite und ergänzen Sie Ihren Schlüssel:

```bash
ssh -i ~/.ssh/hikube-vm ubuntu@<public-ip>
```

### 2. Das Vorhandensein der GPU prüfen

```bash
lspci | grep -i nvidia
```

**Erwartetes Ergebnis:**

```
06:00.0 3D controller: NVIDIA Corporation ...
```

Wenn keine GPU erscheint, prüfen Sie auf der Detailseite der VM, dass der Abschnitt **Resources & Characteristics** die GPU unter **GPUs** aufführt.

### 3. Die NVIDIA-Treiber und CUDA installieren

```bash
# NVIDIA-Repository
wget https://developer.download.nvidia.com/compute/cuda/repos/ubuntu2404/x86_64/cuda-keyring_1.1-1_all.deb
sudo dpkg -i cuda-keyring_1.1-1_all.deb
sudo apt-get update

# CUDA-Toolkit und Treiber
sudo apt-get install -y cuda-toolkit nvidia-driver-560
```

:::tip Neustart erforderlich
Ein Neustart ist notwendig, um die NVIDIA-Kernelmodule zu laden.
:::

```bash
sudo reboot
```

Sie können auch **Restart** im Abschnitt **Actions** der Detailseite starten. Verbinden Sie sich erneut, sobald die VM wieder den Status **Running** hat.

### 4. Die Installation der Treiber prüfen

```bash
nvidia-smi
```

**Erwartetes Ergebnis:**

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

Prüfen Sie die CUDA-Version:

```bash
nvcc --version
```

### 5. Die Umgebungsvariablen konfigurieren (optional)

```bash
echo 'export PATH=/usr/local/cuda/bin:$PATH' >> ~/.bashrc
echo 'export LD_LIBRARY_PATH=/usr/local/cuda/lib64:$LD_LIBRARY_PATH' >> ~/.bashrc
source ~/.bashrc
```

### 6. Mit PyTorch testen

```bash
pip3 install torch --index-url https://download.pytorch.org/whl/cu124
```

```bash
python3 -c "
import torch
print(f'CUDA verfügbar: {torch.cuda.is_available()}')
print(f'Erkannte GPU: {torch.cuda.get_device_name(0)}')
print(f'GPU-Speicher: {torch.cuda.get_device_properties(0).total_memory / 1e9:.1f} GB')
"
```

**Erwartetes Ergebnis:**

```
CUDA verfügbar: True
Erkannte GPU: NVIDIA L40S
GPU-Speicher: 46.1 GB
```

## Überprüfung

```bash
python3 -c "
import torch
x = torch.randn(1000, 1000, device='cuda')
y = torch.randn(1000, 1000, device='cuda')
z = torch.mm(x, y)
print(f'GPU-Berechnung erfolgreich, Größe des Ergebnisses: {z.shape}')
"
```

**Erwartetes Ergebnis:**

```
GPU-Berechnung erfolgreich, Größe des Ergebnisses: torch.Size([1000, 1000])
```

:::tip Die Installation über cloud-init automatisieren
Um die Treiber bereits bei der Erstellung zu installieren, fügen Sie dieses Skript im Schritt **Network** des Assistenten in **Cloud-Init script (User Data)** ein:

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

Siehe [cloud-init konfigurieren](./configure-cloud-init.md).
:::

## Weiterführende Informationen

- [GPU: Übersicht](../../gpu/overview.md)
- [GPU-Fehlerbehebung](../../gpu/troubleshooting.md)
- [cloud-init konfigurieren](./configure-cloud-init.md)
