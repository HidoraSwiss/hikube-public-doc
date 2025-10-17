---
sidebar_position: 10
title: Monitoring Agents
---


### **Agents de Monitoring**

Collecte de logs et métriques avec FluentBit et autres agents.

```yaml
spec:
  addons:
    monitoringAgents:
      enabled: true
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

#### **Configuration Avancée Monitoring**

```yaml
spec:
  addons:
    monitoringAgents:
      enabled: true
      valuesOverride:
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
