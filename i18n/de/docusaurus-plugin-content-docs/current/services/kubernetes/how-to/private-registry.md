---
title: "Private Container-Registry verbinden"
---

# Private Container-Registry verbinden

Diese Anleitung erklärt, wie Sie den Zugriff auf eine private Container-Image-Registry (Docker Hub, GitLab Registry, GitHub Container Registry usw.) von Ihrem Kubernetes-Hikube-Cluster aus konfigurieren.

:::note
Diese Anleitung verwendet die nativen Kubernetes-Mechanismen zur Authentifizierung bei Image-Registries. Sie gilt für jeden Kubernetes-Hikube-Cluster.
:::

## Voraussetzungen

- Ein bereitgestellter Kubernetes-Hikube-Cluster (siehe [Schnellstart](../quick-start.md))
- Die kubeconfig des Child-Clusters konfiguriert (`export KUBECONFIG=cluster-admin.yaml`)
- Die Zugangsdaten zu Ihrer privaten Registry (URL, Benutzername, Passwort oder Token)

## Schritte

### 1. Ein Secret vom Typ docker-registry erstellen

Erstellen Sie ein Kubernetes-Secret mit den Zugangsdaten Ihrer privaten Registry:

```bash
kubectl create secret docker-registry my-registry \
  --docker-server=registry.example.com \
  --docker-username=user \
  --docker-password=pass \
  --docker-email=user@example.com
```

**Beispiele für gängige Registries:**

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

### 2. Secret an den ServiceAccount default anhängen

Damit alle Pods des Namespace automatisch die private Registry verwenden, hängen Sie das Secret an den ServiceAccount `default` an:

```bash
kubectl patch serviceaccount default -p '{"imagePullSecrets": [{"name": "my-registry"}]}'
```

:::tip
Diese Methode ist praktisch für Umgebungen, in denen alle Pods eines Namespace auf dieselbe Registry zugreifen müssen. Neue Pods erben das Secret automatisch.
:::

### 3. Oder direkt im Pod-Spec referenzieren

Alternativ können Sie das Secret `imagePullSecrets` direkt im Spec jedes Pods oder Deployments angeben:

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

### 4. Mit einem Deployment testen, das ein privates Image verwendet

Stellen Sie Ihre Anwendung bereit und prüfen Sie, ob das Image korrekt heruntergeladen wird:

```bash
kubectl apply -f deployment-private-image.yaml

# Pod-Status prüfen
kubectl get pods -l app=my-app

# Bei Fehlern die Events inspizieren
kubectl describe pod -l app=my-app
```

## Überprüfung

Prüfen Sie, ob die Pods das private Image korrekt verwenden:

```bash
# Prüfen, ob die Pods Running sind
kubectl get pods -l app=my-app
```

**Erwartetes Ergebnis:**

```console
NAME                      READY   STATUS    RESTARTS   AGE
my-app-6b8d5f7c9d-abc12   1/1     Running   0          1m
my-app-6b8d5f7c9d-def34   1/1     Running   0          1m
```

:::warning
Wenn die Pods im Zustand `ImagePullBackOff` oder `ErrImagePull` verbleiben, prüfen Sie:
- Die Registry-URL im Secret (`--docker-server`)
- Die Zugangsdaten (Benutzername und Passwort/Token)
- Den vollständigen Image-Namen mit dem Registry-Präfix
- Ob das Secret im selben Namespace wie der Pod liegt
:::

## Weiterführende Informationen

- [API-Referenz](../api-reference.md) -- Vollständige Cluster-Konfiguration
- [Konzepte](../concepts.md) -- Kubernetes-Hikube-Architektur
- [Schnellstart](../quick-start.md) -- Ersten Cluster bereitstellen
