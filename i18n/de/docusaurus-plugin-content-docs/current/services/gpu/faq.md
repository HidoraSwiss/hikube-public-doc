---
sidebar_position: 6
title: FAQ
---

# FAQ — GPU

### Quels modèles de GPU sont disponibles ?

Hikube bietet trois familles de GPU NVIDIA :

| GPU | Architecture | Mémoire | Anwendungsfälle |
|-----|-------------|---------|-------------|
| **L40S** | Ada Lovelace | 48 Go GDDR6 | Inférence, rendu graphique |
| **A100** | Ampere | 80 Go HBM2e | Entraînement ML, calcul scientifique |
| **H100** | Hopper | 80 Go HBM3 | LLM, calcul exascale |

Les identifiants à utiliser dans les manifestes :

```yaml
gpus:
  - name: "nvidia.com/AD102GL_L40S"       # L40S
  - name: "nvidia.com/GA100_A100_PCIE_80GB" # A100
  - name: "nvidia.com/H100_94GB"           # H100
```

---

### Quelle est la différence entre GPU en VM et GPU en Kubernetes ?

| Aspect | GPU en VM | GPU en Kubernetes |
|--------|----------|-------------------|
| **Mode d'accès** | PCI passthrough exclusif | Device plugin partagé |
| **Isolation** | GPU dédié à la VM | Scheduling orchestré par K8s |
| **Installation drivers** | Manuelle (cloud-init) | Automatique (GPU Operator) |
| **Anwendungsfälle** | Workstation dédiée, CUDA dev | Workloads conteneurisés, batch |

En VM, le GPU est directement attaché via PCI passthrough : la VM a un accès exclusif au hardware. En Kubernetes, le GPU Operator gère les drivers et le scheduling permet de partager les ressources GPU entre plusieurs pods.

---

### Quel ratio CPU/GPU est recommandé ?

Pour une utilisation optimale, prévoyez **8 à 16 vCPU par GPU**. Les instances de la gamme **Universal (u1)** avec un ratio 1:4 sont recommandées :

| Configuration | Instance | vCPU | RAM |
|--------------|----------|------|-----|
| 1 GPU | `u1.2xlarge` | 8 | 32 Go |
| 1 GPU (intensif) | `u1.4xlarge` | 16 | 64 Go |
| Multi-GPU | `u1.8xlarge` | 32 | 128 Go |

---

### Comment sont installés les drivers NVIDIA ?

L'installation dépend du mode d'utilisation :

**En VM** : installez manuellement via cloud-init au démarrage :

```yaml title="vm-gpu.yaml"
spec:
  cloudInit: |
    #cloud-config
    runcmd:
      - apt-get update
      - apt-get install -y linux-headers-$(uname -r)
      - apt-get install -y nvidia-driver-550 nvidia-utils-550
```

**En Kubernetes** : aktiviertz l'addon GPU Operator qui installe automatiquement les drivers sur les nœuds GPU :

```yaml title="cluster-gpu.yaml"
spec:
  addons:
    gpuOperator:
      enabled: true
```

---

### Comment vérifier que le GPU est détecté ?

**En VM** :

```bash
nvidia-smi
```

Cette commande affiche les GPU détectés, leur utilisation mémoire et les processus actifs.

**En Kubernetes** :

```bash
kubectl get nodes -o json | jq '.items[].status.allocatable["nvidia.com/gpu"]'
```

Vous pouvez également vérifier depuis un pod :

```bash
kubectl exec -it <pod-name> -- nvidia-smi
```

---

### Comment demander un GPU dans un pod Kubernetes ?

Spécifiez la ressource `nvidia.com/gpu` dans les limites du conteneur :

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
Le nombre de GPU demandé dans `limits` doit correspondre aux GPU physiques disponibles sur les nœuds. Un pod ne peut pas demander une fraction de GPU.
:::
