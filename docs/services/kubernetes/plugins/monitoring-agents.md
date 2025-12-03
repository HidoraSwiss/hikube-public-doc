---
sidebar_position: 10
title: Monitoring Agents
---

# 🧩 Détails du champ `addons.monitoringAgents`

Le champ `addons.monitoringAgents` définit la configuration de l’add-on **Monitoring Agents**, responsable de la collecte des métriques et des logs au sein du cluster Kubernetes.
Cet add-on regroupe les agents de monitoring (Prometheus Node Exporter, kube-state-metrics, ou autres collecteurs) déployés sur les nœuds du cluster.

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

## `monitoringAgents` (Object) — **Obligatoire**

### Description

Le champ `monitoringAgents` regroupe la configuration principale des agents de monitoring déployés dans le cluster.
Il permet d’activer le composant et de personnaliser son comportement via des valeurs Helm.

### Exemple

```yaml
monitoringAgents:
  enabled: true
  valuesOverride:
    monitoringAgents:
      nodeExporter:
        enabled: true
```

---

## `enabled` (boolean) — **Obligatoire**

### Description

Indique si les **agents de monitoring** sont activés (`true`) ou désactivés (`false`).
Lorsqu’ils sont activés, les agents collectent automatiquement les métriques système et Kubernetes pour les exporter vers un serveur de supervision (ex. Prometheus, Grafana Agent, OpenTelemetry Collector, etc.).

### Exemple

```yaml
enabled: true
```

---

## `valuesOverride` (Object) — **Obligatoire**

### Description

Le champ `valuesOverride` permet de **surcharger les valeurs Helm** utilisées pour déployer les agents de monitoring.
Il est utilisé pour ajuster la configuration (activation des modules, ressources, ports d’écoute, labels, etc.).

### Exemple

### **Agents de Monitoring**

Collecte de logs et métriques avec FluentBit et autres agents.

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

#### **Configuration Avancée Monitoring**

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

## 💡 Bonnes pratiques

- Activer `enabled: true` pour garantir la collecte continue des métriques système et applicatives.
- Utiliser `valuesOverride` pour ajuster la configuration des agents selon les besoins (ex. limiter la collecte sur certains nœuds).
- Configurer des `resource limits` appropriés pour éviter que les agents n’impactent la charge du cluster.
