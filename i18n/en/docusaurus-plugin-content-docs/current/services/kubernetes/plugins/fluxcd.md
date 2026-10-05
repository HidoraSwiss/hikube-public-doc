---
sidebar_position: 8
title: Flux CD
---

# Flux CD

The **Flux CD** addon installs the **Flux** controllers in the cluster, for **GitOps management**: Flux continuously synchronizes the cluster state with Git repositories, so that the configuration declared in code is always applied.

## In the console

1. At creation, **Addons** step, check **Flux CD** (disabled by default).
2. On an existing cluster: **Edit** > **Extensions & Addons**, check **Flux CD**, then **Save**.

The cluster detail page shows **Flux CD** in the **Extensions** section when it is active.

## Override the configuration

The addon installs Flux 2.8 with the **Flux Operator** in the cluster. Once the addon is checked, the **Helm Configuration (YAML) — optional** field appears. The value is passed to the `flux-instance` chart, under the `flux-instance` key; the available options are those of the [FluxInstance](https://fluxcd.control-plane.io/operator/fluxinstance/) resource. In most cases, no override is needed.

:::note
The addon installs Flux, but does not declare any repository. Git sources and synchronizations are created in the cluster, as described below.
:::

## Usage in the cluster

Declare a `GitRepository` source and a `Kustomization`:

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

The full walkthrough is described in [How to deploy with Flux (GitOps)](../how-to/deploy-gitops-flux.md).

## Best practices

- Store Git credentials (SSH key, token) in Kubernetes Secrets referenced by `spec.secretRef`, never in the repository.
- Enable `prune: true` so that resources removed from the repository are also removed from the cluster.
- Separate directories by environment (`clusters/staging`, `clusters/production`).
