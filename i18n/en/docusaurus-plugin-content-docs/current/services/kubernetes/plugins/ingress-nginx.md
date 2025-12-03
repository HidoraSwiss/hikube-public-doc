---

sidebar_position: 5
title: Ingress Nginx
--------------------

# 🧩 Details of the `addons.ingressNginx` Field

The `addons.ingressNginx` field defines the configuration of the **Ingress NGINX** add-on, used to manage the HTTP(S) entry points of the Kubernetes cluster.
It deploys an NGINX controller that exposes internal applications through Ingress routes, with full support for TLS, load balancing, and Kubernetes annotations.

```yaml
addons:
  ingressNginx:
    enabled: true
    exposeMethod: LoadBalancer
    hosts:
      - app.example.com
      - api.example.com
    valuesOverride:
      ingressNginx:
        controller:
          replicaCount: 2
          service:
            type: LoadBalancer
```

---

## `ingressNginx` (Object) — **Required**

### Description

The `ingressNginx` field contains the main configuration of the NGINX-based Ingress controller.
It allows enabling the controller deployment, choosing the exposure method, and defining associated public hosts.

### Example

```yaml
ingressNginx:
  enabled: true
  exposeMethod: Proxied
  hosts:
    - app.example.com
```

---

## `enabled` (boolean) — **Required**

### Description

Indicates whether the **Ingress NGINX** controller is enabled (`true`) or disabled (`false`).
When enabled, one or more NGINX pods are deployed to manage the cluster’s ingress rules.

### Example

```yaml
enabled: true
```

---

## `exposeMethod` (string) — **Required**

### Description

Determines the **exposure method** for the Ingress NGINX controller.
This field accepts the following values:

| Value          | Description                                                                 |
| -------------- | --------------------------------------------------------------------------- |
| `Proxied`      | The controller is exposed through an internal proxy or an existing ingress. |
| `LoadBalancer` | The NGINX service is exposed using a `LoadBalancer` Service.                |

### Example

```yaml
exposeMethod: LoadBalancer
```

---

## `hosts` (Array)

### Description

Lists the **domain names** associated with the Ingress NGINX controller.
These hosts define the public routes accessible from outside the cluster.

### Example

```yaml
hosts:
  - app.example.com
  - api.example.com
```

---

## `valuesOverride` (Object) — **Required**

### Description

The `valuesOverride` field allows **overriding the Helm values** of the Ingress NGINX deployment.
It is used to customize controller configuration (replica count, service type, resources, annotations, etc.).

#### **Ingress NGINX**

Ingress controller for HTTP/HTTPS exposure.

```yaml
spec:
  addons:
    ingressNginx:
      enabled: true
      hosts:
        - "app1.example.com"
        - "app2.example.com"
        - "*.api.example.com"  # Wildcard support
      valuesOverride: {}
```

#### **Advanced Ingress NGINX Configuration**

```yaml
spec:
  addons:
    ingressNginx:
      enabled: true
      hosts:
        - "production.company.com"
        - "*.apps.company.com"
      valuesOverride:
        ingressNginx:
          controller:
            # Replication for high availability
            replicaCount: 3

            # Resources configuration
            resources:
              requests:
                cpu: 100m
                memory: 90Mi
              limits:
                cpu: 500m
                memory: 500Mi

            # LoadBalancer service configuration
            service:
              type: LoadBalancer
              annotations:
                service.beta.kubernetes.io/aws-load-balancer-type: nlb

            # Metrics
            metrics:
              enabled: true
              serviceMonitor:
                enabled: true

            # SSL configuration
            config:
              ssl-protocols: "TLSv1.2 TLSv1.3"
              ssl-ciphers: "ECDHE-ECDSA-AES128-GCM-SHA256,ECDHE-RSA-AES128-GCM-SHA256"

            # Logging
            enableSnippets: true
```

---

## 💡 Best Practices

* Prefer `Proxied` for on-premises environments where access is managed through an external reverse proxy.
* Define multiple `hosts` for multi-domain applications.
* Use `valuesOverride` to adjust resources, replica count, and TLS configuration.
* Configure annotations (`nginx.ingress.kubernetes.io/*`) directly in `Ingress` manifests for better application-level control.

---
