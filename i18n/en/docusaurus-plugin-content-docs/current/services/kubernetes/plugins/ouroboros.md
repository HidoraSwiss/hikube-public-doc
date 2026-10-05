---
sidebar_position: 12
title: Ouroboros
---

# Ouroboros

The **Ouroboros** addon fixes Ingress NGINX **hairpin NAT** when the PROXY protocol is used. Without it, a pod in the cluster that calls a public domain served by the Ingress of the same cluster may see its request fail.

:::note
The [Ingress NGINX](./ingress-nginx.md) addon does not enable the PROXY protocol by default. Ouroboros is only useful if you have enabled it, through the Ingress NGINX override, across the whole ingress chain.
:::

## In the console

Ouroboros requires the [Ingress NGINX](./ingress-nginx.md) addon.

1. At creation, **Addons** step, check **Ouroboros** (disabled by default). If **Ingress NGINX** is not checked, the console shows "Requires the Ingress NGINX addon" and blocks the next step.
2. On an existing cluster: **Edit** > **Extensions & Addons**, check **Ouroboros**, then **Save**.

The cluster detail page shows **Ouroboros** in the **Extensions** section when it is active.

## Override the configuration

Once the addon is checked, the **Helm Configuration (YAML) — optional** field appears. The value is passed to the Ouroboros Helm chart, under the `ouroboros` key. In most cases, no override is needed.

## Usage in the cluster

```bash
# Ouroboros pods
kubectl get pods -A | grep -i ouroboros

# From a pod, test access to a public domain served by the cluster's Ingress
kubectl run hairpin-test --rm -it --image=curlimages/curl --restart=Never -- curl -sv https://app.example.com
```

## Best practices

- Enable Ouroboros when the PROXY protocol is active on Ingress NGINX and applications in the cluster call each other through their public domains.
