---
title: "Comment mettre à jour un cluster"
---

# Comment mettre à jour un cluster

Ce guide explique comment mettre à jour la version de Kubernetes d'un cluster Hikube depuis la console. Les mises à jour se font par rolling update.

## Prérequis

- Un cluster Kubernetes Hikube déployé (voir le [démarrage rapide](../quick-start.md))
- Le kubeconfig du cluster téléchargé depuis la console (bouton **Kubeconfig**), pour vérifier le résultat

## Étapes

### 1. Vérifier la version actuelle

Dans **Infrastructure** > **Kubernetes**, la colonne **Version** de la liste indique la version de chaque cluster. La page de détail l'affiche aussi dans la section **Général** (**Version**).

Côté cluster, la version des nœuds est visible avec :

```bash
export KUBECONFIG=~/Downloads/kubeconfig-<nom-du-cluster>.yaml
kubectl get nodes
```

### 2. Préparer la mise à jour

:::warning
Testez toujours la mise à jour sur un cluster de recette avant la production. Certaines applications peuvent ne pas être compatibles avec une nouvelle version de Kubernetes (API dépréciées puis supprimées).
:::

:::note
Faites les mises à jour de manière incrémentale (par exemple, v1.29 vers v1.30). Ne sautez pas plusieurs versions mineures d'un coup.
:::

### 3. Changer la version

1. Ouvrez le menu **Actions** du cluster et choisissez **Modifier** (ou cliquez sur **Modifier** depuis la page de détail).
2. Dans la section **Informations générales**, ouvrez la liste **Version de Kubernetes** et sélectionnez la version cible. La liste ne contient que les versions proposées par la plateforme.
3. Cliquez sur **Enregistrer**. La console affiche « Cluster mis à jour » et revient sur la page de détail.

:::note
Si la version actuelle du cluster n'est plus proposée par la plateforme, la console l'indique (« version actuelle ») et vous invite à sélectionner une version supportée.
:::

### 4. Suivre le rolling update

Les nœuds sont remplacés progressivement. Suivez le remplacement dans le cluster :

```bash
kubectl get nodes -w
```

:::tip
Pendant un rolling update, les nœuds sont remplacés un par un : vos workloads continuent de fonctionner s'ils disposent de plusieurs réplicas. Définissez des `PodDisruptionBudget` pour vos applications critiques.
:::

## Vérification

Une fois le remplacement terminé, confirmez la nouvelle version :

```bash
# Nœuds en état Ready avec la nouvelle version
kubectl get nodes

# Version de l'API server
kubectl version

# Vos workloads fonctionnent
kubectl get pods -A
```

**Résultat attendu :**

```console
NAME                         STATUS   ROLES    AGE   VERSION
my-cluster-general-xxxxx     Ready    <none>   5m    v1.30.x
my-cluster-general-yyyyy     Ready    <none>   3m    v1.30.x
```

:::warning
Si des pods restent en erreur après la mise à jour, vérifiez la compatibilité de vos manifestes avec la nouvelle version de Kubernetes. Certaines API dépréciées peuvent avoir été supprimées.
:::

## Pour aller plus loin

- [Concepts](../concepts.md) : architecture du control plane
- [Accès et outils](./toolbox.md) : commandes de diagnostic dans le cluster
