---
sidebar_position: 2
title: Démarrage rapide
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# Utiliser les GPU sur Hikube

Ce guide présente les deux méthodes d'utilisation des GPU : avec des machines virtuelles et avec des clusters Kubernetes.

---

## 🎯 Méthodes d'Usage

Hikube propose deux approches pour utiliser les GPU :

1. **GPU avec VM** : Attachment direct d'un GPU à une machine virtuelle
2. **GPU avec Kubernetes** : Allocation de GPU aux workers pour utilisation par les pods

---

## 🖥️ Méthode 1 : GPU avec Machine Virtuelle

### **Étape 1 : Créer le disque**

```yaml title="vm-disk.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: VMDisk
metadata:
  name: ubuntu-gpu-disk
spec:
  source:
    http:
      url: https://cloud-images.ubuntu.com/noble/current/noble-server-cloudimg-amd64.img
  optical: false
  storage: 50Gi
  storageClass: "replicated"
```

### **Étape 2 : Créer la VM avec GPU**

```yaml title="vm-gpu.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: VirtualMachine
metadata:
  name: vm-gpu-example
spec:
  running: true
  instanceProfile: ubuntu
  instanceType: u1.xlarge  # 4 vCPU, 16 GB RAM
  gpus:
    - name: "nvidia.com/AD102GL_L40S"
  systemDisk:
    size: 50Gi
    storageClass: replicated
  external: true
  externalMethod: PortList
  externalPorts:
    - 22
  sshKeys:
    - "ssh-rsa AAAAB3NzaC... votre-clé-publique"
  cloudInit: |
    #cloud-config
    users:
      - name: ubuntu
        sudo: ALL=(ALL) NOPASSWD:ALL
        shell: /bin/bash
    
    package_update: true
    packages:
      - curl
      - wget
      - build-essential
    
    runcmd:
      # Installation pilotes NVIDIA
      - wget https://developer.download.nvidia.com/compute/cuda/repos/ubuntu2204/x86_64/cuda-keyring_1.0-1_all.deb
      - dpkg -i cuda-keyring_1.0-1_all.deb
      - apt-get update
      - apt-get install -y cuda-toolkit nvidia-driver-535
      - nvidia-smi -pm 1
```

### **Étape 3 : Déployer**

```bash
kubectl apply -f vm-disk.yaml
kubectl apply -f vm-gpu.yaml

# Vérifier l'état
kubectl get virtualmachine vm-gpu-example
```

### **Étape 4 : Accéder et tester**

```bash
# Accès SSH
virtctl ssh ubuntu@vm-gpu-example

# Vérifier le GPU
nvidia-smi
```

---

## ☸️ Méthode 2 : GPU avec Kubernetes

### **Étape 1 : Créer un cluster avec workers GPU**

```yaml title="cluster-gpu.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Kubernetes
metadata:
  name: cluster-gpu
spec:
  controlPlane:
    replicas: 1
  
  nodeGroups:
    # Workers GPU
    gpu-nodes:
      minReplicas: 1
      maxReplicas: 3
      instanceType: "u1.xlarge"
      ephemeralStorage: 100Gi
      gpus:
        - name: "nvidia.com/AD102GL_L40S"
    
    # Workers standard (optionnel)
    standard-nodes:
      minReplicas: 1
      maxReplicas: 2
      instanceType: "s1.medium"
      ephemeralStorage: 50Gi
  
  storageClass: "replicated"
```

### **Étape 2 : Déployer le cluster**

```bash
kubectl apply -f cluster-gpu.yaml

# Attendre que le cluster soit prêt
kubectl get kubernetes cluster-gpu -w
```

### **Étape 3 : Configurer l'accès**

```bash
# Récupérer le kubeconfig
kubectl get secret cluster-gpu-admin-kubeconfig \
  -o go-template='{{ printf "%s\n" (index .data "super-admin.conf" | base64decode) }}' \
  > cluster-gpu-kubeconfig.yaml

# Utiliser le cluster GPU
export KUBECONFIG=cluster-gpu-kubeconfig.yaml
kubectl get nodes
```

### **Étape 4 : Déployer un pod GPU**

```yaml title="pod-gpu.yaml"
apiVersion: v1
kind: Pod
metadata:
  name: gpu-test
spec:
  containers:
  - name: gpu-container
    image: nvidia/cuda:12.0-runtime-ubuntu20.04
    command: ["sleep", "infinity"]
    resources:
      limits:
        nvidia.com/gpu: 1
      requests:
        nvidia.com/gpu: 1
```

```bash
kubectl apply -f pod-gpu.yaml

# Vérifier l'allocation GPU
kubectl describe pod gpu-test

# Tester le GPU
kubectl exec -it gpu-test -- nvidia-smi
```

---

## 📋 Comparaison Pratique

| **Aspect** | **VM GPU** | **Kubernetes GPU** |
|------------|------------|-------------------|
| **Temps setup** | ~5 minutes | ~10 minutes |
| **Complexité** | Simple | Modérée |
| **Isolation** | Totale | Partielle |
| **Flexibilité** | Limitée | Élevée |
| **Scaling** | Manuel | Automatique |

---

## 🔧 Types de GPU Disponibles

### **Configuration selon l'usage**

```yaml
# Pour inférence/développement
gpus:
  - name: "nvidia.com/AD102GL_L40S"  # 48 GB GDDR6

# Pour entraînement ML
gpus:
  - name: "nvidia.com/GA100_A100_PCIE_80GB"  # 80 GB HBM2e

# Pour LLM/calcul exascale
gpus:
  - name: "nvidia.com/H100_94GB"  # 80 GB HBM3
```

---

## ✅ Vérifications Post-Déploiement

### **VM GPU**

```bash
# Vérifier le GPU
virtctl ssh ubuntu@vm-gpu-example -- nvidia-smi

# Test CUDA
virtctl ssh ubuntu@vm-gpu-example -- nvcc --version
```

### **Kubernetes GPU**

```bash
# Voir les ressources GPU disponibles
kubectl describe nodes

# Vérifier l'allocation
kubectl top nodes
```

---

## Nettoyage

### Supprimer une VM GPU

```bash
kubectl delete -f vm-gpu.yaml
kubectl delete -f vm-disk.yaml
```

### Supprimer un cluster Kubernetes GPU

```bash
kubectl delete -f cluster-gpu.yaml
```

:::warning
Ces actions suppriment les ressources GPU et toutes les données associées. Ces opérations sont **irréversibles**.
:::

---

## 🚀 Prochaines Étapes

### **Pour approfondir VM GPU :**

- [Configuration avancée VM](./api-reference.md)
- [Types d'instances optimisées](../compute/api-reference.md)

### **Pour approfondir Kubernetes GPU :**

- [Clusters avec GPU](../kubernetes/api-reference.md)
- [Scaling automatique](../kubernetes/overview.md)

---

## 💡 Conseils

- **VM GPU** : Idéal pour prototypage et applications legacy
- **Kubernetes GPU** : Recommandé pour workloads de production scalables
- Commencez par **L40S** pour tester avant d'utiliser A100/H100
- Utilisez `replicated` storage class pour la production

<NavigationFooter
  nextSteps={[
    {label: "FAQ", href: "../faq"},
    {label: "Référence API", href: "../api-reference"},
  ]}
  seeAlso={[
    {label: "Ressources de calcul", href: "../../compute/"},
  ]}
/>
