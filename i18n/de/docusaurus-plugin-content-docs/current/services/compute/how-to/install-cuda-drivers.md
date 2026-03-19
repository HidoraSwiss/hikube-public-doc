---
title: "CUDA und GPU-Treiber installieren"
---

# CUDA und GPU-Treiber installieren

Hikube-VMs mit einem angehängten GPU verfügen nicht über vorinstallierte NVIDIA-Treiber. Diese Anleitung beschreibt die Installation der NVIDIA-Treiber und des CUDA-Toolkits auf einer Ubuntu-VM zur Nutzung des GPU.

## Voraussetzungen

- Eine **VMInstance** auf Hikube mit einem angehängten GPU (siehe [GPU API-Referenz](../../gpu/api-reference.md))
- VM basierend auf **Ubuntu 24.04** (die Befehle sind für diese Version angepasst)
- Ein **SSH**- oder **Konsolen**-Zugang zur VM
- **Root**- oder **sudo**-Rechte

:::warning Keine vorinstallierten Treiber
Die Hikube Golden Images enthalten keine NVIDIA GPU-Treiber. Sie müssen diese manuell oder über cloud-init nach der Erstellung der VM installieren.
:::

## Schritte

### 1. Mit der VM verbinden

```bash
virtctl ssh -i ~/.ssh/id_ed25519 ubuntu@my-gpu-vm
```

Oder über direktes SSH, wenn die VM exponiert ist:

```bash
ssh -i ~/.ssh/hikube-vm ubuntu@<IP-EXTERNE>
```

### 2. GPU-Erkennung überprüfen

Bevor Sie die Treiber installieren, überprüfen Sie, dass der GPU vom System erkannt wird:

```bash
lspci | grep -i nvidia
```

**Erwartetes Ergebnis:**

```
06:00.0 3D controller: NVIDIA Corporation ...
```

Wenn kein GPU erscheint, überprüfen Sie, dass Ihre VMInstance einen GPU in ihrer Konfiguration angehängt hat.

### 3. NVIDIA-Treiber und CUDA installieren

Fügen Sie das NVIDIA-Repository hinzu und installieren Sie die Treiber:

```bash
# NVIDIA Keyring herunterladen und installieren
wget https://developer.download.nvidia.com/compute/cuda/repos/ubuntu2404/x86_64/cuda-keyring_1.1-1_all.deb
sudo dpkg -i cuda-keyring_1.1-1_all.deb

# Pakete aktualisieren
sudo apt-get update

# CUDA-Toolkit und Treiber installieren
sudo apt-get install -y cuda-toolkit nvidia-driver-560
```

:::tip Neustart erforderlich
Ein Neustart ist nach der Treiberinstallation notwendig, um die NVIDIA-Kernelmodule zu laden.
:::

Starten Sie die VM neu:

```bash
sudo reboot
```

Verbinden Sie sich nach dem Neustart erneut (warten Sie etwa 1 Minute):

```bash
virtctl ssh -i ~/.ssh/id_ed25519 ubuntu@my-gpu-vm
```

### 4. Treiberinstallation überprüfen

```bash
nvidia-smi
```

**Erwartetes Ergebnis:**

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

Überprüfen Sie die CUDA-Version:

```bash
nvcc --version
```

### 5. Umgebungsvariablen konfigurieren (optional)

Fügen Sie CUDA zum PATH für permanenten Zugriff hinzu:

```bash
echo 'export PATH=/usr/local/cuda/bin:$PATH' >> ~/.bashrc
echo 'export LD_LIBRARY_PATH=/usr/local/cuda/lib64:$LD_LIBRARY_PATH' >> ~/.bashrc
source ~/.bashrc
```

### 6. Mit PyTorch testen

Installieren Sie PyTorch mit CUDA-Unterstützung, um zu validieren, dass der GPU voll funktionsfähig ist:

```bash
pip3 install torch --index-url https://download.pytorch.org/whl/cu124
```

Testen Sie die GPU-Erkennung:

```bash
python3 -c "
import torch
print(f'CUDA verfügbar: {torch.cuda.is_available()}')
print(f'GPU erkannt: {torch.cuda.get_device_name(0)}')
print(f'GPU-Speicher: {torch.cuda.get_device_properties(0).total_mem / 1e9:.1f} GB')
"
```

**Erwartetes Ergebnis:**

```
CUDA verfügbar: True
GPU erkannt: NVIDIA L40S
GPU-Speicher: 46.1 GB
```

## Überprüfung

Führen Sie eine einfache Berechnung auf dem GPU aus, um die korrekte Funktion zu bestätigen:

```bash
python3 -c "
import torch
# Tensor auf dem GPU erstellen
x = torch.randn(1000, 1000, device='cuda')
y = torch.randn(1000, 1000, device='cuda')
z = torch.mm(x, y)
print(f'GPU-Berechnung erfolgreich, Ergebnisgröße: {z.shape}')
"
```

**Erwartetes Ergebnis:**

```
GPU-Berechnung erfolgreich, Ergebnisgröße: torch.Size([1000, 1000])
```

:::tip Installation über cloud-init automatisieren
Um die GPU-Treiberinstallation beim Start zu automatisieren, verwenden Sie den Parameter `cloudInit` der VMInstance. Konsultieren Sie die Anleitung [Cloud-init konfigurieren](./configure-cloud-init.md) für ein vollständiges Beispiel.
:::

## Weiterführende Informationen

- [API-Referenz](../api-reference.md)
- [GPU API-Referenz](../../gpu/api-reference.md)
- [Cloud-init konfigurieren](./configure-cloud-init.md)
