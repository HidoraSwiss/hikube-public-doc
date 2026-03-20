---
title: "Comment connecter un registre d'images prive"
---

# Comment connecter un registre d'images prive

Ce guide explique comment configurer l'acces a un registre d'images de conteneurs prive (Docker Hub, GitLab Registry, GitHub Container Registry, etc.) depuis votre cluster Kubernetes Hikube.

:::note
Ce guide utilise les mecanismes Kubernetes natifs pour l'authentification aux registres d'images. Il s'applique a tout cluster Kubernetes Hikube.
:::

## Prerequis

- Un cluster Kubernetes Hikube deploye (voir le [demarrage rapide](../quick-start.md))
- Le kubeconfig du cluster enfant configure (`export KUBECONFIG=cluster-admin.yaml`)
- Les identifiants d'acces a votre registre prive (URL, nom d'utilisateur, mot de passe ou token)

## Etapes

### 1. Creer un Secret de type docker-registry

Creez un Secret Kubernetes contenant les identifiants de votre registre prive :

```bash
kubectl create secret docker-registry my-registry \
  --docker-server=registry.example.com \
  --docker-username=user \
  --docker-password=pass \
  --docker-email=user@example.com
```

**Exemples pour des registres courants :**

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

### 2. Attacher le secret au ServiceAccount default

Pour que tous les pods du namespace utilisent automatiquement le registre prive, attachez le secret au ServiceAccount `default` :

```bash
kubectl patch serviceaccount default -p '{"imagePullSecrets": [{"name": "my-registry"}]}'
```

:::tip
Cette methode est pratique pour les environnements ou tous les pods d'un namespace doivent acceder au meme registre. Les nouveaux pods heritent automatiquement du secret.
:::

### 3. Ou referencer directement dans le Pod spec

Alternativement, vous pouvez specifier le secret `imagePullSecrets` directement dans le spec de chaque Pod ou Deployment :

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

### 4. Tester avec un deploiement utilisant une image privee

Deployez votre application et verifiez que l'image est correctement telechargee :

```bash
kubectl apply -f deployment-private-image.yaml

# Verifier le statut des pods
kubectl get pods -l app=my-app

# En cas d'erreur, inspecter les events
kubectl describe pod -l app=my-app
```

## Verification

Verifiez que les pods utilisent correctement l'image privee :

```bash
# Verifier que les pods sont Running
kubectl get pods -l app=my-app
```

**Resultat attendu :**

```console
NAME                      READY   STATUS    RESTARTS   AGE
my-app-6b8d5f7c9d-abc12   1/1     Running   0          1m
my-app-6b8d5f7c9d-def34   1/1     Running   0          1m
```

:::warning
Si les pods restent en etat `ImagePullBackOff` ou `ErrImagePull`, verifiez :
- L'URL du registre dans le Secret (`--docker-server`)
- Les identifiants (nom d'utilisateur et mot de passe/token)
- Le nom complet de l'image avec le prefixe du registre
- Que le secret est dans le meme namespace que le Pod
:::

## Pour aller plus loin

- [Référence API](../api-reference.md) -- Configuration complète des clusters
- [Concepts](../concepts.md) -- Architecture Kubernetes Hikube
- [Démarrage rapide](../quick-start.md) -- Déployer un premier cluster
