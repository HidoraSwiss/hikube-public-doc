---
sidebar_position: 3
title: API-Referenz
---

# API-Referenz - GPU

Diese Referenz beschreibt die Nutzung von GPUs auf Hikube, sowohl mit virtuellen Maschinen (`VMInstance`) als auch mit verwalteten Kubernetes-Clustern (`Kubernetes`).

---

## 🎮 Verfügbare GPUs

GPUs werden über ihren **Ressourcennamen** (`nvidia.com/<modell>`) angehängt. Die auf Hikube verfügbaren Modelle:

| GPU | Ressourcenname | Architektur | Speicher | Typischer Einsatz |
|-----|------------------|--------------|---------|---------------|
| **L40S** | `nvidia.com/AD102GL_L40S` | Ada Lovelace | 48 GB GDDR6 | Inferenz, Entwicklung, Rendering |
| **A100 PCIe 80 GB** | `nvidia.com/GA100_A100_PCIE_80GB` | Ampere | 80 GB HBM2e | ML-Training |
| **A100 SXM4 80 GB** | `nvidia.com/GA100_A100_SXM4_80GB` | Ampere | 80 GB HBM2e | ML-Training (Multi-GPU NVLink) |
| **RTX PRO 6000 Blackwell** | `nvidia.com/GB202GL_RTX_PRO_6000_BLACKWELL_SERVER_EDITION` | Blackwell | 96 GB GDDR7 | LLM, intensives Rechnen |

:::note Verfügbarkeit
Die verfügbare GPU-Hardware variiert je nach Zone. Überprüfen Sie die zuteilbaren Ressourcen auf der Plattformseite, bevor Sie einen Workload planen. Der NVIDIA-Treiber benötigt **mindestens 4 GiB RAM** auf der VM oder dem Worker.
:::

---

## 🖥️ GPU mit Virtuellen Maschinen

Auf einer VM wird der GPU im **PCI Passthrough** (exklusive Zuweisung) über das Feld `gpus` einer [`VMInstance`](../compute/api-reference.md)-Ressource angehängt. Die Festplatte wird separat durch eine [`VMDisk`](../compute/api-reference.md#vmdisk)-Ressource definiert.

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

:::warning Häufige Stolperfallen
- Die Ressource heißt **`VMInstance`** (nicht `VirtualMachine`).
- Der Zustand wird über **`runStrategy: Always`** gesteuert (nicht `running: true`).
- Die Festplatte ist **kein** integriertes `systemDisk`-Feld: Erstellen Sie eine `VMDisk`-Ressource und referenzieren Sie sie in `disks` (Liste von `{name}`-Objekten).
:::

### GPU-Parameter für VM

| **Parameter** | **Typ** | **Beschreibung** | **Erforderlich** |
|---------------|----------|-----------------|------------|
| `gpus` | `[]object` | Liste der anzuhängenden GPUs | nein |
| `gpus[].name` | `string` | Name der GPU-Ressource (`nvidia.com/...`) | ja (wenn `gpus` definiert) |

### Vollständiges VM GPU-Beispiel

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
      # NVIDIA-Treiber + CUDA (genaue Version siehe dediziertes Handbuch)
      - wget https://developer.download.nvidia.com/compute/cuda/repos/ubuntu2404/x86_64/cuda-keyring_1.1-1_all.deb
      - dpkg -i cuda-keyring_1.1-1_all.deb
      - apt-get update
      - apt-get install -y cuda-toolkit nvidia-driver-570
      # PyTorch mit CUDA
      - pip3 install torch torchvision
```

### Multi-GPU auf VM

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

## ☸️ GPU mit Kubernetes

Auf einem verwalteten Kubernetes-Cluster werden die GPUs an die **Node Groups** angehängt, und der Addon **`gpuOperator`** muss aktiviert sein, um die GPUs den Pods bereitzustellen.

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
    # Erforderlich: installiert die NVIDIA-Treiber und das Device Plugin
    gpuOperator:
      enabled: true
```

:::warning Addon `gpuOperator` erforderlich
Ohne `gpuOperator: enabled: true` werden die GPUs der Worker nicht den Pods bereitgestellt (`nvidia.com/gpu` bleibt bei 0).
:::

### GPU-Parameter für NodeGroups

| **Parameter** | **Typ** | **Beschreibung** | **Erforderlich** |
|---------------|----------|-----------------|------------|
| `nodeGroups.<name>.gpus` | `[]object` | An die Worker der Gruppe angehängte GPUs | nein |
| `gpus[].name` | `string` | Name der GPU-Ressource (`nvidia.com/...`) | ja (wenn `gpus` definiert) |
| `addons.gpuOperator.enabled` | `boolean` | Aktiviert den NVIDIA GPU Operator | ja (um die GPUs zu nutzen) |

### Multi-GPU-Konfiguration pro Worker

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

### Verwendung in Pods

Sobald der `gpuOperator` aktiv ist, reservieren die Pods die GPUs über die Ressource `nvidia.com/gpu`:

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

| **Aspekt** | **VM GPU** | **Kubernetes GPU** |
|------------|------------|-------------------|
| **Zuweisung** | 1 GPU = 1 VM (exklusiver Passthrough) | 1+ GPU pro Worker |
| **Isolation** | Vollständig auf VM-Ebene | Namespace / Pod |
| **Skalierung** | Vertikal (mehr GPUs) | Horizontal + Vertikal (Autoscaling) |
| **Verwaltung** | Manuell via `VMInstance` | Orchestriert durch Kubernetes |
| **Teilung** | Nein | Ja (zwischen Pods) |
| **Overhead** | Minimal | Orchestrierungs-Overhead |

**VM GPU**: nicht-containerisierte Anwendungen, direkter GPU-Zugang, Entwicklung/Prototyping, Rendering/CAD.

**Kubernetes GPU**: containerisierte Workloads, Autoscaling, parallele/verteilte Jobs, ML/AI-Pipelines.

---

## ✅ Überprüfung

### VM GPU

```bash
virtctl ssh ubuntu@vm-gpu
nvidia-smi
nvidia-smi --query-gpu=name,memory.total,utilization.gpu --format=csv
```

### Kubernetes GPU

```bash
# Auf den Nodes bereitgestellte GPUs (erfordert aktiven gpuOperator)
kubectl get nodes -o custom-columns=NAME:.metadata.name,GPU:.status.allocatable.'nvidia\.com/gpu'

# Aus einem Pod heraus überprüfen
kubectl exec -it <pod-name> -- nvidia-smi
```

---

## 💡 Best Practices

- **L40S** für Inferenz und Entwicklung, **A100** für ML-Training, **RTX PRO 6000 (Blackwell)** für die anspruchsvollsten Workloads.
- Testen Sie mit einem L40S, bevor Sie die teureren GPUs reservieren.
- Dimensionieren Sie CPU/RAM entsprechend dem GPU (≈ 8–16 vCPU pro GPU) und planen Sie ≥ 4 GiB RAM ein.
- Auf VM: installieren Sie die NVIDIA-Treiber über cloud-init (siehe [CUDA-Treiber installieren](../compute/how-to/install-cuda-drivers.md)).
- Auf Kubernetes: aktivieren Sie immer den Addon `gpuOperator`.
- Verwenden Sie die `storageClass` `replicated` in der Produktion.
