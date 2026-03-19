---
sidebar_position: 3
title: API-Referenz
---

# API-Referenz - GPU

Diese Referenz beschreibt die APIs zur Nutzung von GPUs auf Hikube, sowohl mit virtuellen Maschinen als auch mit Kubernetes-Clustern.

---

## 🖥️ GPU mit Virtuellen Maschinen

### **VirtualMachine-API**

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
    - name: "nvidia.com/AD102GL_L40S"
```

#### **GPU-Parameter für VM**

| **Parameter** | **Typ** | **Beschreibung** | **Erforderlich** |
|---------------|----------|-----------------|------------|
| `gpus` | `[]GPU` | Liste der anzuhängenden GPUs | ✅ |
| `gpus[].name` | `string` | NVIDIA GPU-Typ | ✅ |

#### **Verfügbare GPU-Typen**

```yaml
# GPU für Inferenz und Entwicklung
gpus:
  - name: "nvidia.com/AD102GL_L40S"

# GPU für ML-Training
gpus:
  - name: "nvidia.com/GA100_A100_PCIE_80GB"

# GPU für LLM und Exascale-Rechnen
gpus:
  - name: "nvidia.com/H100_94GB"
```

#### **Hardware-Spezifikationen**

| **GPU** | **Architektur** | **Speicher** | **Leistung** |
|---------|------------------|-------------|-----------------|
| **L40S** | Ada Lovelace | 48 GB GDDR6 | 362 TOPS (INT8) |
| **A100** | Ampere | 80 GB HBM2e | 312 TOPS (INT8) |
| **H100** | Hopper | 80 GB HBM3 | 1979 TOPS (INT8) |

#### **Vollständiges VM GPU-Beispiel**

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
    - name: "nvidia.com/GA100_A100_PCIE_80GB"
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
      # NVIDIA-Treiber
      - wget https://developer.download.nvidia.com/compute/cuda/repos/ubuntu2204/x86_64/cuda-keyring_1.0-1_all.deb
      - dpkg -i cuda-keyring_1.0-1_all.deb
      - apt-get update
      - apt-get install -y cuda-toolkit nvidia-driver-535

      # PyTorch mit CUDA
      - pip3 install torch torchvision --index-url https://download.pytorch.org/whl/cu121
```

---

## ☸️ GPU mit Kubernetes

### **Kubernetes-API mit GPU-Workern**

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
        - name: "nvidia.com/AD102GL_L40S"
```

#### **GPU-Parameter für NodeGroups**

| **Parameter** | **Typ** | **Beschreibung** | **Erforderlich** |
|---------------|----------|-----------------|------------|
| `nodeGroups.<name>.gpus` | `[]GPU` | GPUs für die Worker | ❌ |
| `gpus[].name` | `string` | NVIDIA GPU-Typ | ✅ |

#### **Multi-GPU-Konfiguration**

```yaml
nodeGroups:
  gpu-intensive:
    minReplicas: 1
    maxReplicas: 2
    instanceType: "u1.4xlarge"  # 16 vCPU, 64 GB RAM
    gpus:
      - name: "nvidia.com/GA100_A100_PCIE_80GB"
      - name: "nvidia.com/GA100_A100_PCIE_80GB"
      - name: "nvidia.com/GA100_A100_PCIE_80GB"
      - name: "nvidia.com/GA100_A100_PCIE_80GB"
