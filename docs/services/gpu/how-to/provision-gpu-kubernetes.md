---
title: "Comment provisionner un GPU sur Kubernetes"
---

# Comment provisionner un GPU sur Kubernetes

Hikube permet d'ajouter des node groups equipes de GPU NVIDIA a vos clusters Kubernetes. Ce guide explique comment configurer un cluster avec des workers GPU, deployer des pods qui exploitent l'acceleration GPU et mettre en place des node groups specialises.

## Prerequis

- **kubectl** configure avec votre kubeconfig Hikube
- Un **cluster Kubernetes** existant sur Hikube (ou un manifeste pret a deployer)
- Familiarite avec les concepts de [Kubernetes](../overview.md) sur Hikube

## Etapes

### 1. Ajouter un node group GPU au cluster

Modifiez le manifeste de votre cluster pour ajouter un node group avec GPU. La configuration GPU se fait au niveau du node group via `gpus[].name` :

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
Separez vos workloads CPU et GPU dans des node groups distincts. Cela permet un scaling independant et une meilleure maitrise des couts.
:::

### 2. Appliquer la configuration du cluster

```bash
kubectl apply -f cluster-gpu.yaml
```

Attendez que les nodes GPU soient prets :

```bash
kubectl get nodes -w
```

**Resultat attendu :**

```
NAME                        STATUS   ROLES    AGE   VERSION
cluster-gpu-cp-0            Ready    master   5m    v1.29.x
cluster-gpu-gpu-workers-0   Ready    <none>   3m    v1.29.x
```

### 3. Verifier la disponibilite GPU sur les nodes

Confirmez que les GPU sont bien exposes comme ressources Kubernetes :

```bash
kubectl get nodes -o custom-columns=NAME:.metadata.name,GPU:.status.allocatable.'nvidia\.com/gpu'
```

**Resultat attendu :**

```
NAME                        GPU
cluster-gpu-cp-0            <none>
cluster-gpu-gpu-workers-0   1
```

### 4. Deployer un pod avec GPU

Creez un pod de test qui utilise un GPU via les `resources.limits` :

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

Appliquez et verifiez :

```bash
kubectl apply -f gpu-pod.yaml
```

Attendez que le pod termine son execution :

```bash
kubectl wait --for=condition=Ready pod/gpu-test --timeout=120s
```

Consultez les logs pour confirmer que le GPU est visible :

```bash
kubectl logs gpu-test
```

**Resultat attendu :**

```
+-----------------------------------------------------------------------------+
| NVIDIA-SMI 535.xx.xx    Driver Version: 535.xx.xx    CUDA Version: 12.x     |
|-------------------------------+----------------------+----------------------+
| GPU  Name        Persistence-M| Bus-Id        Disp.A | Volatile Uncorr. ECC |
|===============================+======================+======================|
|   0  NVIDIA L40S         Off  | 00000000:00:06.0 Off |                    0 |
+-------------------------------+----------------------+----------------------+
```

### 5. Configurer des node groups specialises

Pour les environnements de production, creez des node groups dedies a l'inference et a l'entrainement avec des GPU differents :

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

Pour cibler un node group specifique dans vos deployements, utilisez `nodeSelector` :

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
Les GPU disponibles pour Kubernetes sont les memes que pour les VM : **L40S** (inference/dev), **A100** (entrainement ML) et **H100** (LLM/exascale). Consultez la [reference API GPU](../api-reference.md) pour les specifications completes.
:::

## Verification

Apres le deploiement, confirmez que votre configuration GPU fonctionne :

1. **Verifiez les nodes GPU** :

```bash
kubectl get nodes -o custom-columns=NAME:.metadata.name,GPU:.status.allocatable.'nvidia\.com/gpu'
```

2. **Verifiez l'allocation GPU sur un node** :

```bash
kubectl describe node cluster-gpu-gpu-workers-0 | grep -A 5 "Allocated resources"
```

3. **Testez avec un pod interactif** :

```bash
kubectl run gpu-debug --rm -it --image=nvidia/cuda:12.0-runtime-ubuntu22.04 \
  --overrides='{"spec":{"containers":[{"name":"gpu-debug","image":"nvidia/cuda:12.0-runtime-ubuntu22.04","command":["nvidia-smi"],"resources":{"limits":{"nvidia.com/gpu":"1"},"requests":{"nvidia.com/gpu":"1"}}}]}}' \
  --restart=Never
```

## Pour aller plus loin

- [Reference API GPU](../api-reference.md)
- [Comment provisionner un GPU sur une VM](./provision-gpu-vm.md)
- [Comment configurer l'autoscaling](../../../services/kubernetes/how-to/configure-autoscaling.md)
- [Comment gerer les node groups](../../../services/kubernetes/how-to/manage-node-groups.md)
