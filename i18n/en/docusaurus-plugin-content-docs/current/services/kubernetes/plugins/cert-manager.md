---
sidebar_position: 6
title: Cert-manager
---

# 🧩 Details of the `certManager` Field

The `certManager` field defines the configuration of the certificate manager integrated into the Kubernetes cluster.
It allows enabling or disabling the component and customizing its behavior through specific values.

```yaml
certManager:
  enabled: true
  valuesOverride:
    certManager:
      installCRDs: true
      prometheus:
        enabled: false
```

---

## `enabled` (boolean) — **Required**

### Description

Indicates whether **cert-manager** is enabled (`true`) or disabled (`false`) in the cluster configuration.
When disabled, no cert-manager-related components are deployed.

### Example

```yaml
enabled: true
```

---

## `valuesOverride` (Object) — **Required**

### Description

Allows **overriding the default values** used for deploying cert-manager.
This field is generally used to inject custom Helm parameters (such as images, resources, or ACME configurations).

### Internal Fields

| Field                | Type    | Required | Description                                                       |
| -------------------- | ------- | -------- | ----------------------------------------------------------------- |
| `installCRDs`        | boolean | ❌        | Installs the Custom Resource Definitions required by cert-manager |
| `prometheus.enabled` | boolean | ❌        | Enables or disables Prometheus metrics export                     |

### Example

```yaml
valuesOverride:
  certManager:
    installCRDs: true
```

---

## Complete Examples

### **Cert-Manager**

Automated management of SSL/TLS certificates.

```yaml
spec:
  addons:
    certManager:
      enabled: true
      valuesOverride:
        certManager:
          installCRDs: true
          prometheus:
            enabled: true
```

#### **Advanced Cert-Manager Configuration**

```yaml
spec:
  addons:
    certManager:
      enabled: true
      valuesOverride:
        certManager:
          # Default issuer configuration
          global:
            leaderElection:
              namespace: cert-manager
          # Prometheus metrics
          prometheus:
            enabled: true
            servicemonitor:
              enabled: true
          # Pod resources
          resources:
            requests:
              cpu: 10m
              memory: 32Mi
            limits:
              cpu: 100m
              memory: 128Mi
```

---

## 💡 Best Practices

* Keep `enabled: true` to ensure automatic TLS certificate management.
* Use `valuesOverride` to adjust Helm parameters without modifying global default values.
* Verify version compatibility between `cert-manager` and the Kubernetes version in use.
* Enable `installCRDs` only during the first installation to avoid resource conflicts.
* Disable `prometheus.enabled` if monitoring is not required to reduce cluster load.
