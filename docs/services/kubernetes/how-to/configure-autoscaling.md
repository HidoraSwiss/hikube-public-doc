---
title: "Comment configurer l'autoscaling"
---

# Comment configurer l'autoscaling

L'autoscaling permet à votre cluster Hikube d'ajuster automatiquement le nombre de nœuds en fonction de la charge. Ce guide explique comment configurer les bornes de scaling de vos groupes de nœuds depuis la console, puis observer le scaling dans le cluster.

## Prérequis

- Un cluster Kubernetes Hikube déployé (voir le [démarrage rapide](../quick-start.md))
- Le kubeconfig du cluster téléchargé depuis la console (bouton **Kubeconfig**)

## Étapes

### 1. Comprendre le fonctionnement

L'autoscaling Hikube fonctionne au niveau des groupes de nœuds. Chaque groupe définit :

- **Nombre minimum de nœuds** : nombre de nœuds toujours actifs ;
- **Nombre maximum de nœuds** : nombre maximal de nœuds pouvant être provisionnés.

Le cluster ajoute des nœuds lorsque des pods ne peuvent pas être planifiés faute de ressources (CPU, mémoire). Il retire les nœuds sous-utilisés lorsque la charge diminue, sans descendre sous le minimum.

:::note
Le scaling est déclenché par la pression sur les ressources : lorsque des pods restent en état `Pending` faute de capacité, de nouveaux nœuds sont provisionnés automatiquement.
:::

:::warning
Le quota du projet est calculé sur le **nombre maximum** de nœuds de chaque groupe. Un maximum élevé réserve du quota CPU, mémoire et stockage même si les nœuds ne sont pas encore provisionnés.
:::

### 2. Définir les bornes de scaling

1. Dans **Infrastructure** > **Kubernetes**, ouvrez le menu **Actions** du cluster et choisissez **Modifier**.
2. Dans la section **Groupes de nœuds**, dépliez la carte du groupe.
3. Renseignez **Nombre minimum de nœuds** et **Nombre maximum de nœuds**. Par exemple :

| Groupe | Minimum | Maximum | Usage |
|--------|---------|---------|-------|
| `web` | 2 | 10 | Autoscaling modéré, groupe exposé sur internet |
| `compute` | 1 | 20 | Grande amplitude pour les traitements |

4. Cliquez sur **Enregistrer**.

La console refuse un maximum inférieur au minimum (« Le nombre maximum de nœuds doit être supérieur ou égal au nombre minimum ») et un maximum supérieur à 100.

:::tip
Pour un environnement de production, fixez le minimum à au moins 2 pour garantir la haute disponibilité de vos workloads.
:::

### 3. Configurer le scaling à zéro

Pour les environnements de développement ou les workloads GPU, un groupe peut descendre à zéro nœud lorsqu'il n'est pas utilisé : saisissez **0** dans **Nombre minimum de nœuds**.

Gardez au moins un groupe avec un minimum supérieur à zéro pour héberger les composants système du cluster.

:::warning
Le scaling à zéro implique un délai de démarrage (cold start) lors du provisionnement du premier nœud. Prévoyez quelques minutes avant que les pods puissent être planifiés sur le nouveau nœud.
:::

### 4. Observer le scaling en action

Dans le cluster, déployez un workload qui demande plus de ressources que les nœuds actuels n'en offrent :

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
export KUBECONFIG=~/Downloads/kubeconfig-<nom-du-cluster>.yaml

# Déployer le workload de test
kubectl apply -f load-test.yaml

# Observer les pods en attente (Pending) puis planifiés
kubectl get pods -l app=load-test -w

# Observer l'ajout de nœuds
kubectl get nodes -w
```

Dans la console, la section **Pools de Nœuds** de la page de détail affiche le nombre de nœuds actifs de chaque groupe, par exemple « 4 nœuds actifs (De 2 à 10) ».

Supprimez le workload de test une fois l'observation terminée :

```bash
kubectl delete -f load-test.yaml
```

## Vérification

```bash
kubectl get nodes
```

**Résultat attendu après scaling :**

```console
NAME                         STATUS   ROLES    AGE   VERSION
my-cluster-web-xxxxx         Ready    <none>   30m   v1.xx.x
my-cluster-web-yyyyy         Ready    <none>   30m   v1.xx.x
my-cluster-compute-zzzzz     Ready    <none>   2m    v1.xx.x
my-cluster-compute-wwwww     Ready    <none>   2m    v1.xx.x
```

## Pour aller plus loin

- [Concepts](../concepts.md) : architecture des groupes de nœuds et quotas
- [Comment ajouter et modifier un groupe de nœuds](./manage-node-groups.md) : gestion des groupes de nœuds
- [Vertical Pod Autoscaler](../plugins/verticalpodautoscaler.md) : ajuster les ressources des pods
