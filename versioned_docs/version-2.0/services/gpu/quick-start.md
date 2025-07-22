---
sidebar_position: 2
title: Démarrage Rapide - VM GPU
---

# Créer votre première Machine Virtuelle GPU

Ce guide vous accompagne dans la création de votre première machine virtuelle GPU Hikube en **10 minutes** ! Découvrez la puissance d'accélération des GPUs NVIDIA L40S, A100 et H100. 🚀

---

## 🎯 Objectif

À la fin de ce guide, vous aurez :
- Une machine virtuelle avec GPU NVIDIA dédié
- Pilotes NVIDIA et CUDA opérationnels
- Accès direct au GPU via passthrough
- Environnement de développement IA prêt

---

## 📋 Prérequis

Avant de commencer, assurez-vous d'avoir :
- **kubectl** configuré avec votre kubeconfig Hikube
- **Droits administrateur** sur votre tenant
- **virtctl** installé pour l'accès console

---

## 🚀 Étape 1 : Créer le Disque VM GPU (3 minutes)

### **Préparez le fichier manifest**

Créez un fichier `vm-gpu-disk.yaml` avec une image Ubuntu optimisée pour GPU :

```yaml title="vm-gpu-disk.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: VMDisk
metadata:
  name: disk-gpu-example
spec:
  source:
    http:
      url: https://cloud-images.ubuntu.com/jammy/current/jammy-server-cloudimg-amd64.img
  optical: false
  storage: 100Gi
  storageClass: "replicated"
```

### **Déployez le disque**

```bash
# Créer le disque VM GPU
kubectl apply -f vm-gpu-disk.yaml

# Vérifier le statut (peut prendre 2-3 minutes)
kubectl get vmdisk disk-gpu-example -w
```

**Résultat attendu :**
```
NAME               STATUS   SIZE    STORAGECLASS   AGE
disk-gpu-example   Ready    100Gi   replicated     120s
```

---

## 🎮 Étape 2 : Créer la VM avec GPU (5 minutes)

### **Choisissez votre GPU**

Hikube propose 3 types de GPUs professionnels :

| GPU Type | Architecture | Mémoire | Usage Principal |
|----------|-------------|---------|-----------------|
| **L40S** | Ada Lovelace | 48GB | IA générative, rendu |
| **A100** | Ampere | 80GB | Entraînement IA |
| **H100** | Hopper | 80GB | LLM, transformers |

### **Préparez le manifest VM GPU**

Créez un fichier `vm-gpu-instance.yaml` avec le GPU de votre choix :

```yaml title="vm-gpu-instance.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: VirtualMachine
metadata:
  name: vm-gpu-example
spec:
  running: true
  instanceProfile: ubuntu
  instanceType: g1.xlarge  # Type optimisé GPU
  systemDisk:
    size: 100Gi
    storageClass: replicated
  disks:
    - name: disk-gpu-example
  gpus:
    - name: "nvidia.com/L40S"  # Changez selon votre besoin
      # Options: nvidia.com/L40S, nvidia.com/A100, nvidia.com/H100
  cloudInit: |
    #cloud-config
    users:
      - name: ubuntu
        sudo: ALL=(ALL) NOPASSWD:ALL
        shell: /bin/bash
        ssh_authorized_keys:
          - ssh-rsa AAAAB3NzaC1yc2E... # Votre clé SSH publique
    package_update: true
    packages:
      - curl
      - wget
      - git
      - build-essential
    runcmd:
      - curl -fsSL https://developer.download.nvidia.com/compute/cuda/repos/ubuntu2204/x86_64/3bf863cc.pub | sudo gpg --dearmor -o /usr/share/keyrings/nvidia-developers.gpg
      - echo "deb [arch=amd64,arm64 signed-by=/usr/share/keyrings/nvidia-developers.gpg] https://developer.download.nvidia.com/compute/cuda/repos/ubuntu2204/x86_64/ /" | sudo tee /etc/apt/sources.list.d/nvidia-developers.list
      - sudo apt update
      - sudo apt install -y nvidia-driver-535 cuda-toolkit-12-2
      - sudo systemctl enable nvidia-persistenced
```

### **Déployez la VM GPU**

```bash
# Créer la VM GPU
kubectl apply -f vm-gpu-instance.yaml

# Vérifier le statut (peut prendre 3-5 minutes)
kubectl get vm vm-gpu-example -w
```

**Résultat attendu :**
```
NAME             AGE   STATUS    READY
vm-gpu-example   3m    Running   True
```

---

## 🔌 Étape 3 : Accéder à votre VM GPU (2 minutes)

