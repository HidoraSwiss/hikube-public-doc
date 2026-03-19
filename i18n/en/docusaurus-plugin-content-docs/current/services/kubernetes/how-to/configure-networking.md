---
title: "How to configure networking"
---

# How to configure networking

This guide explains how to manage the network configuration of your Hikube Kubernetes cluster, using Kubernetes NetworkPolicies and Cilium/Hubble observability tools.

## Prerequisites

- A deployed Hikube Kubernetes cluster (see the [quick start](../quick-start.md))
- The child cluster kubeconfig configured (`export KUBECONFIG=cluster-admin.yaml`)
- Basic understanding of Kubernetes networking (Services, Pods, namespaces)

## Steps

### 1. Understand Hikube networking

:::note
Cilium is the default CNI (Container Network Interface) on Hikube Kubernetes clusters. It provides networking, network security, and observability.
:::

Hikube clusters include:

- **Cilium** as CNI: manages pod-to-pod networking, services, and NetworkPolicy enforcement
- **Hubble** for observability: real-time network flow visualization and debugging

By default, all pods can communicate with each other without restrictions. NetworkPolicies allow you to restrict these communications.

### 2. Create a NetworkPolicy

Define rules to control incoming (Ingress) and outgoing (Egress) traffic for your pods:

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
- **Allows incoming traffic** to `app: web` pods only from `app: frontend` pods on port 80
- **Allows outgoing traffic** from `app: web` pods only to `app: database` pods on port 5432
- **Blocks all other traffic** incoming and outgoing for `app: web` pods

### 3. Apply and test

```bash
# Apply the NetworkPolicy
kubectl apply -f network-policy.yaml

# Verify that the policy is created
kubectl get networkpolicies

# Test allowed connectivity
kubectl exec -it deploy/frontend -- curl -s http://web-service:80

# Test blocked connectivity (should fail)
kubectl exec -it deploy/other-app -- curl -s --connect-timeout 3 http://web-service:80
```

:::tip
Start with permissive policies in observation mode, then gradually restrict. An overly restrictive policy can break communication between your services.
:::

**Example of a default policy to isolate a namespace:**

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

Hubble provides complete visibility into the cluster's network flows. Use it to diagnose connectivity issues:

```bash
# Check Hubble status
kubectl exec -n kube-system -it ds/cilium -- hubble status

# Observe network flows in real time
kubectl exec -n kube-system -it ds/cilium -- hubble observe

# Filter flows for a specific pod
kubectl exec -n kube-system -it ds/cilium -- hubble observe --pod web-xxxxx

# View flows dropped by NetworkPolicies
kubectl exec -n kube-system -it ds/cilium -- hubble observe --verdict DROPPED

# Filter by namespace
kubectl exec -n kube-system -it ds/cilium -- hubble observe --namespace production
```

:::tip
The `hubble observe --verdict DROPPED` command is particularly useful for identifying flows blocked by a NetworkPolicy and adjusting your rules.
:::

## Verification

Verify that your network policies are correctly applied:

```bash
# List all NetworkPolicies
kubectl get networkpolicies -A

# Policy details
kubectl describe networkpolicy allow-web

# Check Cilium status
kubectl exec -n kube-system -it ds/cilium -- cilium status
```

**Expected output for `kubectl get networkpolicies`:**

```console
NAME        POD-SELECTOR   AGE
allow-web   app=web        5m
```

## Next steps

- [API reference](../api-reference.md) -- Full cluster configuration
- [Concepts](../concepts.md) -- Network architecture and communication flows
- [How to deploy an Ingress with TLS](./deploy-ingress-tls.md) -- HTTPS exposure of your applications
