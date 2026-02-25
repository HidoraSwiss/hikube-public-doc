---

sidebar_position: 10
title: Monitoring Agents
------------------------

# 🧩 Details of the `addons.monitoringAgents` Field

The `addons.monitoringAgents` field defines the configuration of the **Monitoring Agents** add-on, responsible for collecting metrics and logs within the Kubernetes cluster.
This add-on bundles monitoring agents (Prometheus Node Exporter, kube-state-metrics, or other collectors) deployed on the cluster nodes.

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

## `monitoringAgents` (Object) — **Required**

### Description

The `monitoringAgents` field contains the main configuration for the monitoring agents deployed across the cluster.
It allows enabling the component and customizing its behavior through Helm values.

### Example

```yaml
monitoringAgents:
  enabled: true
  valuesOverride:
    monitoringAgents:
      nodeExporter:
        enabled: true
```

---

## `enabled` (boolean) — **Required**

### Description

Indicates whether **monitoring agents** are enabled (`true`) or disabled (`false`).
When enabled, the agents automatically collect system and Kubernetes metrics and export them to a monitoring backend (e.g., Prometheus, Grafana Agent, OpenTelemetry Collector, etc.).

### Example

```yaml
enabled: true
```

---

## `valuesOverride` (Object) — **Required**

### Description

The `valuesOverride` field allows **overriding the Helm values** used to deploy monitoring agents.
It is used to adjust configuration (module activation, resources, listening ports, labels, etc.).

### Example

### **Monitoring Agents**

Log and metrics collection using FluentBit and other agents.

```yaml
valuesOverride:
  # FluentBit configuration
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

#### **Advanced Monitoring Configuration**

```yaml
valuesOverride:
  monitoringAgents:
    # FluentBit for logs
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

    # Node Exporter for system metrics
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

* Enable `enabled: true` to ensure continuous collection of system and application metrics.
* Use `valuesOverride` to fine-tune agent configuration depending on the environment (e.g., limit collection on specific nodes).
* Configure appropriate `resource limits` to prevent agents from impacting cluster load.

---
