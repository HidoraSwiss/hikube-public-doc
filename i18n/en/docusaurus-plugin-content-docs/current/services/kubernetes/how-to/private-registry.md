---
title: "How to connect a private image registry"
---

# How to connect a private image registry

This guide explains how to configure access to a private container image registry (Docker Hub, GitLab Registry, GitHub Container Registry, etc.) from your Hikube Kubernetes cluster.

:::note
This guide uses native Kubernetes mechanisms for image registry authentication. It applies to any Hikube Kubernetes cluster.
:::

## Prerequisites

- A deployed Hikube Kubernetes cluster (see the [quick start](../quick-start.md))
- The child cluster kubeconfig configured (`export KUBECONFIG=cluster-admin.yaml`)
- Access credentials for your private registry (URL, username, password or token)

## Steps

### 1. Create a docker-registry Secret

Create a Kubernetes Secret containing the credentials for your private registry:

```bash
kubectl create secret docker-registry my-registry \
  --docker-server=registry.example.com \
  --docker-username=user \
  --docker-password=pass \
  --docker-email=user@example.com
```

**Examples for common registries:**

```bash
# Docker Hub
kubectl create secret docker-registry dockerhub \
  --docker-server=https://index.docker.io/v1/ \
  --docker-username=myuser \
  --docker-password=mytoken

# GitLab Container Registry
kubectl create secret docker-registry gitlab-registry \
  --docker-server=registry.gitlab.com \
  --docker-username=deploy-token-user \
  --docker-password=deploy-token-pass

# GitHub Container Registry
kubectl create secret docker-registry ghcr \
  --docker-server=ghcr.io \
  --docker-username=github-user \
  --docker-password=ghp_xxxxxxxxxxxx
```

### 2. Attach the secret to the default ServiceAccount

To have all pods in the namespace automatically use the private registry, attach the secret to the `default` ServiceAccount:

```bash
kubectl patch serviceaccount default -p '{"imagePullSecrets": [{"name": "my-registry"}]}'
```

:::tip
This method is convenient for environments where all pods in a namespace need to access the same registry. New pods automatically inherit the secret.
:::

### 3. Or reference directly in the Pod spec

Alternatively, you can specify the `imagePullSecrets` secret directly in the spec of each Pod or Deployment:

```yaml title="deployment-private-image.yaml"
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app
spec:
  replicas: 2
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
          image: registry.example.com/company/my-app:v1.2.3
          ports:
            - containerPort: 8080
      imagePullSecrets:
        - name: my-registry
```

### 4. Test with a deployment using a private image

Deploy your application and verify that the image is correctly pulled:

```bash
kubectl apply -f deployment-private-image.yaml

# Check the pod status
kubectl get pods -l app=my-app

# In case of error, inspect the events
kubectl describe pod -l app=my-app
```

## Verification

Verify that the pods are correctly using the private image:

```bash
# Check that the pods are Running
kubectl get pods -l app=my-app
```

**Expected output:**

```console
NAME                      READY   STATUS    RESTARTS   AGE
my-app-6b8d5f7c9d-abc12   1/1     Running   0          1m
my-app-6b8d5f7c9d-def34   1/1     Running   0          1m
```

:::warning
If pods remain in `ImagePullBackOff` or `ErrImagePull` state, check:
- The registry URL in the Secret (`--docker-server`)
- The credentials (username and password/token)
- The full image name with the registry prefix
- That the secret is in the same namespace as the Pod
:::

## Next steps

- [API reference](../api-reference.md) -- Full cluster configuration
- [Concepts](../concepts.md) -- Hikube Kubernetes architecture
- [Quick start](../quick-start.md) -- Deploy a first cluster
