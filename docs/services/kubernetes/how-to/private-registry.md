---
title: "Comment connecter un registre d'images privé"
---

# Comment connecter un registre d'images privé

Ce guide explique comment configurer l'accès à un registre d'images de conteneurs privé (Docker Hub, GitLab Registry, GitHub Container Registry, etc.) depuis votre cluster Kubernetes Hikube.

:::note
Ce guide utilise les mécanismes Kubernetes natifs pour l'authentification aux registres d'images. Toutes les commandes s'exécutent dans votre cluster.
:::

## Prérequis

- Un cluster Kubernetes Hikube déployé (voir le [démarrage rapide](../quick-start.md))
- Le kubeconfig du cluster téléchargé depuis la console (bouton **Kubeconfig**) et chargé dans votre session (`export KUBECONFIG=~/Downloads/kubeconfig-<nom-du-cluster>.yaml`)
- Les identifiants d'accès à votre registre privé (URL, nom d'utilisateur, mot de passe ou token)

## Étapes

### 1. Créer un Secret de type docker-registry

Créez un Secret Kubernetes contenant les identifiants de votre registre privé :

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

Pour que tous les pods du namespace utilisent automatiquement le registre privé, attachez le secret au ServiceAccount `default` :

```bash
kubectl patch serviceaccount default -p '{"imagePullSecrets": [{"name": "my-registry"}]}'
```

:::tip
Cette méthode est pratique lorsque tous les pods d'un namespace doivent accéder au même registre. Les nouveaux pods héritent automatiquement du secret.
:::

### 3. Ou référencer directement dans le Pod spec

Vous pouvez aussi spécifier `imagePullSecrets` directement dans le spec de chaque Pod ou Deployment :

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

### 4. Tester avec un déploiement utilisant une image privée

Déployez votre application et vérifiez que l'image est correctement téléchargée :

```bash
kubectl apply -f deployment-private-image.yaml

# Vérifier le statut des pods
kubectl get pods -l app=my-app

# En cas d'erreur, inspecter les events
kubectl describe pod -l app=my-app
```

## Vérification

Vérifiez que les pods utilisent correctement l'image privée :

```bash
# Vérifier que les pods sont Running
kubectl get pods -l app=my-app
```

**Résultat attendu :**

```console
NAME                      READY   STATUS    RESTARTS   AGE
my-app-6b8d5f7c9d-abc12   1/1     Running   0          1m
my-app-6b8d5f7c9d-def34   1/1     Running   0          1m
```

:::warning
Si les pods restent en état `ImagePullBackOff` ou `ErrImagePull`, vérifiez :
- l'URL du registre dans le Secret (`--docker-server`) ;
- les identifiants (nom d'utilisateur et mot de passe ou token) ;
- le nom complet de l'image avec le préfixe du registre ;
- que le secret est dans le même namespace que le Pod.
:::

## Pour aller plus loin

- [Concepts](../concepts.md) : architecture Kubernetes Hikube
- [Accès et outils](./toolbox.md) : kubeconfig et commandes utiles
