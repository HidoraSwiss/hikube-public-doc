---
title: "Comment provisionner un GPU sur Kubernetes"
---

# Comment provisionner un GPU sur Kubernetes

Hikube permet d'ajouter des groupes de nœuds équipés de GPU NVIDIA à vos clusters Kubernetes managés. Ce guide explique comment configurer ce groupe dans la console, puis déployer des pods qui utilisent le GPU.

## Prérequis

- Un compte Hikube et un projet avec des quotas suffisants
- [kubectl](https://kubernetes.io/docs/tasks/tools/#kubectl) installé sur votre poste
- Familiarité avec le [Kubernetes managé](../../kubernetes/overview.md) Hikube

## Étapes

### 1. Ajouter un groupe de nœuds GPU

**Nouveau cluster** : ouvrez **Infrastructure** > **Kubernetes** > **Créer un cluster**, renseignez l'étape **Général** puis passez à l'étape **Nœuds**.

**Cluster existant** : ouvrez le cluster, cliquez sur **Modifier** et allez dans **Groupes de nœuds**.

Puis :

1. Cliquez sur **Ajouter un groupe de nœuds**.
2. **Nom du groupe** : par exemple `gpu-workers`.
3. **Type d'instance** : choisissez la série et la taille, par exemple **Universel (U)** > **2XLARGE** (8 vCPU, 32 Go).
4. **Taille du stockage éphémère** : prévoyez assez d'espace pour les images de conteneurs CUDA, par exemple `100` Go.
5. **Nombre minimum de nœuds** et **Nombre maximum de nœuds** : par exemple `1` et `3`.
6. Section **GPU** : cliquez sur la carte du modèle voulu (par exemple **NVIDIA L40S**) ; **+** et **−** règlent le nombre de GPU **par nœud**.

:::tip Séparer CPU et GPU
Gardez un groupe de nœuds sans GPU pour les workloads classiques et réservez le groupe GPU aux pods qui en ont besoin : chaque groupe se dimensionne indépendamment.
:::

:::warning Groupes existants
Un groupe créé **sans** GPU ne peut pas en recevoir (**Ce groupe a été créé sans GPU et ne peut pas en recevoir.**). Un groupe créé **avec** GPU peut changer de modèle ou de nombre, mais doit garder au moins un GPU. Pour changer de catégorie, ajoutez un nouveau groupe de nœuds.
:::

### 2. Vérifier les addons

À l'étape **Addons** (section **Extensions & Addons** en modification), **GPU Operator** est coché et verrouillé (**Requis lorsqu'un groupe de nœuds a des GPU**) : il installe les drivers NVIDIA et le device plugin sur les nœuds GPU.

Activez aussi **HAMi** si vous voulez partager un même GPU entre plusieurs pods.

### 3. Déployer

À l'étape **Vérification**, le groupe GPU affiche le modèle et la quantité (par exemple `l40s (x1)`). Cliquez sur **Déployer** (ou **Enregistrer** pour un cluster existant).

Attendez que le cluster soit **Prêt** ou **Actif** dans la liste des clusters.

### 4. Récupérer le kubeconfig du cluster

Sur la page de détail du cluster, cliquez sur **Kubeconfig**. La console télécharge `kubeconfig-<nom-du-cluster>.yaml`.

```bash
export KUBECONFIG=~/Downloads/kubeconfig-<nom-du-cluster>.yaml
kubectl get nodes
```

### 5. Vérifier les GPU sur les nœuds

Une fois les pods du GPU Operator démarrés (quelques minutes après l'arrivée des nœuds) :

```bash
kubectl get nodes -o custom-columns=NAME:.metadata.name,GPU:.status.allocatable.'nvidia\.com/gpu'
```

**Résultat attendu :** les nœuds du groupe GPU affichent `1` (ou le nombre de GPU par nœud choisi), les autres `<none>`.

### 6. Déployer un pod avec GPU

```yaml title="gpu-pod.yaml"
apiVersion: v1
kind: Pod
metadata:
  name: gpu-test
spec:
  restartPolicy: Never
  containers:
  - name: cuda-test
    image: nvidia/cuda:12.4.1-base-ubuntu22.04
    command: ["nvidia-smi"]
    resources:
      limits:
        nvidia.com/gpu: 1
```

```bash
kubectl apply -f gpu-pod.yaml
kubectl wait --for=jsonpath='{.status.phase}'=Succeeded pod/gpu-test --timeout=300s
kubectl logs gpu-test
```

**Résultat attendu :** le tableau `nvidia-smi` liste le GPU (par exemple `NVIDIA L40S`).

### 7. Cibler un modèle de GPU

Si vos groupes utilisent des modèles différents, ciblez-les avec le label posé par le GPU Operator (découverte des fonctionnalités GPU) :

```bash
kubectl get nodes -L nvidia.com/gpu.product
```

```yaml title="inference-deployment.yaml"
apiVersion: apps/v1
kind: Deployment
metadata:
  name: model-serving
spec:
  replicas: 2
  selector:
    matchLabels:
      app: model-serving
  template:
    metadata:
      labels:
        app: model-serving
    spec:
      nodeSelector:
        nvidia.com/gpu.product: <valeur affichée par la commande précédente>
      containers:
      - name: inference
        image: my-model:latest
        resources:
          limits:
            nvidia.com/gpu: 1
```

## Vérification

```bash
# GPU allouables par nœud
kubectl get nodes -o custom-columns=NAME:.metadata.name,GPU:.status.allocatable.'nvidia\.com/gpu'

# GPU déjà attribués sur un nœud
kubectl describe node <nom-du-noeud> | grep -A 8 "Allocated resources"

# Pods du GPU Operator
kubectl get pods -A | grep -i gpu-operator
```

## Pour aller plus loin

- [Plugin GPU Operator](../../kubernetes/plugins/gpu-operator.md)
- [Gérer les groupes de nœuds](../../kubernetes/how-to/manage-node-groups.md)
- [Configurer l'autoscaling](../../kubernetes/how-to/configure-autoscaling.md)
- [Provisionner un GPU sur une VM](./provision-gpu-vm.md)
