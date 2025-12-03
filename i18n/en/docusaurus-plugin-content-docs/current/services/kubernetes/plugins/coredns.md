---

sidebar_position: 2
title: CoreDNS
--------------

  <!--coredns     <Object> -required-
    valuesOverride    <Object> -required--->

# 🧩 Details of the `addons.coredns` Field

The `addons.coredns` field defines the configuration of the **CoreDNS** add-on, used as the cluster’s **DNS service**.
CoreDNS handles name resolution for services and internal pods within the cluster, and can be customized through Helm parameters.

```yaml
addons:
  coredns:
    valuesOverride:
        coredns:
          replicaCount: 2
          servers:
            - plugins:
                - name: errors
                - configBlock: lameduck 10s
                  name: health
                - name: ready
                - configBlock: |-
                    pods insecure
                    fallthrough in-addr.arpa ip6.arpa
                    ttl 33
                  name: kubernetes
                  parameters: cluster.local in-addr.arpa ip6.arpa
                - name: prometheus
                  parameters: 0.0.0.0:9153
                - name: forward
                  parameters: . 10.1.1.2 10.4.1.11
                - name: cache
                  parameters: 333
                - name: loop
                - name: reload
                - name: loadbalance
              port: 53
              zones:
                - use_tcp: true
                  zone: .
```

---

## `coredns` (Object) — **Required**

### Description

The `coredns` field contains the main configuration for the cluster’s DNS service.
It defines the parameters required for deploying and ensuring the proper operation of CoreDNS.

### Example

```yaml
coredns:
  valuesOverride:
    corends:
      replicaCount: 2
```

---

## `valuesOverride` (Object) — **Required**

### Description

The `valuesOverride` field allows **overriding the default values** of the CoreDNS deployment, typically via Helm.
It is used to customize resources, replica counts, and DNS service configuration (e.g., plugins, zones, caches).
See all available options: [https://github.com/coredns/helm/blob/master/charts/coredns/values.yaml](https://github.com/coredns/helm/blob/master/charts/coredns/values.yaml)

### Example

```yaml
valuesOverride:
  corends:
    replicaCount: 2
    resources:
      limits:
        cpu: 500m
        memory: 256Mi
      requests:
        cpu: 100m
        memory: 128Mi
```

---

## 💡 Best Practices

* Always define `valuesOverride` to adjust resources according to the cluster size.
* Set `replicaCount` to **at least 2** to ensure high availability of the DNS service.
* Monitor memory usage: CoreDNS may consume more depending on the number of services and DNS queries.
* Adapt plugin configuration (e.g., `forward`, `cache`, `rewrite`) according to your environment’s needs.
* Avoid manually modifying the CoreDNS `ConfigMap`: prefer a deployment managed through `valuesOverride`.

---
