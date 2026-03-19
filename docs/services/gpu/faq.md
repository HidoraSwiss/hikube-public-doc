---
sidebar_position: 6
title: FAQ
---

# FAQ — GPU

### Quels modeles de GPU sont disponibles ?

Hikube propose trois familles de GPU NVIDIA :

| GPU | Architecture | Memoire | Cas d'usage |
|-----|-------------|---------|-------------|
| **L40S** | Ada Lovelace | 48 Go GDDR6 | Inference, rendu graphique |
| **A100** | Ampere | 80 Go HBM2e | Entrainement ML, calcul scientifique |
| **H100** | Hopper | 80 Go HBM3 | LLM, calcul exascale |

Les identifiants a utiliser dans les manifestes :

```yaml
gpus:
  - name: "nvidia.com/AD102GL_L40S"       # L40S
  - name: "nvidia.com/GA100_A100_PCIE_80GB" # A100
  - name: "nvidia.com/H100_94GB"           # H100
```

---

### Quelle est la difference entre GPU en VM et GPU en Kubernetes ?

| Aspect | GPU en VM | GPU en Kubernetes |
|--------|----------|-------------------|
| **Mode d'acces** | PCI passthrough exclusif | Device plugin partage |
| **Isolation** | GPU dedie a la VM | Scheduling orchestre par K8s |
| **Installation drivers** | Manuelle (cloud-init) | Automatique (GPU Operator) |
| **Cas d'usage** | Workstation dediee, CUDA dev | Workloads containerises, batch |

En VM, le GPU est directement attache via PCI passthrough : la VM a un acces exclusif au hardware. En Kubernetes, le GPU Operator gere les drivers et le scheduling permet de partager les ressources GPU entre plusieurs pods.

---

### Quel ratio CPU/GPU est recommande ?

Pour une utilisation optimale, prevoyez **8 a 16 vCPU par GPU**. Les instances de la gamme **Universal (u1)** avec un ratio 1:4 sont recommandees :

| Configuration | Instance | vCPU | RAM |
|--------------|----------|------|-----|
| 1 GPU | `u1.2xlarge` | 8 | 32 Go |
| 1 GPU (intensif) | `u1.4xlarge` | 16 | 64 Go |
| Multi-GPU | `u1.8xlarge` | 32 | 128 Go |

---

### Comment sont installes les drivers NVIDIA ?

L'installation depend du mode d'utilisation :

**En VM** : installez manuellement via cloud-init au demarrage :

```yaml title="vm-gpu.yaml"
spec:
  cloudInit: |
    #cloud-config
    runcmd:
      - apt-get update
      - apt-get install -y linux-headers-$(uname -r)
      - apt-get install -y nvidia-driver-550 nvidia-utils-550
```

**En Kubernetes** : activez l'addon GPU Operator qui installe automatiquement les drivers sur les noeuds GPU :

```yaml title="cluster-gpu.yaml"
spec:
  addons:
    gpuOperator:
      enabled: true
```

---

### Comment verifier que le GPU est detecte ?

**En VM** :

```bash
nvidia-smi
```

Cette commande affiche les GPU detectes, leur utilisation memoire et les processus actifs.

**En Kubernetes** :

```bash
kubectl get nodes -o json | jq '.items[].status.allocatable["nvidia.com/gpu"]'
```

Vous pouvez egalement verifier depuis un pod :

```bash
kubectl exec -it <pod-name> -- nvidia-smi
```

---

### Comment demander un GPU dans un pod Kubernetes ?

Specifiez la ressource `nvidia.com/gpu` dans les limites du conteneur :

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
Le nombre de GPU demande dans `limits` doit correspondre aux GPU physiques disponibles sur les noeuds. Un pod ne peut pas demander une fraction de GPU.
:::
