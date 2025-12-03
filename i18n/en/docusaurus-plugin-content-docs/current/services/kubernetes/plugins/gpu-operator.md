---

sidebar_position: 7
title: GPU Operator
-------------------

# 🧩 Details of the `addons.gpuOperator` Field

The `addons.gpuOperator` field defines the configuration of the **NVIDIA GPU Operator** add-on, used to automatically manage **GPUs** in a Kubernetes cluster.
This component installs and maintains the NVIDIA drivers, runtime plugins, the device plugin, and the monitoring tools required for GPU operations.

```yaml
addons:
  gpuOperator:
    enabled: true
    valuesOverride:
      gpuOperator:
        driver:
          enabled: true
        toolkit:
          enabled: true
        devicePlugin:
          enabled: true
```

---

## `gpuOperator` (Object) — **Required**

### Description

The `gpuOperator` field contains the main configuration of the NVIDIA GPU Operator add-on.
It allows enabling the component deployment and adjusting its configuration.

### Example

```yaml
gpuOperator:
  enabled: true
  valuesOverride:
    gpuOperator:
      driver:
        enabled: true
```

---

## `enabled` (boolean) — **Required**

### Description

Indicates whether the **GPU Operator** is enabled (`true`) or disabled (`false`) in the cluster.
When enabled, the operator automatically deploys the components necessary for managing NVIDIA GPUs.

### Example

```yaml
enabled: true
```

---

## `valuesOverride` (Object) — **Required**

### Description

The `valuesOverride` field allows **overriding the default values** of the GPU Operator.
It is used to customize deployment behavior (enabling the driver, toolkit, plugins, or configuring resources).

### Example

```yaml
valuesOverride:
  gpuOperator:
    driver:
      enabled: true
    toolkit:
      enabled: true
    devicePlugin:
      enabled: true
```

---

## 💡 Best Practices

* Enable `enabled: true` on nodes equipped with GPUs so the operator can automatically manage NVIDIA components.
* Use `valuesOverride` to adapt the configuration to specific needs (e.g., enabling or disabling the `driver` if already installed manually).
* Deploy the GPU Operator only in environments where GPU workloads (AI, ML, scientific computing) are required.

---
