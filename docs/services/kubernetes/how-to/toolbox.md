---
title: Accès et outils
---

# Accès et outils

Ce guide explique comment accéder à un cluster Kubernetes Hikube une fois créé, et regroupe les commandes utiles pour l'exploiter. Le cycle de vie du cluster (création, modification, suppression) se gère dans la console ; tout le reste se fait dans le cluster avec vos outils habituels.

## Télécharger le kubeconfig

1. Dans la console, ouvrez **Infrastructure** > **Kubernetes** et cliquez sur le cluster.
2. Attendez que le cluster ait le statut **Prêt**.
3. Dans la section **Actions** de la page de détail, cliquez sur **Kubeconfig**.

Le navigateur télécharge le fichier `kubeconfig-<nom-du-cluster>.yaml`. Il donne un accès administrateur au cluster.

:::warning
Conservez ce fichier en lieu sûr (gestionnaire de secrets, coffre-fort) et ne le versionnez jamais. Pour donner accès à d'autres personnes, créez-leur des droits dédiés avec RBAC plutôt que de partager ce fichier.
:::

## Utiliser le kubeconfig

```bash
# Pour la session courante
export KUBECONFIG=~/Downloads/kubeconfig-<nom-du-cluster>.yaml

# Ou ponctuellement
kubectl --kubeconfig ~/Downloads/kubeconfig-<nom-du-cluster>.yaml get nodes

# Vérifier la connexion
kubectl cluster-info
kubectl get nodes
```

Le même fichier fonctionne avec `helm`, `k9s`, `flux` ou tout client Kubernetes.

## Configurer RBAC

Créez des rôles et des comptes dédiés pour vos équipes et vos pipelines, par exemple un accès en lecture seule à un namespace :

```yaml title="rbac-readonly.yaml"
apiVersion: v1
kind: Namespace
metadata:
  name: production
---
apiVersion: v1
kind: ServiceAccount
metadata:
  name: viewer
  namespace: production
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: viewer-view
  namespace: production
subjects:
  - kind: ServiceAccount
    name: viewer
    namespace: production
roleRef:
  kind: ClusterRole
  name: view
  apiGroup: rbac.authorization.k8s.io
```

```bash
kubectl apply -f rbac-readonly.yaml
```

---

## Monitoring et observabilité

### Dans la console

La page de détail du cluster affiche le statut, la version, le control plane, les **Pools de Nœuds** (nombre de nœuds actifs par groupe) et les extensions activées.

### Dans le cluster

```bash
# Nœuds du cluster
kubectl get nodes -o wide

# Consommation de ressources
kubectl top nodes
kubectl top pods -A

# Events récents
kubectl get events -A --sort-by=.metadata.creationTimestamp
```

---

## Gestion du cycle de vie

Ces opérations se font dans la console :

| Opération | Où |
|-----------|----|
| Mettre à jour la version | **Modifier** > **Version de Kubernetes** ([guide](./upgrade-cluster.md)) |
| Ajouter, modifier ou supprimer un groupe de nœuds | **Modifier** > **Groupes de nœuds** ([guide](./manage-node-groups.md)) |
| Ajuster le scaling | **Modifier** > **Nombre minimum de nœuds** / **Nombre maximum de nœuds** ([guide](./configure-autoscaling.md)) |
| Activer ou configurer un addon | **Modifier** > **Extensions & Addons** |
| Supprimer le cluster | **Supprimer**, puis confirmation du nom ([démarrage rapide](../quick-start.md), étape 7) |

---

## Diagnostic

```bash
# Nœuds non prêts
kubectl describe node <nom-du-nœud>

# Pods en erreur
kubectl get pods -A --field-selector=status.phase!=Running
kubectl describe pod <nom-du-pod> -n <namespace>
kubectl logs <nom-du-pod> -n <namespace> --previous

# Composants des addons (Cilium, CoreDNS, Ingress NGINX, etc.)
kubectl get pods -A | grep -E "cilium|coredns|ingress-nginx|cert-manager"
```

Si un cluster reste **En création**, si un addon ne se déploie pas ou si un nœud ne rejoint jamais le cluster, [contactez le support](mailto:support@hidora.io) en indiquant le nom du cluster et le projet.
