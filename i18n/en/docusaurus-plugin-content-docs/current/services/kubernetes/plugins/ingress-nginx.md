---
sidebar_position: 5
title: Ingress NGINX
---

# Ingress NGINX

The **Ingress NGINX** addon deploys an NGINX-based Ingress controller. It exposes the cluster's applications through `Ingress` resources, with support for TLS, load balancing and NGINX annotations.

## In the console

1. At creation, **Addons** step, **Ingress NGINX** is checked by default.
2. On an existing cluster: **Edit** > **Extensions & Addons**, check or uncheck **Ingress NGINX**, then **Save**.

The cluster detail page shows **Ingress NGINX** in the **Extensions** section when it is active.

### Exposure

The controller is exposed by a Service of type `LoadBalancer` and runs on the nodes of the groups marked **Exposed on the internet (Public IP)** (**Nodes** step). The cluster's first group is always exposed. The PROXY protocol is not enabled by default.

:::note
Choosing the exposure method (`LoadBalancer` or `Proxied`) and declaring hostnames at the addon level are not offered in the console; contact support.
:::

## Override the configuration

Once the addon is checked, the **Helm Configuration (YAML) — optional** field appears. The value is passed to the Ingress NGINX Helm chart, under the `ingress-nginx` key. For example, to adjust the resources and the NGINX configuration:

```yaml title="ingress-nginx-override.yaml"
ingress-nginx:
  controller:
    resources:
      requests:
        cpu: 100m
        memory: 90Mi
      limits:
        cpu: 500m
        memory: 500Mi
    config:
      ssl-protocols: "TLSv1.2 TLSv1.3"
```

The available options are described in the [Ingress NGINX Helm chart](https://artifacthub.io/packages/helm/ingress-nginx/ingress-nginx).

## Usage in the cluster

```bash
# External IP of the controller (EXTERNAL-IP column)
kubectl get svc -A -l app.kubernetes.io/name=ingress-nginx

# Ingress class to use in your manifests
kubectl get ingressclass
```

Example Ingress:

```yaml title="ingress.yaml"
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: my-app
spec:
  ingressClassName: nginx
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

Then point your domain names (DNS `A` record) to the controller's external IP. For HTTPS, see [How to deploy an Ingress with TLS](../how-to/deploy-ingress-tls.md).

## Best practices

- Dedicate an exposed node group to incoming traffic to isolate it from your compute workloads.
- Configure `nginx.ingress.kubernetes.io/*` annotations directly in your `Ingress` manifests for per-application control.
- Enable [Ouroboros](./ouroboros.md) if pods in the cluster need to reach the public domains served by this same Ingress.
