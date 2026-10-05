---
sidebar_position: 7
title: GPU Operator
---

# GPU Operator

L'addon **GPU Operator** installe le **NVIDIA GPU Operator**, qui gère automatiquement les GPU du cluster : pilotes NVIDIA, runtime de conteneurs, `device plugin` et outils de monitoring nécessaires à l'exploitation des GPU.

## Dans la console

- **Avec des nœuds GPU** : dès qu'un groupe de nœuds a des GPU (section **GPU** de l'étape **Nœuds**), la console active **GPU Operator** et empêche de le décocher (« Requis lorsqu'un groupe de nœuds a des GPU »).
- **Sans nœuds GPU** : cochez **GPU Operator** à l'étape **Addons** ou depuis **Modifier** > **Extensions & Addons**, puis **Enregistrer**. Il est désactivé par défaut.

La page de détail du cluster affiche **GPU Operator** dans la section **Extensions** lorsqu'il est actif.

Voir [Comment ajouter et modifier un groupe de nœuds](../how-to/manage-node-groups.md#5-ajouter-des-gpu) pour l'ajout de GPU.

## Surcharger la configuration

Une fois l'addon coché, le champ **Configuration Helm (YAML) — optionnel** apparaît. La valeur est transmise au chart Helm du GPU Operator, sous la clé `gpu-operator`.

```yaml title="gpu-operator-override.yaml"
gpu-operator:
  dcgmExporter:
    enabled: true
```

Les options disponibles sont décrites dans la [documentation du NVIDIA GPU Operator](https://docs.nvidia.com/datacenter/cloud-native/gpu-operator/latest/getting-started.html).

:::warning
Les pilotes et le device plugin sont préconfigurés par la plateforme pour les nœuds Hikube. Ne les désactivez pas par surcharge : les GPU ne seraient plus exposés aux pods.
:::

## Utilisation dans le cluster

```bash
# Pods du GPU Operator
kubectl get pods -A | grep -i -E "gpu-operator|nvidia"

# GPU allouables par nœud
kubectl get nodes -o custom-columns=NAME:.metadata.name,GPU:.status.allocatable.'nvidia\.com/gpu'
```

Exemple de pod demandant un GPU :

```yaml title="gpu-test.yaml"
apiVersion: v1
kind: Pod
metadata:
  name: gpu-test
spec:
  restartPolicy: Never
  containers:
    - name: cuda
      image: nvidia/cuda:12.4.1-base-ubuntu22.04
      command: ["nvidia-smi"]
      resources:
        limits:
          nvidia.com/gpu: 1
```

```bash
kubectl apply -f gpu-test.yaml
kubectl logs gpu-test
```

Voir aussi [Provisionner des GPU dans Kubernetes](../../gpu/how-to/provision-gpu-kubernetes.md).

## Bonnes pratiques

- Placez les workloads GPU sur un groupe de nœuds dédié, avec un minimum de nœuds à 0 si l'usage est ponctuel.
- Pour partager un même GPU entre plusieurs pods, activez [HAMi](./hami.md).
