---

sidebar_position: 4
title: Pod Auto Scaler
----------------------

# 🧩 Details of the `addons.verticalPodAutoscaler` Field

The `addons.verticalPodAutoscaler` field defines the configuration of the **Vertical Pod Autoscaler (VPA)** add-on, responsible for automatically adjusting CPU and memory resources for Pods.
It continuously analyzes actual workload consumption and recommends or applies adjustments to optimize performance and resource usage.

```yaml
addons:
  verticalPodAutoscaler:
    valuesOverride:
      verticalPodAutoscaler:
        recommender:
          enabled: true
        updater:
          enabled: true
        admissionController:
          enabled: true
```

---

## `verticalPodAutoscaler` (Object) — **Required**

### Description

The `verticalPodAutoscaler` field contains the main configuration of the VPA add-on.
It allows deploying and customizing the Vertical Pod Autoscaler components to automate Pod resource management.

### Example

```yaml
verticalPodAutoscaler:
  valuesOverride:
    verticalPodAutoscaler:
      recommender:
        enabled: true
```

---

## `valuesOverride` (Object) — **Required**

### Description

The `valuesOverride` field allows **overriding the Helm values** of the Vertical Pod Autoscaler deployment.
It is used to enable or disable the different sub-components:

| Component             | Description                                                                   |
| --------------------- | ----------------------------------------------------------------------------- |
| `recommender`         | Analyzes metrics and recommends optimal resources for Pods.                   |
| `updater`             | Automatically updates Pods when recommendations change.                       |
| `admissionController` | Intercepts Pod creation/modification requests to adjust resources on the fly. |

### Example

```yaml
valuesOverride:
  verticalPodAutoscaler:
    recommender:
      enabled: true
    updater:
      enabled: true
    admissionController:
      enabled: true
```

---

## 💡 Best Practices

* Always enable `recommender` to benefit from automated resource recommendations.
* Start with `updater.enabled: false` to observe recommendations before applying changes automatically.
* Adjust configuration via `valuesOverride` based on workload requirements and environment (staging, production).

---
