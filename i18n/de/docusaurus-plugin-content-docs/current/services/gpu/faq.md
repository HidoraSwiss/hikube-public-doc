---
sidebar_position: 6
title: FAQ
---

# FAQ — GPU

### Welche GPU-Modelle sind verfügbar?

Hikube bietet drei NVIDIA GPU-Familien:

| GPU | Architektur | Speicher | Anwendungsfall |
|-----|-------------|---------|-------------|
| **L40S** | Ada Lovelace | 48 GB GDDR6 | Inferenz, Grafik-Rendering |
| **A100** | Ampere | 80 GB HBM2e | ML-Training, wissenschaftliches Rechnen |
| **H100** | Hopper | 80 GB HBM3 | LLM, Exascale-Rechnen |

Die in den Manifesten zu verwendenden Bezeichner:

```yaml
gpus:
  - name: "nvidia.com/AD102GL_L40S"       # L40S
  - name: "nvidia.com/GA100_A100_PCIE_80GB" # A100
  - name: "nvidia.com/H100_94GB"           # H100
```

---

### Was ist der Unterschied zwischen GPU in VM und GPU in Kubernetes?

| Aspekt | GPU in VM | GPU in Kubernetes |
|--------|----------|-------------------|
| **Zugriffsmodus** | Exklusiver PCI Passthrough | Geteiltes Device Plugin |
| **Isolation** | GPU dediziert für die VM | Durch K8s orchestriertes Scheduling |
| **Treiberinstallation** | Manuell (cloud-init) | Automatisch (GPU Operator) |
| **Anwendungsfall** | Dedizierte Workstation, CUDA-Entwicklung | Containerisierte Workloads, Batch |

In der VM wird der GPU direkt über PCI Passthrough angehängt: die VM hat exklusiven Zugriff auf die Hardware. In Kubernetes verwaltet der GPU Operator die Treiber und das Scheduling ermöglicht die Teilung der GPU-Ressourcen zwischen mehreren Pods.

---

### Welches CPU/GPU-Verhältnis wird empfohlen?

Für eine optimale Nutzung planen Sie **8 bis 16 vCPU pro GPU**. Die Instanzen der **Universal (u1)**-Serie mit einem Verhältnis von 1:4 werden empfohlen:

| Konfiguration | Instanz | vCPU | RAM |
|--------------|----------|------|-----|
| 1 GPU | `u1.2xlarge` | 8 | 32 GB |
| 1 GPU (intensiv) | `u1.4xlarge` | 16 | 64 GB |
| Multi-GPU | `u1.8xlarge` | 32 | 128 GB |

---

### Wie werden die NVIDIA-Treiber installiert?

Die Installation hängt vom Nutzungsmodus ab:

**In der VM**: Manuell über cloud-init beim Start installieren:

```yaml title="vm-gpu.yaml"
spec:
  cloudInit: |
    #cloud-config
    runcmd:
      - apt-get update
      - apt-get install -y linux-headers-$(uname -r)
      - apt-get install -y nvidia-driver-550 nvidia-utils-550
```

**In Kubernetes**: Den GPU Operator-Addon aktivieren, der die Treiber automatisch auf den GPU-Knoten installiert:

```yaml title="cluster-gpu.yaml"
spec:
  addons:
    gpuOperator:
      enabled: true
```

---

### Wie überprüfe ich, ob der GPU erkannt wird?

**In der VM**:

```bash
nvidia-smi
```

Dieser Befehl zeigt die erkannten GPUs, ihre Speichernutzung und die aktiven Prozesse an.

**In Kubernetes**:

```bash
kubectl get nodes -o json | jq '.items[].status.allocatable["nvidia.com/gpu"]'
```

Sie können auch aus einem Pod heraus überprüfen:

```bash
kubectl exec -it <pod-name> -- nvidia-smi
```

---

### Wie fordere ich einen GPU in einem Kubernetes-Pod an?

Geben Sie die Ressource `nvidia.com/gpu` in den Container-Limits an:

```yaml title="pod-gpu.yaml"
apiVersion: v1
kind: Pod
metadata:
  name: gpu-workload
spec:
  containers:
    - name: cuda-app
      image: nvidia/cuda:12.0-base
      resources:
        limits:
          nvidia.com/gpu: 1
```

:::note
Die in `limits` angeforderte GPU-Anzahl muss den physisch auf den Knoten verfügbaren GPUs entsprechen. Ein Pod kann keinen Bruchteil eines GPU anfordern.
:::
