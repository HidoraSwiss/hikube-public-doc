---
title: "How to connect a private image registry"
---

# How to connect a private image registry

This guide explains how to configure access to a private container image registry (Docker Hub, GitLab Registry, GitHub Container Registry, etc.) from your Hikube Kubernetes cluster.

:::note
This guide uses native Kubernetes mechanisms for image registry authentication. All commands run in your cluster.
:::

## Prerequisites

- A deployed Hikube Kubernetes cluster (see the [quick start](../quick-start.md))
- The cluster kubeconfig downloaded from the console (**Kubeconfig** button) and loaded in your session (`export KUBECONFIG=~/Downloads/kubeconfig-<cluster-name>.yaml`)
- The credentials for your private registry (URL, username, password or token)

## Steps

### 1. Create a docker-registry Secret

Create a Kubernetes Secret containing the credentials of your private registry:

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

For all pods in the namespace to use the private registry automatically, attach the secret to the `default` ServiceAccount:

```bash
kubectl patch serviceaccount default -p '{"imagePullSecrets": [{"name": "my-registry"}]}'
```

:::tip
This method is convenient when all pods in a namespace must access the same registry. New pods inherit the secret automatically.
:::

### 3. Or reference it directly in the Pod spec

You can also specify `imagePullSecrets` directly in the spec of each Pod or Deployment:

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

Deploy your application and check that the image is pulled correctly:

```bash
kubectl apply -f deployment-private-image.yaml

# Check the pod status
kubectl get pods -l app=my-app

# In case of error, inspect the events
kubectl describe pod -l app=my-app
```

## Verification

Check that the pods are using the private image correctly:

```bash
# Check that the pods are Running
kubectl get pods -l app=my-app
```

**Expected result:**

```console
NAME                      READY   STATUS    RESTARTS   AGE
my-app-6b8d5f7c9d-abc12   1/1     Running   0          1m
my-app-6b8d5f7c9d-def34   1/1     Running   0          1m
```

:::warning
If the pods remain in `ImagePullBackOff` or `ErrImagePull` state, check:
- the registry URL in the Secret (`--docker-server`);
- the credentials (username and password or token);
- the full image name with the registry prefix;
- that the secret is in the same namespace as the Pod.
:::

## Going further

- [Concepts](../concepts.md): Hikube Kubernetes architecture
- [Access and tools](./toolbox.md): kubeconfig and useful commands
