---
title: "Come collegare un registry di immagini privato"
---

# Come collegare un registry di immagini privato

Questa guida spiega come configurare l'accesso a un registry di immagini di container privato (Docker Hub, GitLab Registry, GitHub Container Registry, ecc.) dal cluster Kubernetes Hikube.

:::note
Questa guida utilizza i meccanismi nativi di Kubernetes per l'autenticazione ai registry di immagini. Tutti i comandi si eseguono nel suo cluster.
:::

## Prerequisiti

- Un cluster Kubernetes Hikube distribuito (vedere l'[avvio rapido](../quick-start.md))
- Il kubeconfig del cluster scaricato dalla console (pulsante **Kubeconfig**) e caricato nella sessione (`export KUBECONFIG=~/Downloads/kubeconfig-<nome-del-cluster>.yaml`)
- Le credenziali di accesso al registry privato (URL, nome utente, password o token)

## Passaggi

### 1. Creare un Secret di tipo docker-registry

Crei un Secret Kubernetes contenente le credenziali del suo registry privato:

```bash
kubectl create secret docker-registry my-registry \
  --docker-server=registry.example.com \
  --docker-username=user \
  --docker-password=pass \
  --docker-email=user@example.com
```

**Esempi per i registry più comuni:**

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

### 2. Collegare il secret al ServiceAccount default

Affinché tutti i pod del namespace utilizzino automaticamente il registry privato, colleghi il secret al ServiceAccount `default`:

```bash
kubectl patch serviceaccount default -p '{"imagePullSecrets": [{"name": "my-registry"}]}'
```

:::tip
Questo metodo è pratico quando tutti i pod di un namespace devono accedere allo stesso registry. I nuovi pod ereditano automaticamente il secret.
:::

### 3. Oppure referenziarlo direttamente nella spec del Pod

È anche possibile specificare `imagePullSecrets` direttamente nella spec di ogni Pod o Deployment:

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

### 4. Testare con una distribuzione che utilizza un'immagine privata

Distribuisca l'applicazione e verifichi che l'immagine venga scaricata correttamente:

```bash
kubectl apply -f deployment-private-image.yaml

# Verificare lo stato dei pod
kubectl get pods -l app=my-app

# In caso di errore, esaminare gli eventi
kubectl describe pod -l app=my-app
```

## Verifica

Verifichi che i pod utilizzino correttamente l'immagine privata:

```bash
# Verificare che i pod siano Running
kubectl get pods -l app=my-app
```

**Risultato atteso:**

```console
NAME                      READY   STATUS    RESTARTS   AGE
my-app-6b8d5f7c9d-abc12   1/1     Running   0          1m
my-app-6b8d5f7c9d-def34   1/1     Running   0          1m
```

:::warning
Se i pod restano nello stato `ImagePullBackOff` o `ErrImagePull`, verifichi:
- l'URL del registry nel Secret (`--docker-server`);
- le credenziali (nome utente e password o token);
- il nome completo dell'immagine con il prefisso del registry;
- che il secret si trovi nello stesso namespace del Pod.
:::

## Per approfondire

- [Concetti](../concepts.md): architettura Kubernetes Hikube
- [Accesso e strumenti](./toolbox.md): kubeconfig e comandi utili
