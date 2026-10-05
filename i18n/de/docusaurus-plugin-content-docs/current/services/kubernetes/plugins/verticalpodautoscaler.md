---
sidebar_position: 4
title: Vertical Pod Autoscaler
---

# Vertical Pod Autoscaler

Der **Vertical Pod Autoscaler (VPA)** passt die CPU- und Arbeitsspeicher-Ressourcen der Pods automatisch an. Er analysiert kontinuierlich den tatsächlichen Verbrauch der Workloads und empfiehlt oder wendet dann Anpassungen an.

| Komponente | Aufgabe |
|------------|---------|
| `recommender` | Analysiert die Metriken und empfiehlt Ressourcen für die Pods |
| `updater` | Erstellt die Pods neu, wenn sich die Empfehlungen ändern |
| `admissionController` | Wendet die empfohlenen Ressourcen bei der Erstellung der Pods an |

## In der Konsole

Der Vertical Pod Autoscaler gehört zur **Advanced Configuration** des Schritts **Addons**: Er ist immer im Cluster vorhanden und lässt sich nicht deaktivieren. Sie können lediglich seine Konfiguration überschreiben.

1. Klappen Sie bei der Erstellung (Schritt **Addons**) oder über **Edit** > **Extensions & Addons** den Block **Vertical Pod Autoscaler** im Abschnitt **Advanced Configuration** auf.
2. Geben Sie Ihre Werte in **Helm Configuration (YAML) — optional** ein.
3. Bestätigen Sie mit **Next** und dann **Create cluster** (Erstellung) oder mit **Save** (Änderung).

:::warning
Bei einem bestehenden Cluster speichert die Konsole ein erstes über **Edit** eingegebenes Override nicht: Die Schaltfläche **Save** bestätigt die Aktualisierung, der Wert wird jedoch ignoriert. Legen Sie das Override bei der Erstellung des Clusters fest oder [wenden Sie sich an den Support](mailto:support@hidora.io). Ein bei der Erstellung festgelegtes Override bleibt über **Edit** änderbar.
:::

Auf der Detailseite des Clusters zeigt die Zeile **VPA** im Abschnitt **Network** **VPA** an, wenn das Addon konfiguriert ist.

## Die Konfiguration überschreiben

Der YAML-Wert wird unter dem Schlüssel `vertical-pod-autoscaler` an das Helm-Chart des VPA übergeben. Zum Beispiel, um den Updater zu deaktivieren und nur die Empfehlungen zu nutzen:

```yaml title="vpa-override.yaml"
vertical-pod-autoscaler:
  updater:
    enabled: false
```

Die verfügbaren Optionen sind im [Helm-Chart des Vertical Pod Autoscaler](https://github.com/cowboysysop/charts/tree/master/charts/vertical-pod-autoscaler) beschrieben.

## Nutzung im Cluster

Erstellen Sie für jede zu beobachtende Workload ein Objekt `VerticalPodAutoscaler`:

```yaml title="vpa-my-app.yaml"
apiVersion: autoscaling.k8s.io/v1
kind: VerticalPodAutoscaler
metadata:
  name: my-app
spec:
  targetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: my-app
  updatePolicy:
    updateMode: "Off"
```

```bash
kubectl apply -f vpa-my-app.yaml

# Empfehlungen lesen
kubectl describe vpa my-app
```

## Best Practices

- Beginnen Sie mit `updateMode: "Off"`, um die Empfehlungen zu beobachten, bevor Sie sie anwenden.
- Verwenden Sie VPA und einen `HorizontalPodAutoscaler` nicht für dieselbe Metrik (CPU oder Arbeitsspeicher) derselben Workload.
- Kombinieren Sie den VPA mit dem [Autoscaling der Node-Gruppen](../how-to/configure-autoscaling.md), um sowohl die Pods als auch die Kapazität des Clusters anzupassen.
