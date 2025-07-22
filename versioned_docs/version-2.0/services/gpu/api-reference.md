---
sidebar_position: 3
title: Référence API - VM GPU
---

# API Reference - Machines Virtuelles GPU

Cette référence complète détaille l'API **VirtualMachine GPU** d'Hikube, les configurations GPU, types d'instances optimisées et bonnes pratiques pour l'accélération matérielle.

---

## 🎮 VirtualMachine GPU

### **Vue d'ensemble**

L'API `VirtualMachine` avec support GPU permet de créer des machines virtuelles avec accès direct aux accélérateurs NVIDIA via GPU Passthrough.

```yaml
apiVersion: apps.cozystack.io/v1alpha1
kind: VirtualMachine
metadata:
  name: example-gpu-vm
spec:
  running: true
  instanceProfile: ubuntu
  instanceType: g1.xlarge
  gpus:
    - name: "nvidia.com/L40S"
  # Configuration détaillée ci-dessous
```

### **Spécification GPU Complète**

#### **Paramètres GPU**

| **Paramètre** | **Type** | **Description** | **Défaut** | **Requis** |
|---------------|----------|-----------------|------------|------------|
| `gpus` | `[]GPU` | Liste des GPUs à attacher à la VM | `[]` | ✅ |
| `gpus[].name` | `string` | Type de GPU NVIDIA à allouer | - | ✅ |
| `gpus[].deviceName` | `string` | Nom spécifique du périphérique GPU | auto | ❌ |

#### **Types de GPUs Disponibles**

##### **NVIDIA L40S (Ada Lovelace)**
```yaml
gpus:
  - name: "nvidia.com/L40S"
```
- **Architecture** : Ada Lovelace
- **Mémoire** : 48 GB GDDR6 avec ECC
- **Performance** : 362 TOPS (INT8), 91.6 TFLOPs (FP32)
- **Usage** : IA générative, rendu temps réel, simulation

##### **NVIDIA A100 (Ampere)**
```yaml
gpus:
  - name: "nvidia.com/A100"
```
- **Architecture** : Ampere
- **Mémoire** : 80 GB HBM2e avec ECC
- **Performance** : 312 TOPS (INT8), 624 TFLOPs (Tensor)
- **Usage** : Entraînement IA, calcul haute performance

##### **NVIDIA H100 (Hopper)**
```yaml
gpus:
  - name: "nvidia.com/H100"
```
- **Architecture** : Hopper
- **Mémoire** : 80 GB HBM3 avec ECC
- **Performance** : 1979 TOPS (INT8), 989 TFLOPs (Tensor)
- **Usage** : LLM, transformers, calcul exascale

#### **Types d'Instances GPU**

##### **Série G1 (GPU Single) - 1 GPU**
Optimisée pour workloads mono-GPU avec CPU et mémoire équilibrés.

```yaml
# Instances G1 disponibles
instanceType: "g1.medium"    # 8 vCPU, 32 GB RAM, 1 GPU
instanceType: "g1.large"     # 16 vCPU, 64 GB RAM, 1 GPU
instanceType: "g1.xlarge"    # 32 vCPU, 128 GB RAM, 1 GPU
instanceType: "g1.2xlarge"   # 64 vCPU, 256 GB RAM, 1 GPU
instanceType: "g1.4xlarge"   # 128 vCPU, 512 GB RAM, 1 GPU
```

##### **Série G2 (GPU Dual) - 2 GPUs**
Optimisée pour workloads multi-GPU avec parallélisation.

```yaml
# Instances G2 disponibles
instanceType: "g2.large"     # 32 vCPU, 128 GB RAM, 2 GPUs
instanceType: "g2.xlarge"    # 64 vCPU, 256 GB RAM, 2 GPUs
instanceType: "g2.2xlarge"   # 128 vCPU, 512 GB RAM, 2 GPUs
instanceType: "g2.4xlarge"   # 256 vCPU, 1 TB RAM, 2 GPUs
```

##### **Série G4 (GPU Quad) - 4 GPUs**
Optimisée pour calcul intensif et entraînement de modèles complexes.

```yaml
# Instances G4 disponibles
instanceType: "g4.xlarge"    # 64 vCPU, 256 GB RAM, 4 GPUs
instanceType: "g4.2xlarge"   # 128 vCPU, 512 GB RAM, 4 GPUs
instanceType: "g4.4xlarge"   # 256 vCPU, 1 TB RAM, 4 GPUs
instanceType: "g4.8xlarge"   # 512 vCPU, 2 TB RAM, 4 GPUs
```

##### **Série G8 (GPU Octo) - 8 GPUs**
Optimisée pour l'entraînement de LLM et calcul distribué.

```yaml
# Instances G8 disponibles
instanceType: "g8.2xlarge"   # 128 vCPU, 512 GB RAM, 8 GPUs
instanceType: "g8.4xlarge"   # 256 vCPU, 1 TB RAM, 8 GPUs
instanceType: "g8.8xlarge"   # 512 vCPU, 2 TB RAM, 8 GPUs
```

