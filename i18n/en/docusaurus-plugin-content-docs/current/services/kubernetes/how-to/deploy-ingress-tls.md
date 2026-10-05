---
title: "How to deploy an Ingress with TLS"
---

# How to deploy an Ingress with TLS

This guide explains how to expose an application over HTTPS with an automatic TLS certificate on a Hikube Kubernetes cluster, using the Cert-Manager and Ingress NGINX addons.

## Prerequisites

- A deployed Hikube Kubernetes cluster (see the [quick start](../quick-start.md))
- The cluster kubeconfig downloaded from the console (**Kubeconfig** button)
- A domain name whose DNS zone you manage

## Steps

### 1. Enable the Cert-Manager and Ingress NGINX addons

Both addons are checked by default when a cluster is created. To check or enable them on an existing cluster:

1. In **Infrastructure** > **Kubernetes**, open the cluster detail page: the **Extensions** section lists the active addons.
2. If they are not listed, click **Edit**, check **Cert-Manager** and **Ingress NGINX** in the **Extensions & Addons** section, then click **Save**.

### 2. Check the exposed node group

The Ingress NGINX controller runs on the nodes of the groups marked **Exposed on the internet (Public IP)**. The cluster's first group always is. To dedicate another group to incoming traffic, enable this option on its card in the **Node groups** section of the **Edit** page.

:::tip
Dedicating a node group to the Ingress lets you isolate incoming traffic and size the HTTP/HTTPS exposure resources independently.
:::

### 3. Get the external IP and configure DNS

```bash
export KUBECONFIG=~/Downloads/kubeconfig-<cluster-name>.yaml

# Cert-Manager and Ingress NGINX pods
kubectl get pods -A | grep -E "cert-manager|ingress-nginx"

# External IP of the Ingress NGINX controller (EXTERNAL-IP column)
kubectl get svc -A | grep ingress-nginx-controller
```

With your DNS provider, create an `A` record that points your domain (for example `app.example.com`) to this external IP.

### 4. Create a certificate issuer

Declare a Let's Encrypt `ClusterIssuer`, which will validate your domains with an HTTP-01 challenge through Ingress NGINX:

```yaml title="cluster-issuer.yaml"
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: admin@example.com
    privateKeySecretRef:
      name: letsencrypt-prod-account-key
    solvers:
      - http01:
          ingress:
            ingressClassName: nginx
```

```bash
kubectl apply -f cluster-issuer.yaml
kubectl get clusterissuer letsencrypt-prod
```

:::tip
For your tests, use the Let's Encrypt staging server first (`https://acme-staging-v02.api.letsencrypt.org/directory`) so as not to hit the rate limits.
:::

### 5. Create an Ingress with TLS

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

```bash
kubectl apply -f ingress-tls.yaml
```

:::note
The `cert-manager.io/cluster-issuer: letsencrypt-prod` annotation tells Cert-Manager to automatically obtain a certificate for the domains in the `tls` section.
:::

### 6. Check the certificate

```bash
kubectl get certificate

# Expected result
# NAME      READY   SECRET    AGE
# app-tls   True    app-tls   2m

kubectl describe certificate app-tls
```

## Verification

```bash
# Check the Ingress
kubectl get ingress my-app

# Test HTTPS access
curl -v https://app.example.com
```

**Expected result:**

```console
NAME     CLASS   HOSTS             ADDRESS        PORTS     AGE
my-app   nginx   app.example.com   203.0.113.10   80, 443   5m
```

:::warning
Provisioning the Let's Encrypt certificate can take a few minutes. If the certificate stays in `False` state, check that your DNS record points to the external IP of the Ingress NGINX controller and that port 80 is reachable (required for HTTP-01 validation).
:::

:::tip
If pods in the cluster need to reach your own public domains (hairpin NAT), enable the [Ouroboros](../plugins/ouroboros.md) addon.
:::

## Going further

- [Cert-Manager](../plugins/cert-manager.md) and [Ingress NGINX](../plugins/ingress-nginx.md): addon details
- [How to configure networking](./configure-networking.md): advanced network management
