---
sidebar_position: 10
title: Monitoring Agents
---

# 🧩 Details zum Feld `addons.monitoringAgents`

Das Feld `addons.monitoringAgents` definiert die Konfiguration des Add-ons **Monitoring Agents**, das für die Erfassung von Metriken und Logs innerhalb des Kubernetes-Clusters verantwortlich ist.
Dieses Add-on umfasst die Monitoring-Agents (Prometheus Node Exporter, kube-state-metrics oder andere Collectoren), die auf den Cluster-Knoten bereitgestellt werden.

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

Das Feld `monitoringAgents` gruppiert die Hauptkonfiguration der im Cluster bereitgestellten Monitoring-Agents.
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

Gibt an, ob die **Monitoring-Agents** aktiviert (`true`) oder deaktiviert (`false`) sind.
Wenn sie aktiviert sind, erfassen die Agents automatisch System- und Kubernetes-Metriken für den Export an einen Überwachungsserver (z.B. Prometheus, Grafana Agent, OpenTelemetry Collector usw.).

### Beispiel

```yaml
enabled: true
```

---

## `valuesOverride` (Object) — **Erforderlich**

### Beschreibung

Das Feld `valuesOverride` ermöglicht das **Überschreiben der Helm-Werte**, die für die Bereitstellung der Monitoring-Agents verwendet werden.
Es wird zur Anpassung der Konfiguration verwendet (Aktivierung der Module, Ressourcen, Listening-Ports, Labels usw.).

### Beispiel

### **Monitoring-Agents**

Erfassung von Logs und Metriken mit FluentBit und anderen Agents.

```yaml
valuesOverride:
  # FluentBit-Konfiguration
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
    # FluentBit für Logs
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

    # Node Exporter für Systemmetriken
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

- Aktivieren Sie `enabled: true`, um die kontinuierliche Erfassung von System- und Anwendungsmetriken sicherzustellen.
- Verwenden Sie `valuesOverride`, um die Agent-Konfiguration je nach Bedarf anzupassen (z.B. Erfassung auf bestimmte Knoten beschränken).
- Konfigurieren Sie angemessene `resource limits`, um zu verhindern, dass die Agents die Cluster-Last beeinträchtigen.
