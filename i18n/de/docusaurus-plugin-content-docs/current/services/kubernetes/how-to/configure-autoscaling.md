---
title: "Autoscaling konfigurieren"
---

# Autoscaling konfigurieren

Autoscaling ermöglicht es Ihrem Hikube-Cluster, die Anzahl der Knoten automatisch je nach Last anzupassen. Diese Anleitung erklärt, wie Sie das automatische Skalieren Ihrer Node Groups konfigurieren und beobachten.

## Voraussetzungen

- Ein bereitgestellter Kubernetes-Hikube-Cluster (siehe [Schnellstart](../quick-start.md))
- `kubectl` konfiguriert für die Interaktion mit der Hikube-API
- Die YAML-Konfigurationsdatei Ihres Clusters

## Schritte

### 1. Funktionsweise verstehen

Das Hikube-Autoscaling funktioniert auf Node-Group-Ebene. Jede Knotengruppe definiert:

- **`minReplicas`**: minimale Anzahl stets aktiver Knoten
- **`maxReplicas`**: maximale Anzahl provisionierbarer Knoten

Der Cluster fügt automatisch Knoten hinzu, wenn Pods aufgrund fehlender Ressourcen (CPU, Speicher) nicht geplant werden können. Er entfernt unterausgelastete Knoten, wenn die Last sinkt, wobei der Schwellenwert `minReplicas` stets eingehalten wird.

:::note
Die Skalierung wird durch Ressourcendruck ausgelöst: Wenn Pods mangels Kapazität im Zustand `Pending` verbleiben, werden automatisch neue Knoten bereitgestellt.
:::

### 2. minReplicas und maxReplicas konfigurieren

Definieren Sie die Skalierungsgrenzen in Ihrer Cluster-Konfiguration:

```yaml title="cluster-autoscaling.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Kubernetes
metadata:
  name: my-cluster
spec:
  controlPlane:
    replicas: 3

  nodeGroups:
    # Node Group mit moderatem Autoscaling
    web:
      minReplicas: 2
      maxReplicas: 10
      instanceType: "s1.large"
      ephemeralStorage: 50Gi
      roles:
        - ingress-nginx

    # Compute Node Group mit großer Bandbreite
    compute:
      minReplicas: 1
      maxReplicas: 20
      instanceType: "u1.2xlarge"
      ephemeralStorage: 100Gi
      roles: []
```

:::tip
Für eine Produktionsumgebung setzen Sie `minReplicas` auf mindestens 2, um die Hochverfügbarkeit Ihrer Workloads zu gewährleisten.
:::

### 3. Skalierung auf Null konfigurieren

Für Entwicklungsumgebungen oder GPU-Workloads können Sie eine Node Group konfigurieren, die auf null Knoten herunterskaliert, wenn sie nicht genutzt wird:

```yaml title="cluster-scale-to-zero.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Kubernetes
metadata:
  name: my-cluster
spec:
  controlPlane:
    replicas: 2

  nodeGroups:
    # Permanente Node Group
    system:
      minReplicas: 2
      maxReplicas: 5
      instanceType: "s1.large"
      ephemeralStorage: 50Gi
      roles:
        - ingress-nginx

    # GPU Node Group mit Skalierung auf Null
    gpu:
      minReplicas: 0
      maxReplicas: 8
      instanceType: "u1.2xlarge"
      ephemeralStorage: 500Gi
      roles: []
```

:::warning
Die Skalierung auf Null impliziert eine Startverzögerung (Cold Start) bei der Bereitstellung des ersten Knotens. Rechnen Sie mit einigen Minuten, bevor Pods auf dem neuen Knoten geplant werden können.
:::

### 4. Skalierung in Aktion beobachten

Wenden Sie die Konfiguration an und beobachten Sie das Skalierungsverhalten:

```bash
# Konfiguration anwenden
kubectl apply -f cluster-autoscaling.yaml

# Knoten in Echtzeit beobachten
kubectl --kubeconfig=cluster-admin.yaml get nodes -w
```

Um eine Skalierung auszulösen, stellen Sie einen Workload bereit, der Ressourcen verbraucht:

```yaml title="load-test.yaml"
apiVersion: apps/v1
kind: Deployment
metadata:
  name: load-test
spec:
  replicas: 20
  selector:
    matchLabels:
      app: load-test
  template:
    metadata:
      labels:
        app: load-test
    spec:
      containers:
        - name: busybox
          image: busybox
          command: ["sleep", "3600"]
          resources:
            requests:
              cpu: "500m"
              memory: "512Mi"
```

```bash
# Test-Workload bereitstellen
kubectl --kubeconfig=cluster-admin.yaml apply -f load-test.yaml

# Pods beobachten: wartend (Pending) dann geplant
kubectl --kubeconfig=cluster-admin.yaml get pods -w

# Hinzufügen von Knoten beobachten
kubectl --kubeconfig=cluster-admin.yaml get nodes -w
```

### 5. Grenzen anpassen

Sie können die Skalierungsgrenzen jederzeit mit einem Patch anpassen:

```bash
kubectl patch kubernetes my-cluster --type='merge' -p='
spec:
  nodeGroups:
    compute:
      maxReplicas: 30
'
```

Oder durch Bearbeitung der YAML-Datei und erneutes Anwenden:

```bash
kubectl apply -f cluster-autoscaling.yaml
```

## Überprüfung

Prüfen Sie, ob das Autoscaling korrekt konfiguriert ist:

```bash
# Aktuelle Cluster-Konfiguration prüfen
kubectl get kubernetes my-cluster -o yaml | grep -A 8 nodeGroups

# Zustand der Maschinen prüfen
kubectl get machines -l cluster.x-k8s.io/cluster-name=my-cluster

# Knoten im Child-Cluster prüfen
kubectl --kubeconfig=cluster-admin.yaml get nodes
```

**Erwartetes Ergebnis nach der Skalierung:**

```console
NAME                         STATUS   ROLES    AGE   VERSION
my-cluster-web-xxxxx         Ready    <none>   30m   v1.29.0
my-cluster-web-yyyyy         Ready    <none>   30m   v1.29.0
my-cluster-compute-zzzzz     Ready    <none>   2m    v1.29.0
my-cluster-compute-wwwww     Ready    <none>   2m    v1.29.0
```

## Weiterführende Informationen

- [API-Referenz](../api-reference.md) -- Parameter `minReplicas` und `maxReplicas`
- [Konzepte](../concepts.md) -- Architektur der Node Groups und Skalierbarkeit
- [Node Group hinzufügen und ändern](./manage-node-groups.md) -- Verwaltung der Node Groups
