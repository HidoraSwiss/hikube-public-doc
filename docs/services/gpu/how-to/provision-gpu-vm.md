---
title: "Comment provisionner un GPU sur une VM"
---

# Comment provisionner un GPU sur une VM

Hikube permet d'attacher un ou plusieurs GPU NVIDIA directement a une machine virtuelle. Ce guide explique comment choisir le type de GPU adapte a votre workload, creer une VM avec GPU et verifier que l'acceleration materielle est bien disponible.

## Prerequis

- **kubectl** configure avec votre kubeconfig Hikube
- Un acces **SSH** a la VM (cle publique SSH disponible)
- Familiarite avec les concepts de [machines virtuelles](../../compute/overview.md) sur Hikube

## Etapes

### 1. Choisir le type de GPU

Hikube propose trois familles de GPU NVIDIA adaptees a differents cas d'usage :

| GPU | Architecture | Memoire | Performance | Cas d'usage |
|-----|-------------|---------|-------------|-------------|
| **L40S** | Ada Lovelace | 48 GB GDDR6 | 362 TOPS (INT8) | Inference, developpement, prototypage |
| **A100** | Ampere | 80 GB HBM2e | 312 TOPS (INT8) | Entrainement ML, fine-tuning |
| **H100** | Hopper | 80 GB HBM3 | 1979 TOPS (INT8) | LLM, calcul exascale, entrainement distribue |

:::tip Quel GPU choisir ?
Commencez par un **L40S** pour le developpement et le prototypage. Passez a un **A100** pour l'entrainement de modeles ML standard, et reservez le **H100** pour les workloads exigeants comme l'entrainement de LLM ou le calcul haute performance.
:::

Les identifiants GPU a utiliser dans vos manifestes sont :

| GPU | Valeur `gpus[].name` |
|-----|----------------------|
| L40S | `nvidia.com/AD102GL_L40S` |
| A100 | `nvidia.com/GA100_A100_PCIE_80GB` |
| H100 | `nvidia.com/H100_94GB` |

### 2. Creer le manifeste de la VM avec GPU

Creez un manifeste qui declare le GPU souhaite dans la section `spec.gpus` :

```yaml title="gpu-vm.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: VMInstance
metadata:
  name: gpu-workstation
spec:
  running: true
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

:::tip Ratio CPU/GPU recommande
Prevoyez **8 a 16 vCPU par GPU**. Pour un seul GPU, un `u1.2xlarge` (8 vCPU, 32 GB RAM) est un bon point de depart. Pour du multi-GPU, montez a `u1.4xlarge` ou `u1.8xlarge`.
:::

### 3. Deployer la VM

Appliquez le manifeste :

```bash
kubectl apply -f gpu-vm.yaml
```

Attendez que la VM soit en etat `Running` :

```bash
kubectl get vminstance gpu-workstation -w
```

**Resultat attendu :**

```
NAME               STATUS    AGE
gpu-workstation    Running   2m
```

:::note
Le provisionnement d'une VM avec GPU peut prendre quelques minutes supplementaires par rapport a une VM standard, le temps que le GPU soit alloue et attache.
:::

### 4. Verifier le GPU dans la VM

Connectez-vous a la VM via SSH :

```bash
virtctl ssh ubuntu@gpu-workstation
```

Verifiez que le GPU est detecte :

```bash
nvidia-smi
```

**Resultat attendu :**

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

Pour des informations detaillees :

```bash
nvidia-smi --query-gpu=name,memory.total,utilization.gpu --format=csv
```

### 5. Configurer une VM multi-GPU

Pour les workloads intensifs (entrainement distribue, inference a grande echelle), vous pouvez attacher plusieurs GPU a une meme VM en repetant les entrees dans `spec.gpus` :

```yaml title="multi-gpu-vm.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: VMInstance
metadata:
  name: multi-gpu-workstation
spec:
  running: true
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
Pour du multi-GPU, dimensionnez le type d'instance en consequence. Prevoyez au minimum 8 vCPU et 32 GB de RAM par GPU. Un `u1.8xlarge` (32 vCPU, 128 GB RAM) est adapte pour 4 GPU.
:::

## Verification

Apres le deploiement, confirmez que tout fonctionne :

1. **Verifiez l'etat de la VM** :

```bash
kubectl get vminstance gpu-workstation
```

2. **Verifiez le GPU dans la VM** :

```bash
virtctl ssh ubuntu@gpu-workstation -- nvidia-smi
```

3. **Testez CUDA** (si les pilotes sont installes) :

```bash
virtctl ssh ubuntu@gpu-workstation -- nvidia-smi --query-gpu=name,memory.total,driver_version,cuda_version --format=csv,noheader
```

## Pour aller plus loin

- [Reference API GPU](../api-reference.md)
- [Comment provisionner un GPU sur Kubernetes](./provision-gpu-kubernetes.md)
- [Comment installer les pilotes CUDA](../../compute/how-to/install-cuda-drivers.md)
