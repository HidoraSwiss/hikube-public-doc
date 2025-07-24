---
sidebar_position: 3
title: API Reference
---

# API Reference - GPU

Cette référence détaille les APIs pour utiliser les GPU sur Hikube, que ce soit avec des machines virtuelles ou des clusters Kubernetes.

---

## 🖥️ GPU avec Machines Virtuelles

### **API VirtualMachine**

```yaml
apiVersion: apps.cozystack.io/v1alpha1
kind: VirtualMachine
metadata:
  name: vm-gpu
spec:
  running: true
  instanceProfile: ubuntu
  instanceType: u1.xlarge
  gpus:
    - name: "nvidia.com/L40S"
```

#### **Paramètres GPU pour VM**

| **Paramètre** | **Type** | **Description** | **Requis** |
|---------------|----------|-----------------|------------|
| `gpus` | `[]GPU` | Liste des GPUs à attacher | ✅ |
| `gpus[].name` | `string` | Type de GPU NVIDIA | ✅ |

#### **Types de GPU Disponibles**

```yaml
# GPU pour inférence et développement
gpus:
  - name: "nvidia.com/L40S"

# GPU pour entraînement ML
gpus:
  - name: "nvidia.com/A100"

# GPU pour LLM et calcul exascale
gpus:
  - name: "nvidia.com/H100"
```

#### **Spécifications Hardware**

| **GPU** | **Architecture** | **Mémoire** | **Performance** |
|---------|------------------|-------------|-----------------|
| **L40S** | Ada Lovelace | 48 GB GDDR6 | 362 TOPS (INT8) |
| **A100** | Ampere | 80 GB HBM2e | 312 TOPS (INT8) |
| **H100** | Hopper | 80 GB HBM3 | 1979 TOPS (INT8) |

#### **Exemple VM GPU Complet**

```yaml
apiVersion: apps.cozystack.io/v1alpha1
kind: VirtualMachine
metadata:
  name: ai-workstation
spec:
  running: true
  instanceProfile: ubuntu
  instanceType: u1.2xlarge  # 8 vCPU, 32 GB RAM
  gpus:
    - name: "nvidia.com/A100"
  systemDisk:
    size: 200Gi
    storageClass: replicated
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
      # Pilotes NVIDIA
      - wget https://developer.download.nvidia.com/compute/cuda/repos/ubuntu2204/x86_64/cuda-keyring_1.0-1_all.deb
      - dpkg -i cuda-keyring_1.0-1_all.deb
      - apt-get update
      - apt-get install -y cuda-toolkit nvidia-driver-535
      
      # PyTorch avec CUDA
      - pip3 install torch torchvision --index-url https://download.pytorch.org/whl/cu121
```

---

## ☸️ GPU avec Kubernetes

### **API Kubernetes avec GPU Workers**

```yaml
apiVersion: apps.cozystack.io/v1alpha1
kind: Kubernetes
metadata:
  name: cluster-gpu
spec:
  controlPlane:
    replicas: 1
  
  nodeGroups:
    gpu-workers:
      minReplicas: 1
      maxReplicas: 5
      instanceType: "u1.xlarge"
      ephemeralStorage: 100Gi
      gpus:
        - name: "nvidia.com/L40S"
```

#### **Paramètres GPU pour NodeGroups**

| **Paramètre** | **Type** | **Description** | **Requis** |
|---------------|----------|-----------------|------------|
| `nodeGroups.<name>.gpus` | `[]GPU` | GPUs pour les workers | ❌ |
| `gpus[].name` | `string` | Type de GPU NVIDIA | ✅ |

#### **Configuration Multi-GPU**

```yaml
nodeGroups:
  gpu-intensive:
    minReplicas: 1
    maxReplicas: 2
    instanceType: "u1.4xlarge"  # 16 vCPU, 64 GB RAM
    gpus:
      - name: "nvidia.com/A100"
      - name: "nvidia.com/A100"
      - name: "nvidia.com/A100"
      - name: "nvidia.com/A100"
```

#### **Utilisation dans les Pods**

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: ml-training
spec:
  containers:
  - name: trainer
    image: pytorch/pytorch:2.0.1-cuda11.7-cudnn8-runtime
    resources:
      limits:
        nvidia.com/gpu: 1
      requests:
        nvidia.com/gpu: 1
    command:
      - python
      - train.py
