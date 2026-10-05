---
sidebar_position: 6
title: Cert-Manager
---

# Cert-Manager

The **Cert-Manager** addon automatically manages the cluster's SSL/TLS certificates: issuance, renewal and storage in Kubernetes Secrets. It supports Let's Encrypt (ACME) and private authorities.

## In the console

1. At creation, **Addons** step, **Cert-Manager** is checked by default.
2. On an existing cluster: **Edit** > **Extensions & Addons**, check or uncheck **Cert-Manager**, then **Save**.

The cluster detail page shows **Cert-Manager** in the **Extensions** section when it is active.

## Override the configuration

Once the addon is checked, the **Helm Configuration (YAML) — optional** field appears. The value is passed to the Cert-Manager Helm chart, under the `cert-manager` key. For example, to adjust the resources:

```yaml title="cert-manager-override.yaml"
cert-manager:
  resources:
    requests:
      cpu: 10m
      memory: 32Mi
    limits:
      cpu: 100m
      memory: 128Mi
```

The available options are described in the [Cert-Manager Helm chart](https://artifacthub.io/packages/helm/cert-manager/cert-manager).

## Usage in the cluster

The addon does not create any issuer: declare your `ClusterIssuer` (or `Issuer`) in the cluster, then reference it in your Ingresses.

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

# Track the certificates
kubectl get certificates -A
kubectl describe certificate <name> -n <namespace>
```

The full walkthrough is described in [How to deploy an Ingress with TLS](../how-to/deploy-ingress-tls.md).

## Best practices

- Keep Cert-Manager enabled as soon as you expose applications over HTTPS.
- Test with the Let's Encrypt staging server before using the production server.
- Regularly check the `READY` state of your certificates to anticipate renewal failures.
