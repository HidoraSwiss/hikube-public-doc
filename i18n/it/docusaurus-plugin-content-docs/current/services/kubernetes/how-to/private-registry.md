---
title: "Come collegare un registro immagini privato"
---

# Come collegare un registro immagini privato

Questa guida spiega come configurare l'accesso a un registro di immagini container privato (Docker Hub, GitLab Registry, GitHub Container Registry, ecc.) dal vostro cluster Kubernetes Hikube.

:::note
Questa guida utilizza i meccanismi Kubernetes nativi per l'autenticazione ai registri di immagini. Si applica a qualsiasi cluster Kubernetes Hikube.
:::

## Prerequisiti

- Un cluster Kubernetes Hikube distribuito (vedere l'[avvio rapido](../quick-start.md))
- Il kubeconfig del cluster figlio configurato (`export KUBECONFIG=cluster-admin.yaml`)
- Le credenziali di accesso al vostro registro privato (URL, nome utente, password o token)

## Fasi

### 1. Creare un Secret di tipo docker-registry

Create un Secret Kubernetes contenente le credenziali del vostro registro privato:

```bash
kubectl create secret docker-registry my-registry \
  --docker-server=registry.example.com \
  --docker-username=user \
  --docker-password=pass \
  --docker-email=user@example.com
```

**Esempi per registri comuni:**

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

### 2. Associare il secret al ServiceAccount default

Affinche tutti i pod del namespace utilizzino automaticamente il registro privato, associate il secret al ServiceAccount `default`:

```bash
kubectl patch serviceaccount default -p '{"imagePullSecrets": [{"name": "my-registry"}]}'
```

:::tip
Questo metodo e pratico per gli ambienti in cui tutti i pod di un namespace devono accedere allo stesso registro. I nuovi pod ereditano automaticamente il secret.
:::

### 3. Oppure referenziare direttamente nel Pod spec

In alternativa, potete specificare il secret `imagePullSecrets` direttamente nel spec di ogni Pod o Deployment:

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

### 4. Testare con un deployment che utilizza un'immagine privata

Distribuite la vostra applicazione e verificate che l'immagine venga scaricata correttamente:

```bash
kubectl apply -f deployment-private-image.yaml

# Verificare lo stato dei pod
kubectl get pods -l app=my-app

# In caso di errore, ispezionare gli eventi
kubectl describe pod -l app=my-app
```

## Verifica

Verificate che i pod utilizzino correttamente l'immagine privata:

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
Se i pod rimangono in stato `ImagePullBackOff` o `ErrImagePull`, verificate:
- L'URL del registro nel Secret (`--docker-server`)
- Le credenziali (nome utente e password/token)
- Il nome completo dell'immagine con il prefisso del registro
- Che il secret sia nello stesso namespace del Pod
:::

## Per approfondire

- [Riferimento API](../api-reference.md) -- Configurazione completa dei cluster
- [Concetti](../concepts.md) -- Architettura Kubernetes Hikube
- [Avvio rapido](../quick-start.md) -- Distribuire un primo cluster
