---
title: "Come provisionare un GPU su Kubernetes"
---

# Come provisionare un GPU su Kubernetes

Hikube permette di aggiungere node group equipaggiati con GPU NVIDIA ai vostri cluster Kubernetes. Questa guida spiega come configurare un cluster con worker GPU, distribuire pod che sfruttano l'accelerazione GPU e mettere in opera node group specializzati.

## Prerequisiti

- **kubectl** configurato con il vostro kubeconfig Hikube
- Un **cluster Kubernetes** esistente su Hikube (o un manifest pronto per il deployment)
- Familiarità con i concetti di [Kubernetes](../overview.md) su Hikube

## Passi

### 1. Aggiungere un node group GPU al cluster

Modificate il manifest del vostro cluster per aggiungere un node group con GPU. La configurazione GPU si fa a livello del node group tramite `gpus[].name`:

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
Separate i vostri workload CPU e GPU in node group distinti. Questo permette uno scaling indipendente e un migliore controllo dei costi.
:::

### 2. Applicare la configurazione del cluster

```bash
kubectl apply -f cluster-gpu.yaml
```

Attendete che i nodi GPU siano pronti:

```bash
kubectl get nodes -w
```

**Risultato atteso:**

```
NAME                        STATUS   ROLES    AGE   VERSION
cluster-gpu-cp-0            Ready    master   5m    v1.29.x
cluster-gpu-gpu-workers-0   Ready    <none>   3m    v1.29.x
```

### 3. Verificare la disponibilità GPU sui nodi

Confermate che le GPU siano ben esposte come risorse Kubernetes:

```bash
kubectl get nodes -o custom-columns=NAME:.metadata.name,GPU:.status.allocatable.'nvidia\.com/gpu'
```

**Risultato atteso:**

```
NAME                        GPU
cluster-gpu-cp-0            <none>
cluster-gpu-gpu-workers-0   1
```

### 4. Distribuire un pod con GPU

Create un pod di test che utilizza una GPU tramite i `resources.limits`:

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

Applicate e verificate:

```bash
kubectl apply -f gpu-pod.yaml
```

Attendete che il pod termini la sua esecuzione:

```bash
kubectl wait --for=condition=Ready pod/gpu-test --timeout=120s
```

Consultate i log per confermare che la GPU è visibile:

```bash
kubectl logs gpu-test
```

**Risultato atteso:**

```
+-----------------------------------------------------------------------------+
| NVIDIA-SMI 535.xx.xx    Driver Version: 535.xx.xx    CUDA Version: 12.x     |
|-------------------------------+----------------------+----------------------+
| GPU  Name        Persistence-M| Bus-Id        Disp.A | Volatile Uncorr. ECC |
|===============================+======================+======================|
|   0  NVIDIA L40S         Off  | 00000000:00:06.0 Off |                    0 |
+-------------------------------+----------------------+----------------------+
```

### 5. Configurare node group specializzati

Per gli ambienti di produzione, create node group dedicati all'inferenza e all'addestramento con GPU differenti:

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

Per indirizzare un node group specifico nei vostri deployment, utilizzate `nodeSelector`:

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
Le GPU disponibili per Kubernetes sono le stesse delle VM: **L40S** (inferenza/dev), **A100** (addestramento ML) e **H100** (LLM/exascale). Consultate il [riferimento API GPU](../api-reference.md) per le specifiche complete.
:::

## Verifica

Dopo il deployment, confermate che la vostra configurazione GPU funzioni:

1. **Verificate i nodi GPU**:

```bash
kubectl get nodes -o custom-columns=NAME:.metadata.name,GPU:.status.allocatable.'nvidia\.com/gpu'
```

2. **Verificate l'allocazione GPU su un nodo**:

```bash
kubectl describe node cluster-gpu-gpu-workers-0 | grep -A 5 "Allocated resources"
```

3. **Testate con un pod interattivo**:

```bash
kubectl run gpu-debug --rm -it --image=nvidia/cuda:12.0-runtime-ubuntu22.04 \
  --overrides='{"spec":{"containers":[{"name":"gpu-debug","image":"nvidia/cuda:12.0-runtime-ubuntu22.04","command":["nvidia-smi"],"resources":{"limits":{"nvidia.com/gpu":"1"},"requests":{"nvidia.com/gpu":"1"}}}]}}' \
  --restart=Never
```

## Per approfondire

- [Riferimento API GPU](../api-reference.md)
- [Come provisionare un GPU su una VM](./provision-gpu-vm.md)
- [Come configurare l'autoscaling](../../../services/kubernetes/how-to/configure-autoscaling.md)
- [Come gestire i node group](../../../services/kubernetes/how-to/manage-node-groups.md)
