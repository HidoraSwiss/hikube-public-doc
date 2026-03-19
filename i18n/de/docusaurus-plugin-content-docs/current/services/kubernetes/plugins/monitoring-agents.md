---
sidebar_position: 10
title: Monitoring Agents
---

# 🧩 Details zum Feld `addons.monitoringAgents`

Das Feld `addons.monitoringAgents` definiert die Konfiguration des Add-ons **Monitoring Agents**, verantwortlich für die Sammlung von Metriken und Logs innerhalb des Kubernetes-Clusters.
Dieses Add-on gruppiert die Monitoring-Agenten (Prometheus Node Exporter, kube-state-metrics oder andere Kollektoren), die auf den Cluster-Knoten bereitgestellt werden.

```yaml
addons:
  monitoringAgents:
    enabled: true
    valuesOverride:
      monitoringAgents:
        nodeExporter:
          enabled: true
        kubeStateMetrics:
          enabled: true
```

---

## `monitoringAgents` (Object) — **Erforderlich**

### Beschreibung

Das Feld `monitoringAgents` gruppiert die Hauptkonfiguration der im Cluster bereitgestellten Monitoring-Agenten.
Es ermöglicht die Aktivierung der Komponente und die Anpassung ihres Verhaltens über Helm-Werte.

### Beispiel

```yaml
monitoringAgents:
  enabled: true
  valuesOverride:
    monitoringAgents:
      nodeExporter:
        enabled: true
```

---

## `enabled` (boolean) — **Erforderlich**

### Beschreibung

Gibt an, ob die **Monitoring-Agenten** aktiviert (`true`) oder deaktiviert (`false`) sind.
Wenn aktiviert, sammeln die Agenten automatisch System- und Kubernetes-Metriken für den Export an einen Überwachungsserver (z.B. Prometheus, Grafana Agent, OpenTelemetry Collector usw.).

### Beispiel

```yaml
enabled: true
```

---

## `valuesOverride` (Object) — **Erforderlich**

### Beschreibung

Das Feld `valuesOverride` ermöglicht das **Überschreiben der Helm-Werte**, die für das Deployment der Monitoring-Agenten verwendet werden.
Es wird verwendet, um die Konfiguration anzupassen (Modulaktivierung, Ressourcen, Listening-Ports, Labels usw.).

### Beispiel

### **Monitoring-Agenten**

Log- und Metriksammlung mit FluentBit und anderen Agenten.

```yaml
valuesOverride:
  # Configuration FluentBit
  fluentbit:
    enabled: true
    config:
      outputs: |
        [OUTPUT]
            Name forward
            Match *
            Host fluent-aggregator.logging
            Port 24224
```

#### **Erweiterte Monitoring-Konfiguration**

```yaml
valuesOverride:
  monitoringAgents:
    # FluentBit pour les logs
    fluentbit:
      enabled: true
      resources:
        requests:
          cpu: 5m
          memory: 10Mi
        limits:
          cpu: 50m
          memory: 60Mi
      config:
        service: |
          [SERVICE]
              Flush         1
              Log_Level     info
              Daemon        off
              Parsers_File  parsers.conf
        inputs: |
          [INPUT]
              Name              tail
              Path              /var/log/containers/*.log
              Parser            cri
              Tag               kube.*
              Refresh_Interval  5
              Mem_Buf_Limit     50MB
        outputs: |
          [OUTPUT]
              Name  forward
              Match *
              Host  logs.company.com
              Port  24224

    # Node Exporter pour les métriques système
    nodeExporter:
      enabled: true
      resources:
        requests:
          cpu: 10m
          memory: 32Mi
        limits:
          cpu: 200m
          memory: 128Mi
```

---

## 💡 Best Practices

- `enabled: true` aktivieren, um die kontinuierliche Sammlung von System- und Anwendungsmetriken sicherzustellen.
- `valuesOverride` verwenden, um die Agenten-Konfiguration nach Bedarf anzupassen (z.B. Sammlung auf bestimmten Knoten einschränken).
- Angemessene `resource limits` konfigurieren, um zu verhindern, dass die Agenten die Cluster-Last beeinträchtigen.
