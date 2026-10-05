---
sidebar_position: 10
title: Monitoring Agents
---

# Monitoring Agents

Das Addon **Monitoring Agents** stellt im Cluster die Agents zur Erfassung von **Metriken** und **Logs** bereit, die die Daten an das Monitoring der Hikube-Plattform übermitteln. Im Projekt muss keine Option aktiviert werden.

| Komponente | Aufgabe |
|------------|---------|
| **VictoriaMetrics Agent** (`vmagent`) | Erfasst und sendet die Metriken |
| **Fluent Bit** | Erfasst und sendet die Logs der Container |
| **kube-state-metrics** | Stellt den Zustand der Kubernetes-Objekte als Metriken bereit |
| **Node exporter** | Stellt die Systemmetriken der Nodes bereit |

## In der Konsole

1. Bei der Erstellung ist **Monitoring Agents** im Schritt **Addons** standardmäßig ausgewählt.
2. Auf einem bestehenden Cluster: **Edit** > **Extensions & Addons**, **Monitoring Agents** aktivieren oder deaktivieren, dann **Save**.

Die Detailseite des Clusters zeigt **Monitoring Agents** im Abschnitt **Extensions** an, wenn es aktiv ist.

:::note
Der Zugriff auf die Monitoring-Dashboards des Projekts wird in der Konsole nicht angeboten; wenden Sie sich an den Support.
:::

## Die Konfiguration überschreiben

Sobald das Addon ausgewählt ist, erscheint das Feld **Helm Configuration (YAML) — optional**, die Plattform wendet es für dieses Addon jedoch nicht an: Ein hier eingegebenes Override bleibt wirkungslos. Die Ziele der Metriken und Logs werden von der Plattform festgelegt. Um das Verhalten der Agents anzupassen (Ressourcen, Erfassungsfilter), wenden Sie sich an den Support.

## Nutzung im Cluster

```bash
# Pods der Agents
kubectl get pods -A -l app.kubernetes.io/name=vmagent
kubectl get pods -A -l app.kubernetes.io/name=fluent-bit

# Ressourcenmetriken
kubectl top nodes
kubectl top pods -A
```

Siehe [Das Monitoring konfigurieren](../how-to/configure-monitoring.md).

## Best Practices

- Lassen Sie das Addon auf Produktionsclustern aktiviert, um den Verlauf der Metriken und Logs zu behalten.
- Schreiben Sie Ihre Anwendungslogs auf die Standardausgabe der Container: Diese erfasst Fluent Bit.
