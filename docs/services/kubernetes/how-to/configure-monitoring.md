---
title: "Comment configurer le monitoring"
---

# Comment configurer le monitoring

Ce guide explique comment activer la collecte de métriques et de logs sur un cluster Kubernetes Hikube avec l'addon **Monitoring Agents**, et comment vérifier son fonctionnement dans le cluster.

## Prérequis

- Un cluster Kubernetes Hikube déployé (voir le [démarrage rapide](../quick-start.md))
- Le kubeconfig du cluster téléchargé depuis la console (bouton **Kubeconfig**)

## Étapes

### 1. Activer l'addon Monitoring Agents

L'addon **Monitoring Agents** (« Agents de surveillance pour logs et métriques ») est coché par défaut à la création d'un cluster. Pour l'activer sur un cluster existant :

1. Dans **Infrastructure** > **Kubernetes**, ouvrez le menu **Actions** du cluster et choisissez **Modifier**.
2. Dans la section **Extensions & Addons**, cochez **Monitoring Agents**.
3. Cliquez sur **Enregistrer**.

La page de détail du cluster affiche alors **Monitoring Agents** dans la section **Extensions**.

### 2. Comprendre ce qui est déployé

L'addon installe dans le cluster des agents de collecte, qui transmettent les données à la plateforme de supervision de votre projet :

| Composant | Rôle |
|-----------|------|
| **VictoriaMetrics Agent** (`vmagent`) | Collecte et envoie les métriques |
| **Fluent Bit** | Collecte et envoie les logs des conteneurs |
| **kube-state-metrics** | Expose l'état des objets Kubernetes sous forme de métriques |
| **Node exporter** | Expose les métriques système des nœuds |

Les agents s'exécutent sur les nœuds du cluster ; le stockage des métriques et des logs n'occupe pas vos nœuds.

:::note
L'accès aux tableaux de bord de supervision du projet n'est pas proposé dans la console ; contactez le support.
:::

### 3. Vérifier les agents dans le cluster

```bash
export KUBECONFIG=~/Downloads/kubeconfig-<nom-du-cluster>.yaml

# Lister les pods des agents de monitoring
kubectl get pods -A | grep -E "vmagent|fluent-bit|kube-state-metrics|node-exporter"
```

**Résultat attendu** : les pods des agents sont en état `Running`, avec un pod Fluent Bit et un pod node exporter par nœud.

### 4. Consulter les métriques dans le cluster

```bash
# Métriques des nœuds
kubectl top nodes

# Métriques des pods
kubectl top pods -A

# Events du cluster
kubectl get events -A --sort-by=.metadata.creationTimestamp
```

**Exemple de résultat pour `kubectl top nodes` :**

```console
NAME                          CPU(cores)   CPU%   MEMORY(bytes)   MEMORY%
my-cluster-general-xxxxx      250m         6%     1200Mi          15%
my-cluster-general-yyyyy      310m         7%     1350Mi          17%
```

## Vérification

```bash
# Logs d'un agent Fluent Bit, en cas de doute sur l'envoi des logs
kubectl get pods -A | grep fluent-bit
kubectl logs -n <namespace> <nom-du-pod-fluent-bit> --tail=20
```

:::warning
Les destinations des métriques et des logs sont configurées par la plateforme. Pour modifier le comportement des agents (ressources, filtres de collecte), contactez le support.
:::

## Pour aller plus loin

- [Monitoring Agents](../plugins/monitoring-agents.md) : détail de l'addon
- [Accès et outils](./toolbox.md) : commandes de diagnostic et métriques