```

#### **Job Multi-GPU**

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: distributed-training
spec:
  template:
    spec:
      containers:
      - name: trainer
        image: pytorch/pytorch:2.0.1-cuda11.7-cudnn8-runtime
        resources:
          limits:
            nvidia.com/gpu: 4
          requests:
            nvidia.com/gpu: 4
        env:
        - name: CUDA_VISIBLE_DEVICES
          value: "0,1,2,3"
      restartPolicy: Never
```

---

## 📋 Comparaison des Approches

### **VM GPU vs Kubernetes GPU**

| **Aspect** | **VM GPU** | **Kubernetes GPU** |
|------------|------------|-------------------|
| **Allocation** | 1 GPU = 1 VM (exclusif) | 1+ GPU par worker (partageable) |
| **Isolation** | Complète au niveau VM | Namespace/Pod |
| **Scaling** | Vertical (plus de GPUs) | Horizontal + Vertical |
| **Gestion** | Manuelle via YAML | Orchestrée par K8s |
| **Partage** | Non | Oui (entre pods) |
| **Overhead** | Minimal | Overhead orchestration |

### **Quand utiliser chaque approche**

#### **VM GPU recommandée pour :**
- Applications legacy non-containerisées
- Besoin d'accès direct et complet au GPU
- Développement et prototypage
- Workloads monolithiques
- Applications graphiques (rendu, CAO)

#### **Kubernetes GPU recommandé pour :**
- Applications containerisées
- Workloads nécessitant du scaling automatique
- Jobs parallèles et distribués
- Partage de ressources GPU
- Pipelines ML/AI complexes

---

## 🔧 Configuration Avancée

### **Multi-GPU sur VM**

```yaml
apiVersion: apps.cozystack.io/v1alpha1
kind: VirtualMachine
metadata:
  name: multi-gpu-vm
spec:
  instanceType: u1.8xlarge  # 32 vCPU, 128 GB RAM
  gpus:
    - name: "nvidia.com/H100"
    - name: "nvidia.com/H100"
    - name: "nvidia.com/H100"
    - name: "nvidia.com/H100"
```

### **NodeGroup spécialisé GPU**

```yaml
nodeGroups:
  gpu-inference:
    minReplicas: 2
    maxReplicas: 10
    instanceType: "u1.large"
    gpus:
      - name: "nvidia.com/L40S"
    
  gpu-training:
    minReplicas: 1
    maxReplicas: 3
    instanceType: "u1.4xlarge"
    gpus:
      - name: "nvidia.com/A100"
      - name: "nvidia.com/A100"
```

### **Pod avec GPU spécifique**

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: specific-gpu-pod
spec:
  nodeSelector:
    gpu-type: "L40S"
  containers:
  - name: app
    image: nvidia/cuda:12.0-runtime-ubuntu20.04
    resources:
      limits:
        nvidia.com/gpu: 1
```

---

## ✅ Vérification et Monitoring

### **Vérification VM GPU**

```bash
# Accéder à la VM
virtctl ssh ubuntu@vm-gpu

# Vérifier les GPU
nvidia-smi

# Test CUDA
nvidia-smi --query-gpu=name,memory.total,utilization.gpu --format=csv
```

### **Vérification Kubernetes GPU**

```bash
# Voir les ressources GPU sur les nodes
kubectl describe nodes

# Vérifier l'allocation GPU
kubectl get nodes -o custom-columns=NAME:.metadata.name,GPU:.status.allocatable.'nvidia\.com/gpu'

# Monitoring utilisation GPU
kubectl top nodes
```

### **Monitoring GPU dans un Pod**

```bash
# Exec dans un pod avec GPU
kubectl exec -it <pod-name> -- nvidia-smi

# Voir les métriques GPU
kubectl exec -it <pod-name> -- nvidia-smi --query-gpu=utilization.gpu,memory.used,memory.total --format=csv -l 5
```

---

## 💡 Bonnes Pratiques

### **Pour VM GPU :**
- Utilisez `replicated` storage class pour la production
- Dimensionnez le CPU/RAM selon le GPU (ratio 8-16 vCPU par GPU)
- Installez les pilotes NVIDIA via cloud-init
- Arrêtez les VMs quand inutilisées pour optimiser les coûts

### **Pour Kubernetes GPU :**
- Configurez des resource limits appropriées
- Utilisez nodeSelector ou nodeAffinity pour cibler des GPU spécifiques
- Implémentez des PodDisruptionBudgets pour les workloads critiques
- Surveillez l'utilisation GPU avec des métriques personnalisées

### **Générale :**
- L40S pour inférence/développement
- A100 pour entraînement ML standard  
- H100 pour LLM et calcul exascale
- Testez avec L40S avant de passer aux GPU plus coûteux 