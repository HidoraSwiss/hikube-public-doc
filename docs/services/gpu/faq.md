---
sidebar_position: 6
title: FAQ
---

# FAQ — GPU

### Où se trouve la page GPU dans la console ?

Il n'y en a pas : le GPU se choisit dans l'assistant de la ressource qui l'utilise.

- **VM** : **Instances VM** > **Créer une Instance**, étape **Configuration**, section **Accélération Matérielle (GPU)** ; ou **Modifier** sur une VM existante.
- **Kubernetes** : **Kubernetes** > **Créer un cluster** (ou **Modifier**), étape **Nœuds**, section **GPU** d'un groupe de nœuds.

---

### Quels modèles de GPU sont disponibles ?

| Modèle | Mémoire | Cas d'usage |
|--------|---------|-------------|
| **NVIDIA L40S** | 48 Go | Inférence, rendu, prototypage |
| **NVIDIA A100 80GB** | 80 Go | Entraînement ML, calcul scientifique |
| **NVIDIA H100 80GB** | 80 Go | Entraînement et inférence de grands modèles |
| **NVIDIA RTX 6000 Pro** | 96 Go | LLM, calcul intensif |

Le sélecteur affiche tous les modèles ; ceux qui n'ont plus d'unité libre sont marqués **Indisponible**.

---

### Pourquoi un modèle est-il marqué Indisponible ?

Toutes ses unités sont attribuées à d'autres workloads. La console ne donne pas le nombre d'unités libres. Réessayez plus tard, choisissez un autre modèle, ou contactez [sales@hidora.io](mailto:sales@hidora.io) pour un besoin de capacité.

---

### Puis-je mettre plusieurs GPU sur une VM ?

Oui : cliquez sur une carte puis utilisez **+** pour ajouter des GPU du même modèle, ou sélectionnez plusieurs modèles. Tous doivent être libres sur un même serveur physique ; sinon, le déploiement échoue avec **Les GPUs suivants ne sont pas disponibles : …**.

---

### Quelle est la différence entre GPU en VM et GPU en Kubernetes ?

| Aspect | GPU en VM | GPU en Kubernetes |
|--------|----------|-------------------|
| **Accès** | GPU dédié à la VM | GPU attribué aux pods par le scheduler |
| **Drivers** | À installer dans l'OS (cloud-init ou manuellement) | Installés par l'addon GPU Operator |
| **Partage** | Non | Oui avec l'addon HAMi |
| **Cas d'usage** | Station de travail, développement CUDA | Workloads conteneurisés, batch, inférence |

---

### Quel ratio CPU/GPU est recommandé ?

Prévoyez **8 à 16 vCPU par GPU**, de préférence dans la série **Universel (U)** :

| Configuration | Instance | vCPU | RAM |
|--------------|----------|------|-----|
| 1 GPU | `u1.2xlarge` | 8 | 32 Go |
| 1 GPU (intensif) | `u1.4xlarge` | 16 | 64 Go |
| Multi-GPU | `u1.8xlarge` | 32 | 128 Go |

---

### Comment sont installés les drivers NVIDIA ?

**En VM** : par vous, dans l'OS. Suivez [Installer CUDA et les drivers GPU](../compute/how-to/install-cuda-drivers.md), qui fournit aussi un script cloud-init à coller dans **Script Cloud-Init (User Data)**.

**En Kubernetes** : par l'addon **GPU Operator**, activé automatiquement dès qu'un groupe de nœuds a des GPU.

---

### Que se passe-t-il quand j'arrête une VM avec GPU ?

Le GPU est libéré et peut être attribué à un autre workload. La console vous en avertit dans la confirmation d'arrêt. Au démarrage, si le GPU n'est plus disponible, la boîte **Sélectionner un GPU alternatif** vous propose un autre modèle.

---

### Puis-je ajouter des GPU à un groupe de nœuds Kubernetes existant ?

Pas à un groupe créé sans GPU : ajoutez un nouveau groupe de nœuds avec GPU. Un groupe créé avec GPU peut changer de modèle ou de nombre, en gardant au moins un GPU.

---

### Comment demander un GPU dans un pod Kubernetes ?

```yaml title="pod-gpu.yaml"
apiVersion: v1
kind: Pod
metadata:
  name: gpu-workload
spec:
  containers:
    - name: cuda-app
      image: nvidia/cuda:12.4.1-base-ubuntu22.04
      command: ["sleep", "infinity"]
      resources:
        limits:
          nvidia.com/gpu: 1
```

:::note
Sans l'addon HAMi, un pod ne peut pas demander une fraction de GPU : la valeur de `nvidia.com/gpu` est un nombre entier de GPU physiques.
:::

---

### Comment vérifier que le GPU est détecté ?

**En VM** :

```bash
lspci | grep -i nvidia   # le GPU est visible
nvidia-smi               # les drivers sont installés
```

**En Kubernetes** (avec le kubeconfig du cluster, bouton **Kubeconfig** de la page du cluster) :

```bash
kubectl get nodes -o custom-columns=NAME:.metadata.name,GPU:.status.allocatable.'nvidia\.com/gpu'
kubectl exec -it <pod> -- nvidia-smi
```
