---
title: "How to deploy an Ingress with TLS"
---

# How to deploy an Ingress with TLS

This guide explains how to expose an application via HTTPS with an automatic TLS certificate on a Hikube Kubernetes cluster, using the cert-manager and ingress-nginx addons.

## Prerequisites

- A deployed Hikube Kubernetes cluster (see the [quick start](../quick-start.md))
- `kubectl` configured to interact with the Hikube API
- A domain name pointing to your cluster (DNS A or CNAME record)
- The child cluster kubeconfig retrieved

## Steps

### 1. Enable the certManager and ingressNginx addons

Modify your cluster configuration to enable the required addons:

```yaml title="cluster-ingress-tls.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Kubernetes
metadata:
  name: my-cluster
spec:
  controlPlane:
    replicas: 3

  nodeGroups:
    web:
      minReplicas: 2
      maxReplicas: 5
      instanceType: "s1.large"
      ephemeralStorage: 50Gi
      roles:
        - ingress-nginx

  addons:
    certManager:
      enabled: true
    ingressNginx:
      enabled: true
      hosts:
        - app.example.com
```

:::note
The `hosts` field under `ingressNginx` defines the domains for which the Ingress Controller will accept traffic. You can use wildcards (`*.example.com`) to cover multiple subdomains.
:::

### 2. Assign the ingress-nginx role to a node group

The node group that will host the Ingress Controller must have the `ingress-nginx` role in its configuration. Verify that your node group is correctly configured:

```yaml title="cluster-ingress.yaml"
nodeGroups:
  web:
    minReplicas: 2
    maxReplicas: 5
    instanceType: "s1.large"
    ephemeralStorage: 50Gi
    roles:
      - ingress-nginx
```

:::tip
Dedicating a node group to Ingress allows you to isolate incoming traffic and independently scale HTTP/HTTPS exposure resources.
:::

### 3. Apply the cluster configuration

```bash
kubectl apply -f cluster-ingress-tls.yaml

# Wait for the cluster to be ready
kubectl get kubernetes my-cluster -w
```

Verify that the addons are deployed in the child cluster:

```bash
export KUBECONFIG=cluster-admin.yaml

# Check cert-manager
kubectl get pods -n cert-manager

# Check the Ingress Controller
kubectl get pods -n ingress-nginx

# Get the external IP of the Ingress Controller
kubectl get svc -n ingress-nginx ingress-nginx-controller
```

### 4. Create an Ingress with TLS in the child cluster

Deploy your application, then create an Ingress with automatic TLS termination:

```yaml title="ingress-tls.yaml"
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: my-app
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  ingressClassName: nginx
  tls:
    - hosts:
        - app.example.com
      secretName: app-tls
  rules:
    - host: app.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: my-app
                port:
                  number: 80
```

Apply the configuration in the child cluster:

```bash
kubectl apply -f ingress-tls.yaml
```

:::note
The `cert-manager.io/cluster-issuer: letsencrypt-prod` annotation tells cert-manager to automatically obtain a Let's Encrypt certificate for the specified domain.
:::

### 5. Verify the certificate

```bash
# Check the certificate status
kubectl get certificate

# Expected output
# NAME      READY   SECRET    AGE
# app-tls   True    app-tls   2m

# Certificate details
kubectl describe certificate app-tls
```

## Verification

Test HTTPS access to your application:

```bash
# Check the Ingress
kubectl get ingress my-app

# Test HTTPS access
curl -v https://app.example.com
```

**Expected output:**

```console
NAME     CLASS   HOSTS             ADDRESS        PORTS     AGE
my-app   nginx   app.example.com   203.0.113.10   80, 443   5m
```

:::warning
Let's Encrypt certificate provisioning may take a few minutes. If the certificate remains in `False` state, verify that your DNS record correctly points to the Ingress Controller IP and that port 80 is accessible (required for HTTP-01 validation).
:::

## Next steps

- [API reference](../api-reference.md) -- `certManager` and `ingressNginx` addon configuration
- [Concepts](../concepts.md) -- Cluster architecture and network components
- [How to configure networking](./configure-networking.md) -- Advanced network management
