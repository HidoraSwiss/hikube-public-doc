---
title: "Cluster aktualisieren"
---

# Cluster aktualisieren

Dieser Leitfaden erklärt, wie Sie die Kubernetes-Version auf einem Hikube-Cluster aktualisieren. Die Updates erfolgen per Rolling Update, ohne Unterbrechung der Steuerungsebene.

## Voraussetzungen

- Ein bereitgestellter Hikube-Kubernetes-Cluster (siehe [Schnellstart](../quick-start.md))
- `kubectl` konfiguriert für die Interaktion mit der Hikube-API
- Die kubeconfig des Child-Clusters abgerufen

## Schritte

### 1. Aktuelle Version überprüfen

Identifizieren Sie die aktuell auf Ihrem Cluster bereitgestellte Kubernetes-Version:

```bash
# Version dans la configuration Hikube
kubectl get kubernetes my-cluster -o yaml | grep version

# Version reportee par les noeuds
kubectl --kubeconfig=cluster-admin.yaml get nodes
```

**Erwartetes Ergebnis:**

```console
NAME                         STATUS   ROLES    AGE   VERSION
my-cluster-general-xxxxx     Ready    <none>   30d   v1.29.0
my-cluster-general-yyyyy     Ready    <none>   30d   v1.29.0
```

### 2. Verfügbare Versionen prüfen

Bevor Sie aktualisieren, überprüfen Sie die von Hikube unterstützten Versionen:

```bash
# Verifier la configuration actuelle du cluster
kubectl get kubernetes my-cluster -o yaml
```

:::warning
Testen Sie das Update immer in einer Staging-Umgebung vor der Produktion. Einige Anwendungen sind möglicherweise nicht mit neuen Kubernetes-Versionen kompatibel.
:::

:::note
Updates müssen inkrementell erfolgen (z.B. v1.29 nach v1.30). Überspringen Sie nicht mehrere Minor-Versionen auf einmal.
:::

### 3. Version aktualisieren

**Option A: Direkter Patch**

```bash
kubectl patch kubernetes my-cluster --type='merge' -p='
spec:
  version: "v1.30.0"
'
```

**Option B: YAML-Datei ändern**

```yaml title="cluster-upgrade.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Kubernetes
metadata:
  name: my-cluster
spec:
  version: "v1.30.0"

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
```

```bash
kubectl apply -f cluster-upgrade.yaml
```

### 4. Rolling Update verfolgen

Beobachten Sie den Ablauf des Updates:

```bash
# Suivre l'etat du cluster Hikube
kubectl get kubernetes my-cluster -w

# Observer le remplacement des machines
kubectl get machines -l cluster.x-k8s.io/cluster-name=my-cluster -w

# Verifier les events
kubectl describe kubernetes my-cluster
```

:::tip
Updates erfolgen per Rolling Update: Die Knoten werden einzeln ersetzt. Die Steuerungsebene wird zuerst aktualisiert, gefolgt von den Node Groups. Ihre Workloads laufen während des Updates weiter.
:::

### 5. Update überprüfen

Sobald das Rolling Update abgeschlossen ist, bestätigen Sie die neue Version:

```bash
# Verifier la version des noeuds
kubectl --kubeconfig=cluster-admin.yaml get nodes

# Verifier la version de l'API server
kubectl --kubeconfig=cluster-admin.yaml version
```

## Überprüfung

Validieren Sie, dass der Cluster nach dem Update korrekt funktioniert:

```bash
# Noeuds en etat Ready avec la nouvelle version
kubectl --kubeconfig=cluster-admin.yaml get nodes

# Pods systeme operationnels
kubectl --kubeconfig=cluster-admin.yaml get pods -n kube-system

# Vos workloads fonctionnent
kubectl --kubeconfig=cluster-admin.yaml get pods -A
```

**Erwartetes Ergebnis:**

```console
NAME                         STATUS   ROLES    AGE   VERSION
my-cluster-general-xxxxx     Ready    <none>   5m    v1.30.0
my-cluster-general-yyyyy     Ready    <none>   3m    v1.30.0
```

:::warning
Wenn Pods nach dem Update im Fehlerzustand verbleiben, überprüfen Sie die Kompatibilität Ihrer Manifeste mit der neuen Kubernetes-Version. Einige veraltete APIs könnten entfernt worden sein.
:::

## Weiterführende Informationen

- [API-Referenz](../api-reference.md) -- Feld `version` und vollständige Konfiguration
- [Konzepte](../concepts.md) -- Architektur der Steuerungsebene und Rolling Updates
- [Zugang und Tools](./toolbox.md) -- Debugging- und Monitoring-Befehle
