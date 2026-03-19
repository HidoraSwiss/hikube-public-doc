---
title: "Private Image-Registry verbinden"
---

# Private Image-Registry verbinden

Dieser Leitfaden erklärt, wie Sie den Zugang zu einer privaten Container-Image-Registry (Docker Hub, GitLab Registry, GitHub Container Registry usw.) von Ihrem Hikube-Kubernetes-Cluster aus konfigurieren.

:::note
Dieser Leitfaden verwendet die nativen Kubernetes-Mechanismen zur Authentifizierung an Image-Registries. Er gilt für jeden Hikube-Kubernetes-Cluster.
:::

## Voraussetzungen

- Ein bereitgestellter Hikube-Kubernetes-Cluster (siehe [Schnellstart](../quick-start.md))
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

Damit alle Pods im Namespace automatisch die private Registry verwenden, hängen Sie das Secret an den ServiceAccount `default` an:

```bash
kubectl patch serviceaccount default -p '{"imagePullSecrets": [{"name": "my-registry"}]}'
```

:::tip
Diese Methode ist praktisch für Umgebungen, in denen alle Pods eines Namespaces auf dieselbe Registry zugreifen müssen. Neue Pods erben automatisch das Secret.
:::

### 3. Oder direkt im Pod-Spec referenzieren

Alternativ können Sie das `imagePullSecrets`-Secret direkt im Spec jedes Pods oder Deployments angeben:

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

### 4. Mit einem Deployment mit privatem Image testen

Stellen Sie Ihre Anwendung bereit und überprüfen Sie, ob das Image korrekt heruntergeladen wird:

```bash
kubectl apply -f deployment-private-image.yaml

# Verifier le statut des pods
kubectl get pods -l app=my-app

# En cas d'erreur, inspecter les events
kubectl describe pod -l app=my-app
```

## Überprüfung

Überprüfen Sie, ob die Pods das private Image korrekt verwenden:

```bash
# Verifier que les pods sont Running
kubectl get pods -l app=my-app
```

**Erwartetes Ergebnis:**

```console
NAME                      READY   STATUS    RESTARTS   AGE
my-app-6b8d5f7c9d-abc12   1/1     Running   0          1m
my-app-6b8d5f7c9d-def34   1/1     Running   0          1m
```

:::warning
Wenn die Pods im Zustand `ImagePullBackOff` oder `ErrImagePull` verbleiben, überprüfen Sie:
- Die URL der Registry im Secret (`--docker-server`)
- Die Zugangsdaten (Benutzername und Passwort/Token)
- Den vollständigen Image-Namen mit dem Registry-Präfix
- Ob das Secret im selben Namespace wie der Pod ist
:::

## Weiterführende Informationen

- [API-Referenz](../api-reference.md) -- Vollständige Cluster-Konfiguration
- [Konzepte](../concepts.md) -- Hikube-Kubernetes-Architektur
- [Schnellstart](../quick-start.md) -- Ersten Cluster bereitstellen
