---
sidebar_position: 3
title: API Reference
---

# API Reference - GPU

Cette référence détaille l'utilisation des GPU sur Hikube, que ce soit avec des machines virtuelles (`VMInstance`) ou des clusters Kubernetes managés (`Kubernetes`).

---

## 🎮 GPU disponibles

Les GPU sont attachés par leur **nom de ressource** (`nvidia.com/<modèle>`). Les modèles disponibles sur Hikube :

| GPU | Nom de ressource | Architecture | Mémoire | Usage typique |
|-----|------------------|--------------|---------|---------------|
| **L40S** | `nvidia.com/AD102GL_L40S` | Ada Lovelace | 48 Go GDDR6 | Inférence, dev, rendu |
| **A100 PCIe 80 Go** | `nvidia.com/GA100_A100_PCIE_80GB` | Ampere | 80 Go HBM2e | Entraînement ML |
| **A100 SXM4 80 Go** | `nvidia.com/GA100_A100_SXM4_80GB` | Ampere | 80 Go HBM2e | Entraînement ML (multi-GPU NVLink) |
| **RTX PRO 6000 Blackwell** | `nvidia.com/GB202GL_RTX_PRO_6000_BLACKWELL_SERVER_EDITION` | Blackwell | 96 Go GDDR7 | LLM, calcul intensif |

:::note Disponibilité
Le matériel GPU disponible varie selon la zone. Vérifiez les ressources allouables côté plateforme avant de planifier un workload. Le pilote NVIDIA nécessite **au moins 4 Gio de RAM** sur la VM ou le worker.
:::

---

## 🖥️ GPU avec Machines Virtuelles

Sur une VM, le GPU est attaché en **passthrough PCI** (allocation exclusive) via le champ `gpus` d'une ressource [`VMInstance`](../compute/api-reference.md). Le disque est défini séparément par une ressource [`VMDisk`](../compute/api-reference.md#vmdisk).

```yaml title="vm-gpu.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: VMInstance
metadata:
  name: vm-gpu
spec:
  runStrategy: Always
  instanceProfile: ubuntu
  instanceType: u1.xlarge
  gpus:
    - name: "nvidia.com/AD102GL_L40S"
  disks:
    - name: vm-gpu-disk
```

:::warning Pièges fréquents
- La ressource s'appelle **`VMInstance`** (pas `VirtualMachine`).
- L'état se pilote via **`runStrategy: Always`** (pas `running: true`).
- Le disque n'est **pas** un champ `systemDisk` intégré : créez une ressource `VMDisk` et référencez-la dans `disks` (liste d'objets `{name}`).
:::

### Paramètres GPU pour VM

| **Paramètre** | **Type** | **Description** | **Requis** |
|---------------|----------|-----------------|------------|
| `gpus` | `[]object` | Liste des GPU à attacher | non |
| `gpus[].name` | `string` | Nom de la ressource GPU (`nvidia.com/...`) | oui (si `gpus` défini) |

### Exemple VM GPU complet

```yaml title="ai-workstation.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: VMDisk
metadata:
  name: ai-workstation-disk
spec:
  source:
    image:
      name: ubuntu-2404
  storage: 200Gi
  storageClass: replicated
---
apiVersion: apps.cozystack.io/v1alpha1
kind: VMInstance
metadata:
  name: ai-workstation
spec:
  runStrategy: Always
  instanceProfile: ubuntu
  instanceType: u1.2xlarge  # 8 vCPU, 32 GB RAM
  gpus:
    - name: "nvidia.com/GA100_A100_PCIE_80GB"
  disks:
    - name: ai-workstation-disk
  external: true
  externalMethod: PortList
  externalPorts:
    - 22
    - 8888  # Jupyter
  cloudInit: |
    #cloud-config
    users:
      - name: ubuntu
        sudo: ALL=(ALL) NOPASSWD:ALL
    packages:
      - python3-pip
      - build-essential
    runcmd:
      # Pilotes NVIDIA + CUDA (voir le guide dédié pour la version exacte)
      - wget https://developer.download.nvidia.com/compute/cuda/repos/ubuntu2404/x86_64/cuda-keyring_1.1-1_all.deb
      - dpkg -i cuda-keyring_1.1-1_all.deb
      - apt-get update
      - apt-get install -y cuda-toolkit nvidia-driver-570
      # PyTorch avec CUDA
      - pip3 install torch torchvision
```

### Multi-GPU sur VM

```yaml
spec:
  instanceType: u1.8xlarge  # 32 vCPU, 128 GB RAM
  gpus:
    - name: "nvidia.com/GA100_A100_SXM4_80GB"
    - name: "nvidia.com/GA100_A100_SXM4_80GB"
    - name: "nvidia.com/GA100_A100_SXM4_80GB"
    - name: "nvidia.com/GA100_A100_SXM4_80GB"
```

