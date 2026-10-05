---
title: "Mit Flux bereitstellen (GitOps)"
---

# Mit Flux bereitstellen (GitOps)

Diese Anleitung erklärt, wie Sie Flux CD auf einem Hikube-Kubernetes-Cluster aktivieren und so konfigurieren, dass es Ihre Anwendungen nach dem GitOps-Ansatz bereitstellt: ein Git-Repository als Source of Truth für den Zustand Ihres Clusters.

## Voraussetzungen

- Ein bereitgestellter Hikube-Kubernetes-Cluster (siehe [Schnellstart](../quick-start.md))
- Die über die Konsole heruntergeladene kubeconfig des Clusters (Schaltfläche **Kubeconfig**)
- Ein vom Cluster aus erreichbares Git-Repository mit Ihren Kubernetes-Manifesten

## Schritte

### 1. Das Git-Repository vorbereiten

Organisieren Sie Ihr Git-Repository mit einer Verzeichnisstruktur, die Ihre Kubernetes-Manifeste enthält:

```
k8s-manifests/
└── clusters/
    └── production/
        ├── namespaces.yaml
        ├── frontend/
        │   ├── deployment.yaml
        │   ├── service.yaml
        │   └── ingress.yaml
        └── backend/
            ├── deployment.yaml
            └── service.yaml
```

:::tip
Flux wendet alle YAML-Manifeste an, die im Zielverzeichnis und seinen Unterverzeichnissen gefunden werden. Organisieren Sie Ihre Dateien logisch, um die Wartung zu erleichtern.
:::

### 2. Das Addon Flux CD aktivieren

1. Öffnen Sie unter **Infrastructure** > **Kubernetes** das Menü **Actions** des Clusters und wählen Sie **Edit** (oder wählen Sie das Addon direkt bei der Erstellung im Schritt **Addons** aus).
2. Aktivieren Sie im Abschnitt **Extensions & Addons** das Kontrollkästchen **Flux CD** („GitOps continuous deployment for Kubernetes“).
3. Klicken Sie auf **Save**.

Die Detailseite des Clusters zeigt dann **Flux CD** im Abschnitt **Extensions** an. Das Addon installiert die Flux-Controller und ihre CRDs; Ihre Repositories deklarieren Sie anschließend im Cluster.

### 3. Die Installation von Flux prüfen

```bash
export KUBECONFIG=~/Downloads/kubeconfig-<cluster-name>.yaml

# Installierte Flux-CRDs
kubectl get crds | grep toolkit.fluxcd.io

# Flux-Controller
kubectl get deploy -A -l app.kubernetes.io/part-of=flux
```

### 4. Repository und Synchronisation deklarieren

Erstellen Sie im Cluster eine Quelle `GitRepository` und eine `Kustomization`, die das gewählte Verzeichnis anwendet:

```yaml title="gitops-sync.yaml"
apiVersion: v1
kind: Namespace
metadata:
  name: gitops
---
apiVersion: source.toolkit.fluxcd.io/v1
kind: GitRepository
metadata:
  name: k8s-manifests
  namespace: gitops
spec:
  interval: 1m
  url: https://github.com/company/k8s-manifests
  ref:
    branch: main
---
apiVersion: kustomize.toolkit.fluxcd.io/v1
kind: Kustomization
metadata:
  name: production
  namespace: gitops
spec:
  interval: 5m
  sourceRef:
    kind: GitRepository
    name: k8s-manifests
  path: ./clusters/production
  prune: true
```

```bash
kubectl apply -f gitops-sync.yaml
```

:::note
Für ein privates Git-Repository erstellen Sie im Namespace `gitops` ein Secret mit einem SSH-Schlüssel oder einem Token und referenzieren es dann im Feld `spec.secretRef` des `GitRepository`. Das erwartete Format finden Sie in der [Flux-Dokumentation](https://fluxcd.io/flux/components/source/gitrepositories/).
:::

### 5. Die Synchronisation beobachten

```bash
# Zustand der Git-Quelle
kubectl get gitrepositories -n gitops

# Zustand der Reconciliation
kubectl get kustomizations -n gitops
```

**Erwartetes Ergebnis:**

```console
NAME            URL                                         READY   STATUS
k8s-manifests   https://github.com/company/k8s-manifests    True    stored artifact for revision 'main@sha1:...'
```

```console
NAME         READY   STATUS
production   True    Applied revision: main@sha1:...
```

### 6. Eine Anwendung über Git bereitstellen

Um eine Anwendung bereitzustellen oder zu aktualisieren, pushen Sie die Manifeste in Ihr Git-Repository:

```yaml title="clusters/production/my-app/deployment.yaml"
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
# Aus Ihrem lokalen Repository
git add clusters/production/my-app/deployment.yaml
git commit -m "deploy: add my-app v1.0.0"
git push origin main
```

Flux erkennt die Änderungen im festgelegten Intervall und wendet die Manifeste im Cluster an:

```bash
kubectl get kustomizations -n gitops -w
kubectl get pods -A -l app=my-app
```

:::tip
Um eine sofortige Reconciliation zu erzwingen:
```bash
kubectl annotate --overwrite gitrepository k8s-manifests -n gitops reconcile.fluxcd.io/requestedAt="$(date +%s)"
```
Mit der CLI `flux` lautet das Äquivalent `flux reconcile kustomization production -n gitops --with-source`.
:::

## Überprüfung

```bash
# Gesamtstatus
kubectl get gitrepositories,kustomizations -A

# Details eines Reconciliation-Fehlers
kubectl describe kustomization production -n gitops
```

:::warning
Wenn die Synchronisation fehlschlägt, prüfen Sie:
- die Erreichbarkeit des Git-Repositorys vom Cluster aus;
- die Gültigkeit der YAML-Manifeste im Repository (eine ungültige Datei blockiert die Reconciliation);
- die Events und die Logs der Flux-Controller (`kubectl logs` auf den Pods `source-controller` und `kustomize-controller`).
:::

## Weiterführende Informationen

- [Flux CD](../plugins/fluxcd.md): Details zum Addon
- [Einen Ingress mit TLS bereitstellen](./deploy-ingress-tls.md): Ihre mit Flux bereitgestellten Anwendungen erreichbar machen
