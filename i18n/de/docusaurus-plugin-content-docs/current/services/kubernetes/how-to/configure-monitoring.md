---
title: "Monitoring konfigurieren"
---

# Monitoring konfigurieren

Diese Anleitung erklärt, wie Sie das Monitoring auf einem Kubernetes-Hikube-Cluster aktivieren und konfigurieren, einschließlich der Erfassung von Metriken, Logs und Visualisierungs-Dashboards.

## Voraussetzungen

- Ein bereitgestellter Kubernetes-Hikube-Cluster (siehe [Schnellstart](../quick-start.md))
- `kubectl` konfiguriert für die Interaktion mit der Hikube-API
- Die YAML-Konfigurationsdatei Ihres Clusters

## Schritte

### 1. Addon monitoringAgents aktivieren

Ändern Sie die Konfiguration Ihres Clusters, um das Monitoring-Addon zu aktivieren:

```yaml title="cluster-monitoring.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Kubernetes
metadata:
  name: my-cluster
spec:
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

    monitoring:
      minReplicas: 2
      maxReplicas: 4
      instanceType: "m1.xlarge"
      ephemeralStorage: 200Gi
      roles:
        - monitoring

  addons:
    monitoringAgents:
      enabled: true
      valuesOverride:
        fluentbit:
          enabled: true
```

:::note
Die Aktivierung von Fluent Bit (`fluentbit.enabled: true`) ermöglicht die Erfassung und Weiterleitung der Logs Ihrer Anwendungen an den Observability-Stack.
:::

### 2. Dedizierte Node Group für Monitoring erstellen

Die Monitoring-Komponenten (VictoriaMetrics, Grafana, Fluent Bit) verbrauchen erhebliche Ressourcen. Es wird empfohlen, eine dedizierte Node Group mit speicheroptimierten Instanzen bereitzustellen:

```yaml title="cluster-monitoring.yaml"
nodeGroups:
  monitoring:
    minReplicas: 2
    maxReplicas: 4
    instanceType: "m1.xlarge"    # 4 vCPU, 32 GB RAM
    ephemeralStorage: 200Gi       # Großer Speicher für Metriken und Logs
    roles:
      - monitoring
```

:::tip
Die M-Serie (Memory Optimized) ist ideal für Monitoring, da Metriken-Datenbanken (VictoriaMetrics) und Log-Indexierungsengines viel Speicher benötigen.
:::

### 3. Konfiguration anwenden

```bash
kubectl apply -f cluster-monitoring.yaml

# Warten, bis der Cluster bereit ist
kubectl get kubernetes my-cluster -w
```

### 4. Zugriff auf die Monitoring-Tools

Sobald der Cluster aktualisiert ist, prüfen Sie, ob die Monitoring-Komponenten im Child-Cluster bereitgestellt sind:

```bash
export KUBECONFIG=cluster-admin.yaml

# Monitoring-Pods auflisten
kubectl get pods -n monitoring

# Verfügbare Services prüfen
kubectl get svc -n monitoring

# Zugriff auf Grafana (falls über Ingress verfügbar)
kubectl get ingress -n monitoring
```

Für lokalen Zugriff auf Grafana:

```bash
kubectl port-forward -n monitoring svc/grafana 3000:80 &
# http://localhost:3000 im Browser öffnen
```

### 5. Metriken überprüfen

Bestätigen Sie, dass die Metriken korrekt erfasst werden:

```bash
# Knoten-Metriken
kubectl top nodes

# Pod-Metriken
kubectl top pods -A

# Cluster-Events
kubectl get events --sort-by=.metadata.creationTimestamp
```

**Erwartetes Ergebnis für `kubectl top nodes`:**

```console
NAME                          CPU(cores)   CPU%   MEMORY(bytes)   MEMORY%
my-cluster-general-xxxxx      250m         6%     1200Mi          15%
my-cluster-monitoring-yyyyy   800m         20%    4500Mi          14%
```

## Überprüfung

Prüfen Sie, ob der gesamte Monitoring-Stack funktionsfähig ist:

```bash
# Alle Monitoring-Komponenten prüfen
kubectl get pods -n monitoring

# Fluent Bit Logs prüfen
kubectl logs -n monitoring -l app.kubernetes.io/name=fluent-bit --tail=20
```

**Erwartetes Ergebnis:**

```console
NAME                                 READY   STATUS    RESTARTS   AGE
grafana-xxxxx-yyyyy                  1/1     Running   0          10m
vmagent-xxxxx-yyyyy                  1/1     Running   0          10m
fluent-bit-xxxxx                     1/1     Running   0          10m
```

## Weiterführende Informationen

- [API-Referenz](../api-reference.md) -- Konfiguration des Addons `monitoringAgents`
- [Konzepte](../concepts.md) -- Architektur und Observability
- [Zugang und Tools](./toolbox.md) -- Debugging-Befehle und Metriken
