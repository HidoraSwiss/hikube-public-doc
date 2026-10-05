---
sidebar_position: 2
title: CoreDNS
---

# CoreDNS

**CoreDNS** is the **DNS server** of Hikube Kubernetes clusters. It resolves the names of services and pods inside the cluster, and forwards queries for external names.

## In the console

CoreDNS is part of the **Advanced Configuration** of the **Addons** step: it is always present in the cluster and cannot be disabled. You can only override its configuration.

1. At creation (**Addons** step) or from **Edit** > **Extensions & Addons**, expand the **CoreDNS** block in the **Advanced Configuration** section.
2. Enter your values in **Helm Configuration (YAML) — optional**.
3. Confirm with **Next** then **Create cluster** (creation) or **Save** (modification).

On the cluster detail page, the **DNS** line of the **Network** section shows **CoreDNS** when a CoreDNS configuration is applied.

## Override the configuration

The YAML value is passed to the CoreDNS Helm chart, under the `coredns` key. For example, to set the number of replicas and the resources:

```yaml title="coredns-override.yaml"
coredns:
  replicaCount: 2
  resources:
    limits:
      cpu: 500m
      memory: 256Mi
    requests:
      cpu: 100m
      memory: 128Mi
```

The available options (plugins, zones, cache, forward…) are described in the [CoreDNS Helm chart](https://github.com/coredns/helm/tree/master/charts/coredns).

## Usage in the cluster

```bash
# CoreDNS pods
kubectl get pods -A | grep coredns

# Test resolution from a pod
kubectl run dns-test --rm -it --image=busybox --restart=Never -- nslookup kubernetes.default
```

## Best practices

- Keep at least **2 replicas** to ensure DNS high availability.
- Monitor memory: CoreDNS consumption grows with the number of services and queries.
- Do not edit the CoreDNS `ConfigMap` by hand in the cluster: use the override in the console, otherwise your changes will be overwritten.
