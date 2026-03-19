---
title: "Autoscaling konfigurieren"
---

# Autoscaling konfigurieren

Autoscaling ermöglicht es Ihrem Hikube-Cluster, die Anzahl der Knoten automatisch je nach Last anzupassen. Dieser Leitfaden erklärt, wie Sie das automatische Scaling Ihrer Node Groups konfigurieren und beobachten.

## Voraussetzungen

- Ein bereitgestellter Hikube-Kubernetes-Cluster (siehe [Schnellstart](../quick-start.md))
- `kubectl` konfiguriert für die Interaktion mit der Hikube-API
- Die YAML-Konfigurationsdatei Ihres Clusters

## Schritte

### 1. Funktionsweise verstehen

Das Hikube-Autoscaling funktioniert auf Node-Group-Ebene. Jede Knotengruppe definiert:

- **`minReplicas`**: Minimale Anzahl immer aktiver Knoten
- **`maxReplicas`**: Maximale Anzahl bereitstellbarer Knoten

Der Cluster fügt automatisch Knoten hinzu, wenn Pods mangels Ressourcen (CPU, Speicher) nicht geplant werden können. Er entfernt unterausgelastete Knoten, wenn die Last sinkt, wobei der Schwellenwert `minReplicas` stets eingehalten wird.

:::note
Das Scaling wird durch Ressourcendruck ausgelöst: Wenn Pods mangels Kapazität im Zustand `Pending` verbleiben, werden automatisch neue Knoten bereitgestellt.
:::

### 2. minReplicas und maxReplicas konfigurieren

Definieren Sie die Scaling-Grenzen in Ihrer Cluster-Konfiguration:

```yaml title="cluster-autoscaling.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Kubernetes
metadata:
  name: my-cluster
spec:
  controlPlane:
    replicas: 3

  nodeGroups:
    # Node group avec autoscaling modere
    web:
      minReplicas: 2
      maxReplicas: 10
      instanceType: "s1.large"
      ephemeralStorage: 50Gi
      roles:
        - ingress-nginx

    # Node group compute avec large amplitude
    compute:
      minReplicas: 1
      maxReplicas: 20
      instanceType: "u1.2xlarge"
      ephemeralStorage: 100Gi
      roles: []
```

:::tip
Setzen Sie für eine Produktionsumgebung `minReplicas` auf mindestens 2, um die Hochverfügbarkeit Ihrer Workloads zu gewährleisten.
:::

### 3. Scaling auf Null konfigurieren

Für Entwicklungsumgebungen oder GPU-Workloads können Sie eine Node Group konfigurieren, die auf null Knoten herunterskaliert, wenn sie nicht verwendet wird:

```yaml title="cluster-scale-to-zero.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Kubernetes
metadata:
  name: my-cluster
spec:
  controlPlane:
    replicas: 2

  nodeGroups:
    # Node group permanent
    system:
      minReplicas: 2
      maxReplicas: 5
      instanceType: "s1.large"
      ephemeralStorage: 50Gi
      roles:
        - ingress-nginx

    # Node group GPU avec scaling a zero
    gpu:
      minReplicas: 0
      maxReplicas: 8
      instanceType: "u1.2xlarge"
      ephemeralStorage: 500Gi
      roles: []
```

:::warning
Scaling auf Null bedeutet eine Startverzögerung (Cold Start) bei der Bereitstellung des ersten Knotens. Rechnen Sie mit einigen Minuten, bevor Pods auf dem neuen Knoten geplant werden können.
:::

### 4. Scaling in Aktion beobachten

Wenden Sie die Konfiguration an und beobachten Sie das Scaling-Verhalten:

```bash
# Appliquer la configuration
kubectl apply -f cluster-autoscaling.yaml

# Observer les noeuds en temps reel
kubectl --kubeconfig=cluster-admin.yaml get nodes -w
```

Um ein Scaling auszulösen, stellen Sie einen ressourcenintensiven Workload bereit:

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
# Deployer le workload de test
kubectl --kubeconfig=cluster-admin.yaml apply -f load-test.yaml

# Observer les pods en attente (Pending) puis planifies
kubectl --kubeconfig=cluster-admin.yaml get pods -w

# Observer l'ajout de noeuds
kubectl --kubeconfig=cluster-admin.yaml get nodes -w
```

### 5. Grenzen anpassen

Sie können die Scaling-Grenzen jederzeit mit einem Patch anpassen:

```bash
kubectl patch kubernetes my-cluster --type='merge' -p='
spec:
  nodeGroups:
    compute:
      maxReplicas: 30
'
```

Oder indem Sie die YAML-Datei ändern und erneut anwenden:

```bash
kubectl apply -f cluster-autoscaling.yaml
```

## Überprüfung

Überprüfen Sie, ob das Autoscaling korrekt konfiguriert ist:

```bash
# Verifier la configuration actuelle du cluster
kubectl get kubernetes my-cluster -o yaml | grep -A 8 nodeGroups

# Verifier l'etat des machines
kubectl get machines -l cluster.x-k8s.io/cluster-name=my-cluster

# Verifier les noeuds dans le cluster enfant
kubectl --kubeconfig=cluster-admin.yaml get nodes
```

**Erwartetes Ergebnis nach Scaling:**

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
