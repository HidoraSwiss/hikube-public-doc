---
title: Zugriff und Werkzeuge
---

# Zugriff und Werkzeuge

Diese Anleitung erklärt, wie Sie nach der Erstellung auf einen Hikube-Kubernetes-Cluster zugreifen, und fasst die nützlichen Befehle für seinen Betrieb zusammen. Den Lebenszyklus des Clusters (Erstellung, Änderung, Löschung) verwalten Sie in der Konsole; alles andere erledigen Sie im Cluster mit Ihren gewohnten Werkzeugen.

## Die kubeconfig herunterladen

1. Öffnen Sie in der Konsole **Infrastructure** > **Kubernetes** und klicken Sie auf den Cluster.
2. Warten Sie, bis der Cluster den Status **Ready** hat.
3. Klicken Sie im Abschnitt **Actions** der Detailseite auf **Kubeconfig**.

Der Browser lädt die Datei `kubeconfig-<cluster-name>.yaml` herunter. Sie gewährt administrativen Zugriff auf den Cluster.

:::warning
Bewahren Sie diese Datei sicher auf (Secret-Manager, Tresor) und versionieren Sie sie niemals. Um anderen Personen Zugriff zu geben, richten Sie ihnen mit RBAC eigene Berechtigungen ein, statt diese Datei weiterzugeben.
:::

## Die kubeconfig verwenden

```bash
# Für die aktuelle Sitzung
export KUBECONFIG=~/Downloads/kubeconfig-<cluster-name>.yaml

# Oder für einen einzelnen Befehl
kubectl --kubeconfig ~/Downloads/kubeconfig-<cluster-name>.yaml get nodes

# Verbindung prüfen
kubectl cluster-info
kubectl get nodes
```

Dieselbe Datei funktioniert mit `helm`, `k9s`, `flux` oder jedem anderen Kubernetes-Client.

## RBAC konfigurieren

Erstellen Sie eigene Rollen und Konten für Ihre Teams und Pipelines, zum Beispiel einen Nur-Lese-Zugriff auf einen Namespace:

```yaml title="rbac-readonly.yaml"
apiVersion: v1
kind: Namespace
metadata:
  name: production
---
apiVersion: v1
kind: ServiceAccount
metadata:
  name: viewer
  namespace: production
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: viewer-view
  namespace: production
subjects:
  - kind: ServiceAccount
    name: viewer
    namespace: production
roleRef:
  kind: ClusterRole
  name: view
  apiGroup: rbac.authorization.k8s.io
```

```bash
kubectl apply -f rbac-readonly.yaml
```

---

## Monitoring und Observability

### In der Konsole

Die Detailseite des Clusters zeigt Status, Version, Control Plane, die **Node Pools** (Anzahl aktiver Nodes pro Gruppe) und die aktivierten Erweiterungen an.

### Im Cluster

```bash
# Nodes des Clusters
kubectl get nodes -o wide

# Ressourcenverbrauch
kubectl top nodes
kubectl top pods -A

# Aktuelle Events
kubectl get events -A --sort-by=.metadata.creationTimestamp
```

---

## Verwaltung des Lebenszyklus

Diese Vorgänge erfolgen in der Konsole:

| Vorgang | Wo |
|---------|----|
| Version aktualisieren | **Edit** > **Kubernetes Version** ([Anleitung](./upgrade-cluster.md)) |
| Node-Gruppe hinzufügen, ändern oder löschen | **Edit** > **Node groups** ([Anleitung](./manage-node-groups.md)) |
| Skalierung anpassen | **Edit** > **Minimum nodes** / **Maximum nodes** ([Anleitung](./configure-autoscaling.md)) |
| Addon aktivieren oder konfigurieren | **Edit** > **Extensions & Addons** |
| Cluster löschen | **Delete**, dann Bestätigung des Namens ([Schnellstart](../quick-start.md), Schritt 7) |

---

## Diagnose

```bash
# Nicht bereite Nodes
kubectl describe node <node-name>

# Fehlerhafte Pods
kubectl get pods -A --field-selector=status.phase!=Running
kubectl describe pod <pod-name> -n <namespace>
kubectl logs <pod-name> -n <namespace> --previous

# Komponenten der Addons (Cilium, CoreDNS, Ingress NGINX usw.)
kubectl get pods -A | grep -E "cilium|coredns|ingress-nginx|cert-manager"
```

Wenn ein Cluster im Status **Creating** bleibt, ein Addon nicht bereitgestellt wird oder ein Node dem Cluster nie beitritt, [wenden Sie sich an den Support](mailto:support@hidora.io) und geben Sie den Namen des Clusters und das Projekt an.
