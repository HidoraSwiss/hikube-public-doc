---
sidebar_position: 8
title: Flux CD
---

# Flux CD

L'addon **Flux CD** installe les contrôleurs **Flux** dans le cluster, pour la **gestion GitOps** : Flux synchronise en continu l'état du cluster avec des dépôts Git, de sorte que la configuration déclarée dans le code soit toujours appliquée.

## Dans la console

1. À la création, étape **Addons**, cochez **Flux CD** (désactivé par défaut).
2. Sur un cluster existant : **Modifier** > **Extensions & Addons**, cochez **Flux CD**, puis **Enregistrer**.

La page de détail du cluster affiche **Flux CD** dans la section **Extensions** lorsqu'il est actif.

## Surcharger la configuration

L'addon installe Flux 2.8 avec le **Flux Operator** dans le cluster. Une fois l'addon coché, le champ **Configuration Helm (YAML) — optionnel** apparaît. La valeur est transmise au chart `flux-instance`, sous la clé `flux-instance` ; les options disponibles sont celles de la ressource [FluxInstance](https://fluxcd.control-plane.io/operator/fluxinstance/). Dans la plupart des cas, aucune surcharge n'est nécessaire.

:::note
L'addon installe Flux, mais ne déclare aucun dépôt. Les sources Git et les synchronisations se créent dans le cluster, comme décrit ci-dessous.
:::

## Utilisation dans le cluster

Déclarez une source `GitRepository` et une `Kustomization` :

```yaml title="gitops-sync.yaml"
apiVersion: v1
kind: Namespace
metadata:
  name: gitops
---
apiVersion: source.toolkit.fluxcd.io/v1
kind: GitRepository
metadata:
  name: k8s-manifests
  namespace: gitops
spec:
  interval: 1m
  url: https://github.com/company/k8s-manifests
  ref:
    branch: main
---
apiVersion: kustomize.toolkit.fluxcd.io/v1
kind: Kustomization
metadata:
  name: production
  namespace: gitops
spec:
  interval: 5m
  sourceRef:
    kind: GitRepository
    name: k8s-manifests
  path: ./clusters/production
  prune: true
```

```bash
kubectl apply -f gitops-sync.yaml
kubectl get gitrepositories,kustomizations -n gitops
```

Le parcours complet est décrit dans [Comment déployer avec Flux (GitOps)](../how-to/deploy-gitops-flux.md).

## Bonnes pratiques

- Stockez les identifiants Git (clé SSH, token) dans des Secrets Kubernetes référencés par `spec.secretRef`, jamais dans le dépôt.
- Activez `prune: true` pour que les ressources retirées du dépôt soient aussi retirées du cluster.
- Séparez les répertoires par environnement (`clusters/staging`, `clusters/production`).