### **Méthodes d'accès**

#### **Option 1 : SSH Direct**
```bash
# SSH via virtctl (avec clé personnalisée)
virtctl ssh -i ~/.ssh/hikube-vm ubuntu@vm-gpu-example
```

### **Options avec virtctl**
### **Installation de virtctl**

Si vous n'avez pas encore `virtctl` installé :

```bash
# Installation de virtctl
export VERSION=$(curl https://storage.googleapis.com/kubevirt-prow/release/kubevirt/kubevirt/stable.txt)
wget https://github.com/kubevirt/kubevirt/releases/download/${VERSION}/virtctl-${VERSION}-linux-amd64
chmod +x virtctl
sudo mv virtctl /usr/local/bin/

# Vérifier l'installation
virtctl version
```

#### **Option 2 : Console Série (toujours disponible)**
```bash
# Accès console directe
virtctl console vm-gpu-example
```

#### **Option 3 : Interface VNC**
```bash
# Accès graphique
virtctl vnc vm-gpu-example
```

---

## ✅ Étape 4 : Validation GPU (2 minutes)

### **Tests de fonctionnement GPU**

Une fois connecté à votre VM, testez l'accès GPU :

```bash
# Vérification du driver NVIDIA
nvidia-smi

# Information système
lspci | grep NVIDIA

# Test CUDA (si installé)
nvcc --version

# Test simple de calcul GPU
nvidia-smi --query-gpu=name,driver_version,memory.total --format=csv
```

### **Résultat attendu**
```bash
ubuntu@vm-gpu-example:~$ nvidia-smi
+-----------------------------------------------------------------------------+
| NVIDIA-SMI 535.XX       Driver Version: 535.XX       CUDA Version: 12.2   |
|-------------------------------+----------------------+----------------------+
| GPU  Name        Persistence-M| Bus-Id        Disp.A | Volatile Uncorr. ECC |
| Fan  Temp  Perf  Pwr:Usage/Cap|         Memory-Usage | GPU-Util  Compute M. |
|                               |                      |               MIG M. |
|===============================+======================+======================|
|   0  NVIDIA L40S         On   | 00000000:06:00.0 Off |                  Off |
| N/A   30C    P8    25W / 300W |      1MiB / 48000MiB |      0%      Default |
|                               |                      |                  N/A |
+-------------------------------+----------------------+----------------------+
```

### **Installation de frameworks IA (optionnel)**

```bash
# Installation de PyTorch avec support CUDA
pip3 install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121

# Installation de TensorFlow avec GPU
pip3 install tensorflow[and-cuda]

# Test PyTorch GPU
python3 -c "import torch; print(f'CUDA disponible: {torch.cuda.is_available()}'); print(f'GPU: {torch.cuda.get_device_name(0) if torch.cuda.is_available() else \"Non détecté\"}')"
```

### **Résultat attendu PyTorch**
```bash
CUDA disponible: True
GPU: NVIDIA L40S
```

---

## 🎉 Félicitations !

Votre VM GPU est maintenant opérationnelle ! Vous pouvez :

### **🔄 Prochaines étapes**

**Développement IA :**
- Installer Jupyter Lab pour le développement interactif
- Cloner vos projets depuis GitHub
- Télécharger des datasets depuis Hugging Face

**Calcul Scientifique :**
- Installer GROMACS, OpenFOAM ou autres outils
- Configurer MPI pour calculs distribués
- Optimiser les performances avec cuBLAS

**Rendu et Visualisation :**
- Installer Blender ou applications 3D
- Configurer le streaming distant
- Optimiser l'encoding vidéo avec NVENC

### **📖 Ressources Avancées**

- **[Configuration Multi-GPU](./api-reference.md#multi-gpu)** → Scaling horizontal
- **[Optimisation Performance](./api-reference.md#performance)** → Tuning avancé
- **[Monitoring GPU](./api-reference.md#monitoring)** → Observabilité

:::tip Performance Tip 💡
Pour les workloads de production, utilisez toujours des instances g1.xxlarge ou supérieures avec stockage NVMe local pour les datasets temporaires.
:::

:::warning Important 🚨
Les GPUs sont des ressources limitées. Pensez à arrêter vos VMs (`kubectl patch vm vm-gpu-example -p '{"spec":{"running":false}}'`) quand vous ne les utilisez pas pour optimiser les coûts.
:::

---

**Prêt pour plus ?** Consultez la [référence API complète](./api-reference.md) pour explorer toutes les possibilités des VMs GPU Hikube ! 🚀 