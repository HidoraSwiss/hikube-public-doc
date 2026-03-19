---
sidebar_position: 2
title: Schnellstart
---

# GPUs auf Hikube nutzen

Diese Anleitung stellt die beiden Methoden zur GPU-Nutzung vor: mit virtuellen Maschinen und mit Kubernetes-Clustern.

---

## 🎯 Nutzungsmethoden

Hikube bietet zwei Ansätze zur GPU-Nutzung:

1. **GPU mit VM**: Direktes Anhängen eines GPU an eine virtuelle Maschine
2. **GPU mit Kubernetes**: GPU-Zuweisung an Worker zur Nutzung durch Pods

---

## 🖥️ Methode 1: GPU mit Virtueller Maschine

### **Schritt 1: Festplatte erstellen**

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

### **Schritt 2: VM mit GPU erstellen**

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
    - "ssh-rsa AAAAB3NzaC... ihr-oeffentlicher-schluessel"
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
      # NVIDIA-Treiber installieren
      - wget https://developer.download.nvidia.com/compute/cuda/repos/ubuntu2204/x86_64/cuda-keyring_1.0-1_all.deb
      - dpkg -i cuda-keyring_1.0-1_all.deb
      - apt-get update
      - apt-get install -y cuda-toolkit nvidia-driver-535
      - nvidia-smi -pm 1
```

### **Schritt 3: Bereitstellen**

```bash
kubectl apply -f vm-disk.yaml
kubectl apply -f vm-gpu.yaml

# Status überprüfen
kubectl get virtualmachine vm-gpu-example
```

### **Schritt 4: Zugreifen und testen**

```bash
# SSH-Zugang
virtctl ssh ubuntu@vm-gpu-example

# GPU überprüfen
nvidia-smi
```

---

## ☸️ Methode 2: GPU mit Kubernetes

### **Schritt 1: Cluster mit GPU-Workern erstellen**

```yaml title="cluster-gpu.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Kubernetes
metadata:
  name: cluster-gpu
spec:
  controlPlane:
    replicas: 1

  nodeGroups:
    # GPU-Worker
    gpu-nodes:
      minReplicas: 1
      maxReplicas: 3
      instanceType: "u1.xlarge"
      ephemeralStorage: 100Gi
      gpus:
        - name: "nvidia.com/AD102GL_L40S"

    # Standard-Worker (optional)
    standard-nodes:
      minReplicas: 1
      maxReplicas: 2
      instanceType: "s1.medium"
      ephemeralStorage: 50Gi

  storageClass: "replicated"
```

### **Schritt 2: Cluster bereitstellen**

```bash
kubectl apply -f cluster-gpu.yaml

# Warten, bis der Cluster bereit ist
kubectl get kubernetes cluster-gpu -w
```

### **Schritt 3: Zugang konfigurieren**

```bash
# Kubeconfig abrufen
kubectl get secret cluster-gpu-admin-kubeconfig \
  -o go-template='{{ printf "%s\n" (index .data "super-admin.conf" | base64decode) }}' \
  > cluster-gpu-kubeconfig.yaml

# GPU-Cluster verwenden
export KUBECONFIG=cluster-gpu-kubeconfig.yaml
kubectl get nodes
```

### **Schritt 4: GPU-Pod bereitstellen**

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

# GPU-Zuweisung überprüfen
kubectl describe pod gpu-test

# GPU testen
kubectl exec -it gpu-test -- nvidia-smi
```

---

## 📋 Praktischer Vergleich

| **Aspekt** | **VM GPU** | **Kubernetes GPU** |
|------------|------------|-------------------|
| **Setup-Zeit** | ~5 Minuten | ~10 Minuten |
| **Komplexität** | Einfach | Moderat |
| **Isolation** | Vollständig | Teilweise |
| **Flexibilität** | Begrenzt | Hoch |
| **Skalierung** | Manuell | Automatisch |

---

## 🔧 Verfügbare GPU-Typen

### **Konfiguration nach Anwendungsfall**

```yaml
# Für Inferenz/Entwicklung
gpus:
  - name: "nvidia.com/AD102GL_L40S"  # 48 GB GDDR6

# Für ML-Training
gpus:
  - name: "nvidia.com/GA100_A100_PCIE_80GB"  # 80 GB HBM2e

# Für LLM/Exascale-Rechnen
gpus:
  - name: "nvidia.com/H100_94GB"  # 80 GB HBM3
```

---

## ✅ Überprüfungen nach der Bereitstellung

### **VM GPU**

```bash
# GPU überprüfen
virtctl ssh ubuntu@vm-gpu-example -- nvidia-smi

# CUDA testen
virtctl ssh ubuntu@vm-gpu-example -- nvcc --version
```

### **Kubernetes GPU**

```bash
# Verfügbare GPU-Ressourcen anzeigen
kubectl describe nodes

# Zuweisung überprüfen
kubectl top nodes
```

---

## Bereinigung

### GPU-VM löschen

```bash
kubectl delete -f vm-gpu.yaml
kubectl delete -f vm-disk.yaml
```

### GPU-Kubernetes-Cluster löschen

```bash
kubectl delete -f cluster-gpu.yaml
```

:::warning
Diese Aktionen löschen die GPU-Ressourcen und alle zugehörigen Daten. Diese Operationen sind **unwiderruflich**.
:::

---

## 🚀 Nächste Schritte

### **VM GPU vertiefen:**

- [Erweiterte VM-Konfiguration](./api-reference.md)
- [Optimierte Instanztypen](../compute/api-reference.md)

### **Kubernetes GPU vertiefen:**

- [Cluster mit GPU](../kubernetes/api-reference.md)
- [Automatische Skalierung](../kubernetes/overview.md)

---

## 💡 Tipps

- **VM GPU**: Ideal für Prototyping und Legacy-Anwendungen
- **Kubernetes GPU**: Empfohlen für skalierbare Produktions-Workloads
- Beginnen Sie mit **L40S** zum Testen, bevor Sie A100/H100 verwenden
- Verwenden Sie die `replicated` Storage Class für die Produktion
