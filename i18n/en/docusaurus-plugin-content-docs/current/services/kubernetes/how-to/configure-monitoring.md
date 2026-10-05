---
title: "How to configure monitoring"
---

# How to configure monitoring

This guide explains how to enable metrics and log collection on a Hikube Kubernetes cluster with the **Monitoring Agents** addon, and how to check that it works in the cluster.

## Prerequisites

- A deployed Hikube Kubernetes cluster (see the [quick start](../quick-start.md))
- The cluster kubeconfig downloaded from the console (**Kubeconfig** button)

## Steps

### 1. Enable the Monitoring Agents addon

The **Monitoring Agents** addon ("Monitoring agents for logs and metrics") is checked by default when a cluster is created. To enable it on an existing cluster:

1. In **Infrastructure** > **Kubernetes**, open the cluster's **Actions** menu and choose **Edit**.
2. In the **Extensions & Addons** section, check **Monitoring Agents**.
3. Click **Save**.

The cluster detail page then shows **Monitoring Agents** in the **Extensions** section.

### 2. Understand what is deployed

The addon installs collection agents in the cluster that forward data to the Hikube platform's monitoring. There is no option to enable in the project:

| Component | Role |
|-----------|------|
| **VictoriaMetrics Agent** (`vmagent`) | Collects and sends metrics |
| **Fluent Bit** | Collects and sends container logs |
| **kube-state-metrics** | Exposes the state of Kubernetes objects as metrics |
| **Node exporter** | Exposes the nodes' system metrics |

The agents run on the cluster nodes; the storage of metrics and logs does not use your nodes.

:::note
Access to the project's monitoring dashboards is not offered in the console; contact support.
:::

### 3. Check the agents in the cluster

```bash
export KUBECONFIG=~/Downloads/kubeconfig-<cluster-name>.yaml

# List the monitoring agent pods
kubectl get pods -A | grep -E "vmagent|fluent-bit|kube-state-metrics|node-exporter"
```

**Expected result**: the agent pods are in `Running` state, with one Fluent Bit pod and one node exporter pod per node.

### 4. View the metrics in the cluster

```bash
# Node metrics
kubectl top nodes

# Pod metrics
kubectl top pods -A

# Cluster events
kubectl get events -A --sort-by=.metadata.creationTimestamp
```

**Example result for `kubectl top nodes`:**

```console
NAME                          CPU(cores)   CPU%   MEMORY(bytes)   MEMORY%
my-cluster-general-xxxxx      250m         6%     1200Mi          15%
my-cluster-general-yyyyy      310m         7%     1350Mi          17%
```

## Verification

```bash
# Logs of a Fluent Bit agent, if in doubt about log forwarding
# Namespace of the Fluent Bit agents
FLUENTBIT_NS=$(kubectl get ds -A -l app.kubernetes.io/name=fluent-bit -o jsonpath='{.items[0].metadata.namespace}')
kubectl logs -n "$FLUENTBIT_NS" -l app.kubernetes.io/name=fluent-bit --tail=20 --prefix
```

:::warning
The destinations of metrics and logs are configured by the platform. To change the behavior of the agents (resources, collection filters), contact support.
:::

## Going further

- [Monitoring Agents](../plugins/monitoring-agents.md): addon details
- [Access and tools](./toolbox.md): diagnostic commands and metrics
