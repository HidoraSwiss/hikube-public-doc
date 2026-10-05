---
sidebar_position: 10
title: Monitoring Agents
---

# Monitoring Agents

The **Monitoring Agents** addon deploys in the cluster the agents that collect **metrics** and **logs** and forward the data to the Hikube platform's monitoring. There is no option to enable in the project.

| Component | Role |
|-----------|------|
| **VictoriaMetrics Agent** (`vmagent`) | Collects and sends metrics |
| **Fluent Bit** | Collects and sends container logs |
| **kube-state-metrics** | Exposes the state of Kubernetes objects as metrics |
| **Node exporter** | Exposes the nodes' system metrics |

## In the console

1. At creation, **Addons** step, **Monitoring Agents** is checked by default.
2. On an existing cluster: **Edit** > **Extensions & Addons**, check or uncheck **Monitoring Agents**, then **Save**.

The cluster detail page shows **Monitoring Agents** in the **Extensions** section when it is active.

:::note
Access to the project's monitoring dashboards is not offered in the console; contact support.
:::

## Override the configuration

Once the addon is checked, the **Helm Configuration (YAML) — optional** field appears, but the platform does not apply it for this addon: an override entered here has no effect. The destinations of metrics and logs are defined by the platform. To adapt the behavior of the agents (resources, collection filters), contact support.

## Usage in the cluster

```bash
# Agent pods
kubectl get pods -A -l app.kubernetes.io/name=vmagent
kubectl get pods -A -l app.kubernetes.io/name=fluent-bit

# Resource metrics
kubectl top nodes
kubectl top pods -A
```

See [How to configure monitoring](../how-to/configure-monitoring.md).

## Best practices

- Keep the addon enabled on production clusters to retain the history of metrics and logs.
- Write your application logs to the containers' standard output: that is what Fluent Bit collects.
