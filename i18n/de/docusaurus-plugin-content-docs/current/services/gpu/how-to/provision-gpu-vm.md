---
title: "GPU auf einer VM bereitstellen"
---

# GPU auf einer VM bereitstellen

Hikube ermöglicht es, einen oder mehrere NVIDIA-GPUs direkt an eine virtuelle Maschine anzuhängen. Diese Anleitung erklärt, wie Sie den für Ihren Workload geeigneten GPU-Typ auswählen, eine VM mit GPU erstellen und überprüfen, dass die Hardware-Beschleunigung verfügbar ist.

## Voraussetzungen

- **kubectl** konfiguriert mit Ihrem Hikube-Kubeconfig
- Ein **SSH**-Zugang zur VM (öffentlicher SSH-Schlüssel verfügbar)
- Vertrautheit mit den Konzepten von [virtuellen Maschinen](../../compute/overview.md) auf Hikube

## Schritte

### 1. GPU-Typ auswählen

Hikube bietet drei NVIDIA GPU-Familien für verschiedene Anwendungsfälle:

| GPU | Architektur | Speicher | Leistung | Anwendungsfall |
|-----|-------------|---------|-------------|-------------|
| **L40S** | Ada Lovelace | 48 GB GDDR6 | 362 TOPS (INT8) | Inferenz, Entwicklung, Prototyping |
| **A100** | Ampere | 80 GB HBM2e | 312 TOPS (INT8) | ML-Training, Fine-Tuning |
| **H100** | Hopper | 80 GB HBM3 | 1979 TOPS (INT8) | LLM, Exascale-Rechnen, verteiltes Training |

:::tip Welchen GPU wählen?
Beginnen Sie mit einem **L40S** für Entwicklung und Prototyping. Wechseln Sie zu einem **A100** für Standard-ML-Modelltraining und reservieren Sie den **H100** für anspruchsvolle Workloads wie LLM-Training oder Hochleistungsrechnen.
:::

Die GPU-Bezeichner für Ihre Manifeste sind:

| GPU | Wert `gpus[].name` |
|-----|----------------------|
| L40S | `nvidia.com/AD102GL_L40S` |
| A100 | `nvidia.com/GA100_A100_PCIE_80GB` |
| H100 | `nvidia.com/H100_94GB` |

### 2. VM-Manifest mit GPU erstellen

Erstellen Sie ein Manifest, das den gewünschten GPU im Abschnitt `spec.gpus` deklariert:

```yaml title="gpu-vm.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: VMInstance
metadata:
  name: gpu-workstation
spec:
  runStrategy: Always
  instanceProfile: ubuntu
  instanceType: u1.2xlarge
  gpus:
    - name: "nvidia.com/AD102GL_L40S"
  systemDisk:
    size: 100Gi
    storageClass: replicated
  external: true
  externalMethod: PortList
  externalPorts:
    - 22
    - 8888
  sshKeys:
    - ssh-ed25519 AAAA... user@host
```

:::tip Empfohlenes CPU/GPU-Verhältnis
Planen Sie **8 bis 16 vCPU pro GPU**. Für einen einzelnen GPU ist ein `u1.2xlarge` (8 vCPU, 32 GB RAM) ein guter Ausgangspunkt. Für Multi-GPU steigen Sie auf `u1.4xlarge` oder `u1.8xlarge` um.
:::

### 3. VM bereitstellen

Wenden Sie das Manifest an:

```bash
kubectl apply -f gpu-vm.yaml
```

Warten Sie, bis die VM im Zustand `Running` ist:

```bash
kubectl get vminstance gpu-workstation -w
```

**Erwartetes Ergebnis:**

```
NAME               STATUS    AGE
gpu-workstation    Running   2m
```

:::note
Die Bereitstellung einer VM mit GPU kann im Vergleich zu einer Standard-VM einige zusätzliche Minuten dauern, da der GPU zugewiesen und angehängt werden muss.
:::

### 4. GPU in der VM überprüfen

Verbinden Sie sich über SSH mit der VM:

```bash
virtctl ssh -i ~/.ssh/id_ed25519 ubuntu@gpu-workstation
```

Überprüfen Sie, ob der GPU erkannt wird:

```bash
nvidia-smi
```

**Erwartetes Ergebnis:**

```
+-----------------------------------------------------------------------------+
| NVIDIA-SMI 535.xx.xx    Driver Version: 535.xx.xx    CUDA Version: 12.x     |
|-------------------------------+----------------------+----------------------+
| GPU  Name        Persistence-M| Bus-Id        Disp.A | Volatile Uncorr. ECC |
| Fan  Temp  Perf  Pwr:Usage/Cap|         Memory-Usage | GPU-Util  Compute M. |
|===============================+======================+======================|
|   0  NVIDIA L40S         Off  | 00000000:00:06.0 Off |                    0 |
| N/A   30C    P0    35W / 350W |      0MiB / 46068MiB |      0%      Default |
+-------------------------------+----------------------+----------------------+
```

Für detaillierte Informationen:

```bash
nvidia-smi --query-gpu=name,memory.total,utilization.gpu --format=csv
```

### 5. Multi-GPU-VM konfigurieren

Für intensive Workloads (verteiltes Training, Inferenz im großen Maßstab) können Sie mehrere GPUs an dieselbe VM anhängen, indem Sie die Einträge in `spec.gpus` wiederholen:

```yaml title="multi-gpu-vm.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: VMInstance
metadata:
  name: multi-gpu-workstation
spec:
  runStrategy: Always
  instanceProfile: ubuntu
  instanceType: u1.8xlarge
  gpus:
    - name: "nvidia.com/H100_94GB"
    - name: "nvidia.com/H100_94GB"
    - name: "nvidia.com/H100_94GB"
    - name: "nvidia.com/H100_94GB"
  systemDisk:
    size: 200Gi
    storageClass: replicated
  external: true
  externalMethod: PortList
  externalPorts:
    - 22
    - 8888
  sshKeys:
    - ssh-ed25519 AAAA... user@host
```

:::warning
Für Multi-GPU dimensionieren Sie den Instanztyp entsprechend. Planen Sie mindestens 8 vCPU und 32 GB RAM pro GPU. Ein `u1.8xlarge` (32 vCPU, 128 GB RAM) ist für 4 GPUs geeignet.
:::

## Überprüfung

Bestätigen Sie nach der Bereitstellung, dass alles funktioniert:

1. **VM-Status überprüfen**:

```bash
kubectl get vminstance gpu-workstation
```

2. **GPU in der VM überprüfen**:

```bash
virtctl ssh -i ~/.ssh/id_ed25519 ubuntu@gpu-workstation -- nvidia-smi
```

3. **CUDA testen** (wenn die Treiber installiert sind):

```bash
virtctl ssh -i ~/.ssh/id_ed25519 ubuntu@gpu-workstation -- nvidia-smi --query-gpu=name,memory.total,driver_version,cuda_version --format=csv,noheader
```

## Weiterführende Informationen

- [GPU API-Referenz](../api-reference.md)
- [GPU auf Kubernetes bereitstellen](./provision-gpu-kubernetes.md)
- [CUDA-Treiber installieren](../../compute/how-to/install-cuda-drivers.md)