### **Configuration Multi-GPU**

#### **Configuration Dual GPU**
```yaml
apiVersion: apps.cozystack.io/v1alpha1
kind: VirtualMachine
metadata:
  name: dual-gpu-vm
spec:
  running: true
  instanceProfile: ubuntu
  instanceType: g2.xlarge
  gpus:
    - name: "nvidia.com/A100"
    - name: "nvidia.com/A100"
  systemDisk:
    size: 200Gi
    storageClass: replicated
  cloudInit: |
    #cloud-config
    runcmd:
      - nvidia-smi
      - nvidia-smi topo -m  # Vérifier la topologie GPU
```

#### **Configuration Quad GPU pour HPC**
```yaml
apiVersion: apps.cozystack.io/v1alpha1
kind: VirtualMachine
metadata:
  name: hpc-quad-gpu
spec:
  running: true
  instanceProfile: ubuntu
  instanceType: g4.2xlarge
  gpus:
    - name: "nvidia.com/H100"
    - name: "nvidia.com/H100"
    - name: "nvidia.com/H100"
    - name: "nvidia.com/H100"
  systemDisk:
    size: 500Gi
    storageClass: replicated
  cloudInit: |
    #cloud-config
    packages:
      - nvidia-cuda-toolkit
      - openmpi-bin
      - openmpi-common
    runcmd:
      - nvidia-smi
      - mpirun --version
```

### **Stockage Optimisé GPU**

#### **Storage Classes Recommandées**

```yaml
# Pour datasets IA/ML
systemDisk:
  size: 1000Gi
  storageClass: "replicated"

# Stockage temporaire haute performance
additionalDisks:
  - name: scratch-disk
    size: 2000Gi
    storageClass: "local"  # NVMe local ultra-rapide
```

#### **Configuration Stockage par Use Case**

##### **Entraînement IA**
```yaml
systemDisk:
  size: 200Gi
  storageClass: "replicated"
additionalDisks:
  - name: datasets
    size: 5000Gi
    storageClass: "replicated"
  - name: checkpoints
    size: 1000Gi
    storageClass: "replicated"
  - name: temp-data
    size: 2000Gi
    storageClass: "local"
```

##### **Inférence Production**
```yaml
systemDisk:
  size: 100Gi
  storageClass: "replicated"
additionalDisks:
  - name: models
    size: 500Gi
    storageClass: "replicated"
```

##### **Rendu 3D**
```yaml
systemDisk:
  size: 200Gi
  storageClass: "replicated"
additionalDisks:
  - name: scenes
    size: 2000Gi
    storageClass: "replicated"
  - name: cache
    size: 1000Gi
    storageClass: "local"
```

### **Réseau Haute Performance**

#### **Configuration pour Multi-GPU**
```yaml
spec:
  network:
    interfaces:
      - name: default
        bridge: {}
      - name: hpc
        multus:
          networkName: "gpu-interconnect"  # Réseau InfiniBand/RoCE
```

### **Cloud-Init pour GPU**

#### **Configuration de base avec Drivers NVIDIA**
```yaml
cloudInit: |
  #cloud-config
  users:
    - name: gpu-user
      sudo: ALL=(ALL) NOPASSWD:ALL
      shell: /bin/bash
      groups: [docker]
      ssh_authorized_keys:
        - ssh-rsa AAAAB3NzaC1yc2E...

  package_update: true
  packages:
    - curl
    - wget
    - build-essential
    - dkms

  runcmd:
    # Installation drivers NVIDIA
    - wget https://developer.download.nvidia.com/compute/cuda/repos/ubuntu2204/x86_64/cuda-keyring_1.0-1_all.deb
    - dpkg -i cuda-keyring_1.0-1_all.deb
    - apt-get update
    - apt-get install -y cuda-toolkit nvidia-driver-535
    
    # Configuration persistance
    - systemctl enable nvidia-persistenced
    - nvidia-smi -pm 1
    
    # Installation Docker avec support NVIDIA
    - curl -fsSL https://get.docker.com | sh
    - distribution=$(. /etc/os-release;echo $ID$VERSION_ID)
    - curl -fsSL https://nvidia.github.io/libnvidia-container/gpgkey | gpg --dearmor -o /usr/share/keyrings/nvidia-container-toolkit-keyring.gpg
    - curl -s -L https://nvidia.github.io/libnvidia-container/$distribution/libnvidia-container.list | sed 's#deb https://#deb [signed-by=/usr/share/keyrings/nvidia-container-toolkit-keyring.gpg] https://#g' | tee /etc/apt/sources.list.d/nvidia-container-toolkit.list
    - apt-get update
    - apt-get install -y nvidia-container-toolkit
    - nvidia-ctk runtime configure --runtime=docker
    - systemctl restart docker
```

