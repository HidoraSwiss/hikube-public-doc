---

sidebar_position: 1
title: Cilium
-------------

# 🧩 Details of the `addons.cilium` Field

The `addons.cilium` field defines the configuration of the **Cilium** add-on, used as the cluster’s **CNI (Container Network Interface)**.
Cilium manages networking, security, and observability for Pods using **BPF (Berkeley Packet Filter)**.
This field allows customizing the component deployment through specific values.

```yaml
addons:
  cilium:
    valuesOverride:
      cilium:
        hubble:
          enabled: true
        encryption:
          enabled: true
```

---

## `cilium` (Object) — **Required**

### Description

The `cilium` field represents the main configuration of the network add-on.
It contains the parameters required for installing and customizing Cilium within the cluster.

### Example

```yaml
cilium:
  valuesOverride:
    cilium:
      hubble:
        enabled: true
```

---

## `valuesOverride` (Object) — **Required**

### Description

The `valuesOverride` field allows **overriding the default values** used when deploying Cilium.
It adjusts the behavior of the CNI without modifying the main chart.
These values may include configuration for **Hubble**, encryption, network policies, or allocated resources.
For more configuration options: [https://docs.cilium.io/en/stable/helm-reference/](https://docs.cilium.io/en/stable/helm-reference/)

### Example

```yaml
valuesOverride:
  cilium:
    hubble:
      enabled: true
    encryption:
      enabled: true
```

---

## 💡 Best Practices

* Always define `valuesOverride` to maintain full control over network configuration.
* Enable **Hubble** (`hubble.enabled: true`) to gain network visibility and traffic flow tracking.
* Use `encryption.enabled: true` to encrypt inter-Pod traffic in sensitive environments.
* Verify version compatibility between Cilium and the Kubernetes cluster version.

---
