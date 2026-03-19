---
title: "GPU auf Kubernetes bereitstellen"
---

# GPU auf Kubernetes bereitstellen

Hikube ermöglicht es, Node Groups mit NVIDIA-GPUs zu Ihren Kubernetes-Clustern hinzuzufügen. Diese Anleitung erklärt, wie Sie einen Cluster mit GPU-Workern konfigurieren, Pods bereitstellen, die GPU-Beschleunigung nutzen, und spezialisierte Node Groups einrichten.

## Voraussetzungen

- **kubectl** konfiguriert mit Ihrem Hikube-Kubeconfig
- Ein bestehender **Kubernetes-Cluster** auf Hikube (oder ein bereitstellungsbereites Manifest)
- Vertrautheit mit den Konzepten von [Kubernetes](../overview.md) auf Hikube

## Schritte

### 1. GPU Node Group zum Cluster hinzufügen

Ändern Sie das Manifest Ihres Clusters, um eine Node Group mit GPU hinzuzufügen. Die GPU-Konfiguration erfolgt auf Node Group-Ebene über `gpus[].name`:

```yaml title="cluster-gpu.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Kubernetes
metadata:
  name: cluster-gpu
spec:
  controlPlane:
    replicas: 1

  nodeGroups:
    default-workers:
      minReplicas: 1
      maxReplicas: 3
      instanceType: "u1.large"
      ephemeralStorage: 50Gi

    gpu-workers:
      minReplicas: 1
      maxReplicas: 5
      instanceType: "u1.xlarge"
      ephemeralStorage: 100Gi
      gpus:
        - name: "nvidia.com/AD102GL_L40S"
```

:::tip
Trennen Sie Ihre CPU- und GPU-Workloads in separate Node Groups. Dies ermöglicht eine unabhängige Skalierung und eine bessere Kostenkontrolle.
:::

### 2. Cluster-Konfiguration anwenden

```bash
kubectl apply -f cluster-gpu.yaml
```

Warten Sie, bis die GPU-Nodes bereit sind:

```bash
kubectl get nodes -w
```

**Erwartetes Ergebnis:**

```
NAME                        STATUS   ROLES    AGE   VERSION
cluster-gpu-cp-0            Ready    master   5m    v1.29.x
cluster-gpu-gpu-workers-0   Ready    <none>   3m    v1.29.x
```

### 3. GPU-Verfügbarkeit auf den Nodes überprüfen

Bestätigen Sie, dass die GPUs als Kubernetes-Ressourcen exponiert sind:

```bash
kubectl get nodes -o custom-columns=NAME:.metadata.name,GPU:.status.allocatable.'nvidia\.com/gpu'
```

**Erwartetes Ergebnis:**

```
NAME                        GPU
cluster-gpu-cp-0            <none>
cluster-gpu-gpu-workers-0   1
```

### 4. Pod mit GPU bereitstellen

Erstellen Sie einen Test-Pod, der einen GPU über `resources.limits` nutzt:

```yaml title="gpu-pod.yaml"
apiVersion: v1
kind: Pod
metadata:
  name: gpu-test
spec:
  containers:
  - name: cuda-test
    image: nvidia/cuda:12.0-runtime-ubuntu22.04
    command: ["nvidia-smi"]
    resources:
      limits:
        nvidia.com/gpu: 1
      requests:
        nvidia.com/gpu: 1
```

Anwenden und überprüfen:

```bash
kubectl apply -f gpu-pod.yaml
```

Warten Sie, bis der Pod seine Ausführung beendet:

```bash
kubectl wait --for=condition=Ready pod/gpu-test --timeout=120s
```

Konsultieren Sie die Logs, um zu bestätigen, dass der GPU sichtbar ist:

```bash
kubectl logs gpu-test
```

**Erwartetes Ergebnis:**

```
+-----------------------------------------------------------------------------+
| NVIDIA-SMI 535.xx.xx    Driver Version: 535.xx.xx    CUDA Version: 12.x     |
|-------------------------------+----------------------+----------------------+
| GPU  Name        Persistence-M| Bus-Id        Disp.A | Volatile Uncorr. ECC |
|===============================+======================+======================|
|   0  NVIDIA L40S         Off  | 00000000:00:06.0 Off |                    0 |
+-------------------------------+----------------------+----------------------+
```

### 5. Spezialisierte Node Groups konfigurieren

Für Produktionsumgebungen erstellen Sie dedizierte Node Groups für Inferenz und Training mit verschiedenen GPUs:

```yaml title="cluster-multi-gpu.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Kubernetes
metadata:
  name: cluster-ml
spec:
  controlPlane:
    replicas: 3

  nodeGroups:
    default-workers:
      minReplicas: 2
      maxReplicas: 5
      instanceType: "u1.large"
      ephemeralStorage: 50Gi

    gpu-inference:
      minReplicas: 2
      maxReplicas: 10
      instanceType: "u1.large"
      ephemeralStorage: 100Gi
      gpus:
        - name: "nvidia.com/AD102GL_L40S"

    gpu-training:
      minReplicas: 1
      maxReplicas: 3
      instanceType: "u1.4xlarge"
      ephemeralStorage: 200Gi
      gpus:
        - name: "nvidia.com/GA100_A100_PCIE_80GB"
        - name: "nvidia.com/GA100_A100_PCIE_80GB"
```

Um eine spezifische Node Group in Ihren Deployments anzuvisieren, verwenden Sie `nodeSelector`:

```yaml title="inference-deployment.yaml"
apiVersion: apps/v1
kind: Deployment
metadata:
  name: model-serving
spec:
  replicas: 3
  selector:
    matchLabels:
      app: model-serving
  template:
    metadata:
      labels:
        app: model-serving
    spec:
      nodeSelector:
        gpu-type: "L40S"
      containers:
      - name: inference
        image: my-model:latest
        resources:
          limits:
            nvidia.com/gpu: 1
          requests:
            nvidia.com/gpu: 1
```

:::note
Die für Kubernetes verfügbaren GPUs sind dieselben wie für VMs: **L40S** (Inferenz/Entwicklung), **A100** (ML-Training) und **H100** (LLM/Exascale). Konsultieren Sie die [GPU API-Referenz](../api-reference.md) für die vollständigen Spezifikationen.
:::

## Überprüfung

Bestätigen Sie nach der Bereitstellung, dass Ihre GPU-Konfiguration funktioniert:

1. **GPU-Nodes überprüfen**:

```bash
kubectl get nodes -o custom-columns=NAME:.metadata.name,GPU:.status.allocatable.'nvidia\.com/gpu'
```

2. **GPU-Zuweisung auf einem Node überprüfen**:

```bash
kubectl describe node cluster-gpu-gpu-workers-0 | grep -A 5 "Allocated resources"
```

3. **Mit einem interaktiven Pod testen**:

```bash
kubectl run gpu-debug --rm -it --image=nvidia/cuda:12.0-runtime-ubuntu22.04 \
  --overrides='{"spec":{"containers":[{"name":"gpu-debug","image":"nvidia/cuda:12.0-runtime-ubuntu22.04","command":["nvidia-smi"],"resources":{"limits":{"nvidia.com/gpu":"1"},"requests":{"nvidia.com/gpu":"1"}}}]}}' \
  --restart=Never
```

## Weiterführende Informationen

- [GPU API-Referenz](../api-reference.md)
- [GPU auf einer VM bereitstellen](./provision-gpu-vm.md)
- [Autoscaling konfigurieren](../../../services/kubernetes/how-to/configure-autoscaling.md)
- [Node Groups verwalten](../../../services/kubernetes/how-to/manage-node-groups.md)