#### **Configuration pour Deep Learning**
```yaml
cloudInit: |
  #cloud-config
  runcmd:
    # Drivers et CUDA comme ci-dessus
    - # ... configuration drivers ...
    
    # Installation PyTorch
    - pip3 install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121
    
    # Installation TensorFlow
    - pip3 install tensorflow[and-cuda]
    
    # Installation Jupyter Lab
    - pip3 install jupyterlab
    - jupyter lab --generate-config
    
    # Optimisations GPU
    - echo 'export CUDA_CACHE_PATH=/tmp' >> /etc/environment
    - echo 'export PYTORCH_CUDA_ALLOC_CONF=max_split_size_mb:128' >> /etc/environment
```

### **Monitoring et Observabilité**

#### **Métriques GPU**
```yaml
# Annotations pour le monitoring
metadata:
  annotations:
    prometheus.io/scrape: "true"
    prometheus.io/port: "9400"
    prometheus.io/path: "/metrics"

cloudInit: |
  #cloud-config
  runcmd:
    # Installation DCGM Exporter pour Prometheus
    - docker run -d --gpus all --rm -p 9400:9400 nvcr.io/nvidia/k8s/dcgm-exporter:3.1.8-3.1.5-ubuntu20.04
```

### **Exemples d'Usage**

#### **VM pour Entraînement LLM**
```yaml
apiVersion: apps.cozystack.io/v1alpha1
kind: VirtualMachine
metadata:
  name: llm-training
spec:
  running: true
  instanceProfile: ubuntu
  instanceType: g8.4xlarge  # 8x H100
  gpus:
    - name: "nvidia.com/H100"
    - name: "nvidia.com/H100"
    - name: "nvidia.com/H100"
    - name: "nvidia.com/H100"
    - name: "nvidia.com/H100"
    - name: "nvidia.com/H100"
    - name: "nvidia.com/H100"
    - name: "nvidia.com/H100"
  systemDisk:
    size: 500Gi
    storageClass: replicated
  additionalDisks:
    - name: datasets
      size: 10000Gi  # 10TB pour datasets
      storageClass: replicated
    - name: checkpoints
      size: 5000Gi   # 5TB pour checkpoints
      storageClass: replicated
```

#### **VM pour Inférence API**
```yaml
apiVersion: apps.cozystack.io/v1alpha1
kind: VirtualMachine
metadata:
  name: inference-api
spec:
  running: true
  instanceProfile: ubuntu
  instanceType: g1.large
  gpus:
    - name: "nvidia.com/L40S"
  external: true
  externalPorts:
    - 8000  # API endpoint
  systemDisk:
    size: 200Gi
    storageClass: replicated
  cloudInit: |
    #cloud-config
    runcmd:
      # Installation TensorRT pour optimisation
      - apt-get install -y tensorrt
      # Configuration FastAPI
      - pip3 install fastapi uvicorn transformers
```

#### **VM pour Rendu 3D**
```yaml
apiVersion: apps.cozystack.io/v1alpha1
kind: VirtualMachine
metadata:
  name: render-farm
spec:
  running: true
  instanceProfile: ubuntu
  instanceType: g2.xlarge
  gpus:
    - name: "nvidia.com/L40S"
    - name: "nvidia.com/L40S"
  systemDisk:
    size: 500Gi
    storageClass: replicated
  external: true
  externalPorts:
    - 5900  # VNC pour accès graphique
  cloudInit: |
    #cloud-config
    packages:
      - ubuntu-desktop-minimal
      - blender
      - x11vnc
    runcmd:
      - systemctl set-default graphical.target
```

### **Bonnes Pratiques**

#### **🔧 Optimisation Performance**

1. **CPU/GPU Ratio** : Utilisez 8-16 vCPU par GPU pour équilibrer les workloads
2. **Mémoire** : Minimum 32GB RAM par GPU, 64-128GB pour entraînement
3. **Stockage** : Utilisez du stockage local pour datasets temporaires
4. **Réseau** : Configurez RDMA pour multi-GPU distribué

#### **💰 Optimisation Coûts**

1. **Auto-scaling** : Arrêtez les VMs quand inutilisées
2. **Spot instances** : Utilisez pour workloads interruptibles
3. **Scheduling** : Planifiez les entraînements pendant heures creuses
4. **Monitoring** : Surveillez l'utilisation GPU pour dimensionner

#### **🔒 Sécurité**

1. **Isolation** : Un GPU = Une VM, pas de partage
2. **Chiffrement** : Activez le chiffrement des données sensibles
3. **Accès** : Limitez l'accès réseau aux ports nécessaires
4. **Audit** : Loggez tous les accès GPU et transferts de données

:::tip Performance GPU 🚀
Pour maximiser les performances, utilisez des images optimisées avec drivers pré-installés et configurez CUDA Unified Memory pour les gros datasets.
:::

:::warning Limitation H100 ⚠️
Les instances H100 sont limitées en nombre. Réservez à l'avance pour les projets critiques et libérez rapidement après usage.
:::

---

**Besoin d'aide ?** Consultez notre [guide de troubleshooting GPU](./troubleshooting.md) ou contactez le support Hikube ! 🆘 