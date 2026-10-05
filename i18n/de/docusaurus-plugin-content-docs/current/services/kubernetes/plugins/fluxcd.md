---
sidebar_position: 8
title: Flux CD
---

# Flux CD

Das Addon **Flux CD** installiert die **Flux**-Controller im Cluster für die **GitOps-Verwaltung**: Flux synchronisiert den Zustand des Clusters kontinuierlich mit Git-Repositories, sodass die im Code deklarierte Konfiguration stets angewendet ist.

## In der Konsole

1. Wählen Sie bei der Erstellung im Schritt **Addons** **Flux CD** aus (standardmäßig deaktiviert).
2. Auf einem bestehenden Cluster: **Edit** > **Extensions & Addons**, **Flux CD** aktivieren, dann **Save**.

Die Detailseite des Clusters zeigt **Flux CD** im Abschnitt **Extensions** an, wenn es aktiv ist.

## Die Konfiguration überschreiben

Das Addon installiert Flux 2.8 mit dem **Flux Operator** im Cluster. Sobald das Addon ausgewählt ist, erscheint das Feld **Helm Configuration (YAML) — optional**. Der Wert wird unter dem Schlüssel `flux-instance` an das Chart `flux-instance` übergeben; die verfügbaren Optionen sind die der Ressource [FluxInstance](https://fluxcd.control-plane.io/operator/fluxinstance/). In den meisten Fällen ist kein Override nötig.

:::note
Das Addon installiert Flux, deklariert aber kein Repository. Git-Quellen und Synchronisationen werden im Cluster erstellt, wie unten beschrieben.
:::

## Nutzung im Cluster

Deklarieren Sie eine Quelle `GitRepository` und eine `Kustomization`:

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
kubectl get gitrepositories,kustomizations -n gitops
```

Der vollständige Ablauf ist in [Mit Flux bereitstellen (GitOps)](../how-to/deploy-gitops-flux.md) beschrieben.

## Best Practices

- Speichern Sie Git-Zugangsdaten (SSH-Schlüssel, Token) in Kubernetes-Secrets, die über `spec.secretRef` referenziert werden, niemals im Repository.
- Aktivieren Sie `prune: true`, damit aus dem Repository entfernte Ressourcen auch aus dem Cluster entfernt werden.
- Trennen Sie die Verzeichnisse nach Umgebung (`clusters/staging`, `clusters/production`).