---

## ☸️ GPU avec Kubernetes

Sur un cluster Kubernetes managé, les GPU sont attachés aux **node groups**, et l'addon **`gpuOperator`** doit être activé pour exposer les GPU aux pods.

```yaml title="cluster-gpu.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Kubernetes
metadata:
  name: cluster-gpu
spec:
  controlPlane:
    replicas: 2

  nodeGroups:
    gpu-workers:
      minReplicas: 1
      maxReplicas: 5
      instanceType: "u1.xlarge"
      ephemeralStorage: 100Gi
      gpus:
        - name: "nvidia.com/AD102GL_L40S"

  addons:
    # Requis : installe les pilotes NVIDIA et le device plugin
    gpuOperator:
      enabled: true
```

:::warning Addon `gpuOperator` requis
Sans `gpuOperator: enabled: true`, les GPU des workers ne sont pas exposés aux pods (`nvidia.com/gpu` reste à 0).
:::

### Paramètres GPU pour NodeGroups

| **Paramètre** | **Type** | **Description** | **Requis** |
|---------------|----------|-----------------|------------|
| `nodeGroups.<name>.gpus` | `[]object` | GPU attachés aux workers du groupe | non |
| `gpus[].name` | `string` | Nom de la ressource GPU (`nvidia.com/...`) | oui (si `gpus` défini) |
| `addons.gpuOperator.enabled` | `boolean` | Active le NVIDIA GPU Operator | oui (pour utiliser les GPU) |

### Configuration Multi-GPU par worker

```yaml
nodeGroups:
  gpu-intensive:
    minReplicas: 1
    maxReplicas: 2
    instanceType: "u1.4xlarge"  # 16 vCPU, 64 GB RAM
    gpus:
      - name: "nvidia.com/GA100_A100_SXM4_80GB"
      - name: "nvidia.com/GA100_A100_SXM4_80GB"
      - name: "nvidia.com/GA100_A100_SXM4_80GB"
      - name: "nvidia.com/GA100_A100_SXM4_80GB"
```

### Utilisation dans les Pods

Une fois le `gpuOperator` actif, les pods réservent les GPU via la ressource `nvidia.com/gpu` :

```yaml title="ml-training.yaml"
apiVersion: v1
kind: Pod
metadata:
  name: ml-training
spec:
  containers:
  - name: trainer
    image: pytorch/pytorch:2.4.1-cuda12.4-cudnn9-runtime
    resources:
      limits:
        nvidia.com/gpu: 1
      requests:
        nvidia.com/gpu: 1
    command: ["python", "train.py"]
```

---

## 📋 VM GPU vs Kubernetes GPU

| **Aspect** | **VM GPU** | **Kubernetes GPU** |
|------------|------------|-------------------|
| **Allocation** | 1 GPU = 1 VM (passthrough exclusif) | 1+ GPU par worker |
| **Isolation** | Complète au niveau VM | Namespace / Pod |
| **Scaling** | Vertical (plus de GPU) | Horizontal + Vertical (autoscaling) |
| **Gestion** | Manuelle via `VMInstance` | Orchestrée par Kubernetes |
| **Partage** | Non | Oui (entre pods) |
| **Overhead** | Minimal | Overhead d'orchestration |

**VM GPU** : applications non-containerisées, accès direct au GPU, dev/prototypage, rendu/CAO.

**Kubernetes GPU** : workloads containerisés, autoscaling, jobs parallèles/distribués, pipelines ML/AI.

---

## ✅ Vérification

### VM GPU

```bash
virtctl ssh ubuntu@vm-gpu
nvidia-smi
nvidia-smi --query-gpu=name,memory.total,utilization.gpu --format=csv
```

### Kubernetes GPU

```bash
# GPU exposés sur les nodes (nécessite gpuOperator actif)
kubectl get nodes -o custom-columns=NAME:.metadata.name,GPU:.status.allocatable.'nvidia\.com/gpu'

# Vérifier depuis un pod
kubectl exec -it <pod-name> -- nvidia-smi
```

---

## 💡 Bonnes pratiques

- **L40S** pour l'inférence et le développement, **A100** pour l'entraînement ML, **RTX PRO 6000 (Blackwell)** pour les workloads les plus exigeants.
- Testez avec un L40S avant de réserver les GPU les plus coûteux.
- Dimensionnez le CPU/RAM en fonction du GPU (≈ 8–16 vCPU par GPU) et prévoyez ≥ 4 Gio de RAM.
- Sur VM : installez les pilotes NVIDIA via cloud-init (voir [Installer les pilotes CUDA](../compute/how-to/install-cuda-drivers.md)).
- Sur Kubernetes : activez toujours l'addon `gpuOperator`.
- Utilisez la `storageClass` `replicated` en production.
