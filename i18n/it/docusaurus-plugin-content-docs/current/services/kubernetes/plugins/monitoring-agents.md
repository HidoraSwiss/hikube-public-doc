---
sidebar_position: 10
title: Monitoring Agents
---

# 🧩 Dettagli del campo `addons.monitoringAgents`

Il campo `addons.monitoringAgents` definisce la configurazione dell'add-on **Monitoring Agents**, responsabile della raccolta delle metriche e dei log all'interno del cluster Kubernetes.
Questo add-on raggruppa gli agenti di monitoring (Prometheus Node Exporter, kube-state-metrics o altri collettori) distribuiti sui nodi del cluster.

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

## `monitoringAgents` (Object) — **Obbligatorio**

### Descrizione

Il campo `monitoringAgents` raggruppa la configurazione principale degli agenti di monitoring distribuiti nel cluster.
Permette di attivare il componente e di personalizzarne il comportamento tramite valori Helm.

### Esempio

```yaml
monitoringAgents:
  enabled: true
  valuesOverride:
    monitoringAgents:
      nodeExporter:
        enabled: true
```

---

## `enabled` (boolean) — **Obbligatorio**

### Descrizione

Indica se gli **agenti di monitoring** sono attivati (`true`) o disattivati (`false`).
Quando sono attivati, gli agenti raccolgono automaticamente le metriche di sistema e Kubernetes per esportarle verso un server di supervisione (es. Prometheus, Grafana Agent, OpenTelemetry Collector, ecc.).

### Esempio

```yaml
enabled: true
```

---

## `valuesOverride` (Object) — **Obbligatorio**

### Descrizione

Il campo `valuesOverride` permette di **sovrascrivere i valori Helm** utilizzati per distribuire gli agenti di monitoring.
E utilizzato per regolare la configurazione (attivazione dei moduli, risorse, porte di ascolto, label, ecc.).

### Esempio

### **Agenti di Monitoring**

Raccolta di log e metriche con FluentBit e altri agenti.

```yaml
valuesOverride:
  # Configurazione FluentBit
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

#### **Configurazione Avanzata Monitoring**

```yaml
valuesOverride:
  monitoringAgents:
    # FluentBit per i log
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

    # Node Exporter per le metriche di sistema
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

## 💡 Buone pratiche

- Attivare `enabled: true` per garantire la raccolta continua delle metriche di sistema e applicative.
- Utilizzare `valuesOverride` per regolare la configurazione degli agenti in base alle esigenze (es. limitare la raccolta su determinati nodi).
- Configurare `resource limits` appropriati per evitare che gli agenti impattino il carico del cluster.
