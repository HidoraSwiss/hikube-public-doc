---
sidebar_position: 2
title: Avvio rapido
---

# Utilizzare le GPU su Hikube

Questa guida presenta i due metodi di utilizzo delle GPU: con macchine virtuali e con cluster Kubernetes.

---

## 🎯 Metodi di Utilizzo

Hikube propone due approcci per utilizzare le GPU:

1. **GPU con VM**: Collegamento diretto di una GPU a una macchina virtuale
2. **GPU con Kubernetes**: Allocazione di GPU ai worker per l'utilizzo da parte dei pod

---

## 🖥️ Metodo 1: GPU con Macchina Virtuale

### **Passo 1: Creare il disco**

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

### **Passo 2: Creare la VM con GPU**

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
    - "ssh-rsa AAAAB3NzaC... vostra-chiave-pubblica"
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
      # Installazione driver NVIDIA
      - wget https://developer.download.nvidia.com/compute/cuda/repos/ubuntu2204/x86_64/cuda-keyring_1.0-1_all.deb
      - dpkg -i cuda-keyring_1.0-1_all.deb
      - apt-get update
      - apt-get install -y cuda-toolkit nvidia-driver-535
      - nvidia-smi -pm 1
```

### **Passo 3: Distribuire**

```bash
kubectl apply -f vm-disk.yaml
kubectl apply -f vm-gpu.yaml

# Verificare lo stato
kubectl get virtualmachine vm-gpu-example
```

### **Passo 4: Accedere e testare**

```bash
# Accesso SSH
virtctl ssh ubuntu@vm-gpu-example

# Verificare la GPU
nvidia-smi
```

---

## ☸️ Metodo 2: GPU con Kubernetes

### **Passo 1: Creare un cluster con worker GPU**

```yaml title="cluster-gpu.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Kubernetes
metadata:
  name: cluster-gpu
spec:
  controlPlane:
    replicas: 1

  nodeGroups:
    # Worker GPU
    gpu-nodes:
      minReplicas: 1
      maxReplicas: 3
      instanceType: "u1.xlarge"
      ephemeralStorage: 100Gi
      gpus:
        - name: "nvidia.com/AD102GL_L40S"

    # Worker standard (opzionale)
    standard-nodes:
      minReplicas: 1
      maxReplicas: 2
      instanceType: "s1.medium"
      ephemeralStorage: 50Gi

  storageClass: "replicated"
```

### **Passo 2: Distribuire il cluster**

```bash
kubectl apply -f cluster-gpu.yaml

# Attendere che il cluster sia pronto
kubectl get kubernetes cluster-gpu -w
```

### **Passo 3: Configurare l'accesso**

```bash
# Recuperare il kubeconfig
kubectl get secret cluster-gpu-admin-kubeconfig \
  -o go-template='{{ printf "%s\n" (index .data "super-admin.conf" | base64decode) }}' \
  > cluster-gpu-kubeconfig.yaml

# Utilizzare il cluster GPU
export KUBECONFIG=cluster-gpu-kubeconfig.yaml
kubectl get nodes
```

### **Passo 4: Distribuire un pod GPU**

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

# Verificare l'allocazione GPU
kubectl describe pod gpu-test

# Testare la GPU
kubectl exec -it gpu-test -- nvidia-smi
```

---

## 📋 Confronto Pratico

| **Aspetto** | **VM GPU** | **Kubernetes GPU** |
|------------|------------|-------------------|
| **Tempo setup** | ~5 minuti | ~10 minuti |
| **Complessità** | Semplice | Moderata |
| **Isolamento** | Totale | Parziale |
| **Flessibilità** | Limitata | Elevata |
| **Scaling** | Manuale | Automatico |

---

## 🔧 Tipi di GPU Disponibili

### **Configurazione secondo l'uso**

```yaml
# Per inferenza/sviluppo
gpus:
  - name: "nvidia.com/AD102GL_L40S"  # 48 GB GDDR6

# Per addestramento ML
gpus:
  - name: "nvidia.com/GA100_A100_PCIE_80GB"  # 80 GB HBM2e

# Per LLM/calcolo exascale
gpus:
  - name: "nvidia.com/H100_94GB"  # 80 GB HBM3
```

---

## ✅ Verifiche Post-Deployment

### **VM GPU**

```bash
# Verificare la GPU
virtctl ssh ubuntu@vm-gpu-example -- nvidia-smi

# Test CUDA
virtctl ssh ubuntu@vm-gpu-example -- nvcc --version
```

### **Kubernetes GPU**

```bash
# Vedere le risorse GPU disponibili
kubectl describe nodes

# Verificare l'allocazione
kubectl top nodes
```

---

## Pulizia

### Eliminare una VM GPU

```bash
kubectl delete -f vm-gpu.yaml
kubectl delete -f vm-disk.yaml
```

### Eliminare un cluster Kubernetes GPU

```bash
kubectl delete -f cluster-gpu.yaml
```

:::warning
Queste azioni eliminano le risorse GPU e tutti i dati associati. Queste operazioni sono **irreversibili**.
:::

---

## 🚀 Prossimi Passi

### **Per approfondire VM GPU:**

- [Configurazione avanzata VM](./api-reference.md)
- [Tipi di istanze ottimizzate](../compute/api-reference.md)

### **Per approfondire Kubernetes GPU:**

- [Cluster con GPU](../kubernetes/api-reference.md)
- [Scaling automatico](../kubernetes/overview.md)

---

## 💡 Consigli

- **VM GPU**: Ideale per prototipazione e applicazioni legacy
- **Kubernetes GPU**: Raccomandato per workload di produzione scalabili
- Iniziate con **L40S** per testare prima di utilizzare A100/H100
- Utilizzate la storage class `replicated` per la produzione
