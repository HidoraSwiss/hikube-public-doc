---
title: Come aggiornare un cluster
---

# Comment mettre a jour un cluster

Ce guide explique comment mettre a jour la version de Kubernetes sur un cluster Hikube. Les mises a jour se font par rolling update, sans interruption du plan de controle.

## Prerequisitiiti

- Un cluster Kubernetes Hikube deploye (voir le [demarrage rapide](../quick-start.md))
- `kubectl` configure pour interagir avec l'API Hikube
- Le kubeconfig du cluster enfant recupere

## Passi

### 1. Verifier la version actuelle

Identifiez la version Kubernetes actuellement deployee sur votre cluster :

```bash
# Version dans la configuration Hikube
kubectl get kubernetes my-cluster -o yaml | grep version

# Version reportee par les noeuds
kubectl --kubeconfig=cluster-admin.yaml get nodes
```

**Risultato atteso :**

```console
NAME                         STATUS   ROLES    AGE   VERSION
my-cluster-general-xxxxx     Ready    <none>   30d   v1.29.0
my-cluster-general-yyyyy     Ready    <none>   30d   v1.29.0
```

### 2. Consulter les versions disponibles

Avant de mettre a jour, verifiez les versions supportees par Hikube :

```bash
# Verifier la configuration actuelle du cluster
kubectl get kubernetes my-cluster -o yaml
```

:::warning
Testez toujours la mise a jour en environnement de staging avant la production. Certaines applications peuvent ne pas etre compatibles avec les nouvelles versions de Kubernetes.
:::

:::note
Les mises a jour doivent se faire de maniere incrementale (par exemple, v1.29 vers v1.30). Ne sautez pas plusieurs versions mineures d'un coup.
:::

### 3. Mettre a jour la version

**Option A : Patch direct**

```bash
kubectl patch kubernetes my-cluster --type='merge' -p='
spec:
  version: "v1.30.0"
'
```

**Option B : Modifier le fichier YAML**

```yaml title="cluster-upgrade.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Kubernetes
metadata:
  name: my-cluster
spec:
  version: "v1.30.0"

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
```

```bash
kubectl apply -f cluster-upgrade.yaml
```

### 4. Suivre le rolling update

Observez le deroulement de la mise a jour :

```bash
# Suivre l'etat du cluster Hikube
kubectl get kubernetes my-cluster -w

# Observer le remplacement des machines
kubectl get machines -l cluster.x-k8s.io/cluster-name=my-cluster -w

# Verifier les events
kubectl describe kubernetes my-cluster
```

:::tip
Les mises a jour se font par rolling update : les noeuds sont remplaces un par un. Le plan de controle est mis a jour en premier, suivi des node groups. Vos workloads continuent de fonctionner pendant la mise a jour.
:::

### 5. Verifier la mise a jour

Une fois le rolling update termine, confirmez la nouvelle version :

```bash
# Verifier la version des noeuds
kubectl --kubeconfig=cluster-admin.yaml get nodes

# Verifier la version de l'API server
kubectl --kubeconfig=cluster-admin.yaml version
```

## Verifica

Validez que le cluster fonctionne correctement apres la mise a jour :

```bash
# Noeuds en etat Ready avec la nouvelle version
kubectl --kubeconfig=cluster-admin.yaml get nodes

# Pods systeme operationnels
kubectl --kubeconfig=cluster-admin.yaml get pods -n kube-system

# Vos workloads fonctionnent
kubectl --kubeconfig=cluster-admin.yaml get pods -A
```

**Risultato atteso :**

```console
NAME                         STATUS   ROLES    AGE   VERSION
my-cluster-general-xxxxx     Ready    <none>   5m    v1.30.0
my-cluster-general-yyyyy     Ready    <none>   3m    v1.30.0
```

:::warning
Si des pods restent en erreur apres la mise a jour, verifiez la compatibilite de vos manifestes avec la nouvelle version Kubernetes. Certaines API deprecees peuvent avoir ete supprimees.
:::

## Per approfondire

- [Reference API](../api-reference.md) -- Champ `version` et configuration complete
- [Concepts](../concepts.md) -- Architecture du plan de controle et rolling updates
- [Acces et outils](./toolbox.md) -- Commandes de debugging et monitoring
