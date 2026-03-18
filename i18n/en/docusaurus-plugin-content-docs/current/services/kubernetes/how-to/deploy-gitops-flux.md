---
title: "How to deploy with Flux (GitOps)"
---

# How to deploy with Flux (GitOps)

This guide explains how to enable and configure FluxCD on a Hikube Kubernetes cluster to deploy your applications using the GitOps approach: a Git repository as the source of truth for your cluster state.

## Prerequisites

- A deployed Hikube Kubernetes cluster (see the [quick start](../quick-start.md))
- `kubectl` configured to interact with the Hikube API
- An accessible Git repository containing your Kubernetes manifests
- The child cluster kubeconfig retrieved

## Steps

### 1. Prepare the Git repository

Organize your Git repository with a directory structure containing your Kubernetes manifests:

```
k8s-manifests/
├── namespaces/
│   └── production.yaml
├── apps/
│   ├── frontend/
│   │   ├── deployment.yaml
│   │   ├── service.yaml
│   │   └── ingress.yaml
│   └── backend/
│       ├── deployment.yaml
│       └── service.yaml
└── config/
    └── configmaps.yaml
```

:::tip
Flux synchronizes all YAML manifests found in the target directory and its subdirectories. Organize your files logically to facilitate maintenance.
:::

### 2. Enable the FluxCD addon

Modify your cluster configuration to enable FluxCD with your repository URL:

```yaml title="cluster-gitops.yaml"
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

  addons:
    certManager:
      enabled: true
    ingressNginx:
      enabled: true
      hosts:
        - app.example.com
    fluxcd:
      enabled: true
      valuesOverride:
        gitRepository:
          url: "https://github.com/company/k8s-manifests"
          branch: "main"
```

:::note
For private Git repositories, configure SSH or token authentication in the child cluster after Flux deployment.
:::

### 3. Apply the cluster configuration

```bash
kubectl apply -f cluster-gitops.yaml

# Wait for the cluster and addons to be ready
kubectl get kubernetes my-cluster -w
```

### 4. Observe the synchronization

Verify that Flux is correctly synchronizing your Git repository:

```bash
export KUBECONFIG=cluster-admin.yaml

# Check the GitRepository
kubectl get gitrepositories -A

# Check the Kustomizations (Flux reconciliation)
kubectl get kustomizations -A

# Synchronization details
kubectl describe gitrepository -A

# Check Flux pods
kubectl get pods -n flux-system
```

**Expected output:**

```console
NAMESPACE     NAME            URL                                          READY   STATUS                  AGE
flux-system   flux-system     https://github.com/company/k8s-manifests    True    Fetched revision: main   5m
```

```console
NAMESPACE     NAME            READY   STATUS                  AGE
flux-system   flux-system     True    Applied revision: main   5m
```

### 5. Deploy an application via Git

To deploy or update an application, simply push the manifests to your Git repository:

```yaml title="apps/my-app/deployment.yaml"
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
git add apps/my-app/deployment.yaml
git commit -m "deploy: add my-app v1.0.0"
git push origin main
```

Flux automatically detects changes and applies the manifests in the cluster:

```bash
# Watch the reconciliation
kubectl get kustomizations -A -w

# Verify that the application is deployed
kubectl get pods -l app=my-app
```

:::tip
By default, Flux synchronizes the repository every minute. To force an immediate reconciliation:
```bash
kubectl annotate --overwrite gitrepository flux-system -n flux-system reconcile.fluxcd.io/requestedAt="$(date +%s)"
```
:::

## Verification

Validate that the GitOps pipeline works end to end:

```bash
# Overall Flux status
kubectl get gitrepositories,kustomizations -A

# Flux logs in case of issues
kubectl logs -n flux-system deploy/source-controller --tail=30
kubectl logs -n flux-system deploy/kustomize-controller --tail=30

# Check resources deployed by Flux
kubectl get all -l kustomize.toolkit.fluxcd.io/name=flux-system
```

:::warning
If synchronization fails, check:
- Git repository accessibility from the cluster
- Validity of YAML manifests in the repository (an invalid file blocks reconciliation)
- Flux controller logs to identify the precise error
:::

## Next steps

- [API reference](../api-reference.md) -- `fluxcd` addon configuration
- [Concepts](../concepts.md) -- Cluster architecture and addons
- [How to deploy an Ingress with TLS](./deploy-ingress-tls.md) -- Expose your applications deployed by Flux