```

#### **Verwendung in Pods**

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

#### **Multi-GPU-Job**

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

## 📋 Vergleich der Ansätze

### **VM GPU vs Kubernetes GPU**

| **Aspekt** | **VM GPU** | **Kubernetes GPU** |
|------------|------------|-------------------|
| **Zuweisung** | 1 GPU = 1 VM (exklusiv) | 1+ GPU pro Worker (teilbar) |
| **Isolation** | Vollständig auf VM-Ebene | Namespace/Pod |
| **Skalierung** | Vertikal (mehr GPUs) | Horizontal + Vertikal |
| **Verwaltung** | Manuell via YAML | Orchestriert durch K8s |
| **Teilung** | Nein | Ja (zwischen Pods) |
| **Overhead** | Minimal | Orchestrierungs-Overhead |

### **Wann welchen Ansatz verwenden**

#### **VM GPU empfohlen für:**

- Nicht-containerisierte Legacy-Anwendungen
- Bedarf an direktem und vollständigem GPU-Zugang
- Entwicklung und Prototyping
- Monolithische Workloads
- Grafische Anwendungen (Rendering, CAD)

#### **Kubernetes GPU empfohlen für:**

- Containerisierte Anwendungen
- Workloads, die automatische Skalierung erfordern
- Parallele und verteilte Jobs
- GPU-Ressourcenteilung
- Komplexe ML/AI-Pipelines

---

## 🔧 Erweiterte Konfiguration

### **Multi-GPU auf VM**

```yaml
apiVersion: apps.cozystack.io/v1alpha1
kind: VirtualMachine
metadata:
  name: multi-gpu-vm
spec:
  instanceType: u1.8xlarge  # 32 vCPU, 128 GB RAM
  gpus:
    - name: "nvidia.com/H100_94GB"
    - name: "nvidia.com/H100_94GB"
    - name: "nvidia.com/H100_94GB"
    - name: "nvidia.com/H100_94GB"
```

### **Spezialisierte GPU-NodeGroup**

```yaml
nodeGroups:
  gpu-inference:
    minReplicas: 2
    maxReplicas: 10
    instanceType: "u1.large"
    gpus:
      - name: "nvidia.com/AD102GL_L40S"

  gpu-training:
    minReplicas: 1
    maxReplicas: 3
    instanceType: "u1.4xlarge"
    gpus:
      - name: "nvidia.com/GA100_A100_PCIE_80GB"
      - name: "nvidia.com/GA100_A100_PCIE_80GB"
```

### **Pod mit spezifischem GPU**

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

## ✅ Überprüfung und Monitoring

### **VM GPU-Überprüfung**

```bash
# Auf die VM zugreifen
virtctl ssh ubuntu@vm-gpu

# GPUs überprüfen
nvidia-smi

# CUDA-Test
nvidia-smi --query-gpu=name,memory.total,utilization.gpu --format=csv
```

### **Kubernetes GPU-Überprüfung**

```bash
# GPU-Ressourcen auf den Nodes anzeigen
kubectl describe nodes

# GPU-Zuweisung überprüfen
kubectl get nodes -o custom-columns=NAME:.metadata.name,GPU:.status.allocatable.'nvidia\.com/gpu'

# GPU-Nutzung überwachen
kubectl top nodes
```

### **GPU-Monitoring in einem Pod**

```bash
# In einen Pod mit GPU einsteigen
kubectl exec -it <pod-name> -- nvidia-smi

# GPU-Metriken anzeigen
kubectl exec -it <pod-name> -- nvidia-smi --query-gpu=utilization.gpu,memory.used,memory.total --format=csv -l 5
```

---

## 💡 Best Practices

### **Für VM GPU:**

- Verwenden Sie die `replicated` Storage Class für die Produktion
- Dimensionieren Sie CPU/RAM entsprechend dem GPU (Verhältnis 8-16 vCPU pro GPU)
- Installieren Sie NVIDIA-Treiber über cloud-init
- Stoppen Sie VMs bei Nichtbenutzung, um Kosten zu optimieren

### **Für Kubernetes GPU:**

- Konfigurieren Sie angemessene Resource Limits
- Verwenden Sie nodeSelector oder nodeAffinity, um spezifische GPUs anzuvisieren
- Implementieren Sie PodDisruptionBudgets für kritische Workloads
- Überwachen Sie die GPU-Nutzung mit benutzerdefinierten Metriken

### **Allgemein:**

- L40S für Inferenz/Entwicklung
- A100 für Standard-ML-Training
- H100 für LLM und Exascale-Rechnen
- Testen Sie mit L40S, bevor Sie auf teurere GPUs umsteigen
