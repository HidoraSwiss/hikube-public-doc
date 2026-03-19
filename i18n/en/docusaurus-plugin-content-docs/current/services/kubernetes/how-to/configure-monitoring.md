---
title: "How to configure monitoring"
---

# How to configure monitoring

This guide explains how to enable and configure monitoring on a Hikube Kubernetes cluster, including metrics collection, logs, and visualization dashboards.

## Prerequisites

- A deployed Hikube Kubernetes cluster (see the [quick start](../quick-start.md))
- `kubectl` configured to interact with the Hikube API
- Your cluster YAML configuration file

## Steps

### 1. Enable the monitoringAgents addon

Modify your cluster configuration to enable the monitoring addon:

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
Enabling Fluent Bit (`fluentbit.enabled: true`) allows collecting and forwarding your application logs to the observability stack.
:::

### 2. Create a dedicated monitoring node group

Monitoring components (VictoriaMetrics, Grafana, Fluent Bit) consume significant resources. It is recommended to dedicate a node group with memory-optimized instances:

```yaml title="cluster-monitoring.yaml"
nodeGroups:
  monitoring:
    minReplicas: 2
    maxReplicas: 4
    instanceType: "m1.xlarge"    # 4 vCPU, 32 GB RAM
    ephemeralStorage: 200Gi       # Significant storage for metrics and logs
    roles:
      - monitoring
```

:::tip
The M series (Memory Optimized) is ideal for monitoring because metrics databases (VictoriaMetrics) and log indexing engines require a lot of memory.
:::

### 3. Apply the configuration

```bash
kubectl apply -f cluster-monitoring.yaml

# Wait for the cluster to be ready
kubectl get kubernetes my-cluster -w
```

### 4. Access the monitoring tools

Once the cluster is updated, verify that the monitoring components are deployed in the child cluster:

```bash
export KUBECONFIG=cluster-admin.yaml

# List monitoring pods
kubectl get pods -n monitoring

# Check available services
kubectl get svc -n monitoring

# Access Grafana (if available via Ingress)
kubectl get ingress -n monitoring
```

To access Grafana locally:

```bash
kubectl port-forward -n monitoring svc/grafana 3000:80 &
# Open http://localhost:3000 in the browser
```

### 5. Verify the metrics

Confirm that metrics are being collected correctly:

```bash
# Node metrics
kubectl top nodes

# Pod metrics
kubectl top pods -A

# Cluster events
kubectl get events --sort-by=.metadata.creationTimestamp
```

**Expected output for `kubectl top nodes`:**

```console
NAME                          CPU(cores)   CPU%   MEMORY(bytes)   MEMORY%
my-cluster-general-xxxxx      250m         6%     1200Mi          15%
my-cluster-monitoring-yyyyy   800m         20%    4500Mi          14%
```

## Verification

Verify that the entire monitoring stack is operational:

```bash
# Check all monitoring components
kubectl get pods -n monitoring

# Check Fluent Bit logs
kubectl logs -n monitoring -l app.kubernetes.io/name=fluent-bit --tail=20
```

**Expected output:**

```console
NAME                                 READY   STATUS    RESTARTS   AGE
grafana-xxxxx-yyyyy                  1/1     Running   0          10m
vmagent-xxxxx-yyyyy                  1/1     Running   0          10m
fluent-bit-xxxxx                     1/1     Running   0          10m
```

## Next steps

- [API reference](../api-reference.md) -- `monitoringAgents` addon configuration
- [Concepts](../concepts.md) -- Architecture and observability
- [Access and tools](./toolbox.md) -- Debugging commands and metrics
