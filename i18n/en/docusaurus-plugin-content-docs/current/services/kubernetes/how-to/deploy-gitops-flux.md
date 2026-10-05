---
title: "How to deploy with Flux (GitOps)"
---

# How to deploy with Flux (GitOps)

This guide explains how to enable Flux CD on a Hikube Kubernetes cluster and configure it to deploy your applications following the GitOps approach: a Git repository as the source of truth for the state of your cluster.

## Prerequisites

- A deployed Hikube Kubernetes cluster (see the [quick start](../quick-start.md))
- The cluster kubeconfig downloaded from the console (**Kubeconfig** button)
- A Git repository reachable from the cluster, containing your Kubernetes manifests

## Steps

### 1. Prepare the Git repository

Organize your Git repository with a directory structure containing your Kubernetes manifests:

```
k8s-manifests/
└── clusters/
    └── production/
        ├── namespaces.yaml
        ├── frontend/
        │   ├── deployment.yaml
        │   ├── service.yaml
        │   └── ingress.yaml
        └── backend/
            ├── deployment.yaml
            └── service.yaml
```

:::tip
Flux applies all YAML manifests found in the target directory and its subdirectories. Organize your files logically to make maintenance easier.
:::

### 2. Enable the Flux CD addon

1. In **Infrastructure** > **Kubernetes**, open the cluster's **Actions** menu and choose **Edit** (or check the addon directly at creation, **Addons** step).
2. In the **Extensions & Addons** section, check **Flux CD** ("GitOps continuous deployment for Kubernetes").
3. Click **Save**.

The cluster detail page then shows **Flux CD** in the **Extensions** section. The addon installs the Flux controllers and their CRDs; you then declare your repositories in the cluster.

### 3. Check the Flux installation

```bash
export KUBECONFIG=~/Downloads/kubeconfig-<cluster-name>.yaml

# Installed Flux CRDs
kubectl get crds | grep toolkit.fluxcd.io

# Flux controllers
kubectl get deploy -A -l app.kubernetes.io/part-of=flux
```

### 4. Declare the repository and the synchronization

Create in the cluster a `GitRepository` source and a `Kustomization` that applies the chosen directory:

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
```

:::note
For a private Git repository, create a Secret containing an SSH key or a token in the `gitops` namespace, then reference it in the `spec.secretRef` field of the `GitRepository`. See the [Flux documentation](https://fluxcd.io/flux/components/source/gitrepositories/) for the expected format.
:::

### 5. Observe the synchronization

```bash
# State of the Git source
kubectl get gitrepositories -n gitops

# State of the reconciliation
kubectl get kustomizations -n gitops
```

**Expected result:**

```console
NAME            URL                                         READY   STATUS
k8s-manifests   https://github.com/company/k8s-manifests    True    stored artifact for revision 'main@sha1:...'
```

```console
NAME         READY   STATUS
production   True    Applied revision: main@sha1:...
```

### 6. Deploy an application via Git

To deploy or update an application, push the manifests to your Git repository:

```yaml title="clusters/production/my-app/deployment.yaml"
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: my-app
  template:
    metadata:
      labels:
        app: my-app
    spec:
      containers:
        - name: app
          image: registry.example.com/my-app:v1.0.0
          ports:
            - containerPort: 8080
          resources:
            requests:
              cpu: "100m"
              memory: "128Mi"
            limits:
              cpu: "500m"
              memory: "256Mi"
```

```bash
# From your local repository
git add clusters/production/my-app/deployment.yaml
git commit -m "deploy: add my-app v1.0.0"
git push origin main
```

Flux detects the changes at the defined interval and applies the manifests in the cluster:

```bash
kubectl get kustomizations -n gitops -w
kubectl get pods -A -l app=my-app
```

:::tip
To force an immediate reconciliation:
```bash
kubectl annotate --overwrite gitrepository k8s-manifests -n gitops reconcile.fluxcd.io/requestedAt="$(date +%s)"
```
With the `flux` CLI, the equivalent is `flux reconcile kustomization production -n gitops --with-source`.
:::

## Verification

```bash
# Overall status
kubectl get gitrepositories,kustomizations -A

# Details of a reconciliation error
kubectl describe kustomization production -n gitops
```

:::warning
If the synchronization fails, check:
- that the Git repository is reachable from the cluster;
- that the YAML manifests in the repository are valid (an invalid file blocks the reconciliation);
- the events and logs of the Flux controllers (`kubectl logs` on the `source-controller` and `kustomize-controller` pods).
:::

## Going further

- [Flux CD](../plugins/fluxcd.md): addon details
- [How to deploy an Ingress with TLS](./deploy-ingress-tls.md): expose your applications deployed by Flux
