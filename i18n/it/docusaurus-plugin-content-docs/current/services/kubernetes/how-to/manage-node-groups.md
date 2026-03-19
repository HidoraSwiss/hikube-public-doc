---
title: Come aggiungere e modificare un node group
---

# Comment ajouter et modifier un node group

Les node groups permettent de segmenter les noeuds de votre cluster Kubernetes selon les besoins de vos workloads. Ce guide explique comment ajouter, modifier et supprimer des node groups dans votre configuration Hikube.

## Prerequisitiiti

- Un cluster Kubernetes Hikube deploye (voir le [demarrage rapide](../quick-start.md))
- `kubectl` configure pour interagir avec l'API Hikube
- Le fichier YAML de configuration de votre cluster

## Passi

### 1. Comprendre les types d'instances

Hikube propose trois series d'instances adaptees a differents cas d'usage :

| Serie | Ratio CPU:RAM | Cas d'usage |
|-------|---------------|-------------|
| **S (Standard)** | 1:2 | Workloads generaux, applications web |
| **U (Universal)** | 1:4 | Workloads equilibres, bases de donnees |
| **M (Memory Optimized)** | 1:8 | Applications memoire-intensive, caches |

**Detail des instances disponibles :**

| Instance | vCPU | RAM |
|----------|------|-----|
| `s1.small` | 1 | 2 GB |
| `s1.medium` | 2 | 4 GB |
| `s1.large` | 4 | 8 GB |
| `s1.xlarge` | 8 | 16 GB |
| `s1.2xlarge` | 16 | 32 GB |
| `s1.4xlarge` | 32 | 64 GB |
| `s1.8xlarge` | 64 | 128 GB |
| `u1.medium` | 1 | 4 GB |
| `u1.large` | 2 | 8 GB |
| `u1.xlarge` | 4 | 16 GB |
| `u1.2xlarge` | 8 | 32 GB |
| `u1.4xlarge` | 16 | 64 GB |
| `u1.8xlarge` | 32 | 128 GB |
| `m1.large` | 2 | 16 GB |
| `m1.xlarge` | 4 | 32 GB |
| `m1.2xlarge` | 8 | 64 GB |
| `m1.4xlarge` | 16 | 128 GB |
| `m1.8xlarge` | 32 | 256 GB |

### 2. Ajouter un node group

Pour ajouter un nouveau node group, ajoutez une entree sous `spec.nodeGroups` dans votre fichier de configuration cluster :

```yaml title="cluster-with-compute.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Kubernetes
metadata:
  name: my-cluster
spec:
  controlPlane:
    replicas: 3

  nodeGroups:
    # Node group existant
    general:
      minReplicas: 2
      maxReplicas: 5
      instanceType: "s1.large"
      ephemeralStorage: 50Gi
      roles:
        - ingress-nginx

    # Nouveau node group pour le compute intensif
    compute:
      minReplicas: 1
      maxReplicas: 10
      instanceType: "u1.4xlarge"
      ephemeralStorage: 100Gi
      roles: []
```

:::tip
Choisissez un nom descriptif pour vos node groups (`compute`, `web`, `monitoring`, `gpu`) afin de faciliter la gestion du cluster.
:::

### 3. Modifier un node group existant

Pour modifier un node group, mettez a jour les champs souhaites dans votre fichier YAML. Par exemple, pour changer le type d'instance et augmenter le stockage ephemere :

```yaml title="cluster-updated.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Kubernetes
metadata:
  name: my-cluster
spec:
  controlPlane:
    replicas: 3

  nodeGroups:
    general:
      minReplicas: 2
      maxReplicas: 5
      instanceType: "u1.xlarge"       # Modifie : de s1.large a u1.xlarge
      ephemeralStorage: 100Gi          # Modifie : de 50Gi a 100Gi
      roles:
        - ingress-nginx
```

:::warning
Le changement d'`instanceType` provoque un rolling update des noeuds du groupe. Assurez-vous que votre cluster dispose de suffisamment de capacite pour absorber la charge pendant la mise a jour.
:::

### 4. Supprimer un node group

Pour supprimer un node group, retirez simplement son bloc de la configuration et re-appliquez :

```yaml title="cluster-simplified.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Kubernetes
metadata:
  name: my-cluster
spec:
  controlPlane:
    replicas: 3

  nodeGroups:
    general:
      minReplicas: 2
      maxReplicas: 5
      instanceType: "s1.large"
      ephemeralStorage: 50Gi
      roles:
        - ingress-nginx
    # Le node group "compute" a ete supprime
```

:::warning
Avant de supprimer un node group, assurez-vous que les workloads qui y tournent peuvent etre replanifies sur d'autres groupes. Utilisez `kubectl drain` sur les noeuds concernes si necessaire.
:::

### 5. Appliquer les modifications

Appliquez les changements avec `kubectl` :

```bash
kubectl apply -f cluster-updated.yaml
```

## Verifica

Verifiez que les modifications ont ete prises en compte :

```bash
# Verifier la configuration du cluster
kubectl get kubernetes my-cluster -o yaml | grep -A 15 nodeGroups

# Observer les noeuds du cluster enfant
kubectl --kubeconfig=cluster-admin.yaml get nodes -w

# Verifier les machines en cours de provisionnement
kubectl get machines -l cluster.x-k8s.io/cluster-name=my-cluster
```

**Risultato atteso :**

```console
NAME                         STATUS   ROLES    AGE   VERSION
my-cluster-general-xxxxx     Ready    <none>   10m   v1.29.0
my-cluster-compute-yyyyy     Ready    <none>   2m    v1.29.0
```

## Per approfondire

- [Reference API](../api-reference.md) -- Detail complet des champs `nodeGroups`
- [Concepts](../concepts.md) -- Architecture des node groups Hikube
- [Comment configurer l'autoscaling](./configure-autoscaling.md) -- Gerer le scaling automatique des node groups
