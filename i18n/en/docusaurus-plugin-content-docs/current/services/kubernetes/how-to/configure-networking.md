---
title: "How to configure networking"
---

# How to configure networking

This guide explains how to manage the network configuration of your Hikube Kubernetes cluster, using Kubernetes NetworkPolicies and the Cilium/Hubble observability tools.

## Prerequisites

- A deployed Hikube Kubernetes cluster (see the [quick start](../quick-start.md))
- The cluster kubeconfig downloaded from the console (**Kubeconfig** button) and loaded in your session:
  ```bash
  export KUBECONFIG=~/Downloads/kubeconfig-<cluster-name>.yaml
  ```
- Basic knowledge of Kubernetes networking (Services, Pods, namespaces)

## Steps

### 1. Understand Hikube networking

:::note
Cilium is the CNI (Container Network Interface) of Hikube Kubernetes clusters. It provides networking, network security and observability. It is always present; its configuration is overridden in the console, in the **Advanced Configuration** section of the addons (see [Cilium](../plugins/cilium.md)).
:::

Hikube clusters include:

- **Cilium** as the CNI: pod-to-pod networking, services and NetworkPolicy enforcement;
- **Hubble** for observability: visualization of network flows, to be enabled through the Cilium override.

By default, all pods can communicate with each other without restriction. NetworkPolicies let you restrict this communication.

Exposure to the internet goes through the node groups marked **Exposed on the internet (Public IP)** in the console, which host the [Ingress NGINX](../plugins/ingress-nginx.md) controller.

### 2. Create a NetworkPolicy

Define rules to control the incoming (Ingress) and outgoing (Egress) traffic of your pods:

```yaml title="network-policy.yaml"
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-web
spec:
  podSelector:
    matchLabels:
      app: web
  policyTypes:
    - Ingress
    - Egress
  ingress:
    - from:
        - podSelector:
            matchLabels:
              app: frontend
      ports:
        - protocol: TCP
          port: 80
  egress:
    - to:
        - podSelector:
            matchLabels:
              app: database
      ports:
        - protocol: TCP
          port: 5432
```

This policy:
- **allows incoming traffic** to the `app: web` pods only from the `app: frontend` pods on port 80;
- **allows outgoing traffic** from the `app: web` pods only to the `app: database` pods on port 5432;
- **blocks all other** incoming and outgoing traffic for the `app: web` pods.

### 3. Apply and test

```bash
# Apply the NetworkPolicy
kubectl apply -f network-policy.yaml

# Check that the policy is created
kubectl get networkpolicies

# Test the allowed connectivity
kubectl exec -it deploy/frontend -- curl -s http://web-service:80

# Test the blocked connectivity (must fail)
kubectl exec -it deploy/other-app -- curl -s --connect-timeout 3 http://web-service:80
```

:::tip
Start with permissive policies, then tighten them progressively. An overly restrictive policy can break communication between your services.
:::

**Example default policy to isolate a namespace:**

```yaml title="default-deny.yaml"
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-all
spec:
  podSelector: {}
  policyTypes:
    - Ingress
    - Egress
```

:::warning
The `default-deny-all` policy blocks **all traffic** in the namespace, including DNS access. If you apply it, immediately add a policy allowing outgoing DNS traffic (port 53), otherwise name resolution will be broken.
:::

### 4. Use Hubble for network debugging

Hubble is not enabled by default. To enable it, edit the cluster in the console (**Edit**), expand **Cilium** in the **Advanced Configuration** section of the addons, enter the following override in **Helm Configuration (YAML) — optional**, then click **Save**:

```yaml title="cilium-override.yaml"
cilium:
  hubble:
    enabled: true
```

Once Cilium is redeployed, use the Hubble CLI embedded in the Cilium pods:

```bash
# Cilium pods (one per node)
kubectl get pods -A -l k8s-app=cilium

# Cilium namespace, used by the following commands
CILIUM_NS=$(kubectl get ds -A -l k8s-app=cilium -o jsonpath='{.items[0].metadata.namespace}')

# Check the Hubble status
kubectl exec -n "$CILIUM_NS" -it ds/cilium -- hubble status

# Observe network flows in real time
kubectl exec -n "$CILIUM_NS" -it ds/cilium -- hubble observe

# See the flows dropped by NetworkPolicies
kubectl exec -n "$CILIUM_NS" -it ds/cilium -- hubble observe --verdict DROPPED

# Filter by namespace
kubectl exec -n "$CILIUM_NS" -it ds/cilium -- hubble observe --namespace production
```

:::tip
The `hubble observe --verdict DROPPED` command is particularly useful to identify the flows blocked by a NetworkPolicy and adjust your rules.
:::

## Verification

```bash
# List all NetworkPolicies
kubectl get networkpolicies -A

# Details of a policy
kubectl describe networkpolicy allow-web

# Check the Cilium status
CILIUM_NS=$(kubectl get ds -A -l k8s-app=cilium -o jsonpath='{.items[0].metadata.namespace}')
kubectl exec -n "$CILIUM_NS" -it ds/cilium -- cilium status
```

**Expected result for `kubectl get networkpolicies`:**

```console
NAME        POD-SELECTOR   AGE
allow-web   app=web        5m
```

## Going further

- [Concepts](../concepts.md): network architecture and exposed node groups
- [How to deploy an Ingress with TLS](./deploy-ingress-tls.md): HTTPS exposure of your applications
