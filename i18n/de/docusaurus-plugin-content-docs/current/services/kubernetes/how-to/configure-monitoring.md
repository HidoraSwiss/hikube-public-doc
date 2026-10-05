---
title: "Das Monitoring konfigurieren"
---

# Das Monitoring konfigurieren

Diese Anleitung erklärt, wie Sie auf einem Hikube-Kubernetes-Cluster die Erfassung von Metriken und Logs mit dem Addon **Monitoring Agents** aktivieren und seine Funktion im Cluster prüfen.

## Voraussetzungen

- Ein bereitgestellter Hikube-Kubernetes-Cluster (siehe [Schnellstart](../quick-start.md))
- Die über die Konsole heruntergeladene kubeconfig des Clusters (Schaltfläche **Kubeconfig**)

## Schritte

### 1. Das Addon Monitoring Agents aktivieren

Das Addon **Monitoring Agents** („Monitoring agents for logs and metrics“) ist bei der Erstellung eines Clusters standardmäßig ausgewählt. Um es auf einem bestehenden Cluster zu aktivieren:

1. Öffnen Sie unter **Infrastructure** > **Kubernetes** das Menü **Actions** des Clusters und wählen Sie **Edit**.
2. Aktivieren Sie im Abschnitt **Extensions & Addons** das Kontrollkästchen **Monitoring Agents**.
3. Klicken Sie auf **Save**.

Die Detailseite des Clusters zeigt dann **Monitoring Agents** im Abschnitt **Extensions** an.

### 2. Verstehen, was bereitgestellt wird

Das Addon installiert im Cluster Erfassungs-Agents, die die Daten an das Monitoring der Hikube-Plattform übermitteln. Im Projekt muss keine Option aktiviert werden:

| Komponente | Aufgabe |
|------------|---------|
| **VictoriaMetrics Agent** (`vmagent`) | Erfasst und sendet die Metriken |
| **Fluent Bit** | Erfasst und sendet die Logs der Container |
| **kube-state-metrics** | Stellt den Zustand der Kubernetes-Objekte als Metriken bereit |
| **Node exporter** | Stellt die Systemmetriken der Nodes bereit |

Die Agents laufen auf den Nodes des Clusters; die Speicherung der Metriken und Logs belegt Ihre Nodes nicht.

:::note
Der Zugriff auf die Monitoring-Dashboards des Projekts wird in der Konsole nicht angeboten; wenden Sie sich an den Support.
:::

### 3. Die Agents im Cluster prüfen

```bash
export KUBECONFIG=~/Downloads/kubeconfig-<cluster-name>.yaml

# Pods der Monitoring-Agents auflisten
kubectl get pods -A | grep -E "vmagent|fluent-bit|kube-state-metrics|node-exporter"
```

**Erwartetes Ergebnis**: Die Pods der Agents sind im Zustand `Running`, mit je einem Fluent-Bit-Pod und einem node-exporter-Pod pro Node.

### 4. Die Metriken im Cluster einsehen

```bash
# Metriken der Nodes
kubectl top nodes

# Metriken der Pods
kubectl top pods -A

# Events des Clusters
kubectl get events -A --sort-by=.metadata.creationTimestamp
```

**Beispielergebnis für `kubectl top nodes`:**

```console
NAME                          CPU(cores)   CPU%   MEMORY(bytes)   MEMORY%
my-cluster-general-xxxxx      250m         6%     1200Mi          15%
my-cluster-general-yyyyy      310m         7%     1350Mi          17%
```

## Überprüfung

```bash
# Logs eines Fluent-Bit-Agents, falls Zweifel am Versand der Logs bestehen
# Namespace der Fluent-Bit-Agenten
FLUENTBIT_NS=$(kubectl get ds -A -l app.kubernetes.io/name=fluent-bit -o jsonpath='{.items[0].metadata.namespace}')
kubectl logs -n "$FLUENTBIT_NS" -l app.kubernetes.io/name=fluent-bit --tail=20 --prefix
```

:::warning
Die Ziele der Metriken und Logs werden von der Plattform konfiguriert. Um das Verhalten der Agents zu ändern (Ressourcen, Erfassungsfilter), wenden Sie sich an den Support.
:::

## Weiterführende Informationen

- [Monitoring Agents](../plugins/monitoring-agents.md): Details zum Addon
- [Zugriff und Werkzeuge](./toolbox.md): Diagnosebefehle und Metriken
