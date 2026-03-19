---
title: "Mit Flux (GitOps) bereitstellen"
---

# Mit Flux (GitOps) bereitstellen

Dieser Leitfaden erklärt, wie Sie FluxCD auf einem Hikube-Kubernetes-Cluster aktivieren und konfigurieren, um Ihre Anwendungen nach dem GitOps-Ansatz bereitzustellen: ein Git-Repository als einzige Wahrheitsquelle für den Zustand Ihres Clusters.

## Voraussetzungen

- Ein bereitgestellter Hikube-Kubernetes-Cluster (siehe [Schnellstart](../quick-start.md))
- `kubectl` konfiguriert für die Interaktion mit der Hikube-API
- Ein zugängliches Git-Repository mit Ihren Kubernetes-Manifesten
- Die kubeconfig des Child-Clusters abgerufen

## Schritte

### 1. Git-Repository vorbereiten

Organisieren Sie Ihr Git-Repository mit einer Verzeichnisstruktur, die Ihre Kubernetes-Manifeste enthält:

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
Flux synchronisiert alle YAML-Manifeste, die im Zielverzeichnis und seinen Unterverzeichnissen gefunden werden. Organisieren Sie Ihre Dateien logisch, um die Wartung zu erleichtern.
:::

### 2. FluxCD-Addon aktivieren

Ändern Sie die Konfiguration Ihres Clusters, um FluxCD mit der URL Ihres Repositorys zu aktivieren:

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
Für private Git-Repositorys konfigurieren Sie die SSH- oder Token-Authentifizierung im Child-Cluster nach dem Deployment von Flux.
:::

### 3. Cluster-Konfiguration anwenden

```bash
kubectl apply -f cluster-gitops.yaml

# Attendre que le cluster et les addons soient prets
kubectl get kubernetes my-cluster -w
```

### 4. Synchronisation beobachten

Überprüfen Sie, ob Flux Ihr Git-Repository korrekt synchronisiert:

```bash
export KUBECONFIG=cluster-admin.yaml

# Verifier le GitRepository
kubectl get gitrepositories -A

# Verifier les Kustomizations (reconciliation Flux)
kubectl get kustomizations -A

# Details de la synchronisation
kubectl describe gitrepository -A

# Verifier les pods Flux
kubectl get pods -n flux-system
```

**Erwartetes Ergebnis:**

```console
NAMESPACE     NAME            URL                                          READY   STATUS                  AGE
flux-system   flux-system     https://github.com/company/k8s-manifests    True    Fetched revision: main   5m
```

```console
NAMESPACE     NAME            READY   STATUS                  AGE
flux-system   flux-system     True    Applied revision: main   5m
```

### 5. Anwendung über Git bereitstellen

Um eine Anwendung bereitzustellen oder zu aktualisieren, pushen Sie einfach die Manifeste in Ihr Git-Repository:

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
# Depuis votre depot local
git add apps/my-app/deployment.yaml
git commit -m "deploy: add my-app v1.0.0"
git push origin main
```

Flux erkennt automatisch die Änderungen und wendet die Manifeste im Cluster an:

```bash
# Observer la reconciliation
kubectl get kustomizations -A -w

# Verifier que l'application est deployee
kubectl get pods -l app=my-app
```

:::tip
Standardmäßig synchronisiert Flux das Repository jede Minute. Um eine sofortige Abstimmung zu erzwingen:
```bash
kubectl annotate --overwrite gitrepository flux-system -n flux-system reconcile.fluxcd.io/requestedAt="$(date +%s)"
```
:::

## Überprüfung

Validieren Sie, dass die GitOps-Pipeline durchgängig funktioniert:

```bash
# Statut global de Flux
kubectl get gitrepositories,kustomizations -A

# Logs de Flux en cas de probleme
kubectl logs -n flux-system deploy/source-controller --tail=30
kubectl logs -n flux-system deploy/kustomize-controller --tail=30

# Verifier les resources deployees par Flux
kubectl get all -l kustomize.toolkit.fluxcd.io/name=flux-system
```

:::warning
Wenn die Synchronisation fehlschlägt, überprüfen Sie:
- Die Erreichbarkeit des Git-Repositorys vom Cluster aus
- Die Gültigkeit der YAML-Manifeste im Repository (eine ungültige Datei blockiert die Abstimmung)
- Die Logs der Flux-Controller, um den genauen Fehler zu identifizieren
:::

## Weiterführende Informationen

- [API-Referenz](../api-reference.md) -- Konfiguration des Addons `fluxcd`
- [Konzepte](../concepts.md) -- Cluster-Architektur und Addons
- [Ingress mit TLS bereitstellen](./deploy-ingress-tls.md) -- Ihre über Flux bereitgestellten Anwendungen exponieren
