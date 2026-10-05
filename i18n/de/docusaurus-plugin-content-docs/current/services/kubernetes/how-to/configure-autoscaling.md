---
title: "Autoscaling konfigurieren"
---

# Autoscaling konfigurieren

Mit Autoscaling passt Ihr Hikube-Cluster die Anzahl der Nodes automatisch an die Last an. Diese Anleitung erklärt, wie Sie die Skalierungsgrenzen Ihrer Node-Gruppen in der Konsole festlegen und die Skalierung anschließend im Cluster beobachten.

## Voraussetzungen

- Ein bereitgestellter Hikube-Kubernetes-Cluster (siehe [Schnellstart](../quick-start.md))
- Die über die Konsole heruntergeladene kubeconfig des Clusters (Schaltfläche **Kubeconfig**)

## Schritte

### 1. Die Funktionsweise verstehen

Das Autoscaling von Hikube arbeitet auf Ebene der Node-Gruppen. Jede Gruppe definiert:

- **Minimum nodes**: Anzahl der Nodes, die immer aktiv sind;
- **Maximum nodes**: maximale Anzahl der Nodes, die bereitgestellt werden können.

Der Cluster fügt Nodes hinzu, wenn Pods mangels Ressourcen (CPU, Arbeitsspeicher) nicht eingeplant werden können. Er entfernt nicht ausgelastete Nodes, wenn die Last sinkt, ohne unter das Minimum zu fallen.

:::note
Die Skalierung wird durch Ressourcendruck ausgelöst: Wenn Pods mangels Kapazität im Zustand `Pending` bleiben, werden automatisch neue Nodes bereitgestellt.
:::

:::warning
Die Quota des Projekts wird anhand der **maximalen Anzahl** an Nodes jeder Gruppe berechnet. Ein hohes Maximum reserviert CPU-, Arbeitsspeicher- und Speicher-Quota, auch wenn die Nodes noch nicht bereitgestellt sind.
:::

### 2. Die Skalierungsgrenzen festlegen

1. Öffnen Sie unter **Infrastructure** > **Kubernetes** das Menü **Actions** des Clusters und wählen Sie **Edit**.
2. Klappen Sie im Abschnitt **Node groups** die Karte der Gruppe auf.
3. Füllen Sie **Minimum nodes** und **Maximum nodes** aus. Zum Beispiel:

| Gruppe | Minimum | Maximum | Nutzung |
|--------|---------|---------|---------|
| `web` | 2 | 10 | Moderates Autoscaling, aus dem Internet erreichbare Gruppe |
| `compute` | 1 | 20 | Große Spannweite für Verarbeitungsaufgaben |

4. Klicken Sie auf **Save**.

Die Konsole lehnt ein Maximum unter dem Minimum („Maximum node count must be greater than or equal to minimum“) sowie ein Maximum über 100 ab.

:::tip
Setzen Sie in einer Produktionsumgebung das Minimum auf mindestens 2, um die Hochverfügbarkeit Ihrer Workloads zu gewährleisten.
:::

### 3. Skalierung auf null konfigurieren

Für Entwicklungsumgebungen oder GPU-Workloads kann eine Gruppe auf null Nodes herunterskalieren, wenn sie nicht genutzt wird: Geben Sie **0** in **Minimum nodes** ein.

Behalten Sie mindestens eine Gruppe mit einem Minimum größer als null, um die Systemkomponenten des Clusters zu hosten.

:::warning
Die Skalierung auf null bringt eine Startverzögerung (Cold Start) bei der Bereitstellung des ersten Nodes mit sich. Rechnen Sie mit einigen Minuten, bevor Pods auf dem neuen Node eingeplant werden können.
:::

### 4. Die Skalierung in Aktion beobachten

Stellen Sie im Cluster eine Workload bereit, die mehr Ressourcen anfordert, als die aktuellen Nodes bieten:

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
export KUBECONFIG=~/Downloads/kubeconfig-<cluster-name>.yaml

# Test-Workload bereitstellen
kubectl apply -f load-test.yaml

# Wartende (Pending) und dann eingeplante Pods beobachten
kubectl get pods -l app=load-test -w

# Hinzufügen von Nodes beobachten
kubectl get nodes -w
```

In der Konsole zeigt der Abschnitt **Node Pools** der Detailseite die Anzahl aktiver Nodes jeder Gruppe an, zum Beispiel „4 active nodes (2 to 10)“.

Löschen Sie die Test-Workload, wenn die Beobachtung abgeschlossen ist:

```bash
kubectl delete -f load-test.yaml
```

## Überprüfung

```bash
kubectl get nodes
```

**Erwartetes Ergebnis nach der Skalierung:**

```console
NAME                         STATUS   ROLES    AGE   VERSION
my-cluster-web-xxxxx         Ready    <none>   30m   v1.xx.x
my-cluster-web-yyyyy         Ready    <none>   30m   v1.xx.x
my-cluster-compute-zzzzz     Ready    <none>   2m    v1.xx.x
my-cluster-compute-wwwww     Ready    <none>   2m    v1.xx.x
```

## Weiterführende Informationen

- [Konzepte](../concepts.md): Architektur der Node-Gruppen und Quotas
- [Eine Node-Gruppe hinzufügen und ändern](./manage-node-groups.md): Verwaltung der Node-Gruppen
- [Vertical Pod Autoscaler](../plugins/verticalpodautoscaler.md): Ressourcen der Pods anpassen
