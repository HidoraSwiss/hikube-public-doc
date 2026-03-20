---
title: "Comment configurer l'autoscaling"
---

# Comment configurer l'autoscaling

L'autoscaling permet a votre cluster Hikube d'ajuster automatiquement le nombre de noeuds en fonction de la charge. Ce guide explique comment configurer et observer le scaling automatique de vos node groups.

## Prerequis

- Un cluster Kubernetes Hikube deploye (voir le [demarrage rapide](../quick-start.md))
- `kubectl` configure pour interagir avec l'API Hikube
- Le fichier YAML de configuration de votre cluster

## Etapes

### 1. Comprendre le fonctionnement

L'autoscaling Hikube fonctionne au niveau des node groups. Chaque groupe de noeuds definit :

- **`minReplicas`** : nombre minimal de noeuds toujours actifs
- **`maxReplicas`** : nombre maximal de noeuds pouvant etre provisionnes

Le cluster ajoute automatiquement des noeuds lorsque les pods ne peuvent pas etre planifies faute de ressources (CPU, memoire). Il supprime les noeuds sous-utilises lorsque la charge diminue, en respectant toujours le seuil `minReplicas`.

:::note
Le scaling est declenche par la pression sur les ressources : lorsque des pods restent en etat `Pending` faute de capacite, de nouveaux noeuds sont provisionnes automatiquement.
:::

### 2. Configurer minReplicas et maxReplicas

Definissez les bornes de scaling dans votre configuration cluster :

```yaml title="cluster-autoscaling.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Kubernetes
metadata:
  name: my-cluster
spec:
  controlPlane:
    replicas: 3

  nodeGroups:
    # Node group avec autoscaling modere
    web:
      minReplicas: 2
      maxReplicas: 10
      instanceType: "s1.large"
      ephemeralStorage: 50Gi
      roles:
        - ingress-nginx

    # Node group compute avec large amplitude
    compute:
      minReplicas: 1
      maxReplicas: 20
      instanceType: "u1.2xlarge"
      ephemeralStorage: 100Gi
      roles: []
```

:::tip
Pour un environnement de production, fixez `minReplicas` a au moins 2 pour garantir la haute disponibilite de vos workloads.
:::

### 3. Configurer le scaling a zero

Pour les environnements de developpement ou les workloads GPU, vous pouvez configurer un node group qui descend a zero noeuds lorsqu'il n'est pas utilise :

```yaml title="cluster-scale-to-zero.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Kubernetes
metadata:
  name: my-cluster
spec:
  controlPlane:
    replicas: 2

  nodeGroups:
    # Node group permanent
    system:
      minReplicas: 2
      maxReplicas: 5
      instanceType: "s1.large"
      ephemeralStorage: 50Gi
      roles:
        - ingress-nginx

    # Node group GPU avec scaling a zero
    gpu:
      minReplicas: 0
      maxReplicas: 8
      instanceType: "u1.2xlarge"
      ephemeralStorage: 500Gi
      roles: []
```

:::warning
Le scaling a zero implique un delai de demarrage (cold start) lors du provisionnement du premier noeud. Prevoyez quelques minutes avant que les pods puissent etre planifies sur le nouveau noeud.
:::

### 4. Observer le scaling en action

Appliquez la configuration et observez le comportement du scaling :

```bash
# Appliquer la configuration
kubectl apply -f cluster-autoscaling.yaml

# Observer les noeuds en temps reel
kubectl --kubeconfig=cluster-admin.yaml get nodes -w
```

Pour declencher un scaling, deployez un workload qui consomme des ressources :

```yaml title="load-test.yaml"
apiVersion: apps/v1
kind: Deployment
metadata:
  name: load-test
spec:
  replicas: 20
  selector:
    matchLabels:
      app: load-test
  template:
    metadata:
      labels:
        app: load-test
    spec:
      containers:
        - name: busybox
          image: busybox
          command: ["sleep", "3600"]
          resources:
            requests:
              cpu: "500m"
              memory: "512Mi"
```

```bash
# Deployer le workload de test
kubectl --kubeconfig=cluster-admin.yaml apply -f load-test.yaml

# Observer les pods en attente (Pending) puis planifies
kubectl --kubeconfig=cluster-admin.yaml get pods -w

# Observer l'ajout de noeuds
kubectl --kubeconfig=cluster-admin.yaml get nodes -w
```

### 5. Ajuster les limites

Vous pouvez ajuster les limites de scaling a tout moment avec un patch :

```bash
kubectl patch kubernetes my-cluster --type='merge' -p='
spec:
  nodeGroups:
    compute:
      maxReplicas: 30
'
```

Ou en modifiant le fichier YAML et en re-appliquant :

```bash
kubectl apply -f cluster-autoscaling.yaml
```

## Verification

Verifiez que l'autoscaling est correctement configure :

```bash
# Verifier la configuration actuelle du cluster
kubectl get kubernetes my-cluster -o yaml | grep -A 8 nodeGroups

# Verifier l'etat des machines
kubectl get machines -l cluster.x-k8s.io/cluster-name=my-cluster

# Verifier les noeuds dans le cluster enfant
kubectl --kubeconfig=cluster-admin.yaml get nodes
```

**Resultat attendu apres scaling :**

```console
NAME                         STATUS   ROLES    AGE   VERSION
my-cluster-web-xxxxx         Ready    <none>   30m   v1.29.0
my-cluster-web-yyyyy         Ready    <none>   30m   v1.29.0
my-cluster-compute-zzzzz     Ready    <none>   2m    v1.29.0
my-cluster-compute-wwwww     Ready    <none>   2m    v1.29.0
```

## Pour aller plus loin

- [Référence API](../api-reference.md) -- Parametres `minReplicas` et `maxReplicas`
- [Concepts](../concepts.md) -- Architecture des node groups et scalabilite
- [Comment ajouter et modifier un node group](./manage-node-groups.md) -- Gestion des node groups
